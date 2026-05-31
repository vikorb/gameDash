import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import { useModerationAuditStore } from './audit'
import type { ModerationSanction } from './types'

type SanctionsListResponse = {
  data: Array<Partial<ModerationSanction> & { id: string | number }>
}

type SanctionResponse = {
  data: Partial<ModerationSanction> & { id: string | number }
}

function normalizeSanction(item: Partial<ModerationSanction> & { id: string | number }) {
  return {
    id: String(item.id),
    targetName: item.targetName ?? '—',
    targetEmail: item.targetEmail ?? null,
    type: item.type ?? 'warning',
    status: item.status ?? 'draft',
    severity: item.severity ?? 'medium',
    scope: item.scope ?? 'account',
    reason: item.reason ?? '—',
    summary: item.summary ?? '',
    createdBy: item.createdBy ?? 'system',
    assignedTo: item.assignedTo ?? null,
    createdAt: item.createdAt ?? item.startAt ?? new Date().toISOString(),
    startAt: item.startAt ?? new Date().toISOString(),
    endAt: item.endAt ?? '',
    lastUpdatedAt: item.lastUpdatedAt ?? item.createdAt ?? new Date().toISOString(),
    note: item.note ?? '',
    policyLabel: item.policyLabel ?? 'Politique de modération',
    appealCount: Number(item.appealCount ?? 0),
    relatedReportIds: Array.isArray(item.relatedReportIds)
      ? item.relatedReportIds.map((id) => String(id))
      : [],
    evidence: Array.isArray(item.evidence) ? item.evidence : [],
    activity: Array.isArray(item.activity) ? item.activity : [],
  } satisfies ModerationSanction
}

export const useModerationSanctionsStore = defineStore('moderation-sanctions', () => {
  const auditStore = useModerationAuditStore()
  const sanctions = ref<ModerationSanction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function replaceSanction(sanction: ModerationSanction) {
    const index = sanctions.value.findIndex((item) => item.id === sanction.id)

    if (index === -1) {
      sanctions.value.unshift(sanction)
      return
    }

    sanctions.value[index] = sanction
  }

  async function fetchSanctions() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<SanctionsListResponse>('/moderation/sanctions')
      sanctions.value = response.data.map(normalizeSanction)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les sanctions.'
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

  function getSanctionById(sanctionId: string) {
    return sanctions.value.find((item) => item.id === sanctionId)
  }

  async function activateSanction(sanctionId: string, actorName = 'Administration') {
    const response = await apiRequest<SanctionResponse>(`/moderation/sanctions/${sanctionId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName }),
    })

    replaceSanction(normalizeSanction(response.data))
    await refreshAudit()
  }

  async function revokeSanction(sanctionId: string, actorName = 'Administration') {
    const response = await apiRequest<SanctionResponse>(`/moderation/sanctions/${sanctionId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName }),
    })

    replaceSanction(normalizeSanction(response.data))
    await refreshAudit()
  }

  async function updateSanctionNote(sanctionId: string, note: string, actorName = 'Administration') {
    const response = await apiRequest<SanctionResponse>(`/moderation/sanctions/${sanctionId}/note`, {
      method: 'PATCH',
      body: JSON.stringify({ note, actor: actorName }),
    })

    replaceSanction(normalizeSanction(response.data))
  }

  const sanctionSummary = computed(() => {
    const currentTime = Date.now()

    const expiringSoonCount = sanctions.value.filter((item) => {
      if (item.status !== 'active' || item.endAt === '') return false

      const endAt = new Date(item.endAt).getTime()

      return (
        Number.isFinite(endAt) && endAt >= currentTime && endAt - currentTime <= 72 * 60 * 60 * 1000
      )
    }).length

    return {
      total: sanctions.value.length,
      activeCount: sanctions.value.filter((item) => item.status === 'active').length,
      draftCount: sanctions.value.filter((item) => item.status === 'draft').length,
      revokedCount: sanctions.value.filter((item) => item.status === 'revoked').length,
      expiredCount: sanctions.value.filter((item) => item.status === 'expired').length,
      expiringSoonCount,
    }
  })

  return {
    sanctions,
    loading,
    error,
    sanctionSummary,
    fetchSanctions,
    getSanctionById,
    activateSanction,
    revokeSanction,
    updateSanctionNote,
  }
})
