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
            <th>Map</th>
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
            <td>
              <div class="map-cell">
                <img
                  v-if="getMapThumb(match)"
                  :src="getMapThumb(match)"
                  :alt="match.map?.name ?? 'Map'"
                  class="map-thumb"
                />
                <RouterLink
                  v-if="getMapDetailId(match)"
                  :to="{ name: 'maps-detail', params: { id: getMapDetailId(match) } }"
                  class="map-link"
                >
                  {{ match.map?.name ?? 'N/A' }}
                </RouterLink>
                <span v-else>{{ match.map?.name ?? 'N/A' }}</span>
              </div>
            </td>
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
            <td class="teams-col">
              <div class="teams-stack">
                <div
                  v-for="team in match.teams"
                  :key="team.id"
                  :class="['team-card', { 'my-team': team.id === match.my_team.id }]"
                >
                  <div class="team-head">
                    <strong class="team-name">{{ team.name }}</strong>
                    <div class="team-head-right">
                      <span v-if="team.id === match.my_team.id" class="my-team-badge"
                        >Ton équipe</span
                      >
                    </div>
                  </div>

                  <div class="team-players">
                    <span v-for="player in team.players" :key="player.id" class="player-chip">
                      {{ player.username }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <MatchHistoryPagination
        :total="total"
        :limit="limit"
        :offset="offset"
        :current-items-count="matches.length"
        @prev-page="emit('prev-page')"
        @next-page="emit('next-page')"
        @update:limit="(value) => emit('update:limit', value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import type { MatchEntry } from '@/services/matches'
import { useMapsStore } from '@/stores/mapsStore'
import { formatDateTime } from '@/utils/date'
import MatchHistoryPagination from '@/views/tasks/MatchHistoryPagination.vue'

defineProps<{
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
  'update:limit': [value: number]
}>()
const mapsStore = useMapsStore()

function resultLabel(result: string) {
  const labels: Record<string, string> = {
    win: 'Victoire',
    loss: 'Défaite',
    draw: 'Nul',
    pending: '–',
  }
  return labels[result] ?? result
}

function getMapDetailId(match: MatchEntry): number | null {
  if (!match.map) return null

  if (typeof match.map.id === 'string' && match.map.id.length > 0) {
    return Number.parseInt(match.map.id, 10)
  }

  const found = mapsStore.maps.find((map) => map.title === match.map?.name)
  return found?.id ?? null
}

function getMapThumb(match: MatchEntry): string {
  const mapId = getMapDetailId(match)
  if (!mapId) return ''

  return mapsStore.getMap(mapId)?.screenshots[0]?.url ?? ''
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

.teams-col {
  min-width: 300px;
}

.teams-stack {
  display: grid;
  gap: 0.45rem;
}

.team-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left-width: 3px;
  border-left-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0.45rem 0.6rem;
  background: rgba(255, 255, 255, 0.02);
}

.team-card.my-team {
  border-left-color: #f28b5b;
  background: rgba(242, 139, 91, 0.14);
  box-shadow: inset 0 0 0 1px rgba(242, 139, 91, 0.45);
}

.team-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.team-name {
  font-size: 0.82rem;
}

.team-head-right {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.my-team-badge {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.25);
  color: #ffb08e;
}

.team-players {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.player-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  color: #d8deea;
  background: rgba(26, 34, 48, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.map-link {
  color: #f2c875;
  text-decoration: underline;
}

.map-link:hover {
  color: #ffd98f;
}

.map-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.map-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>
