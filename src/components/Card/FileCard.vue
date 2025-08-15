<script setup lang="ts">
const props = defineProps<{
  name: string
  size: number
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'info'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

// 触发事件的函数
const onInfo = () => emit('info')
const onEdit = () => emit('edit')
const onDelete = () => emit('delete')

const Edit = () => {
  onEdit()
}

const Info = () => {
  onInfo()
}

const Delete = () => {
  // deleteParticles(root.value as HTMLElement)
  onDelete()
}
</script>

<template>
  <div class="project">
    <a-card hoverable style="cursor: auto">
      <!-- 上半部分 -->
      <div class="card-top">
        <span class="icon">📄</span>
        <div class="card-top-text">
          <h1 class="card-title">{{ props.name }}</h1>
          <h3 class="card-subtitle">大小: {{ props.size }}字节</h3>
        </div>
      </div>

      <!-- 下半部分 -->
      <div class="card-bottom">
        <p class="card-description"></p>
        <div class="card-op">
          <a-button @click="Info">信息</a-button>
          <a-button type="primary" @click="Edit">编辑</a-button>
          <a-button type="primary" danger @click="Delete">删除</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.project {
  width: 300px;
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
  height: 0.5em; /* 2行高度 = 2 * 1.5em */
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

.icon {
  position: relative;
  font-size: 5em;
  /* 上 右 下 左*/
  margin: -0.4em -0.1em -0.15em -0.18em;
}
</style>
