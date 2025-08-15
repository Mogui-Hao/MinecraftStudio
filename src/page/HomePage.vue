<script setup lang="ts">
import { ref, onMounted, computed, watchEffect, onUnmounted } from 'vue'
import CreateProjectDropdown from '@/components/Dropdown/CreateProjectDropdown.vue';
import CreateProjectModal from '@/components/Modal/CreateProjectModal.vue';
import { client } from '@/stores/client.ts'
import { type Project } from '@/ts/schemas.ts'
import { message } from 'ant-design-vue'
import ProjectCard from '@/components/Card/ProjectCard.vue'
import { useRouter } from 'vue-router'
// import { deleteParticles } from '@/ts/Animation/DeleteAnimation.ts'

const modalVisible = ref(false);
const projects = ref<Project[]>([]);
const currentPage = ref(1);
const containerRef = ref<HTMLElement | null>(null);
const projectsGridRef = ref<HTMLElement | null>(null);
const cardsPerPage = ref(8); // 初始值，将根据容器大小动态计算
const router = useRouter()

// 计算当前页显示的项目
const paginatedProjects = computed(() => {
  const startIndex = (currentPage.value - 1) * cardsPerPage.value;
  const endIndex = startIndex + cardsPerPage.value;
  return projects.value.slice(startIndex, endIndex);
});

// 模拟从API获取项目数据
function fetchProjects() {
  // console.log(client().getProjectList())
  client().getProjectList().then(_p => {
    projects.value = _p;
  })
  // 实际项目中这里应该调用API
  /*projects.value = [
    {
      name: "My Project",
      description: "A Test Project",
      version: "1.21.4",
      namespace: "myproject",
      type: ProjectType.DataPack,
    },
    {
      name: "Test Project",
      description: "A Test Project",
      version: "1.13.x",
      namespace: "testproject",
      type: ProjectType.DataPack,
    },
    {
      name: "Not Kill",
      description: "A Test Project",
      version: "1.18.x",
      namespace: "notkill",
      type: ProjectType.DataPack,
    },
    {
      name: "A Killer Player",
      description: "A Test Project",
      version: "1.16.2",
      namespace: "akillerplayer",
      type: ProjectType.DataPack,
    },
    {
      name: "Epic Adventure",
      description: "Explore new worlds",
      version: "1.19.3",
      namespace: "epicadventure",
      type: ProjectType.DataPack,
    },
    {
      name: "Magic System",
      description: "Add magic to your world",
      version: "1.18.2",
      namespace: "magicsystem",
      type: ProjectType.DataPack,
    },
    {
      name: "Survival Plus",
      description: "Enhanced survival experience",
      version: "1.20.1",
      namespace: "survivalplus",
      type: ProjectType.DataPack,
    },
    {
      name: "Fantasy RPG",
      description: "Role-playing elements",
      version: "1.19.2",
      namespace: "fantasyrpg",
      type: ProjectType.DataPack,
    },
    {
      name: "Tech Expansion",
      description: "Add new technologies",
      version: "1.18.1",
      namespace: "techexpansion",
      type: ProjectType.DataPack,
    },
    {
      name: "Medieval Kingdom",
      description: "Build your kingdom",
      version: "1.20.0",
      namespace: "medievalkingdom",
      type: ProjectType.DataPack,
    },
    {
      name: "Ocean Adventure",
      description: "Explore underwater worlds",
      version: "1.19.0",
      namespace: "oceanadventure",
      type: ProjectType.DataPack,
    },
    {
      name: "Space Exploration",
      description: "Journey to the stars",
      version: "1.18.0",
      namespace: "spaceexploration",
      type: ProjectType.DataPack,
    }
  ];*/
}

