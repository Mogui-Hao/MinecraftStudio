<script setup lang="ts">
import type {  FolderInfo } from '@/ts/schemas.ts'
import BaseInfoModal from '@/components/Modal/InfoModal/BaseInfoModal.vue'

const props = defineProps<{
  visible: boolean
  alias?: string
} & FolderInfo>()

// 定义事件
const emit = defineEmits<{
  (e: 'ok'): void
}>()

// 触发事件的函数
const onOk = () => emit('ok')

const Ok = () => {
  onOk()
}
</script>

<template>
  <BaseInfoModal v-bind="props" @ok="Ok">
    <template #icon>📁</template>
    <template #descriptions>
      <a-descriptions-item label="文件夹名">{{ props.name }}</a-descriptions-item>
      <a-descriptions-item label="文件夹别名">{{ props.alias || "无" }}</a-descriptions-item>
      <a-descriptions-item label="大小">{{ props.size }} 字节</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ props.datetime }}</a-descriptions-item>
    </template>
  </BaseInfoModal>
</template>

<style scoped>
.icon {
  font-size: 5em;
  display: block; /* 变成块级元素 */
  width: 100%; /* 宽度撑满父容器 */
  text-align: center; /* 内容居中 */
  position: relative;
}
</style>
