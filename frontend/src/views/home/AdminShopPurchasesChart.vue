<template>
  <section class="admin-shop-purchases">
    <div class="admin-shop-purchases__head">
      <div>
        <h3 class="admin-shop-purchases__title">{{ t('home.admin.shopPurchases.title') }}</h3>
        <p class="admin-shop-purchases__subtitle">{{ t('home.admin.shopPurchases.subtitle') }}</p>
      </div>
      <span class="admin-shop-purchases__badge">{{ totalPurchases }} {{ t('home.admin.shopPurchases.badgeUnit') }}</span>
    </div>

    <div class="admin-shop-purchases__filters">
      <div class="admin-shop-purchases__filter-item">
        <span class="admin-shop-purchases__filter-label">{{ t('home.admin.shopPurchases.filters.period') }}</span>
        <DateFilter v-model="selectedDateRange" @update:modelValue="onPresetChange" />
      </div>
      <div class="admin-shop-purchases__separator"></div>
      <div class="admin-shop-purchases__filter-item">
        <span class="admin-shop-purchases__filter-label">{{ t('home.admin.shopPurchases.filters.customRange') }}</span>
        <DateRangePicker v-model:from="customFrom" v-model:to="customTo" />
      </div>
    </div>

    <p v-if="loading" class="state-text">{{ t('home.admin.states.loading') }}</p>
    <p v-else-if="error" class="state-text state-text--error">{{ t('home.admin.shopPurchases.error') }}</p>
    <p v-else-if="!chartPoints.length" class="state-text">{{ t('home.admin.shopPurchases.empty') }}</p>

    <div v-else class="admin-shop-purchases__chart-wrap">
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { computed, onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

import { fetchAdminShopTransactions } from '@/services/adminShop'
import type { Transaction } from '@/types/shops'
import { formatDate } from '@/utils/date'
import DateFilter, { type DateRange } from '@/views/progress/DateFilter.vue'
import DateRangePicker from '@/views/progress/DateRangePicker.vue'

Chart.register(...registerables)

type PurchaseChartPoint = {
  date: string
  totalPurchases: number
  softPurchases: number
  hardPurchases: number
  softAmount: number
  hardAmount: number
}

const { t } = useI18n({ useScope: 'global' })

const selectedDateRange = ref<DateRange>('month')
const customFrom = ref<string>('')
const customTo = ref<string>('')

const loading = ref<boolean>(false)
const error = ref<boolean>(false)
const rawTransactions = ref<Transaction[]>([])

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

const filteredPurchases = computed(() => {
  const from = dateFrom.value ? new Date(`${dateFrom.value}T00:00:00`) : null
  const to = dateTo.value ? new Date(`${dateTo.value}T23:59:59.999`) : null

  return rawTransactions.value.filter((transaction) => {
    if (transaction.type !== 'purchase' || transaction.status !== 'success') return false

    const createdAt = new Date(transaction.createdAt)
    if (Number.isNaN(createdAt.getTime())) return false
    if (from && createdAt < from) return false
    if (to && createdAt > to) return false

    return true
  })
})

const chartPoints = computed<PurchaseChartPoint[]>(() => {
  const grouped = new Map<string, PurchaseChartPoint>()

  for (const transaction of filteredPurchases.value) {
    const dayKey = transaction.createdAt.slice(0, 10)
    const existing = grouped.get(dayKey) ?? {
      date: formatDate(dayKey),
      totalPurchases: 0,
      softPurchases: 0,
      hardPurchases: 0,
      softAmount: 0,
      hardAmount: 0,
    }

    existing.totalPurchases += 1

    if (transaction.currency === 'soft') {
      existing.softPurchases += 1
      existing.softAmount += transaction.amount
    }

    if (transaction.currency === 'hard') {
      existing.hardPurchases += 1
      existing.hardAmount += transaction.amount
    }

    grouped.set(dayKey, existing)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, point]) => point)
})

const totalPurchases = computed(() => filteredPurchases.value.length)

