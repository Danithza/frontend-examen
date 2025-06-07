import { createRouter, createWebHistory } from 'vue-router'
import Especialistas from '@/views/Especialistas.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Especialistas',
      component: Especialistas,
    },
  ],
})

export default router
