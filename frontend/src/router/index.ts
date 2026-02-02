import { createRouter, createWebHistory } from 'vue-router'
import MapsView from '../views/MapsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test-maps',
      name: 'maps',
      component: MapsView
    }
  ]
})

export default router
