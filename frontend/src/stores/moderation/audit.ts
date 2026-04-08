import { defineStore } from 'pinia'
import { ref } from 'vue'

import { generateAuditEntries, MODERATION_MOCK_COUNTS } from './mock'
import type { ModerationAuditEntry } from './types'

export const useModerationAuditStore = defineStore('moderation-audit', () => {
  const auditEntries = ref<ModerationAuditEntry[]>(
    generateAuditEntries(MODERATION_MOCK_COUNTS.auditEntries),
  )

  let auditSequence = MODERATION_MOCK_COUNTS.auditEntries

  function pushAudit(entry: Omit<ModerationAuditEntry, 'id' | 'createdAt'>) {
    auditSequence += 1

    auditEntries.value.unshift({
      id: `audit-${auditSequence}`,
      createdAt: new Date().toISOString(),
      ...entry,
    })
  }

  return {
    auditEntries,
    pushAudit,
  }
})
