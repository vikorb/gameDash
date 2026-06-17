<template>
  <PublicNavbarView v-if="!isAuthenticated" />
  <AdminNavbarView v-else-if="userStore.currentRole === 'admin'" />
  <PlayerNavbarView v-else />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { authService, pb } from '@/services/pocketbase'
import { useMapsStore } from '@/stores/mapsStore'
import { useUserStore } from '@/stores/userStore'
import AdminNavbarView from '@/views/navbar/AdminNavbarView.vue'
import PlayerNavbarView from '@/views/navbar/PlayerNavbarView.vue'
import PublicNavbarView from '@/views/navbar/PublicNavbarView.vue'

const userStore = useUserStore()
const mapsStore = useMapsStore()
const isAuthenticated = ref(authService.isAuthenticated())

const syncSession = async () => {
  isAuthenticated.value = authService.isAuthenticated()

  const pocketbaseUserId = authService.getUser()?.id
  if (!pocketbaseUserId) {
    userStore.clearProfile()
    return
  }

  try {
    await userStore.hydrateFromSession(pocketbaseUserId)
    void mapsStore.loadMaps()
  } catch {
    userStore.clearProfile()
  }
}

let unsubscribe: (() => void) | undefined

onMounted(async () => {
  await syncSession()

  unsubscribe = pb.authStore.onChange(() => {
    void syncSession()
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
