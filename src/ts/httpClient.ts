import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { FileNode, FolderNode, Project } from '@/ts/schemas.ts'


class HttpClient {
  private instance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(error),
    );
  }

  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public async post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public async put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public async patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public async getVersionList(): Promise<AxiosResponse<string[]>> {
    return this.get<string[]>("/api/v1/version/list");
  }

  public async postProject(data: Project): Promise<AxiosResponse<null>> {
    return this.instance.post("/api/v1/project", data);
  }

  public async getProjectList(): Promise<AxiosResponse<Project[]>> {
    return this.instance.get<Project[]>("/api/v1/project/list");
  }

  public async getProjectDownload(projectName: string): Promise<void> {
    const response = await this.instance.get<Blob>(`/api/v1/project/download/${projectName}`, {
      responseType: 'blob',
    });

    // 从响应头获取文件名，默认用 projectName
    const disposition = response.headers['content-disposition'];
    let filename = projectName;
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match && match[1]) filename = decodeURIComponent(match[1]);
    }

    // 创建下载链接并触发下载
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  public async deleteProject(projectName: string): Promise<AxiosResponse<number>> {
    return this.instance.delete<number>(`/api/v1/project/delete/${projectName}`);
  }

  public async getProjectData(projectName: string): Promise<AxiosResponse<Project>> {
    return this.instance.get<Project>(`/api/v1/project/data/${projectName}`)
  }

  public async getProjectDir(projectName: string, path: string): Promise<AxiosResponse<Array<FileNode | FolderNode | null>>> {
    return this.instance.get<Array<FileNode | FolderNode | null>>(`api/v1/project/${projectName}/${path}`, {})
  }

}

export default HttpClient;

