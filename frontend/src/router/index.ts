import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import MapsListView from '@/views/MapsListView.vue'
import MapFormView from '@/views/MapFormView.vue'
import TestHomeView from '@/views/TestHomeView.vue'
import RoleSectionView from '@/views/RoleSectionView.vue'
import { authService } from '@/services/pocketbase'
import { useUserStore, type UserRole } from '@/stores/userStore'

const canAccess = (role: UserRole, allowedRoles?: UserRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(role)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: AuthView },
    { path: '/signup', name: 'signup', component: AuthView },
    { path: '/test', name: 'home-test', component: TestHomeView, meta: { requiresAuth: true } },
    {
      path: '/test/progress',
      name: 'progress-test',
      component: RoleSectionView,
      props: { sectionKey: 'progress' },
      meta: { requiresAuth: true, roles: ['player'] as UserRole[] },
    },
    {
      path: '/test/tasks',
      name: 'tasks-test',
      component: RoleSectionView,
      props: { sectionKey: 'tasks' },
      meta: { requiresAuth: true, roles: ['player'] as UserRole[] },
    },
    {
      path: '/test/activities',
      name: 'activities-test',
      component: RoleSectionView,
      props: { sectionKey: 'activities' },
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/test/shop',
      name: 'shop-test',
      component: RoleSectionView,
      props: { sectionKey: 'shop' },
      meta: { requiresAuth: true, roles: ['player', 'admin'] as UserRole[] },
    },
    {
      path: '/test/maps',
      name: 'maps-list-test',
      component: MapsListView,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/test/maps/new',
      name: 'map-create-test',
      component: MapFormView,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/test/maps/edit/:id',
      name: 'map-edit-test',
      component: MapFormView,
      props: true,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    return { path: '/' }
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const userStore = useUserStore()
  const pocketbaseUserId = authService.getUser()?.id

  if (pocketbaseUserId && !userStore.profile) {
    try {
      await userStore.hydrateFromSession(pocketbaseUserId)
    } catch {
      if (to.path === '/test') {
        return true
      }
      return { path: '/test' }
    }
  }

  const allowedRoles = (to.meta.roles as UserRole[] | undefined)
  if (!canAccess(userStore.currentRole, allowedRoles)) {
    return { path: '/test' }
  }

  return true
})

export default router
