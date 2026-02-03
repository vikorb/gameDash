<template>
  <div class="app-navbar">
    <BaseNav :items="items" />
    <BaseLangSwitch v-model="locale" :options="langOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BaseNav, { type NavItem } from '@/components/BaseNav.vue';
import BaseLangSwitch, { type LangOption } from '@/components/BaseLangSwitch.vue';
import { setLocale } from '@/utils/i18n';
import type { SupportedLocale } from '@/plugins/i18n';
import { useI18n } from 'vue-i18n';

const { t, locale: i18nLocale } = useI18n({ useScope: 'global' });

const items = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/', exact: true },
  { label: t('nav.maps'), to: '/maps' },
]);

const langOptions = computed<LangOption<SupportedLocale>[]>(() => [
  { value: 'fr', label: t('nav.lang.fr') },
  { value: 'en', label: t('nav.lang.en') },
]);

const locale = computed<SupportedLocale>({
  get: () => (i18nLocale.value === 'fr' ? 'fr' : 'en'),
  set: (val) => {
    i18nLocale.value = val;
    setLocale(val);
  },
});
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
