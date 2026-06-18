<template>
  <HomeHeaderSection
    :is-session-active="isSessionActive"
    :display-name="displayName"
    :show-play-button="isPlayer"
  />

  <AdminHomeSection v-if="isAdmin" />
  <PlayerDashboardSection v-if="isPlayer" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { authService } from '@/services/pocketbase'
import { useUserStore } from '@/stores/userStore'
import AdminHomeSection from '@/views/home/AdminHomeSection.vue'
import HomeHeaderSection from '@/views/home/HomeHeaderSection.vue'
import PlayerDashboardSection from '@/views/home/PlayerDashboardSection.vue'

const userStore = useUserStore()

const isSessionActive = computed(() => authService.isAuthenticated())

const displayName = computed(() => {
  const user = authService.getUser()
  return user?.username
})

const isPlayer = computed(() => userStore.currentRole === 'player')
const isAdmin = computed(() => userStore.currentRole === 'admin')
</script>
