<template>
  <div class="progress-view" v-if="user">
    <header class="progress-hero">
      <div>
        <h1 class="progress-title">Progression de {{ user.username }}</h1>
        <p class="progress-subtitle">Visualise ta dynamique de jeu, ton niveau et tes statistiques de performance.</p>
      </div>
      <div class="hero-badges">
        <span class="hero-badge">{{ currentModeLabel }}</span>
        <span class="hero-badge hero-badge--soft">{{ insightsMatches.length }} matchs analysés</span>
      </div>
    </header>

    <section class="progress-panel progress-panel--filters">
      <div class="progress-filters-bar">
        <span class="filters-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filtres
        </span>
        <div class="filters-group">
          <div class="filter-item">
            <span class="filter-item-label">Mode de jeu</span>
            <ModeSelector
              v-if="modes && modes.length"
              :modes="modes"
              v-model="selectedModeId"
            />
          </div>
          <div class="filter-separator"></div>
          <div class="filter-item">
            <span class="filter-item-label">Période</span>
            <DateFilter v-model="selectedDateRange" @update:modelValue="onPresetChange" />
          </div>
          <div class="filter-separator"></div>
          <div class="filter-item">
            <span class="filter-item-label">Plage personnalisée</span>
            <DateRangePicker v-model:from="customFrom" v-model:to="customTo" />
          </div>
        </div>
      </div>
    </section>

    <section class="progress-panel">
      <RateCard
        v-if="postgresUserId"
        :user-id="Number(postgresUserId)"
        :mode-id="Number(selectedModeId)"
        :date-from="rateDateFrom"
        :date-to="rateDateTo"
      />
    </section>

    <section class="progress-panel">
      <InsightsPieCharts :matches="insightsMatches" />
    </section>

    <section class="progress-split" v-if="user">
      <CardMMR
        v-if="mmrStore.mmrData"
        :mmr="mmrStore.mmrData.mmr"
        :rank="mmrStore.mmrData.rank"
        :history="mmrHistory"
        :modes="modes"
        :selectedModeId="selectedModeId ?? 0"
      />
      <CardRank v-if="postgresUserId" :userId="Number(postgresUserId)" :selectedModeId="selectedModeId ?? 0" :modes="modes" />
    </section>

    <section class="progress-panel progress-panel--end" v-if="user">
      <ProgressStatsGrid :matches="insightsMatches" />
    </section>

    <div v-else>
      <p>Veuillez vous connecter pour voir votre progression.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import ModeSelector from '@/components/game-mode/ModeSelector.vue'
import { fetchGameModes } from '@/services/gameMode'
import { fetchMatchHistory, type MatchEntry } from '@/services/matches'
import type { AuthUser } from '@/services/pocketbase'
import { authService } from '@/services/pocketbase'
import { useMMRStore } from '@/stores/mmrStore'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'
import { formatDate } from '@/utils/date'
import CardMMR from '@/views/progress/CardMMR.vue'
import CardRank from '@/views/progress/CardRank.vue'
import type { DateRange } from '@/views/progress/DateFilter.vue'
import DateFilter from '@/views/progress/DateFilter.vue'
import DateRangePicker from '@/views/progress/DateRangePicker.vue'
import InsightsPieCharts from '@/views/progress/InsightsPieCharts.vue'
import ProgressStatsGrid from '@/views/progress/ProgressStatsGrid.vue'
import RateCard from '@/views/progress/RateCard.vue'

const user = ref<AuthUser | null>(null)
const selectedModeId = ref<number | string>(1)
const selectedDateRange = ref<DateRange>('all')
const customFrom = ref<string>('')
const customTo = ref<string>('')
const insightsMatches = ref<MatchEntry[]>([])

function onPresetChange() {
  customFrom.value = ''
  customTo.value = ''
}
const modes = ref<GameMode[]>([])
const mmrStore = useMMRStore()
const userStore = useUserStore()

const postgresUserId = computed(() => userStore.profile?.id)
const currentModeLabel = computed(() => {
  const mode = modes.value.find((item) => String(item.id) === String(selectedModeId.value))
  return mode ? `Mode: ${mode.name}` : 'Mode: Tous'
})

function getDateThreshold(range: DateRange): Date | null {
  const now = new Date()
  if (range === 'week')    { now.setDate(now.getDate() - 7);   return now }
  if (range === '3weeks')  { now.setDate(now.getDate() - 21);  return now }
  if (range === 'month')   { now.setMonth(now.getMonth() - 1); return now }
  if (range === '3months') { now.setMonth(now.getMonth() - 3); return now }
  if (range === 'year')    { now.setFullYear(now.getFullYear() - 1); return now }
  return null
}

const rateDateFrom = computed(() => {
  if (customFrom.value) return customFrom.value
  const threshold = getDateThreshold(selectedDateRange.value)
  if (!threshold) return undefined
  return threshold.toISOString().split('T')[0]
})

const rateDateTo = computed(() => {
  if (customTo.value) return customTo.value
  return undefined
})

