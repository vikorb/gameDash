<template>
  <BaseNav :items="[]" brand-to="/">
    <template #actions>
      <BaseLangSwitch v-model="locale" :options="langOptions" />

      <RouterLink to="/login" class="public-nav__link">
        {{ t('nav.login') }}
      </RouterLink>

      <RouterLink to="/signup" class="public-nav__button">
        {{ t('nav.register') }}
      </RouterLink>
    </template>
  </BaseNav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import BaseLangSwitch, { type LangOption } from '@/components/BaseLangSwitch.vue'
import BaseNav from '@/components/BaseNav.vue'
import type { SupportedLocale } from '@/plugins/i18n'
import { setLocale } from '@/utils/i18n'

const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })

const langOptions = computed<LangOption<SupportedLocale>[]>(() => [
  { value: 'fr', label: t('nav.lang.fr') },
  { value: 'en', label: t('nav.lang.en') },
])

const locale = computed<SupportedLocale>({
  get: () => (i18nLocale.value === 'fr' ? 'fr' : 'en'),
  set: (value) => {
    i18nLocale.value = value
    setLocale(value)
  },
})
</script>

<style scoped>
.public-nav__link {
  text-decoration: none;
  color: #516079;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.public-nav__link:hover {
  color: #f28b5b;
  background: rgba(242, 139, 91, 0.08);
}

.public-nav__button {
  text-decoration: none;
  background: #f28b5b;
  color: white;
  font-weight: 700;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.public-nav__button:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
</style>