// 计算容器可以显示的项目数量
function calculateCardsPerPage() {
  if (!containerRef.value || !projectsGridRef.value) return;

  // 获取容器尺寸
  const containerWidth = containerRef.value.clientWidth;
  const containerHeight = containerRef.value.clientHeight;

  // 获取网格布局信息
  const gridComputedStyle = window.getComputedStyle(projectsGridRef.value);
  const gridColumnGap = parseInt(gridComputedStyle.columnGap) || 0;
  const gridRowGap = parseInt(gridComputedStyle.rowGap) || 0;

  // 估计卡片尺寸（假设卡片最小宽度为280px）
  const cardMinWidth = 280;
  const cardHeight = 200; // 假设卡片高度为200px

  // 计算每行可以容纳的卡片数量
  const cardsPerRow = Math.max(1, Math.floor((containerWidth - gridColumnGap) / (cardMinWidth + gridColumnGap)));

  // 计算每列可以容纳的卡片行数
  const rowsPerPage = Math.max(1, Math.floor((containerHeight - gridRowGap) / (cardHeight + gridRowGap)));

  // 计算每页可以显示的卡片总数
  cardsPerPage.value = cardsPerRow * rowsPerPage;

  // console.log(`计算每页卡片数: ${cardsPerPage.value} (${cardsPerRow}列 x ${rowsPerPage}行)`);
}

// 响应式调整每页项目数
watchEffect(() => {
  if (projects.value.length > 0) {
    calculateCardsPerPage();
  }
});

// 添加窗口大小变化监听器
function setupResizeListener() {
  window.addEventListener('resize', calculateCardsPerPage);
}

function showModal() {
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
}

function handleSubmit(formData: Project) {
  client().postProject(formData).then(() => {
    message.success('创建成功');
    // 添加新项目到列表
    projects.value.push(formData);
    // 跳转到新项目所在的最后一页
    const totalPages = Math.ceil(projects.value.length / cardsPerPage.value);
    currentPage.value = totalPages;
  }).catch(error => {
    message.error("创建失败, " + error.response.data.detail);
  })
  closeModal();
}

// 处理卡片事件
function handleEdit(projectName: string) {
  console.log('编辑项目:', projectName);
  // 实际项目中这里应该打开编辑模态框
  router.push({ name: "ProjectEdit", params: { projectName: projectName } });
}

function handleDownload(projectId: string) {
  console.log('下载项目:', projectId);
  // 实际下载逻辑
  client().getProjectDownload(projectId).then(() => {})
}

function handleDelete(projectId: string) {
  // 实际删除逻辑
  // projects.value = projects.value.filter(p => p.uuid !== projectId);
  client().deleteProject(projectId).then(() => {
    message.success("项目已删除");
    // 如果删除后当前页没有项目且不是第一页，则跳转到上一页
    const index = projects.value.findIndex(p => p.name === projectId);
    if (index !== -1) {
      projects.value.splice(index, 1);
    }

    if (paginatedProjects.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1;
    }
  }).catch(() => {
    message.error("删除失败");
  })
}

// 分页变化处理
function handlePageChange(page: number) {
  currentPage.value = page;
}

// 组件挂载时获取项目数据
onMounted(() => {
  fetchProjects();
  setupResizeListener();
  // 初始计算延迟以确保DOM已渲染
  setTimeout(calculateCardsPerPage, 1);
});

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', calculateCardsPerPage);
});
</script>

<template>
  <div class="home">
    <div class="container">
      <a-dropdown :trigger="['contextmenu']">
        <div class="large-div" ref="containerRef">
          <!-- 项目卡片网格 -->
          <div class="card-grid" ref="projectsGridRef" v-if="paginatedProjects.length > 0">
            <ProjectCard
              v-for="project in paginatedProjects"
              :key="project.namespace"
              :name="project.name"
              :type="project.type"
              :class="project.namespace"
              :description="project.description"
              @edit="handleEdit(project.name)"
              @download="handleDownload(project.name)"
              @delete="handleDelete(project.name)"
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
            <a-button type="primary" @click="showModal">Create Now</a-button>
          </a-empty>

          <!-- 分页控件（简化版） -->
          <div class="pagination-container" v-if="projects.length > cardsPerPage">
            <a-pagination
              v-model:current="currentPage"
              :total="projects.length"
              :pageSize="cardsPerPage"
              :showSizeChanger="false"
              @change="handlePageChange"
            />
          </div>
        </div>
        <template #overlay>
          <CreateProjectDropdown @create-project="showModal" />
        </template>
      </a-dropdown>
    </div>

    <CreateProjectModal
      :visible="modalVisible"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
@import "@/assets/Animation/DeleteAnimation.css";

html, body {
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
  /* max-width: 1200px;*/
  max-width: 1500px;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
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

  .pagination-container {
    flex-direction: column;
    align-items: center;
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
