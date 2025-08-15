<script setup lang="ts">
const props = defineProps<{
  visible: boolean
}>()

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
  <a-modal
    :visible="props.visible"
    title="文件信息"
    okText="确定"
    cancel-text="取消"
    @ok="Ok"
    @cancel="Ok"
  >
    <span class="icon">
      <slot name="icon" />
    </span>
    <a-descriptions title="" bordered :column="1">
      <slot name="descriptions" />
    </a-descriptions>
    <template #footer>
      <a-button type="primary" @click="Ok">确定</a-button>
    </template>
  </a-modal>
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