const mmrHistory = computed(() => {
  if (!mmrStore.mmrData) return []
  const rawHistory = mmrStore.mmrData.history ?? []
  let filtered = rawHistory

  if (customFrom.value || customTo.value) {
    const from = customFrom.value ? new Date(customFrom.value).getTime() : -Infinity
    const to = customTo.value ? new Date(customTo.value + 'T23:59:59').getTime() : Infinity
    filtered = rawHistory.filter(h => {
      const t = new Date(h.date).getTime()
      return t >= from && t <= to
    })
  } else {
    const threshold = getDateThreshold(selectedDateRange.value)
    if (threshold) {
      filtered = rawHistory.filter(h => new Date(h.date).getTime() >= threshold.getTime())
    }
  }
  const hist = filtered.map(h => ({ ...h, date: formatDate(h.date), isCurrent: false }))
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

async function loadInsights() {
  if (!postgresUserId.value) {
    insightsMatches.value = []
    return
  }

  const modeId = selectedModeId.value ? Number(selectedModeId.value) : undefined
  const limit = 100
  let offset = 0
  let total = 0
  const allMatches: MatchEntry[] = []

  do {
    const res = await fetchMatchHistory(
      postgresUserId.value,
      modeId,
      undefined,
      rateDateFrom.value,
      rateDateTo.value,
      limit,
      offset,
    )
    total = res.total
    allMatches.push(...res.matches)
    offset += res.matches.length
    if (res.matches.length === 0) break
  } while (allMatches.length < total && allMatches.length < 1000)

  insightsMatches.value = allMatches
}

watch(selectedModeId, async (newModeId) => {
  if (user.value && newModeId) {
    await mmrStore.fetchMMR(user.value.id, Number(newModeId))
  }
})

onMounted(async () => {
  const pbUser = authService.getUser()
  if (!pbUser) return
  user.value = pbUser
  await userStore.hydrateFromSession(pbUser.id)
  await loadModes()
  await mmrStore.fetchMMR(pbUser.id, Number(selectedModeId.value))
  await loadInsights()
})

watch(() => user.value?.id, async (newId: string | undefined) => {
  if (newId) {
    await userStore.hydrateFromSession(newId)
  }
})

watch(
  () => [postgresUserId.value, selectedModeId.value, rateDateFrom.value, rateDateTo.value],
  async () => {
    await loadInsights()
  },
)
</script>

<style scoped>
.progress-view {
  padding: 1.5rem;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.progress-title {
  color: var(--color-cream);
  margin: 0;
  font-size: clamp(1.45rem, 2vw, 2rem);
  line-height: 1.15;
}

.progress-subtitle {
  margin: 0.5rem 0 0;
  color: color-mix(in srgb, var(--color-cream) 78%, var(--color-background-secondary));
  max-width: 58ch;
  font-size: 0.95rem;
}

.hero-badges {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-apricot) 55%, transparent);
  background: color-mix(in srgb, var(--color-apricot) 18%, transparent);
  color: var(--color-cream);
  font-size: 0.78rem;
  font-weight: 600;
}

.hero-badge--soft {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
}

.progress-panel {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  box-shadow: 0 12px 24px -20px rgba(0, 0, 0, 0.45);
  padding: 0.95rem;
}

.progress-panel--filters {
  padding: 0.7rem 0.95rem;
}

.progress-panel--end {
  margin-top: 0.2rem;
}

.progress-filters-bar {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 0;
}

.filters-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  padding: 0.35rem 0.95rem 0.35rem 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-group {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.filter-item-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}

.filter-separator {
  width: 1px;
  height: 30px;
  margin-top: 0.2rem;
  background: rgba(255, 255, 255, 0.1);
}

.progress-filters-bar :deep(.date-filter select),
.progress-filters-bar > .filters-group > .filter-item > select {
  padding: 6px 32px 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e2736;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.progress-filters-bar :deep(.mode-selector) {
  margin-bottom: 0;
}

.progress-filters-bar :deep(.mode-buttons) {
  gap: 0.45rem;
}

.progress-filters-bar :deep(.mode-button) {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: #1e2736;
  color: var(--color-cream);
  padding: 0.36rem 0.72rem;
  border-radius: 9px;
  font-size: 0.95rem;
  line-height: 1.1;
}

.progress-filters-bar :deep(.mode-button.is-selected) {
  background: var(--color-apricot);
  border-color: var(--color-apricot);
  color: var(--color-ink);
}

.progress-filters-bar :deep(label) {
  display: none;
}

.progress-filters-bar :deep(select) {
  padding: 6px 32px 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e2736;
  color: #e2e8f0;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.progress-filters-bar :deep(select:hover) {
  border-color: rgba(255, 255, 255, 0.3);
  background-color: #263044;
}

.progress-filters-bar :deep(option) {
  background-color: #1e2736;
  color: #e2e8f0;
}

.progress-split {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 1rem;
}

.progress-split :deep(.mmr-card),
.progress-split :deep(.card-rank) {
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  .progress-view {
    padding: 1rem;
    gap: 0.8rem;
  }

  .progress-hero {
    flex-direction: column;
  }

  .hero-badges {
    justify-content: flex-start;
  }

  .progress-filters-bar {
    flex-direction: column;
    gap: 0.7rem;
  }

  .filters-label {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 0 0.45rem;
    width: 100%;
  }

  .filter-separator {
    display: none;
  }

  .filters-group {
    width: 100%;
    gap: 0.7rem;
  }

  .filter-item {
    flex-wrap: wrap;
  }

  .progress-split {
    grid-template-columns: 1fr;
  }
}
</style>
