<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue'
import type { ProjectType } from '@/ts/schemas.ts'
// import { deleteParticles } from '@/ts/Animation/DeleteAnimation.ts'

const root = ref<HTMLElement | null>(null);

// 定义 props
const props = defineProps<{
  name: string
  type: ProjectType
  description?: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'download'): void
  (e: 'delete'): void
}>()

// 触发事件的函数
const onEdit = () => emit('edit')
const onDownload = () => emit('download')
const onDelete = () => emit('delete')

const Edit = () => {
  onEdit()
}

const Download = () => {
  onDownload()
}

const Delete = () => {
  // deleteParticles(root.value as HTMLElement)
  onDelete()
}

defineExpose({
  root
})

</script>

<template>
  <div class="project">
    <a-card hoverable ref="root">
      <!-- 上半部分 -->
      <div class="card-top">
        <a-avatar :size="64" shape="square" />
        <div class="card-top-text">
          <h1 class="card-title">{{ props.name }}</h1>
          <h3 class="card-subtitle">{{ props.type }}</h3>
        </div>
      </div>

      <!-- 下半部分 -->
      <div class="card-bottom">
        <p class="card-description">{{ props.description }}</p>
        <div class="card-op">
          <a-button @click="Edit">编辑</a-button>
          <a-button type="primary" @click="Download">下载</a-button>
          <a-button type="primary" danger @click="Delete">删除</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
@import "@/assets/Animation/DeleteAnimation.css";

.project {
  width: 340px;
  height: 216px; /* 固定高度 */
  margin: 16px;
  box-sizing: border-box;
}

a-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}

/* 上半部分 */
.card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

/* 右边文字 */
.card-top-text {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

/* 标题和副标题 */
.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-subtitle {
  margin: 4px 0 0 0;
  font-size: 1rem;
  color: #666;
}

/* 下半部分 */
.card-bottom {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  gap: 12px;
}

/* 介绍部分，固定两行高度 */
.card-description {
  margin: 0;
  color: #333;
  line-height: 1.5em; /* 行高 */
  height: 3em; /* 2行高度 = 2 * 1.5em */
  overflow: hidden; /* 超出隐藏 */
  white-space: normal;
  word-break: break-word;
}

/* 按钮组 */
.card-op {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