const chartData = computed(() => ({
  labels: chartPoints.value.map((point) => point.date),
  datasets: [
    {
      label: t('home.admin.shopPurchases.legend.total'),
      data: chartPoints.value.map((point) => point.totalPurchases),
      borderColor: '#73d2de',
      backgroundColor: 'rgba(115, 210, 222, 0.14)',
      pointBackgroundColor: '#73d2de',
      pointBorderColor: '#effcff',
      pointBorderWidth: 1.5,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.28,
      fill: true,
    },
    {
      label: t('home.admin.shopPurchases.legend.soft'),
      data: chartPoints.value.map((point) => point.softPurchases),
      borderColor: '#f5b14c',
      backgroundColor: 'rgba(245, 177, 76, 0.1)',
      pointBackgroundColor: '#f5b14c',
      pointRadius: 2.5,
      pointHoverRadius: 4,
      tension: 0.24,
      fill: false,
    },
    {
      label: t('home.admin.shopPurchases.legend.hard'),
      data: chartPoints.value.map((point) => point.hardPurchases),
      borderColor: '#c68cff',
      backgroundColor: 'rgba(198, 140, 255, 0.1)',
      pointBackgroundColor: '#c68cff',
      pointRadius: 2.5,
      pointHoverRadius: 4,
      tension: 0.24,
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
        label(context: { dataIndex: number; datasetIndex: number; parsed: { y: number | null } }) {
          const point = chartPoints.value[context.dataIndex]
          const value = context.parsed.y ?? 0

          if (!point) return `${value}`
          if (context.datasetIndex === 1) {
            return `${t('home.admin.shopPurchases.legend.soft')}: ${value} ${t('home.admin.shopPurchases.badgeUnit')} (${point.softAmount} ${t('home.admin.shopPurchases.currencies.soft')})`
          }
          if (context.datasetIndex === 2) {
            return `${t('home.admin.shopPurchases.legend.hard')}: ${value} ${t('home.admin.shopPurchases.badgeUnit')} (${point.hardAmount} ${t('home.admin.shopPurchases.currencies.hard')})`
          }

          return `${t('home.admin.shopPurchases.legend.total')}: ${value} ${t('home.admin.shopPurchases.badgeUnit')}`
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
      beginAtZero: true,
      ticks: {
        color: 'rgba(252, 239, 225, 0.78)',
        precision: 0,
      },
      grid: { color: 'rgba(255,255,255,0.08)' },
      title: {
        display: true,
        text: t('home.admin.shopPurchases.axis.y'),
        color: 'rgba(252, 239, 225, 0.84)',
      },
    },
  },
}

const LineChart = Line

async function loadTransactions() {
  loading.value = true
  error.value = false

  try {
    rawTransactions.value = await fetchAdminShopTransactions()
  } catch {
    rawTransactions.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTransactions()
})
</script>

<style scoped>
.admin-shop-purchases {
  padding: 0.95rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: linear-gradient(150deg, rgba(25, 58, 74, 0.82), rgba(18, 27, 41, 0.92));
  display: grid;
  gap: 0.9rem;
}

.admin-shop-purchases__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.admin-shop-purchases__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 1.02rem;
  font-weight: 800;
}

.admin-shop-purchases__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(252, 239, 225, 0.7);
  font-size: 0.84rem;
}

.admin-shop-purchases__badge {
  align-self: center;
  border-radius: 999px;
  border: 1px solid rgba(115, 210, 222, 0.42);
  background: rgba(115, 210, 222, 0.16);
  color: var(--color-cream);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.28rem 0.62rem;
}

.admin-shop-purchases__filters {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.admin-shop-purchases__filter-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.admin-shop-purchases__filter-label {
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.78rem;
  white-space: nowrap;
}

.admin-shop-purchases__separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.admin-shop-purchases__chart-wrap {
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

@media (max-width: 900px) {
  .admin-shop-purchases__filters {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-shop-purchases__separator {
    display: none;
  }

  .admin-shop-purchases__chart-wrap {
    height: 250px;
  }
}
</style>