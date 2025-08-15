<script setup lang="ts">
import { defineEmits, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { client } from '@/stores/client.ts'
import { type Project, ProjectType } from '@/ts/schemas.ts'

// 事件：提交成功后通知父组件关闭模态框
const emit = defineEmits(['close', 'submit'])

// 控制模态框显示
const { visible } = defineProps<{ visible: boolean }>()

// 版本选项示例
// const versions = ['1.19.2', '1.18.1', '1.17.1', '1.16.5'];
let versions: string[] = []

const formState = ref<Project>({
  description: 'A Minecraft Project',
  icon: '',
  name: 'My Project',
  namespace: '',
  type: ProjectType.DataPack,
  version: '1.21.5',
})

client()
  .getVersion()
  .then((data) => {
    versions = data // 异步请求完成后赋值给全局变量
    // 表单数据
    formState.value.version = versions[0]
    formState.value.namespace = generateNamespace(formState.value.name)
  })

// 标记命名空间是否被用户手动修改过
const namespaceManuallyEdited = ref(false)

// 工具函数：根据项目名称生成命名空间（只保留小写字母）
function generateNamespace(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .filter((ch) => ch >= 'a' && ch <= 'z')
    .join('')
}

// 监听项目名称变化，自动更新命名空间（如果用户未手动修改）
watch(
  () => formState.value.name,
  (newName) => {
    if (!namespaceManuallyEdited.value) {
      formState.value.namespace = generateNamespace(newName)
    }
  },
)

// 监听命名空间输入框，判断用户是否手动修改
function onNamespaceInput() {
  const generated = generateNamespace(formState.value.name)
  namespaceManuallyEdited.value = formState.value.namespace !== generated
}

// 关闭模态框
function handleCancel() {
  emit('close')
}

// 提交表单
function handleOk() {
  if (!formState.value.name) {
    message.error('项目名称不能为空')
    return
  }
  if (!formState.value.namespace) {
    message.error('命名空间不能为空')
    return
  }
  // 提交数据给父组件
  emit('submit', { ...formState.value })
  // 重置表单
  formState.value = {
    icon: "",
    name: 'My Project',
    description: 'A Minecraft Project',
    version: versions[0],
    namespace: generateNamespace('My Project'),
    type: ProjectType.DataPack,
  }
  namespaceManuallyEdited.value = false
}
</script>

<template>
  <a-modal
    :visible="visible"
    title="创建新项目"
    ok-text="创建"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <a-form-item label="项目名称">
        <a-input v-model:value="formState.name" placeholder="请输入项目名称" />
      </a-form-item>

      <a-form-item label="项目描述">
        <a-textarea v-model:value="formState.description" show-count :maxlength="35" />
      </a-form-item>

      <a-form-item label="版本">
        <a-select v-model:value="formState.version" placeholder="请选择版本">
          <a-select-option v-for="v in versions" :key="v" :value="v">{{ v }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="命名空间">
        <a-input
          v-model:value="formState.namespace"
          placeholder="请输入命名空间"
          @input="onNamespaceInput"
        />
        <small style="color: #888">命名空间只允许小写字母，自动根据项目名称生成</small>
      </a-form-item>

      <a-form-item label="类型">
        <a-radio-group v-model:value="formState.type">
          <a-radio-button :value="ProjectType.DataPack">数据包</a-radio-button>
          <a-radio-button :value="ProjectType.ResourcePack" disabled>资源包</a-radio-button>
          <a-radio-button :value="ProjectType.Mod" disabled>模组</a-radio-button>
          <a-radio-button :value="ProjectType.Plugin" disabled>插件</a-radio-button>
          <a-radio-button :value="ProjectType.Server" disabled>服务端</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
