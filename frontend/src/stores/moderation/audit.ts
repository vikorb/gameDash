import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiRequest } from '../apiClient'
import type { ModerationAuditEntry } from './types'

type AuditListResponse = {
  data: ModerationAuditEntry[]
}

function normalizeAuditEntry(entry: Partial<ModerationAuditEntry> & { id: string | number }) {
  return {
    id: String(entry.id),
    actorName: entry.actorName ?? 'system',
    actionKey: entry.actionKey ?? 'content_review_requested',
    resourceType: entry.resourceType ?? 'content',
    resourceLabel: entry.resourceLabel ?? '—',
    metadata: Array.isArray(entry.metadata) ? entry.metadata.map(String) : [],
    createdAt: entry.createdAt ?? new Date().toISOString(),
  } satisfies ModerationAuditEntry
}

export const useModerationAuditStore = defineStore('moderation-audit', () => {
  const auditEntries = ref<ModerationAuditEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAuditEntries() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<AuditListResponse>('/moderation/audit')
      auditEntries.value = response.data.map(normalizeAuditEntry)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger le journal de modération.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function pushAudit(entry: Omit<ModerationAuditEntry, 'id' | 'createdAt'>) {
    auditEntries.value.unshift({
      id: `local-audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...entry,
    })
  }

  return {
    auditEntries,
    loading,
    error,
    fetchAuditEntries,
    pushAudit,
  }
})
