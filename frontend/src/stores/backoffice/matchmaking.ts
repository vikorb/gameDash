import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import type {
  BackofficeMatchmakingAuditEntry,
  BackofficeMatchmakingMode,
  BackofficeMatchmakingSummary,
} from './types'

type MatchmakingResponse = {
  modes: BackofficeMatchmakingMode[]
  auditTrail: BackofficeMatchmakingAuditEntry[]
  summary: BackofficeMatchmakingSummary
}

type MatchmakingUpdateResponse = {
  data: BackofficeMatchmakingMode
  auditTrail: BackofficeMatchmakingAuditEntry[]
}

type MatchmakingPatch = Pick<
  BackofficeMatchmakingMode,
  'enabled' | 'maxWaitTimeSec' | 'mmrWindow' | 'teamSize'
>

function normalizeMode(mode: BackofficeMatchmakingMode) {
  return {
    ...mode,
    id: Number(mode.id),
    enabled: Boolean(mode.enabled),
    maxWaitTimeSec: Number(mode.maxWaitTimeSec ?? 0),
    mmrWindow: Number(mode.mmrWindow ?? 0),
    teamSize: Number(mode.teamSize ?? 1),
    playersInQueue: Number(mode.playersInQueue ?? 0),
    matchesLastHour: Number(mode.matchesLastHour ?? 0),
    lastUpdatedAt: mode.lastUpdatedAt ?? new Date().toISOString(),
    lastUpdatedBy: mode.lastUpdatedBy ?? 'system',
  } satisfies BackofficeMatchmakingMode
}

export const useBackofficeMatchmakingStore = defineStore('backoffice-matchmaking', () => {
  const modes = ref<BackofficeMatchmakingMode[]>([])
  const auditTrail = ref<BackofficeMatchmakingAuditEntry[]>([])
  const apiSummary = ref<BackofficeMatchmakingSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMatchmaking() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<MatchmakingResponse>('/backoffice/matchmaking')
      modes.value = response.modes.map(normalizeMode)
      auditTrail.value = Array.isArray(response.auditTrail) ? response.auditTrail : []
      apiSummary.value = response.summary
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger le matchmaking.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMatchmakingMode(modeId: number, payload: MatchmakingPatch, actor = 'POC Admin') {
    const response = await apiRequest<MatchmakingUpdateResponse>(`/backoffice/matchmaking/${modeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...payload, actor }),
    })

    const updated = normalizeMode(response.data)
    modes.value = modes.value.map((mode) => (mode.id === modeId ? updated : mode))
    auditTrail.value = Array.isArray(response.auditTrail) ? response.auditTrail : auditTrail.value
    apiSummary.value = null

    return updated
  }

  const summary = computed<BackofficeMatchmakingSummary>(() => {
    if (apiSummary.value) return apiSummary.value

    const enabledModes = modes.value.filter((mode) => mode.enabled)
    const sorted = [...modes.value].sort(
      (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
    )

    return {
      totalInQueue: enabledModes.reduce((sum, mode) => sum + mode.playersInQueue, 0),
      avgWaitSeconds:
        enabledModes.length === 0
          ? 0
          : Math.round(enabledModes.reduce((sum, mode) => sum + mode.maxWaitTimeSec, 0) / enabledModes.length),
      lastUpdateAt: sorted[0]?.lastUpdatedAt ?? new Date().toISOString(),
      lastUpdateActor: sorted[0]?.lastUpdatedBy ?? '—',
    }
  })

  return {
    modes,
    auditTrail,
    summary,
    loading,
    error,
    fetchMatchmaking,
    updateMatchmakingMode,
  }
})
