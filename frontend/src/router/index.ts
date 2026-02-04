import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import MapsListView from '@/views/MapsListView.vue'
import MapFormView from '@/views/MapFormView.vue'
import TestHomeView from '@/views/TestHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: AuthView },
    { path: '/signup', name: 'signup', component: AuthView },
    { path: '/test', name: 'home-test', component: TestHomeView },
    { path: '/test/maps', name: 'maps-list-test', component: MapsListView },
    { path: '/test/maps/new', name: 'map-create-test', component: MapFormView },
    { path: '/test/maps/edit/:id', name: 'map-edit-test', component: MapFormView, props: true },
  ],
})

export default router
