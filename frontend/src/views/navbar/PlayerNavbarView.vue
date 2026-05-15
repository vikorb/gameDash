<template>
  <BaseNav :items="items" brand-to="/home">
    <template #actions>
      <BaseLangSwitch v-model="locale" :options="langOptions" />

      <RouterLink to="/profil" class="user-chip" aria-label="Profile">
        <span class="user-chip__avatar-wrap">
          <span class="user-chip__avatar">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profileName"
              class="user-chip__avatar-image"
            />
            <span v-else class="user-chip__avatar-fallback">
              {{ profileInitial }}
            </span>
          </span>

          <span :class="['user-chip__presence', `user-chip__presence--${statusKey}`]" />
        </span>

        <span class="user-chip__meta">
          <span class="user-chip__name">{{ profileName }}</span>

          <span :class="['user-chip__status', `user-chip__status--${statusKey}`]">
            <span class="user-chip__status-dot" />
            {{ statusLabel }}
          </span>
        </span>
      </RouterLink>

      <button type="button" class="base-nav__action" aria-label="Sign out" @click="handleLogout">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path :d="mdiLogout" />
        </svg>
      </button>
    </template>
  </BaseNav>
</template>

<script setup lang="ts">
import {
  mdiChartTimelineVariant,
  mdiFormatListChecks,
  mdiHome,
  mdiLogout,
  mdiMap,
  mdiStore,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const { profile } = storeToRefs(userStore)
const { t, locale: i18nLocale } = useI18n({ useScope: 'global' })

const avatarUrl = ref<string | null>(null)

const statusLabel = computed(() => {
  if (statusKey.value === 'online') return t('profile.status.online')
  if (statusKey.value === 'offline') return t('profile.status.offline')
  if (statusKey.value === 'banned') return t('profile.status.banned')
  if (statusKey.value === 'deleted') return t('profile.status.deleted')

  return t('profile.status.offline')
})

const items = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/home', exact: true, icon: mdiHome },
  { label: t('nav.progress'), to: '/progress', icon: mdiChartTimelineVariant },
  { label: t('nav.tasks'), to: '/tasks', icon: mdiFormatListChecks },
  { label: t('nav.maps'), to: '/maps', icon: mdiMap },
  { label: t('nav.shop'), to: '/shop', icon: mdiStore },
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

const profileName = computed(() => {
  const authUser = authService.getUser()
  return profile.value?.username || authUser?.username || t('nav.profileFallback')
})

const profileInitial = computed(() => profileName.value.charAt(0).toUpperCase() || 'U')

const statusKey = computed(() => {
  const value = Number(profile.value?.status)

  if (value === 1) return 'online'
  if (value === 2) return 'offline'
  if (value === 3) return 'banned'
  if (value === 0) return 'deleted'

  return 'offline'
})

async function syncSession() {
  const authUser = authService.getUser()

  if (!authUser?.id) {
    avatarUrl.value = null
    userStore.clearProfile()
    return
  }

  if (!profile.value || profile.value.pocketbase_user_id !== authUser.id) {
    try {
      await userStore.hydrateFromSession(authUser.id)
    } catch {
      userStore.clearProfile()
    }
  }

  avatarUrl.value = authUser.avatarUrl ?? null
}

let stopAuthListener: (() => void) | undefined

onMounted(async () => {
  await syncSession()

  stopAuthListener = authService.onAuthChange(async (user) => {
    avatarUrl.value = user?.avatarUrl ?? null

    if (!user?.id) {
      userStore.clearProfile()
      return
    }

    try {
      await userStore.hydrateFromSession(user.id)
    } catch {
      userStore.clearProfile()
    }
  }) as (() => void) | undefined
})

onUnmounted(() => {
  stopAuthListener?.()
})

const handleLogout = async () => {
  await authService.logout()
  userStore.clearProfile()
  router.push('/')
}
</script>

<style scoped>
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  max-width: 220px;
  padding: 0.45rem 0.8rem 0.45rem 0.55rem;
  border-radius: 18px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.user-chip:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.user-chip__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-chip__name {
  color: rgba(252, 239, 225, 0.98);
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-chip__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.28rem;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
}

.user-chip__status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-chip__status--online {
  color: #59d391;
}

.user-chip__status--online .user-chip__status-dot {
  background: #3dbf7d;
}

.user-chip__status--offline {
  color: #b6bfd0;
}

.user-chip__status--offline .user-chip__status-dot {
  background: #8b95a7;
}

.user-chip__status--banned {
  color: #f08a8a;
}

.user-chip__status--banned .user-chip__status-dot {
  background: #e15b5b;
}

.user-chip__status--deleted {
  color: #b0b7c4;
}

.user-chip__status--deleted .user-chip__status-dot {
  background: #6a7288;
}

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

.user-chip__avatar-wrap {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  overflow: visible;
}

.user-chip__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-chip__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-chip__avatar-fallback {
  color: white;
  font-weight: 700;
  font-size: 0.98rem;
}

.user-chip__presence {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 50%;
  border: 2px solid #49536d;
  z-index: 2;
}

.user-chip__presence--online {
  background: #3dbf7d;
}

.user-chip__presence--offline {
  background: #8b95a7;
}

.user-chip__presence--banned {
  background: #e15b5b;
}

.user-chip__presence--deleted {
  background: #6a7288;
}

@media (max-width: 900px) {
  .user-chip {
    padding: 0.35rem;
    max-width: none;
  }

  .user-chip__meta {
    display: none;
  }
}
</style>
