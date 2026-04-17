<template>
  <div class="tasks-view">
    <div class="tasks-header">
      <h1 class="tasks-title">Historique des matchs</h1>
      <div class="tasks-filters">
        <label class="filter-label">Mode de jeu</label>
        <select v-model="selectedModeId" class="filter-select">
          <option :value="undefined">Tous les modes</option>
          <option v-for="mode in modes" :key="mode.id" :value="mode.id">{{ mode.name }}</option>
        </select>
      </div>
    </div>

    <HistoricMatchsTable
      :matches="matches"
      :total="total"
      :limit="limit"
      :offset="offset"
      :loading="loading"
      :error="error"
      @prev-page="prevPage"
      @next-page="nextPage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import HistoricMatchsTable from '@/components/tasks/HistoricMatchsTable.vue'
import { fetchGameModes } from '@/services/gameMode'
import { fetchMatchHistory, type MatchEntry } from '@/services/matches'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'

const userStore = useUserStore()
const postgresUserId = computed(() => userStore.profile?.id)

const modes = ref<GameMode[]>([])
const selectedModeId = ref<number | undefined>(undefined)
const matches = ref<MatchEntry[]>([])
const total = ref(0)
const limit = 20
const offset = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!postgresUserId.value) return
  loading.value = true
  error.value = null
  try {
    const res = await fetchMatchHistory(postgresUserId.value, selectedModeId.value, limit, offset.value)
    matches.value = res.matches
    total.value = res.total
  } catch {
    error.value = 'Impossible de charger l\'historique des matchs.'
  } finally {
    loading.value = false
  }
}

function prevPage() {
  offset.value = Math.max(0, offset.value - limit)
}

function nextPage() {
  offset.value += limit
}

onMounted(async () => {
  modes.value = await fetchGameModes()
  await load()
})

watch([selectedModeId, offset], load)
watch(() => postgresUserId.value, async () => {
  offset.value = 0
  await load()
})
</script>

<style scoped>
.tasks-view {
  padding: 2rem;
  color: var(--color-cream);
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.tasks-title {
  font-size: 1.6rem;
  margin: 0;
}

.tasks-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.filter-select {
  background: #1a2230;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.9rem;
}
</style>
