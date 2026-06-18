<template>
  <section class="missions-panel" aria-label="Missions et recompenses">
    <header class="missions-header">
      <h2 class="missions-title">Missions du jour</h2>
      <p class="missions-subtitle">Termine ces objectifs pour recuperer tes recompenses.</p>
    </header>

    <div v-if="loading" class="missions-state">Chargement des missions...</div>
    <div v-else-if="error" class="missions-state missions-state--error">{{ error }}</div>

    <div v-else class="missions-grid">
      <article
        v-for="mission in orderedDailyTasks"
        :key="mission.id"
        class="mission-card"
        :class="{ 'mission-card--done': mission.completed }"
      >
        <div class="mission-top">
          <h3 class="mission-name">{{ mission.title }}</h3>
          <span class="mission-status">{{ mission.completed ? 'Completee' : 'En cours' }}</span>
        </div>

        <p v-if="mission.description" class="mission-description">{{ mission.description }}</p>

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

    <details class="history-block" :open="completedTasks.length > 0">
      <summary>
        Missions terminees
        <span class="history-count">{{ completedTasks.length }}</span>
      </summary>
      <div v-if="completedTasks.length === 0" class="history-empty">Aucune mission terminee.</div>
      <ul v-else class="history-list">
        <li
          v-for="mission in completedTasks"
          :key="mission.dayDate + '-' + mission.id"
          class="history-item history-item--done"
        >
          <div>
            <strong>{{ mission.title }}</strong>
            <p class="history-meta">{{ formatDate(mission.dayDate) }} • {{ mission.progress }} / {{ mission.target }}</p>
            <p class="history-reward">{{ formatRewards(mission.rewards) }}</p>
          </div>
          <span class="history-status">Terminee</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import type { DailyTask, TaskReward } from '@/services/tasks'
import { fetchDailyTasks, fetchTaskHistory } from '@/services/tasks'

const props = defineProps<{
  userId?: number
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const dayDate = ref<string | null>(null)
const dailyTasks = ref<DailyTask[]>([])
const history = ref<Array<{ dayDate: string; tasks: DailyTask[] }>>([])

function progressPercent(task: DailyTask) {
  if (!task.target) return 0
  return Math.min(100, Math.round((task.progress / task.target) * 100))
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
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

const completedTasks = computed(() => {
  const today = dayDate.value
  return history.value
    .filter((day) => day.dayDate !== today)
    .flatMap((day) => day.tasks.map((task) => ({ ...task, dayDate: day.dayDate })))
    .filter((task) => task.completed)
})

async function loadTasks() {
  if (!props.userId) {
    dailyTasks.value = []
    history.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const [daily, taskHistory] = await Promise.all([
      fetchDailyTasks(props.userId),
      fetchTaskHistory(props.userId, 30),
    ])

    dayDate.value = daily.dayDate
    dailyTasks.value = daily.tasks
    history.value = taskHistory.history
  } catch {
    error.value = 'Impossible de charger les missions.'
  } finally {
    loading.value = false
  }
}

onMounted(loadTasks)

watch(
  () => props.userId,
  () => {
    void loadTasks()
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
  margin-bottom: 0.75rem;
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

.mission-description {
  margin: 0 0 0.45rem;
  font-size: 0.82rem;
  opacity: 0.82;
}

.mission-reward {
  margin: 0;
  font-size: 0.84rem;
  color: #f0c674;
}

.history-block {
  margin-top: 0.65rem;
  border: 1px solid #2a3a4e;
  border-radius: 8px;
  background: #0f1824;
}

.history-block > summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.8rem;
  font-weight: 600;
}

.history-block > summary::-webkit-details-marker {
  display: none;
}

.history-count {
  border: 1px solid #3d556e;
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  font-size: 0.78rem;
}

.history-empty {
  padding: 0 0.8rem 0.8rem;
  opacity: 0.75;
  font-size: 0.88rem;
}

.history-list {
  margin: 0;
  padding: 0 0.8rem 0.8rem;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.history-item {
  border: 1px solid #2f4055;
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.history-item--done {
  border-color: #2f7b50;
}

.history-meta {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  opacity: 0.8;
}

.history-reward {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: #f0c674;
}

.history-status {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
}
</style>
