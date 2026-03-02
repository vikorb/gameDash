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

const roleMenuMap: Record<UserRole, NavItem[]> = {
  player: [
    { label: t('nav.home'), to: '/test', exact: true, icon: 'home' },
    { label: t('nav.progress'), to: '/test/progress', icon: 'progress' },
    { label: t('nav.tasks'), to: '/test/tasks', icon: 'tasks' },
    { label: t('nav.shop'), to: '/test/shop', icon: 'shop' },
  ],
  admin: [
    { label: t('nav.home'), to: '/test', exact: true, icon: 'home' },
    { label: t('nav.activities'), to: '/test/activities', icon: 'tasks' },
    { label: t('nav.maps'), to: '/test/maps', icon: 'maps' },
    { label: t('nav.shop'), to: '/test/shop', icon: 'shop' },
  ],
  moderator: [
    { label: t('nav.home'), to: '/test', exact: true, icon: 'home' },
    { label: t('nav.activities'), to: '/test/activities', icon: 'tasks' },
    { label: t('nav.maps'), to: '/test/maps', icon: 'maps' },
  ],
}

const items = computed<NavItem[]>(() => roleMenuMap[userStore.currentRole])

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
