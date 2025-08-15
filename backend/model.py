from datetime import datetime
from typing import List, Union

from fastapi import HTTPException
from pydantic import BaseModel, Field

from schemas import ProjectType


class Project(BaseModel):
    name: str
    description: str
    version: str
    namespace: str
    type: str | ProjectType
    icon: str
    structure: dict = {}

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "namespace": self.namespace,
            "type": self.type if isinstance(self.type, str) else self.type.value,
            "icon": self.icon,
            "structure": self.structure,
        }

    def add_file(self, name: str, path: str, alias: str = ""):
        current = self.structure  # 初始指向根目录（与 self.structure 引用同一字典）
        # 过滤路径中的空段（处理路径首尾斜杠的情况，如 "data//docs/" 会被过滤为 ["data", "docs"]）
        path_parts = [part for part in path.split("/") if part]

        for key in path_parts:
            # 如果当前目录不存在该文件夹，创建它
            if key not in current:
                current[key] = {
                    "type": "folder",
                    "alias": "",
                    "children": {}  # 子目录初始化为空
                }
            # 检查当前节点是否是文件（不能在文件下创建子文件/文件夹）
            if current[key]["type"] == "file":
                raise HTTPException("Cannot create file in a file path")  # 明确异常信息
            # 进入下一层目录（更新 current 为当前文件夹的子目录字典）
            current = current[key]["children"]

        # 在目标文件夹的 children 中添加文件（name 是文件名）
        current[name] = {
            "type": "file",
            "alias": alias,  # 别名可选，默认空字符串
        }

    def add_folder(self, path: str, name: str = "", alias: str = ""):
        current = self.structure  # 初始指向根目录
        for key in path.split("/"):
            if key not in current:
                # 创建新文件夹（类型、别名、空子目录）
                current[key] = {
                    "type": "folder",
                    "alias": "",
                    "children": {}
                }
            if current[key]["type"] == "file":
                raise HTTPException("路径中存在文件，无法创建文件夹")
            current = current[key]["children"]  # 进入子目录
        if name != "":
            # 添加目标文件夹（若name非空）
            current[name] = {
                "type": "folder",
                "alias": alias,
                "children": {}
            }

    @classmethod
    def from_dict(cls, data: dict) -> 'Project':
        return Project(**data)

# class FileNode(BaseModel):
#     name: str
#     type: str = Field("file", const=True)
#     path: str
#     size: int
#     modifiedAt: datetime
#
# class FolderNode(BaseModel):
#     name: str
#     type: str = Field("folder", const=True)
#     path: str
#     children: List[Union['FolderNode', FileNode]] = []
#
# FolderNode.update_forward_refs()

# 定义数据模型
class FileNode(BaseModel):
    name: str
    size: int
    file_type: str
    datetime: str
    type: str = "file"  # 添加type字段
    alias: str = ""

class FolderNode(BaseModel):
    name: str
    size: int
    datetime: str
    type: str = "folder"  # 添加type字段
    alias: str = ""

Node = Union[FileNode, FolderNode]
