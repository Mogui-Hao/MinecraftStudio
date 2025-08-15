import { defineStore } from 'pinia';
import HttpClient from '@/ts/httpClient.ts';
import type { FileNode, FolderNode, Project } from '@/ts/schemas.ts'

export const client = defineStore('httpClient', () => {
  // 创建 HttpClient 实例（只创建一次）
  const httpClient = new HttpClient({
    baseURL: 'http://127.0.0.1:5142',
    timeout: 5000,
  })

  // login 方法, 调用 HttpClient 内部的 loginUser
  async function getVersion(): Promise<string[]> {
    try {
      return (await httpClient.getVersionList()).data;
    } catch (error) {
      // 这里可以统一处理错误，或者直接抛出
      throw error
    }
  }

  async function postProject(project: Project): Promise<number> {
    try {
      return (await httpClient.postProject(project)).status;
    } catch (error) {
      throw error
    }
  }

  async function getProjectList(): Promise<Project[]> {
    try {
      return (await httpClient.getProjectList()).data;
    } catch (error) {
      throw error
    }
  }

  async function getProjectDownload(projectName: string): Promise<void> {
    try {
      await httpClient.getProjectDownload(projectName);
    } catch (error) {
      throw error
    }
  }

  async function deleteProject(projectName: string): Promise<number> {
    try {
      const res = await httpClient.deleteProject(projectName);
      return res.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  async function getProjectData(projectName: string): Promise<Project> {
    try {
      return (await httpClient.getProjectData(projectName)).data;
    } catch (error) {
      throw error
    }
  }

  async function getProjectDir(projectName: string, path: string): Promise<Array<FileNode | FolderNode | null>> {
    try {
      return (await httpClient.getProjectDir(projectName, path)).data;
    } catch (error) {
      throw error
    }
  }

  return { httpClient, getVersion, postProject, getProjectList, getProjectDownload, deleteProject, getProjectData,
    getProjectDir };
})
