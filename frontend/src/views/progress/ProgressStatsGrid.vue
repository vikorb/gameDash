<template>
  <section class="stats-grid-section" aria-label="Indicateurs de progression">
    <h2 class="stats-grid-title">Synthese de performance</h2>

    <div v-if="stats.length" class="stats-grid">
      <ProgressStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :hint="stat.hint"
        :tone="stat.tone"
      />
    </div>

    <p v-else class="stats-empty">Pas encore assez de matchs pour calculer les statistiques.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { MatchEntry } from '@/services/matches'
import ProgressStatCard from '@/views/progress/ProgressStatCard.vue'

type StatTone = 'default' | 'positive' | 'negative' | 'accent'

type StatItem = {
  label: string
  value: string
  hint?: string
  tone?: StatTone
}

const props = defineProps<{
  matches: MatchEntry[]
}>()

const orderedMatches = computed(() => {
  return [...props.matches].sort((a, b) => {
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
  })
})

function toPercent(part: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

function toAverage(total: number, count: number, digits = 1) {
  if (!count) return '0'
  return (total / count).toFixed(digits)
}

const currentStreak = computed(() => {
  const decisive = orderedMatches.value.filter((m) => m.result === 'win' || m.result === 'loss')
  const firstDecisive = decisive[0]
  if (!firstDecisive) {
    return { text: '-', tone: 'default' as StatTone, hint: 'Aucune victoire ou defaite sur la periode.' }
  }

  const start = firstDecisive.result
  let count = 0
  for (const match of decisive) {
    if (match.result === start) {
      count += 1
    } else {
      break
    }
  }

  const isWin = start === 'win'
  return {
    text: `${count} ${isWin ? 'victoire(s)' : 'defaite(s)'}`,
    tone: (isWin ? 'positive' : 'negative') as StatTone,
    hint: 'Serie en cours (matchs decisifs).',
  }
})

const bestWinStreak = computed(() => {
  let best = 0
  let current = 0
  for (const match of [...orderedMatches.value].reverse()) {
    if (match.result === 'win') {
      current += 1
      if (current > best) best = current
    } else {
      current = 0
    }
  }
  return best
})

const averageMmr = computed(() => {
  const total = orderedMatches.value.reduce((sum, match) => sum + match.mmr_gained, 0)
  const avg = Number(toAverage(total, orderedMatches.value.length, 1))
  const prefix = avg > 0 ? '+' : ''
  return {
    value: `${prefix}${avg.toFixed(1)}`,
    tone: (avg > 0 ? 'positive' : avg < 0 ? 'negative' : 'default') as StatTone,
  }
})

const averageKills = computed(() => {
  const total = orderedMatches.value.reduce((sum, match) => sum + match.nb_kills, 0)
  return Number(toAverage(total, orderedMatches.value.length, 1)).toFixed(1)
})

const averageXp = computed(() => {
  const total = orderedMatches.value.reduce((sum, match) => sum + match.xp_gained, 0)
  return Number(toAverage(total, orderedMatches.value.length, 0)).toLocaleString('fr-FR')
})

const topPerfRate = computed(() => {
  const topPerf = orderedMatches.value.filter((m) => m.nb_kills >= 6).length
  return toPercent(topPerf, orderedMatches.value.length)
})

const positiveMmrRate = computed(() => {
  const positive = orderedMatches.value.filter((m) => m.mmr_gained > 0).length
  return toPercent(positive, orderedMatches.value.length)
})

const bestMode = computed(() => {
  const byMode = new Map<number, { name: string; total: number; wins: number; mmr: number }>()

  for (const match of orderedMatches.value) {
    const id = match.game_mode.id
    const entry = byMode.get(id) ?? { name: match.game_mode.name, total: 0, wins: 0, mmr: 0 }
    entry.total += 1
    if (match.result === 'win') entry.wins += 1
    entry.mmr += match.mmr_gained
    byMode.set(id, entry)
  }

  let bestName = '-'
  let bestWinrate = -1
  let bestAvgMmr = -Infinity

  for (const entry of byMode.values()) {
    if (!entry.total) continue
    const winrate = entry.wins / entry.total
    const avgMmr = entry.mmr / entry.total
    if (winrate > bestWinrate || (winrate === bestWinrate && avgMmr > bestAvgMmr)) {
      bestName = entry.name
      bestWinrate = winrate
      bestAvgMmr = avgMmr
    }
  }

  return {
    name: bestName,
    hint: bestWinrate >= 0 ? `${Math.round(bestWinrate * 100)}% de winrate` : 'Aucune donnee',
  }
})

const stats = computed<StatItem[]>(() => {
  if (!orderedMatches.value.length) return []

  return [
    {
      label: 'Serie actuelle',
      value: currentStreak.value.text,
      hint: currentStreak.value.hint,
      tone: currentStreak.value.tone,
    },
    {
      label: 'Best streak',
      value: `${bestWinStreak.value} victoire(s)`,
      hint: 'Meilleure serie de victoires sur la periode.',
      tone: 'positive',
    },
    {
      label: 'MMR moyen / match',
      value: averageMmr.value.value,
      hint: 'Moyenne de mmr_gained',
      tone: averageMmr.value.tone,
    },
    {
      label: 'Kills moyens / match',
      value: averageKills.value,
      hint: 'Moyenne de nb_kills',
      tone: 'accent',
    },
    {
      label: 'XP moyen / match',
      value: averageXp.value,
      hint: 'Moyenne de xp_gained',
      tone: 'default',
    },
    {
      label: 'Ratio top perf (6+ kills)',
      value: topPerfRate.value,
      hint: 'Part de matchs avec au moins 6 kills',
      tone: 'accent',
    },
    {
      label: 'Matchs MMR positif',
      value: positiveMmrRate.value,
      hint: 'Taux de matchs avec mmr_gained > 0',
      tone: 'positive',
    },
    {
      label: 'Mode le plus performant',
      value: bestMode.value.name,
      hint: bestMode.value.hint,
      tone: 'default',
    },
  ]
})
</script>

<style scoped>
.stats-grid-section {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.stats-grid-title {
  margin: 0 0 0.9rem;
  color: var(--color-cream);
  font-size: 1.05rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.stats-empty {
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
