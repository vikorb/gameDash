<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/navigation/AppNavbar.vue'
import BaseLangSwitch, { type LangOption } from '@/components/BaseLangSwitch.vue'
import { setLocale } from '@/utils/i18n'
import type { SupportedLocale } from '@/plugins/i18n'
import { authService, pb } from '@/services/pocketbase'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const showNavbar = computed(() => route.path.startsWith('/home'))

const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })

const langOptions = computed<LangOption<SupportedLocale>[]>(() => [
  { value: 'fr', label: t('nav.lang.fr') },
  { value: 'en', label: t('nav.lang.en') },
])

const locale = computed<SupportedLocale>({
  get: () => {
    const current = typeof i18nLocale === 'string' ? i18nLocale : i18nLocale.value
    return current === 'fr' ? 'fr' : 'en'
  },
  set: (val) => {
    if (typeof i18nLocale !== 'string') {
      i18nLocale.value = val
    }
    setLocale(val)
  },
})

const isAuthenticated = ref(authService.isAuthenticated())

pb.authStore.onChange(() => {
  isAuthenticated.value = authService.isAuthenticated()
  if (!isAuthenticated.value) {
    userStore.clearProfile()
  }
})

const handleLogout = async () => {
  await authService.logout()
  userStore.clearProfile()
  router.push('/')
}

const handleProfile = () => {}
</script>

<template>
  <div class="app-shell">
    <header v-show="showNavbar">
      <AppNavbar :show-actions="false" />
    </header>

    <div class="lang-switch-wrapper">
      <BaseLangSwitch v-model="locale" :options="langOptions" />
      <button
        v-if="isAuthenticated"
        type="button"
        class="nav-action-btn"
        aria-label="Profile"
        @click="handleProfile"
      >
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5C20 16 16.4 14 12 14Z"
          />
        </svg>
      </button>
      <button
        v-if="isAuthenticated"
        type="button"
        class="nav-action-btn"
        aria-label="Sign out"
        @click="handleLogout"
      >
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M12 2v10M6.2 4.9A8 8 0 1 0 17.8 4.9" />
        </svg>
      </button>
    </div>

    <main class="app-main" :class="{ 'app-main-full': !showNavbar }">
      <RouterView :key="$route.fullPath" />
    </main>

    <footer class="app-footer">
      <span>Copyright @SDv 2026</span>
    </footer>
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-action-btn {
  background: transparent;
  border: none;
  color: #516079;
  padding: 0.25rem;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.nav-action-btn svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-action-btn:hover {
  color: var(--color-cream);
}

.app-footer {
  height: var(--footer-height);
  background: var(--color-cream);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
