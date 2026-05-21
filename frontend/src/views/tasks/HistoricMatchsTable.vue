<template>
  <div>
    <div v-if="loading" class="tasks-state">Chargement…</div>
    <div v-else-if="error" class="tasks-state error">{{ error }}</div>
    <div v-else-if="matches.length === 0" class="tasks-state empty">Aucun match trouvé.</div>

    <div v-else class="tasks-table-wrapper">
      <table class="tasks-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Résultat</th>
            <th>XP gagné</th>
            <th>Kills</th>
            <th>MMR avant</th>
            <th>MMR après</th>
            <th>Variation MMR</th>
            <th>Équipes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in matches" :key="match.match_id" :class="['match-row', match.result]">
            <td>{{ formatDateTime(match.played_at) }}</td>
            <td>{{ match.game_mode.name }}</td>
            <td>
              <span class="result-badge" :class="match.result">
                {{ resultLabel(match.result) }}
              </span>
            </td>
            <td class="xp">+{{ match.xp_gained }} XP</td>
            <td>{{ match.nb_kills }}</td>
            <td>{{ match.mmr_before ?? '–' }}</td>
            <td>{{ match.mmr_after ?? '–' }}</td>
            <td :class="(match.mmr_gained ?? 0) >= 0 ? 'mmr-up' : 'mmr-down'">
              {{ (match.mmr_gained ?? 0) >= 0 ? '+' : '' }}{{ match.mmr_gained ?? '–' }}
            </td>
            <td>
              <div v-for="team in match.teams" :key="team.id" class="team-inline">
                <strong>{{ team.name }}</strong> :
                {{ team.players.map(p => p.username).join(', ') }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="total > limit">
        <button :disabled="offset === 0" @click="emit('prev-page')">← Précédent</button>
        <span>Page {{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="offset + limit >= total" @click="emit('next-page')">Suivant →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { MatchEntry } from '@/services/matches'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{
  matches: MatchEntry[]
  total: number
  limit: number
  offset: number
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  'prev-page': []
  'next-page': []
}>()

const currentPage = computed(() => Math.floor(props.offset / props.limit) + 1)
const totalPages = computed(() => Math.ceil(props.total / props.limit))

function resultLabel(result: string) {
  const labels: Record<string, string> = { win: 'Victoire', loss: 'Défaite', draw: 'Nul', pending: '–' }
  return labels[result] ?? result
}
</script>

<style scoped>
.tasks-state {
  text-align: center;
  padding: 3rem;
  opacity: 0.6;
}

.tasks-state.error {
  color: #e87070;
  opacity: 1;
}

.tasks-table-wrapper {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.tasks-table th {
  background: #1a2230;
  padding: 0.7rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-cream);
  white-space: nowrap;
}

.tasks-table td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #2a3a4e;
  vertical-align: middle;
}

.match-row.win td:first-child {
  border-left: 3px solid #4caf84;
}

.match-row.loss td:first-child {
  border-left: 3px solid #e87070;
}

.match-row.draw td:first-child {
  border-left: 3px solid #aaa;
}

.result-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-badge.win {
  background: rgba(76, 175, 132, 0.2);
  color: #4caf84;
}

.result-badge.loss {
  background: rgba(232, 112, 112, 0.2);
  color: #e87070;
}

.result-badge.draw {
  background: rgba(170, 170, 170, 0.15);
  color: #aaa;
}

.xp {
  color: #f28b5b;
  font-weight: 600;
}

.mmr-up {
  color: #4caf84;
  font-weight: 600;
}

.mmr-down {
  color: #e87070;
  font-weight: 600;
}

.team-inline {
  font-size: 0.8rem;
  opacity: 0.85;
  margin-bottom: 0.2rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 0;
}

.pagination button {
  background: #1a2230;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
