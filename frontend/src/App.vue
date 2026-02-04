<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/views/TestAppNavbar.vue'
import BaseLangSwitch, { type LangOption } from '@/components/BaseLangSwitch.vue'
import { setLocale } from '@/utils/i18n'
import type { SupportedLocale } from '@/plugins/i18n'

const route = useRoute()

const showNavbar = computed(() => route.path.startsWith('/test'))

const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })

const langOptions = computed<LangOption<SupportedLocale>[]>(() => [
  { value: 'fr', label: t('nav.lang.fr') },
  { value: 'en', label: t('nav.lang.en') },
])

const locale = computed<SupportedLocale>({
  get: () => (i18nLocale.value === 'fr' ? 'fr' : 'en'),
  set: (val) => {
    i18nLocale.value = val
    setLocale(val)
  },
})
</script>

<template>
  <header v-show="showNavbar">
    <AppNavbar />
  </header>

  <div class="lang-switch-wrapper">
    <BaseLangSwitch v-model="locale" :options="langOptions" />
  </div>

  <main class="app-main" :class="{ 'app-main-full': !showNavbar }">
    <RouterView :key="$route.fullPath" />
  </main>
</template>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  color: var(--color-text);
}

.app-main {
  padding: 20px;
}

.app-main-full {
  padding: 0;
}

.lang-switch-wrapper {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}
</style>
