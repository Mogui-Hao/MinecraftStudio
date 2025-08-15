import datetime
import json
import os
import zipfile
from io import BytesIO
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

import tools
from model import Project, FileNode, FolderNode, Node

app = FastAPI()

# 获取版本列表
with open("data/pack_format.json", "r") as f:
    # versions = list(json.load(f)["start_releases"].keys())[::-1]
    versions = json.load(f)["start_releases"]

# 获取类型描述列表
with open("data/file_type.json", "r", encoding="utf-8") as f:
    # versions = list(json.load(f)["start_releases"].keys())[::-1]
    file_type = json.load(f)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/version/list", response_model=list[str])
async def versionList() -> list[str]:
    return [k for k, v in versions.items() if v["data"] is not None and v["resource"] is not None][::-1]

@app.post("/api/v1/project")
async def project(data: Project) -> None:
    # with zipfile.ZipFile(f"projects/{str(uuid.uuid4())}.project", "w") as _project:
    if os.path.isfile(f"projects/{data.name}.project"):
        raise HTTPException(status_code=400, detail="同名项目已存在")
    with zipfile.ZipFile(f"projects/{data.name}.project", "w") as _project:
        data.add_folder(f"data/{data.namespace}")
        data.add_file("pack.mcmeta", "")
        data.add_folder(f"data/{data.namespace}", "tags", "标签")  # 标签文件夹
        data.add_folder(f"data/{data.namespace}", "advancement", "进度")  # 进度文件夹
        data.add_folder(f"data/{data.namespace}", "worldgen", "世界生成")  # 世界生成文件夹
        data.add_folder(f"data/{data.namespace}", "function", "函数")  # 函数文件夹
        data.add_folder(f"data/{data.namespace}", "structure", "结构")  # 结构文件夹
        # 创建项目信息文件
        _project.writestr(
            "info.json",
            json.dumps(data.to_dict(), ensure_ascii=False),
        )

        # 创建pack.mcmeta文件
        _project.writestr(
            "pack.mcmeta",
            json.dumps({
                "pack": {
                    "description": data.description,
                    "pack_format": versions[data.version]["data"]
                }
            })
        )

        # 创建层级文件
        _project.mkdir("data")
        _project.mkdir(f"data/{data.namespace}")
        _project.mkdir(f"data/{data.namespace}/tags")  # 标签文件夹
        _project.mkdir(f"data/{data.namespace}/advancement")  # 进度文件夹
        _project.mkdir(f"data/{data.namespace}/worldgen")  # 世界生成文件夹
        _project.mkdir(f"data/{data.namespace}/function")  # 函数文件夹
        _project.mkdir(f"data/{data.namespace}/structure")  # 结构文件夹

@app.get("/api/v1/project/list", response_model=list[Project])
async def projectList() -> list[Project]:
    projects = []
    for filename in os.listdir("projects"):
        if filename.endswith(".project"):
            try:
                with zipfile.ZipFile(f"projects/{filename}", "r") as zf:
                    if "info.json" in zf.namelist():
                        projects.append(Project.from_dict(json.loads(zf.read("info.json").decode())))
            except Exception as e:
                print(e)
    return projects

@app.get("/api/v1/project/download/{project_name}")
async def projectDownload(project_name: str):
    path = f"projects/{project_name}"
    if not os.path.abspath(path).startswith(os.path.abspath("projects")):
        raise HTTPException(status_code=400, detail="非法的项目名称")

    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="项目不存在")

    original_zip = zipfile.ZipFile(path, "r")
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as new_zip:
        for item in original_zip.infolist():
            if item.filename != "info.json":
                new_zip.writestr(item, original_zip.read(item.filename))
    original_zip.close()

    buffer.seek(0)
    headers = {
        "Content-Disposition": f'attachment; filename="{project_name}"'
    }
    return StreamingResponse(buffer, media_type="application/zip", headers=headers)

