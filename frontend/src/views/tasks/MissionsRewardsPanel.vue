<template>
  <section class="missions-panel" aria-label="Missions et recompenses">
    <header class="missions-header">
      <div>
        <h2 class="missions-title">Missions du jour</h2>
        <p class="missions-subtitle">Termine ces objectifs pour recuperer tes recompenses.</p>
        <p class="missions-rank-note">
          Rang sur {{ selectedModeLabel }}: <strong>{{ rankDisplay }}</strong>
        </p>
        <p class="missions-rank-impact">La difficulte des objectifs suit ton rang sur ce mode.</p>
      </div>
      <div class="missions-mode-filter">
        <label class="missions-mode-label">Mode de jeu</label>
        <ModeSelector :modes="modes" :model-value="modeSelectorValue" @update:model-value="onModeSelectorUpdate" />
      </div>
    </header>

    <div v-if="loading" class="missions-state">Chargement des missions...</div>
    <div v-else-if="error" class="missions-state missions-state--error">{{ error }}</div>

    <div v-else>
      <Transition name="missions-swap" mode="out-in">
        <div :key="`missions-${modeSelectorValue}`" class="missions-grid">
          <article
            v-for="mission in orderedDailyTasks"
            :key="`${mission.id}-${modeSelectorValue}`"
            class="mission-card"
            :class="{ 'mission-card--done': mission.completed }"
          >
            <div class="mission-top">
              <h3 class="mission-name">{{ mission.title }}</h3>
              <span class="mission-status">{{ mission.completed ? 'Completee' : 'En cours' }}</span>
            </div>

            <div class="mission-progress-row">
              <div class="mission-progress-track">
                <div class="mission-progress-fill" :style="{ width: `${progressPercent(mission)}%` }" />
              </div>
              <span class="mission-progress-text">{{ mission.progress }} / {{ mission.target }}</span>
            </div>

            <p class="mission-reward">Recompense: {{ formatRewards(mission.rewards) }}</p>
          </article>

          <div v-if="orderedDailyTasks.length === 0" class="missions-state">Aucune mission du jour active.</div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import api from '@/api'
import ModeSelector from '@/components/game-mode/ModeSelector.vue'
import { type DailyTask, fetchDailyTasks, type TaskReward } from '@/services/tasks'
import type { RankData } from '@/stores/rankStore'
import type { GameMode } from '@/types/gameMode'

const props = defineProps<{
  userId?: number
  modeId?: number
  modes: GameMode[]
}>()

const emit = defineEmits<{
  (event: 'update:modeId', value: number | undefined): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const dayDate = ref<string | null>(null)
const dailyTasks = ref<DailyTask[]>([])
const rankLoading = ref(false)
const rankError = ref<string | null>(null)
const rankData = ref<RankData | null>(null)

const modeSelectorValue = computed<number | string>(() => props.modeId ?? 0)

const modes = computed(() => props.modes)

const selectedModeLabel = computed(() => {
  if (!props.modeId) return 'Tous les modes'
  return props.modes.find((mode) => Number(mode.id) === Number(props.modeId))?.name ?? `Mode ${props.modeId}`
})

const rankDisplay = computed(() => {
  if (rankLoading.value) return 'Chargement du rang...'
  if (rankError.value) return 'Rang indisponible'
  if (!rankData.value) return 'Aucun rang disponible'
  if (rankData.value.division) return `${rankData.value.rank} ${rankData.value.division}`
  return rankData.value.rank
})

function onModeSelectorUpdate(val: number | string) {
  const nextModeId = Number(val)
  const normalized = Number.isInteger(nextModeId) && nextModeId > 0 ? nextModeId : undefined
  emit('update:modeId', props.modeId === normalized ? undefined : normalized)
}

function progressPercent(task: DailyTask) {
  if (!task.target) return 0
  return Math.min(100, Math.round((task.progress / task.target) * 100))
}

function rewardLabel(reward: TaskReward) {
  if (reward.item) return `+${reward.quantity} objet${reward.quantity > 1 ? 's' : ''} • ${reward.item.name}`
  const total = reward.amount * reward.quantity
  if (reward.type === 'soft_currency') return `+${total} étoiles`
  if (reward.type === 'hard_currency' || reward.type === 'stars') return `+${total} étoiles`
  if (reward.type === 'xp') return `+${total} XP`
  return `+${total} ${reward.name}`
}

function formatRewards(rewards: TaskReward[]) {
  if (!rewards.length) return 'Aucune recompense'
  return rewards.map((reward) => rewardLabel(reward)).join(' + ')
}

const orderedDailyTasks = computed(() => {
  return [...dailyTasks.value].sort((a, b) => Number(a.completed) - Number(b.completed))
})

async function loadRank() {
  if (!props.userId) {
    rankData.value = null
    return
  }

  rankLoading.value = true
  rankError.value = null

  try {
    let url = `/ranks/${props.userId}/rank`
    if (props.modeId) url += `?modeId=${props.modeId}`
    const { data } = await api.get<RankData>(url)
    rankData.value = data
  } catch {
    rankData.value = null
    rankError.value = 'Impossible de charger le rang.'
  } finally {
    rankLoading.value = false
  }
}

async function loadTasks() {
  if (!props.userId) {
    dailyTasks.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const daily = await fetchDailyTasks(props.userId, props.modeId)

    dayDate.value = daily.dayDate
    dailyTasks.value = daily.tasks
  } catch {
    error.value = 'Impossible de charger les missions.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadTasks(), loadRank()])
})

watch(
  () => [props.userId, props.modeId],
  () => {
    void loadTasks()
    void loadRank()
  }
)
</script>

<style scoped>
.missions-panel {
  margin-bottom: 1.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid #2a3a4e;
  border-radius: 10px;
  background: linear-gradient(180deg, #101925, #0c141f);
}

.missions-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.missions-mode-filter :deep(.mode-selector) {
  margin-bottom: 0;
}

.missions-mode-label {
  display: block;
  font-size: 0.72rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
}

.missions-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-cream);
}

.missions-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  opacity: 0.78;
}

.missions-rank-note {
  margin: 0.45rem 0 0;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.9);
}

.missions-rank-note strong {
  color: #f0c674;
}

.missions-rank-impact {
  margin: 0.18rem 0 0;
  font-size: 0.78rem;
  opacity: 0.72;
}

.missions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.missions-state {
  opacity: 0.8;
  padding: 0.6rem 0;
}

.missions-state--error {
  color: #ff8f8f;
}

.mission-card {
  border: 1px solid #33475f;
  border-radius: 10px;
  background: #132031;
  padding: 0.7rem;
}

.mission-card--done {
  border-color: #2f7b50;
  box-shadow: 0 0 0 1px rgba(67, 160, 71, 0.3) inset;
}

.mission-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.mission-name {
  margin: 0;
  font-size: 0.92rem;
}

.mission-status {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.78;
}

.mission-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.mission-progress-track {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  background: #0b1520;
  overflow: hidden;
}

.mission-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #58a6ff, #3fb950);
}

.mission-progress-text {
  font-size: 0.75rem;
  opacity: 0.86;
  min-width: 58px;
  text-align: right;
}

.mission-reward {
  margin: 0;
  font-size: 0.84rem;
  color: #f0c674;
}

.missions-swap-enter-active,
.missions-swap-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.missions-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.missions-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 880px) {
  .missions-header {
    flex-direction: column;
    align-items: stretch;
  }

  .missions-mode-filter {
    min-width: 0;
  }
}
</style>
