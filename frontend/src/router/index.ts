import { createRouter, createWebHistory } from 'vue-router'
import MapsListView from '@/views/MapsListView.vue'
import MapFormView from '@/views/MapFormView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/test', name: 'home-test', component: HomeView },
    { path: '/test/maps', name: 'maps-list-test', component: MapsListView },
    { path: '/test/maps/new', name: 'map-create-test', component: MapFormView },
    { path: '/test/maps/edit/:id', name: 'map-edit-test', component: MapFormView, props: true },
  ],
})

export default router
