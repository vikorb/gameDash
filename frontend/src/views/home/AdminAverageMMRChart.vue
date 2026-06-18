<template>
  <section class="admin-mmr">
    <div class="admin-mmr__head">
      <div>
        <h3 class="admin-mmr__title">{{ t('home.admin.averageMmr.title') }}</h3>
        <p class="admin-mmr__subtitle">{{ t('home.admin.averageMmr.subtitle') }}</p>
      </div>
      <span class="admin-mmr__badge">{{ chartPoints.length }} points</span>
    </div>

    <div class="admin-mmr__filters">
      <div class="admin-mmr__filter-item">
        <span class="admin-mmr__filter-label">{{ t('home.admin.averageMmr.filters.mode') }}</span>
        <ModeSelector v-model="selectedModeId" :modes="modeOptions" />
      </div>
      <div class="admin-mmr__separator"></div>
      <div class="admin-mmr__filter-item">
        <span class="admin-mmr__filter-label">{{ t('home.admin.averageMmr.filters.period') }}</span>
        <DateFilter v-model="selectedDateRange" @update:modelValue="onPresetChange" />
      </div>
      <div class="admin-mmr__separator"></div>
      <div class="admin-mmr__filter-item">
        <span class="admin-mmr__filter-label">{{ t('home.admin.averageMmr.filters.customRange') }}</span>
        <DateRangePicker v-model:from="customFrom" v-model:to="customTo" />
      </div>
    </div>

    <p v-if="loading" class="state-text">{{ t('home.admin.states.loading') }}</p>
    <p v-else-if="error" class="state-text state-text--error">{{ t('home.admin.averageMmr.error') }}</p>
    <p v-else-if="!chartPoints.length" class="state-text">{{ t('home.admin.averageMmr.empty') }}</p>

    <div v-else class="admin-mmr__chart-wrap">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

import ModeSelector from '@/components/game-mode/ModeSelector.vue'
import type { AverageMMRPoint } from '@/services/adminMmr'
import { fetchAverageMMRHistory } from '@/services/adminMmr'
import { fetchGameModes } from '@/services/gameMode'
import type { GameMode } from '@/types/gameMode'
import { formatDate } from '@/utils/date'
import type { DateRange } from '@/views/progress/DateFilter.vue'
import DateFilter from '@/views/progress/DateFilter.vue'
import DateRangePicker from '@/views/progress/DateRangePicker.vue'

Chart.register(...registerables)

const { t } = useI18n({ useScope: 'global' })

const modes = ref<GameMode[]>([])
const selectedModeId = ref<number | string>(0)
const selectedDateRange = ref<DateRange>('all')
const customFrom = ref<string>('')
const customTo = ref<string>('')

const loading = ref<boolean>(false)
const error = ref<boolean>(false)
const rawPoints = ref<AverageMMRPoint[]>([])

const modeOptions = computed(() => [
  { id: 0, name: t('home.admin.averageMmr.filters.allModes') },
  ...modes.value,
])

function onPresetChange() {
  customFrom.value = ''
  customTo.value = ''
}

function getDateThreshold(range: DateRange): Date | null {
  const now = new Date()
  if (range === 'week') {
    now.setDate(now.getDate() - 7)
    return now
  }
  if (range === '3weeks') {
    now.setDate(now.getDate() - 21)
    return now
  }
  if (range === 'month') {
    now.setMonth(now.getMonth() - 1)
    return now
  }
  if (range === '3months') {
    now.setMonth(now.getMonth() - 3)
    return now
  }
  if (range === 'year') {
    now.setFullYear(now.getFullYear() - 1)
    return now
  }
  return null
}

const dateFrom = computed<string | undefined>(() => {
  if (customFrom.value) return customFrom.value
  const threshold = getDateThreshold(selectedDateRange.value)
  if (!threshold) return undefined
  return threshold.toISOString().split('T')[0]
})

const dateTo = computed<string | undefined>(() => {
  if (customTo.value) return customTo.value
  return undefined
})

const chartPoints = computed(() =>
  rawPoints.value.map((point) => ({
    ...point,
    date: formatDate(point.date),
  })),
)

const medianMMR = computed<number | null>(() => {
  const values = rawPoints.value
    .map((point) => point.averageMMR)
    .filter((value): value is number => typeof value === 'number')
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
  labels: chartPoints.value.map((point) => point.date),
  datasets: [
    {
      label: t('home.admin.averageMmr.legend.averageMmr'),
      data: chartPoints.value.map((point) => point.averageMMR),
      borderColor: '#f28b5b',
      backgroundColor: 'rgba(242,139,91,0.12)',
      pointBackgroundColor: '#f28b5b',
      pointBorderColor: '#fff1e7',
      pointBorderWidth: 1.5,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.28,
      fill: true,
    },
    {
      label: t('home.admin.averageMmr.legend.median'),
      data: chartPoints.value.map(() => medianMMR.value),
      borderColor: 'rgba(255, 255, 255, 0.62)',
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
    legend: {
      display: true,
      labels: {
        color: 'rgba(252, 239, 225, 0.86)',
      },
    },
    tooltip: {
      callbacks: {
        label(context: { parsed: { y: number | null }; dataIndex: number; datasetIndex: number }) {
          const yValue = context.parsed.y ?? 0
          if (context.datasetIndex === 1) {
            return `${t('home.admin.averageMmr.legend.median')}: ${Math.round(yValue)} MMR`
          }
          const point = chartPoints.value[context.dataIndex]
          const avg = Math.round(yValue)
          const players = point?.sampleSize ?? 0
          return `${avg} MMR (${players} joueurs)`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(252, 239, 225, 0.78)' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      ticks: { color: 'rgba(252, 239, 225, 0.78)' },
      grid: { color: 'rgba(255,255,255,0.08)' },
      title: {
        display: true,
        text: 'MMR moyen',
        color: 'rgba(252, 239, 225, 0.84)',
      },
    },
  },
}

const LineChart = Line

async function loadModes() {
  const fetchedModes = await fetchGameModes()
  modes.value = fetchedModes
}

async function loadAverageMMR() {
  loading.value = true
  error.value = false

  try {
    const modeId = Number(selectedModeId.value)
    rawPoints.value = await fetchAverageMMRHistory({
      modeId: Number.isInteger(modeId) && modeId > 0 ? modeId : undefined,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
    })
  } catch {
    rawPoints.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadModes()
  await loadAverageMMR()
})

watch(
  () => [selectedModeId.value, dateFrom.value, dateTo.value],
  async () => {
    await loadAverageMMR()
  },
)
</script>

<style scoped>
.admin-mmr {
  padding: 0.95rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: linear-gradient(150deg, rgba(37, 49, 77, 0.82), rgba(22, 27, 41, 0.92));
  display: grid;
  gap: 0.9rem;
}

.admin-mmr__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.admin-mmr__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 1.02rem;
  font-weight: 800;
}

.admin-mmr__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(252, 239, 225, 0.7);
  font-size: 0.84rem;
}

.admin-mmr__badge {
  align-self: center;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.45);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-cream);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.28rem 0.62rem;
}

.admin-mmr__filters {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.admin-mmr__filter-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.admin-mmr__filter-label {
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.78rem;
  white-space: nowrap;
}

.admin-mmr__separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.admin-mmr__chart-wrap {
  height: 290px;
}

.state-text {
  margin: 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.9rem;
}

.state-text--error {
  color: #f6b3b3;
}

:deep(.mode-selector) {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .admin-mmr__filters {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-mmr__separator {
    display: none;
  }

  .admin-mmr__chart-wrap {
    height: 250px;
  }
}
</style>
