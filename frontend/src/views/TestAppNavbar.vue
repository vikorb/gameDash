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
import { computed, toRefs } from 'vue'

import BaseNav, { type NavItem } from '@/components/BaseNav.vue'
import { useI18n } from 'vue-i18n'

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

const items = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/test', exact: true, icon: 'home' },
  { label: t('nav.maps'), to: '/test/maps', icon: 'maps' },
])
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
