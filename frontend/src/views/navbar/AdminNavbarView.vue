<template>
  <BaseNav :items="items" brand-to="/home">
    <template #actions>
      <BaseLangSwitch v-model="locale" :options="langOptions" />

      <RouterLink to="/profil" class="base-nav__action" aria-label="Profile">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14Z"
          />
        </svg>
      </RouterLink>

      <button type="button" class="base-nav__action" aria-label="Sign out" @click="handleLogout">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M12 2v10M6.2 4.9A8 8 0 1 0 17.8 4.9" />
        </svg>
      </button>
    </template>
  </BaseNav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import BaseLangSwitch, { type LangOption } from '@/components/BaseLangSwitch.vue'
import BaseNav, { type NavItem } from '@/components/BaseNav.vue'
import type { SupportedLocale } from '@/plugins/i18n'
import { authService } from '@/services/pocketbase'
import { useUserStore } from '@/stores/userStore'
import { setLocale } from '@/utils/i18n'

const router = useRouter()
const userStore = useUserStore()
const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })

const items = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/home', exact: true, icon: 'home' },
  { label: t('nav.activities'), to: '/home/activities', icon: 'tasks' },
  { label: t('nav.maps'), to: '/home/maps', icon: 'maps' },
  { label: t('nav.shop'), to: '/home/shop', icon: 'shop' },
])

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

const handleLogout = async () => {
  await authService.logout()
  userStore.clearProfile()
  router.push('/')
}
</script>
<style scoped>
.base-nav__action {
  background: transparent;
  border: none;
  color: #6a7994;
  padding: 0.25rem;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
}

.base-nav__action svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.base-nav__action:hover {
  color: rgba(252, 239, 225, 0.95);
}
</style>
