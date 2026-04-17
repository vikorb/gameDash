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
  set: (val) => {
    if (postgresUserId.value) store.setMode(postgresUserId.value, val)
  },
})

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
