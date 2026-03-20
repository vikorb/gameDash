<template>
  <div class="mmr-card">
    <div class="mmr-header">
      <h2>MMR</h2>
      <div class="mmr-mode-selector">
        <ModeSelector
          v-if="modes && modes.length"
          :modes="modes"
          :model-value="selectedModeId"
          @update:modelValue="onModeChange"
        />
      </div>
    </div>
    <div class="mmr-graph">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
    <div class="mmr-info">
      <p>
        MMR actuel : <strong>{{ mmr }}</strong>
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">

import { Chart, registerables } from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

import type { GameMode } from '@/types/gameMode'

import ModeSelector from './ModeSelector.vue'
Chart.register(...registerables)

interface MMRHistory {
  date: string
  mmr: number
  isCurrent?: boolean
}
const props = defineProps({
  mmr: { type: Number, required: true },
  history: { type: Array as () => MMRHistory[], required: true },
  modes: { type: Array as () => GameMode[], required: false, default: () => [] },
  selectedModeId: { type: [Number, String], required: false, default: 1 },
})
const emit = defineEmits(['update:selectedModeId'])

function onModeChange(val: number | string) {
  emit('update:selectedModeId', val)
}

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
      pointRadius: props.history.map((h: MMRHistory) => h.isCurrent ? 8 : 4),
      pointBackgroundColor: props.history.map((h: MMRHistory) => h.isCurrent ? '#f28b5b' : '#fff'),
      pointBorderColor: props.history.map((h: MMRHistory) => h.isCurrent ? '#f28b5b' : '#f28b5b'),
      pointBorderWidth: props.history.map((h: MMRHistory) => h.isCurrent ? 3 : 1),
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Progression MMR' },
  },
  scales: {
    x: { title: { display: true, text: 'Date' } },
    y: { title: { display: true, text: 'MMR' } },
  },
}

const LineChart = Line
</script>

<style scoped>
.mmr-card {
  background: #232c3a;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.mmr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  justify-content: space-between;
}
.mmr-mode-selector {
  margin-left: auto;
}
.mmr-icon {
  font-size: 2rem;
}
.mmr-graph {
  margin-bottom: 18px;
}
.mmr-info {
  color: #fff;
}
</style>
