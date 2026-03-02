<template>
  <div class="app-navbar">
    <BaseNav
      :items="items"
      :show-actions="showActions"
      @logout="emit('logout')"
      @profile="emit('profile')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, toRefs, watch } from 'vue'

import BaseNav, { type NavItem } from '@/components/BaseNav.vue'
import { useI18n } from 'vue-i18n'
import { authService } from '@/services/pocketbase'
import { useUserStore, type UserRole } from '@/stores/userStore'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(
  defineProps<{
    showActions?: boolean
  }>(),
  {
    showActions: true,
  },
)

const { showActions } = toRefs(props)

const emit = defineEmits<{
  (event: 'logout'): void
  (event: 'profile'): void
}>()

const userStore = useUserStore()

const buildItemsForRole = (role: UserRole): NavItem[] => {
  if (role === 'player') {
    return [
      { label: t('nav.home'), to: '/home', exact: true, icon: 'home' },
      { label: t('nav.progress'), to: '/home/progress', icon: 'progress' },
      { label: t('nav.tasks'), to: '/home/tasks', icon: 'tasks' },
      { label: t('nav.shop'), to: '/home/shop', icon: 'shop' },
    ]
  }

  if (role === 'admin') {
    return [
      { label: t('nav.home'), to: '/home', exact: true, icon: 'home' },
      { label: t('nav.activities'), to: '/home/activities', icon: 'tasks' },
      { label: t('nav.maps'), to: '/home/maps', icon: 'maps' },
      { label: t('nav.shop'), to: '/home/shop', icon: 'shop' },
    ]
  }

  return [
    { label: t('nav.home'), to: '/home', exact: true, icon: 'home' },
    { label: t('nav.activities'), to: '/home/activities', icon: 'tasks' },
    { label: t('nav.maps'), to: '/home/maps', icon: 'maps' },
  ]
}

const items = computed<NavItem[]>(() => buildItemsForRole(userStore.currentRole))

const hydrateRole = async () => {
  const pocketbaseUserId = authService.getUser()?.id
  if (!pocketbaseUserId) return

  try {
    await userStore.hydrateFromSession(pocketbaseUserId)
  } catch {
    userStore.clearProfile()
  }
}

onMounted(async () => {
  await hydrateRole()
})

watch(
  () => authService.getUser()?.id,
  async () => {
    await hydrateRole()
  },
)
</script>

<style scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border-bottom: none;
  background: transparent;
}

:deep(.base-nav) {
  border-bottom: none;
  background: transparent;
}
</style>
