<template>
  <div class="mmr-card">
    <div class="mmr-header">
      <span class="mmr-icon">📈</span>
      <h2>MMR</h2>
    </div>
    <div class="mmr-graph">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
    <div class="mmr-info">
      <h3>
        Rank: <span class="rank">{{ rank }}</span>
      </h3>
      <p>
        MMR actuel : <strong>{{ mmr }}</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Chart, registerables } from 'chart.js'
import { Line } from 'vue-chartjs'
Chart.register(...registerables)

interface MMRHistory {
  date: string
  mmr: number
}
const props = defineProps({
  mmr: { type: Number, required: true },
  rank: { type: String, required: true },
  history: { type: Array as () => MMRHistory[], required: true },
})

const chartData = {
  labels: props.history.map((h: MMRHistory) => h.date),
  datasets: [
    {
      label: 'MMR',
      data: props.history.map((h: MMRHistory) => h.mmr),
      borderColor: '#f28b5b',
      backgroundColor: 'rgba(242,139,91,0.08)',
      tension: 0.3,
      fill: false,
    },
  ],
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Progression MMR (démo)' },
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
.rank {
  color: #f28b5b;
}
</style>
