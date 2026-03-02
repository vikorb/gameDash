<template>
  <div class="home-container">
    <HomeHeaderSection
      :is-session-active="isSessionActive"
      :display-name="displayName"
      :show-play-button="isPlayer"
    />

    <PlayerDashboardSection v-if="isPlayer" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HomeHeaderSection from '@/components/home/HomeHeaderSection.vue'
import PlayerDashboardSection from '@/components/player-dashboard/PlayerDashboardSection.vue'
import { useUserStore } from '@/stores/userStore'
import { authService } from '@/services/pocketbase'

const userStore = useUserStore()

const isSessionActive = computed(() => authService.isAuthenticated())

const displayName = computed(() => {
  const user = authService.getUser()
  return user?.username
})

const isPlayer = computed(() => userStore.currentRole === 'player')
</script>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 24px auto 60px;
  padding: 0 24px;
}
</style>
