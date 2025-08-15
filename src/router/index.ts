import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/page/HomePage.vue'
import DataPackProjectEditPage from '@/page/Edit/DataPackProjectEditPage.vue'
import ProjectEditPage from '@/page/Edit/ProjectEditPage.vue'
import TestPage from '@/page/TestPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomePage,
    },
    {
      path: "/project/:projectName",
      name: "ProjectEdit",
      component: ProjectEditPage,
      props: true,
    },
    {
      path: "/project/datapack/:projectName/:path*",
      name: "DataPackProjectEdit",
      component: DataPackProjectEditPage,
      props: true,
    },
    {
      path: "/test",
      name: "Test",
      component: TestPage
    }
  ],
})

export default router
