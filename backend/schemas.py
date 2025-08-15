from dataclasses import dataclass
from enum import Enum, unique

@unique
class ProjectType(Enum):
    DataPack = "数据包"
    ResourcePack = "资源包"
    Mod = "模组"
    Plugin = "插件"
    Server = "服务端"

@dataclass
class VersionInfo:
    resource: int
    datapack: int
