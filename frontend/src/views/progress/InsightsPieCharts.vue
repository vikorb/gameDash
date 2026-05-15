<template>
  <section class="insights-section" aria-label="Statistiques des matchs">
    <article class="insight-card">
      <h3 class="insight-title">Résultats</h3>
      <div v-if="hasMatches" class="chart-wrap">
        <Pie :data="resultsData" :options="chartOptions" />
      </div>
      <p v-else class="empty-text">Aucune donnée sur la période.</p>
    </article>

    <article class="insight-card">
      <h3 class="insight-title">Delta MMR</h3>
      <div v-if="hasMatches" class="chart-wrap">
        <Pie :data="mmrDeltaData" :options="chartOptions" />
      </div>
      <p v-else class="empty-text">Aucune donnée sur la période.</p>
    </article>

    <article class="insight-card">
      <h3 class="insight-title">Répartition des kills</h3>
      <div v-if="hasMatches" class="chart-wrap">
        <Pie :data="killsData" :options="chartOptions" />
      </div>
      <p v-else class="empty-text">Aucune donnée sur la période.</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ArcElement, Chart as ChartJS, type ChartData, type ChartOptions, Legend, Tooltip } from 'chart.js'
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'

import type { MatchEntry } from '@/services/matches'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  matches: MatchEntry[]
}>()

const hasMatches = computed(() => props.matches.length > 0)

function resolveCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const theme = {
  cream: resolveCssVar('--color-cream', '#fcefe1'),
  apricot: resolveCssVar('--color-apricot', '#f28b5b'),
  apricotDark: resolveCssVar('--color-apricot-dark', '#e27b4c'),
  primaryStrong: resolveCssVar('--color-primary-strong', '#f7a784'),
  danger: resolveCssVar('--color-danger', '#e15b5b'),
  navy: resolveCssVar('--color-navy', '#2e3244'),
  slate: resolveCssVar('--color-slate', '#516079'),
}

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: theme.cream,
        boxWidth: 12,
        padding: 14,
      },
    },
  },
}

function buildPieData(labels: string[], values: number[], colors: string[]): ChartData<'pie', number[], string> {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: theme.navy,
        borderWidth: 2,
      },
    ],
  }
}

const resultsData = computed(() => {
  const wins = props.matches.filter((m) => m.result === 'win').length
  const losses = props.matches.filter((m) => m.result === 'loss').length
  const draws = props.matches.filter((m) => m.result === 'draw').length
  const pending = props.matches.filter((m) => m.result === 'pending').length

  return buildPieData(
    ['Victoires', 'Défaites', 'Nuls', 'Pending'],
    [wins, losses, draws, pending],
    [theme.apricot, theme.danger, theme.primaryStrong, theme.slate],
  )
})

const mmrDeltaData = computed(() => {
  const positive = props.matches.filter((m) => m.mmr_gained > 0).length
  const negative = props.matches.filter((m) => m.mmr_gained < 0).length
  const neutral = props.matches.filter((m) => m.mmr_gained === 0).length

  return buildPieData(
    ['MMR +', 'MMR -', 'MMR stable'],
    [positive, negative, neutral],
    [theme.apricot, theme.danger, theme.slate],
  )
})

const killsData = computed(() => {
  const bucket0to2 = props.matches.filter((m) => m.nb_kills <= 2).length
  const bucket3to5 = props.matches.filter((m) => m.nb_kills >= 3 && m.nb_kills <= 5).length
  const bucket6to9 = props.matches.filter((m) => m.nb_kills >= 6 && m.nb_kills <= 9).length
  const bucket10plus = props.matches.filter((m) => m.nb_kills >= 10).length

  return buildPieData(
    ['0-2', '3-5', '6-9', '10+'],
    [bucket0to2, bucket3to5, bucket6to9, bucket10plus],
    [theme.slate, theme.primaryStrong, theme.apricotDark, theme.apricot],
  )
})
</script>

<style scoped>
.insights-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.2rem 0 1.8rem;
}

.insight-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.9rem 1rem 1rem;
}

.insight-title {
  margin: 0 0 0.75rem;
  color: var(--color-cream);
  font-size: 0.95rem;
  font-weight: 700;
}

.chart-wrap {
  position: relative;
  height: 240px;
}

.empty-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .insights-section {
    grid-template-columns: 1fr;
  }

  .chart-wrap {
    height: 220px;
  }
}
</style>
