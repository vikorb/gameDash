import { createRouter, createWebHistory } from 'vue-router'
import MapsListView from '@/views/MapsListView.vue'
import MapFormView from '@/views/MapFormView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/maps',
      name: 'maps-list',
      component: MapsListView
    },
    {
      path: '/maps/new',
      name: 'map-create',
      component: MapFormView
    },
    {
      path: '/maps/edit/:id',
      name: 'map-edit',
      component: MapFormView,
      props: true // Permet de recevoir :id comme une prop
    }
  ]
})

export default router
