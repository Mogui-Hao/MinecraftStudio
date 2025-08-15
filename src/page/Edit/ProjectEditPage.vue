<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { client } from '@/stores/client.ts'
import { ProjectType } from '@/ts/schemas.ts'

const route = useRoute()
const router = useRouter()

const projectName = route.params.projectName as string

onMounted(async () => {
  try {
    const data = await client().getProjectData(projectName)
    const type = data.type

    // 根据类型跳转到对应路由
    switch (type) {
      case ProjectType.DataPack:
        router.replace({ name: "DataPackProjectEdit", params: { projectName } })
        break
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    router.replace({ name: "Home" })
  }
})
</script>

<template>
  <div class="edit"></div>
</template>
