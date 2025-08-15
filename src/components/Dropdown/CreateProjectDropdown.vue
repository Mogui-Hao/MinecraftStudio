<template>
  <a-menu>
    <a-menu-item @click="createProject">创建项目</a-menu-item>
  </a-menu>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

// 定义事件
const emit = defineEmits<{
  (e: "create-project"): void;
}>();

// 创建项目的处理函数
const createProject = () => {
  emit("create-project"); // 触发事件
};
</script>

<style scoped>
.large-div {
  position: relative;
  width: 100%;
  max-width: 1200px;
  aspect-ratio: 16 / 9;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
