
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import DataPackDropdown from '@/components/Dropdown/Project/DataPackDropdown.vue'
import type { FileInfo, FileNode, FolderInfo, FolderNode } from '@/ts/schemas.ts'
import { client } from '@/stores/client.ts'
import { computed, onMounted, ref, watch, reactive } from 'vue'
import FolderCard from '@/components/Card/FolderCard.vue'
import FileCard from '@/components/Card/FileCard.vue'
import FileInfoModal from '@/components/Modal/InfoModal/FileInfoModal.vue'
import FolderInfoModal from '@/components/Modal/InfoModal/FolderInfoModal.vue'
import RecipeEditModal from '@/components/Modal/EditModal/RecipeEditModal.vue'

enum ModalType {
  FileInfoModal,
  FolderInfoModal,
}

type ModalPropsMap = {
  [ModalType.FileInfoModal]: FileInfo;
  [ModalType.FolderInfoModal]: FolderInfo;
};

const route = useRoute()
const router = useRouter()

const props = route.params as { projectName: string; path: string[] | undefined }

const path = computed(() => {
  const p = route.params.path
  return Array.isArray(p) ? p.join('\\') : ''
})
// 统一 Modal 状态管理
const modalState = reactive<{
  type: ModalType | null;
  props: Partial<ModalPropsMap[ModalType]>;
}>({
  type: null,
  props: {},
});


const directory = ref<Array<FileNode | FolderNode | null>>([])
const isLoading = ref(true)

const pathSegments = computed(() => {
  const p = route.params.path
  return Array.isArray(p) ? p : []
})

function goToPath(segments: string[]) {
  const basePath = `/project/datapack/${props.projectName}`
  const fullPath = segments.length > 0 ? `${basePath}/${segments.join('/')}` : basePath
  router.push(fullPath)
}

// 获取目录数据
const fetchDirectory = async () => {
  try {
    isLoading.value = true
    const data = await client().getProjectDir(props.projectName, path.value)
    directory.value = data
  } catch (err) {
    console.error('加载目录失败:', err)
  } finally {
    isLoading.value = false
  }
}

function openModal<T extends ModalType>(type: T, props: ModalPropsMap[T]) {
  modalState.type = type;
  modalState.props = props;
}

function closeModal(): void {
  modalState.type = null;
  modalState.props = {}
}

// 组件挂载时获取数据
onMounted(fetchDirectory)

watch(
  () => route.params.path,
  () => {
    fetchDirectory()
  }
)
</script>

<template>
  <div class="projectEdit">
    <div class="container">
      <a-dropdown :trigger="['contextmenu']">
        <div class="large-div">
          <a-breadcrumb style="margin-bottom: 16px;">
            <a-breadcrumb-item @click="goToPath([])" style="cursor: pointer;">根目录</a-breadcrumb-item>
            <a-breadcrumb-item
              v-for="(segment, index) in pathSegments"
              :key="index"
              @click="goToPath(pathSegments.slice(0, index + 1))"
              style="cursor: pointer;"
            >
              {{ segment }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          <!-- 项目卡片网格 -->
          <div class="card-grid" v-if="directory && directory.length > 0">
            <FolderCard
              v-for="item in directory.filter(
                (item): item is FolderNode => item !== null && item.type === 'folder',
              )"
              :name="item.name"
              :alias="item.alias"
              :key="item.name"
              @open="
                () => {
                  router.push(`${route.path}/${item.name}`)
                }
              "
              @info="openModal(ModalType.FolderInfoModal, item)"
            />
            <FileCard
              v-for="item in directory.filter(
                (item): item is FileNode => item !== null && item.type === 'file',
              )"
              :name="item.alias || item.name"
              :size="item.size"
              :key="item.name"
              @info="openModal(ModalType.FileInfoModal, item)"
            />
          </div>
          <a-empty class="empty"
            image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
            :image-style="{height: '60px'}"
            v-else
          >
            <template #description>
            <span>
              No Project
            </span>
            </template>
            <a-button type="primary">Create Now</a-button>
          </a-empty>
        </div>
        <template #overlay>
          <DataPackDropdown />
        </template>
      </a-dropdown>
    </div>
    <div class="">
      <FileInfoModal
        v-bind="modalState.props as FileInfo"
        :visible="modalState.type == ModalType.FileInfoModal"
        @ok="closeModal"/>

      <FolderInfoModal
        :alias="(modalState.props as FolderNode).alias"
        v-bind="modalState.props as FolderInfo"
        :visible="modalState.type == ModalType.FolderInfoModal"
        @ok="closeModal"/>

      <RecipeEditModal />
    </div>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 0 50px;
  box-sizing: border-box;
}

.large-div {
  position: relative;
  width: 100%;
  max-width: 1500px;
  /*max-width: 1200px;*/
  aspect-ratio: 16 / 9;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  flex: 1; /* 占据剩余空间 */
  align-content: flex-start;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .large-div {
    aspect-ratio: unset;
    height: 80vh;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

</style>