@app.delete("/api/v1/project/delete/{project_name}")
async def projectDelete(project_name: str):
    file_path = os.path.join("projects", f"{project_name}.project")
    # 防止路径穿越
    if not os.path.abspath(file_path).startswith(os.path.abspath("projects")):
        raise HTTPException(status_code=400, detail="非法的项目名称")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="项目不存在")

    try:
        os.remove(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

    return 200

@app.get("/api/v1/project/data/{project_name}", response_model=Project)
async def projectData(project_name: str):
    file_path = os.path.join("projects", f"{project_name}.project")
    if not os.path.abspath(file_path).startswith(os.path.abspath("projects")):
        raise HTTPException(status_code=400, detail="非法的项目名称")

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="项目不存在")

    with zipfile.ZipFile(file_path, "r") as zf:
        data = zf.read("info.json")
    return json.loads(data)

def find_node_by_path(node: dict, path_parts: List[str]) -> dict:
    """
    递归查找结构树中对应路径的节点
    """
    if not path_parts or path_parts == ["/"]:
        return node
    if path_parts[0] not in node:
        raise HTTPException(status_code=404, detail="路径不存在")
    children = node[path_parts[0]]
    return find_node_by_path(children["children"], path_parts[1:])

@app.get("/api/v1/project/{project_name}/{sub_path:path}", response_model=List[Node])
async def projectDir(project_name: str, sub_path: str = "/"):
    zip_path = os.path.join("projects", f"{project_name}.project")

    # 安全检查
    real_projects_dir = os.path.abspath("projects")
    zip_abs_path = os.path.abspath(zip_path)
    if not zip_abs_path.startswith(real_projects_dir):
        raise HTTPException(status_code=400, detail="非法的项目名称")

    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="项目不存在")

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # 读取info.json
            try:
                with zf.open("info.json") as info_file:
                    info_data = json.load(info_file)
            except KeyError:
                raise HTTPException(status_code=404, detail="info.json不存在")

            # 解析路径
            path_parts = [p for p in sub_path.split("/") if p] or ['/']

            target_node = find_node_by_path(info_data["structure"], path_parts)

            # 返回当前目录下的文件和文件夹（省略children字段）
            result = []
            for name, child in target_node.items():
                node_type = child.get("type", "file")
                alias = child.get("alias", "")
                if node_type == "folder":
                    file_info = zf.getinfo(os.path.join(sub_path, name).replace("\\", "/") + '/')
                    result.append(FolderNode(
                        name=name,
                        datetime=str(datetime.datetime(*file_info.date_time)),
                        size=file_info.file_size,
                        alias=alias,
                    ))
                else:
                    file_info = zf.getinfo(os.path.join(sub_path, name))
                    file_name = os.path.basename(file_info.filename)
                    result.append(FileNode(
                        name=name,
                        size=file_info.file_size,
                        file_type=tools.file_type_split(os.path.splitext(file_name)[1].lstrip('.'), file_type),
                        datetime=str(datetime.datetime(*file_info.date_time)),
                        alias=alias
                    ))

            # 按文件夹优先，名称排序
            # result.sort(key=lambda x: (x.type == "file", x.name))

            return result

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="项目打开错误")

@app.delete("/api/v1/project/{project_name}/{sub_path:path}")
async def dirDelete(project_name: str, sub_path: str = "/"):
    zip_path = os.path.join("projects", f"{project_name}.project")
    # 防止路径穿越
    if not os.path.abspath(zip_path).startswith(os.path.abspath("projects")):
        raise HTTPException(status_code=400, detail="非法的项目名称")

    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="项目不存在")

    with zipfile.ZipFile(zip_path, 'r') as zf:
        try:
            with zf.open("info.json") as info_file:
                info_data = json.load(info_file)
        except KeyError:
            raise HTTPException(status_code=404, detail="info.json不存在")

    _ = info_data["structure"]
    for i in sub_path.strip("/").split("/")[:-1]:
        _ = _[i]["children"]

    if sub_path.strip("/").split("/") not in _:
        return HTTPException(status_code=404, detail="资源不存在")
    del _[sub_path.strip("/").split("/")[-1]]


    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf_write:
        # 写入修改后的info.json
        zf_write.writestr("info.json", json.dumps(info_data, indent=2))

        # 复制原ZIP中的其他文件（避免丢失）
        for item in zf.infolist():
            if item.filename != "info.json":  # 跳过已重新写入的info.json
                zf_write.writestr(item, zf.read(item))


if __name__ == '__main__':
    with zipfile.ZipFile("./projects/My Project.project", "r") as zf:
        print(zf.namelist())
        print(zf.getinfo("data/"))
