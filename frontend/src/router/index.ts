import { createRouter, createWebHistory } from 'vue-router'

import { authService } from '@/services/pocketbase'
import { type UserRole, useUserStore } from '@/stores/userStore'
import AuthView from '@/views/AuthView.vue'
import RoleSectionView from '@/views/home/RoleSectionView.vue'
import HomeView from '@/views/HomeView.vue'
import LandingView from '@/views/LandingView.vue'
import MapFormView from '@/views/MapFormView.vue'
import MapsListView from '@/views/MapsListView.vue'
import ModerationUsersView from '@/views/moderation/ModerationUsersView.vue'
import ModerationView from '@/views/ModerationView.vue'
import ProfilView from '@/views/profile/ProfileView.vue'

const canAccess = (role: UserRole, allowedRoles?: UserRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(role)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/login', name: 'login', component: AuthView },
    { path: '/signup', name: 'signup', component: AuthView },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/profil', name: 'profil', component: ProfilView, meta: { requiresAuth: true } },
    {
      path: '/progress',
      name: 'progress-home',
      component: RoleSectionView,
      props: { sectionKey: 'progress' },
      meta: { requiresAuth: true, roles: ['player'] as UserRole[] },
    },
    {
      path: '/tasks',
      name: 'tasks-home',
      component: RoleSectionView,
      props: { sectionKey: 'tasks' },
      meta: { requiresAuth: true, roles: ['player'] as UserRole[] },
    },
    {
      path: '/activities',
      name: 'activities-home',
      component: RoleSectionView,
      props: { sectionKey: 'activities' },
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/shop',
      name: 'shop-home',
      component: RoleSectionView,
      props: { sectionKey: 'shop' },
      meta: { requiresAuth: true, roles: ['player', 'admin'] as UserRole[] },
    },
    {
      path: '/maps',
      name: 'maps-list-home',
      component: MapsListView,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/maps/new',
      name: 'map-create-home',
      component: MapFormView,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/maps/edit/:id',
      name: 'map-edit-home',
      component: MapFormView,
      props: true,
      meta: { requiresAuth: true, roles: ['admin', 'moderator'] as UserRole[] },
    },
    {
      path: '/moderation',
      name: 'moderation',
      component: ModerationView,
      props: true,
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/users',
      name: 'moderation-users',
      component: ModerationUsersView,
      props: true,
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/users/:id',
      name: 'moderation-user-detail',
      component: ProfilView,
      props: (route) => ({
        adminMode: true,
        userId: Number(route.params.id),
      }),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/reports',
      name: 'moderation-reports',
      component: () => import('@/views/moderation/report/ModerationReportsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/reports/:id',
      name: 'moderation-report-detail',
      component: () => import('@/views/moderation/report/ModerationReportDetailView.vue'),
      props: (route) => ({
        id: String(route.params.id),
      }),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/content',
      name: 'moderation-content',
      component: () => import('@/views/moderation/ModerationContentView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/sanctions',
      name: 'moderation-sanctions',
      component: () => import('@/views/moderation/sanction/ModerationSanctionsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/sanctions/:id',
      name: 'moderationSanctionDetail',
      component: () => import('@/views/moderation/sanction/ModerationSanctionDetailView.vue'),
    },
    {
      path: '/moderation/appeals',
      name: 'moderation-appeals',
      component: () => import('@/views/moderation/ModerationAppealsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    {
      path: '/moderation/audit',
      name: 'moderation-audit',
      component: () => import('@/views/moderation/ModerationAuditView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] as UserRole[] },
    },
    { path: '/test/:pathMatch(.*)*', redirect: '/home' },
  ],
})

router.beforeEach(async (to) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.path === '/') {
    return isAuthenticated ? { path: '/home' } : true
  }

  if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    return { path: '/home' }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
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
      if (to.path === '/home') {
        return true
      }
      return { path: '/home' }
    }
  }

  const allowedRoles = to.meta.roles as UserRole[] | undefined
  if (!canAccess(userStore.currentRole, allowedRoles)) {
    return { path: '/home' }
  }

  return true
})

export default router
