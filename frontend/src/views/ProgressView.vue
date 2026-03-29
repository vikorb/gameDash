<template>
  <div class="progress-view" v-if="user">
    <h1>Progression de {{ user.username }}</h1>
    <div v-if="user">
      <CardMMR
        v-if="mmrStore.mmrData"
        :mmr="mmrStore.mmrData.mmr"
        :rank="mmrStore.mmrData.rank"
        :history="mmrHistory"
        :modes="modes"
        :selectedModeId="selectedModeId"
        @update:selectedModeId="handleModeChange"
      />
      <CardRank v-if="postgresUserId" :userId="Number(postgresUserId)" />
    </div>
    <div v-else>
      <p>Veuillez vous connecter pour voir votre progression.</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { fetchGameModes } from '@/services/gameMode'
import type { AuthUser } from '@/services/pocketbase'
import { authService } from '@/services/pocketbase'
import { useMMRStore } from '@/stores/mmrStore'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'
import { formatDate } from '@/utils/date'
import CardMMR from '@/views/progress/CardMMR.vue'
import CardRank from '@/views/progress/CardRank.vue'

const user = ref<AuthUser | null>(null)
const selectedModeId = ref<number | string>(1)
const modes = ref<GameMode[]>([])
const mmrStore = useMMRStore()
const userStore = useUserStore()

const postgresUserId = computed(() => userStore.profile?.id)

const mmrHistory = computed(() => {
  if (!mmrStore.mmrData) return []
  const hist = (mmrStore.mmrData.history ?? []).map(h => ({ ...h, date: formatDate(h.date), isCurrent: false }))
  const current = {
    date: formatDate(new Date().toISOString()),
    mmr: mmrStore.mmrData.mmr,
    isCurrent: true
  }
  if (!hist.length || hist[hist.length - 1]?.mmr !== current.mmr) {
    hist.push(current)
  } else if (hist.length > 0) {
    hist[hist.length - 1]!.isCurrent = true
  }
  return hist
})

async function loadModes() {
  const fetchedModes = await fetchGameModes()
  modes.value = fetchedModes
  if (Array.isArray(modes.value) && modes.value.length > 0 && !selectedModeId.value) {
    const firstMode = modes.value[0]
    if (firstMode && typeof firstMode.id !== 'undefined') {
      selectedModeId.value = firstMode.id
    }
  }
}

async function handleModeChange(modeId: number | string) {
  selectedModeId.value = modeId
  if (user.value) {
    await mmrStore.fetchMMR(user.value.id, Number(selectedModeId.value))
  }
}

onMounted(async () => {
  const pbUser = authService.getUser()
  if (!pbUser) return
  user.value = pbUser
  await userStore.hydrateFromSession(pbUser.id)
  await loadModes()
  await mmrStore.fetchMMR(pbUser.id, Number(selectedModeId.value))
})

watch(() => user.value?.id, async (newId: string | undefined) => {
  if (newId) {
    await userStore.hydrateFromSession(newId)
  }
})
</script>

<style scoped>
.progress-view {
  padding: 20px;
}
.progress-view h1 {
  color: var(--color-cream);
  margin: 0 0 1.5rem 0;
}
.progress-section {
  margin-top: 32px;
}
</style>
