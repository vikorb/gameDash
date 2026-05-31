import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import type {
  BackofficeDashboardData,
  BackofficePeriodSnapshot,
  BackofficePeriodValue,
  BackofficeTrend,
} from './types'

const emptySnapshot: BackofficePeriodSnapshot = {
  activeUsers: 0,
  matchesPerDay: 0,
  transactionsPerDay: 0,
  mapsPublished: 0,
  virtualRevenue: 0,
  pendingReports: 0,
}

const emptyTrends: Record<keyof BackofficePeriodSnapshot, BackofficeTrend> = {
  activeUsers: { value: '0%', direction: 'up' },
  matchesPerDay: { value: '0%', direction: 'up' },
  transactionsPerDay: { value: '0%', direction: 'up' },
  mapsPublished: { value: '0%', direction: 'up' },
  virtualRevenue: { value: '0%', direction: 'up' },
  pendingReports: { value: '0%', direction: 'down' },
}

function normalizeDashboard(payload: BackofficeDashboardData): BackofficeDashboardData {
  return {
    period: payload.period,
    snapshot: { ...emptySnapshot, ...payload.snapshot },
    trends: { ...emptyTrends, ...payload.trends },
    rankDistribution: Array.isArray(payload.rankDistribution) ? payload.rankDistribution : [],
    topMaps: Array.isArray(payload.topMaps) ? payload.topMaps : [],
    topCreators: Array.isArray(payload.topCreators) ? payload.topCreators : [],
    recentActivity: Array.isArray(payload.recentActivity) ? payload.recentActivity : [],
  }
}

export const useBackofficeDashboardStore = defineStore('backoffice-dashboard', () => {
  const dashboard = ref<BackofficeDashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard(period: BackofficePeriodValue = '7d') {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<BackofficeDashboardData>('/backoffice/dashboard', {
        query: { period },
      })

      dashboard.value = normalizeDashboard(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger le dashboard.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const snapshot = computed(() => dashboard.value?.snapshot ?? emptySnapshot)
  const trends = computed(() => dashboard.value?.trends ?? emptyTrends)
  const rankDistribution = computed(() => dashboard.value?.rankDistribution ?? [])
  const topMaps = computed(() => dashboard.value?.topMaps ?? [])
  const topCreators = computed(() => dashboard.value?.topCreators ?? [])
  const recentActivity = computed(() => dashboard.value?.recentActivity ?? [])

  return {
    dashboard,
    loading,
    error,
    snapshot,
    trends,
    rankDistribution,
    topMaps,
    topCreators,
    recentActivity,
    fetchDashboard,
  }
})
