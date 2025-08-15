
export enum ProjectType {
  DataPack = "数据包",
  ResourcePack = "资源包",
  Mod = "模组",
  Plugin = "插件",
  Server = "服务端",
}

export enum ModTypes {
  Forge = "Forge",
  Fabric = "Fabric",
  NeoForge = "NeoForge",
  MultiLoader = "MultiLoader",
  Architectury = "Architectury",
}

export interface Project {
  icon?: string;
  name: string;
  description?: string;
  version: string;
  namespace: string;
  type: ProjectType;
}

export interface VersionInfo {
  version: string;
  resource: number;
  data: number;
}

export interface FileInfo {
  name: string
  size: number
  file_type: string
  datetime: string
}

export interface FileNode extends FileInfo {
  type: string;
  alias: string;
}

export interface FolderInfo {
  name: string
  size: number
  datetime: string
}

export interface FolderNode extends FolderInfo {
  type: string;
  alias: string;
}
