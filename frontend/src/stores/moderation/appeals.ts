import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import { useModerationAuditStore } from './audit'
import type { ModerationAppeal } from './types'

type AppealsListResponse = {
  data: Array<Partial<ModerationAppeal> & { id: string | number }>
}

type AppealResponse = {
  data: Partial<ModerationAppeal> & { id: string | number }
}

function normalizeAppeal(item: Partial<ModerationAppeal> & { id: string | number }) {
  return {
    id: String(item.id),
    targetName: item.targetName ?? '—',
    sanctionType: item.sanctionType ?? 'warning',
    status: item.status ?? 'pending',
    submittedAt: item.submittedAt ?? new Date().toISOString(),
    message: item.message ?? '',
    decisionNote: item.decisionNote ?? '',
  } satisfies ModerationAppeal
}

export const useModerationAppealsStore = defineStore('moderation-appeals', () => {
  const auditStore = useModerationAuditStore()
  const appeals = ref<ModerationAppeal[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function replaceAppeal(appeal: ModerationAppeal) {
    const index = appeals.value.findIndex((item) => item.id === appeal.id)

    if (index === -1) {
      appeals.value.unshift(appeal)
      return
    }

    appeals.value[index] = appeal
  }

  async function fetchAppeals() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<AppealsListResponse>('/moderation/appeals')
      appeals.value = response.data.map(normalizeAppeal)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les appels.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshAudit() {
    try {
      await auditStore.fetchAuditEntries()
    } catch {
      // Non bloquant.
    }
  }

  async function updateAppeal(
    appealId: string,
    endpoint: 'accept' | 'reject' | 'request-info',
    actorName = 'Administration',
    decisionNote?: string,
  ) {
    const response = await apiRequest<AppealResponse>(`/moderation/appeals/${appealId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName, decisionNote }),
    })

    replaceAppeal(normalizeAppeal(response.data))
    await refreshAudit()
  }

  function acceptAppeal(appealId: string, actorName = 'Administration', decisionNote?: string) {
    return updateAppeal(appealId, 'accept', actorName, decisionNote)
  }

  function rejectAppeal(appealId: string, actorName = 'Administration', decisionNote?: string) {
    return updateAppeal(appealId, 'reject', actorName, decisionNote)
  }

  function requestAppealInfo(appealId: string, actorName = 'Administration', decisionNote?: string) {
    return updateAppeal(appealId, 'request-info', actorName, decisionNote)
  }

  const appealSummary = computed(() => ({
    total: appeals.value.length,
    pendingCount: appeals.value.filter((item) => item.status === 'pending').length,
    acceptedCount: appeals.value.filter((item) => item.status === 'accepted').length,
    rejectedCount: appeals.value.filter((item) => item.status === 'rejected').length,
    needsInfoCount: appeals.value.filter((item) => item.status === 'needsInfo').length,
  }))

  return {
    appeals,
    loading,
    error,
    appealSummary,
    fetchAppeals,
    acceptAppeal,
    rejectAppeal,
    requestAppealInfo,
  }
})
