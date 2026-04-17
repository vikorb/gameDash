<template>
  <div class="tasks-view">
    <div class="tasks-header">
      <h1 class="tasks-title">Historique des matchs</h1>
    </div>

    <div class="tasks-filters">
      <div class="filter-group">
        <label class="filter-label">Mode de jeu</label>
        <select v-model="selectedModeId" class="filter-select">
          <option :value="undefined">Tous les modes</option>
          <option v-for="mode in modes" :key="mode.id" :value="mode.id">{{ mode.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Résultat</label>
        <select v-model="selectedResult" class="filter-select">
          <option :value="undefined">Tous</option>
          <option value="win">Victoire</option>
          <option value="loss">Défaite</option>
          <option value="draw">Nul</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Du</label>
        <input v-model="dateFrom" type="date" class="filter-input" />
      </div>

      <div class="filter-group">
        <label class="filter-label">Au</label>
        <input v-model="dateTo" type="date" class="filter-input" />
      </div>

      <button class="filter-reset" @click="resetFilters">Réinitialiser</button>
    </div>

    <HistoricMatchsTable
      :matches="store.matches"
      :total="store.total"
      :limit="store.limit"
      :offset="store.offset"
      :loading="store.loading"
      :error="store.error?.message ?? null"
      @prev-page="store.prevPage(postgresUserId!)"
      @next-page="store.nextPage(postgresUserId!)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { fetchGameModes } from '@/services/gameMode'
import { useMatchHistoricStore } from '@/stores/matchHistoricStore'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'
import HistoricMatchsTable from '@/views/tasks/HistoricMatchsTable.vue'

const userStore = useUserStore()
const store = useMatchHistoricStore()
const postgresUserId = computed(() => userStore.profile?.id)

const modes = ref<GameMode[]>([])

const selectedModeId = computed({
  get: () => store.selectedModeId,
  set: (val) => { if (postgresUserId.value) store.setMode(postgresUserId.value, val) },
})

const selectedResult = computed({
  get: () => store.selectedResult,
  set: (val) => { if (postgresUserId.value) store.setResult(postgresUserId.value, val) },
})

const dateFrom = computed({
  get: () => store.dateFrom ?? '',
  set: (val) => {
    if (postgresUserId.value) store.setDateRange(postgresUserId.value, val || undefined, store.dateTo)
  },
})

const dateTo = computed({
  get: () => store.dateTo ?? '',
  set: (val) => {
    if (postgresUserId.value) store.setDateRange(postgresUserId.value, store.dateFrom, val || undefined)
  },
})

function resetFilters() {
  if (!postgresUserId.value) return
  store.reset()
  store.fetch(postgresUserId.value)
}

onMounted(async () => {
  modes.value = await fetchGameModes()
  if (postgresUserId.value) await store.fetch(postgresUserId.value)
})

watch(() => postgresUserId.value, async (id) => {
  if (id) {
    store.reset()
    await store.fetch(id)
  }
})
</script>

<style scoped>
.tasks-view {
  padding: 2rem;
  color: var(--color-cream);
}

.tasks-header {
  margin-bottom: 1rem;
}

.tasks-title {
  font-size: 1.6rem;
  margin: 0;
}

.tasks-filters {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1rem 1.2rem;
  background: #111b27;
  border: 1px solid #2a3a4e;
  border-radius: 10px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.filter-label {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select,
.filter-input {
  background: #1a2230;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.9rem;
  min-width: 130px;
}

.filter-input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.5);
}

.filter-reset {
  background: transparent;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.35rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
  opacity: 0.7;
  align-self: flex-end;
  transition: opacity 0.15s;
}

.filter-reset:hover {
  opacity: 1;
}
</style>
