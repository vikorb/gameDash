<template>
  <div class="app-navbar">
    <BaseNav :items="items" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import BaseNav, { type NavItem } from '@/components/BaseNav.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const items = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/test', exact: true },
  { label: t('nav.maps'), to: '/test/maps' },
])
</script>

<style scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border-bottom: var(--border-1);
  background: var(--color-surface);
}

:deep(.base-nav) {
  border-bottom: none;
  background: transparent;
}
</style>
