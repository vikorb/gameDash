<template>
  <div class="mmr-card">
    <div class="mmr-header">
      <h2>
        MMR <strong>{{ mmr }}</strong>
      </h2>
    </div>
    <div class="mmr-graph">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

import type { GameMode } from '@/types/gameMode'
import type { MMRHistory } from '@/types/mmr'

Chart.register(...registerables)

const props = defineProps({
  mmr: { type: Number, required: true },
  history: { type: Array as () => MMRHistory[], required: true },
  modes: { type: Array as () => GameMode[], required: false, default: () => [] },
  selectedModeId: { type: [Number, String], required: false, default: 1 },
})

const medianMMR = computed<number | null>(() => {
  const values = props.history
    .map((h: MMRHistory) => h.mmr)
    .filter((value: unknown): value is number => typeof value === 'number')
    .sort((a, b) => a - b)

  if (values.length === 0) return null

  const middle = Math.floor(values.length / 2)

  if (values.length % 2 === 1) {
    return values[middle] ?? null
  }

  const left = values[middle - 1] ?? 0
  const right = values[middle] ?? 0
  return (left + right) / 2
})

const chartData = computed(() => ({
  labels: props.history.map((h: MMRHistory) => h.date),
  datasets: [
    {
      label: 'MMR',
      data: props.history.map((h: MMRHistory) => h.mmr),
      borderColor: '#f28b5b',
      backgroundColor: 'rgba(242,139,91,0.08)',
      tension: 0.3,
      fill: false,
      pointRadius: props.history.map((h: MMRHistory) => (h.isCurrent ? 8 : 4)),
      pointBackgroundColor: props.history.map((h: MMRHistory) =>
        h.isCurrent ? '#f28b5b' : '#fff',
      ),
      pointBorderColor: props.history.map((h: MMRHistory) => (h.isCurrent ? '#f28b5b' : '#f28b5b')),
      pointBorderWidth: props.history.map((h: MMRHistory) => (h.isCurrent ? 3 : 1)),
    },
    {
      label: 'Mediane',
      data: props.history.map(() => medianMMR.value),
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderDash: [8, 6],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0,
      fill: false,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date',
        color: 'rgba(252, 239, 225, 0.85)',
      },
      ticks: { color: 'rgba(252, 239, 225, 0.8)' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
    },
    y: {
      title: {
        display: true,
        text: 'MMR',
        color: 'rgba(252, 239, 225, 0.85)',
      },
      ticks: { color: 'rgba(252, 239, 225, 0.8)' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
    },
  },
}

const LineChart = Line
</script>

<style scoped>
.mmr-card {
  background: linear-gradient(160deg, rgba(18, 29, 43, 0.88), rgba(16, 23, 35, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 16px;
  padding: 1rem 1.05rem 1.1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.mmr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.mmr-header h2 {
  color: var(--color-cream);
  margin: 0;
  font-size: 1.18rem;
}
.mmr-mode-selector {
  margin-left: auto;
}
.mmr-icon {
  font-size: 2rem;
}
.mmr-graph {
  margin-bottom: 0;
  height: 270px;
}

@media (max-width: 1024px) {
  .mmr-graph {
    height: 240px;
  }
}
</style>
