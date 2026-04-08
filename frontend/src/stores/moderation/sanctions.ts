import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModerationAuditStore } from './audit'
import { generateSanctions, MODERATION_MOCK_COUNTS } from './mock'
import type { ModerationSanction } from './types'

export const useModerationSanctionsStore = defineStore('moderation-sanctions', () => {
  const auditStore = useModerationAuditStore()
  const sanctions = ref<ModerationSanction[]>(generateSanctions(MODERATION_MOCK_COUNTS.sanctions))

  function activateSanction(sanctionId: string, actorName = 'Administration') {
    const sanction = sanctions.value.find((item) => item.id === sanctionId)

    if (!sanction) {
      return
    }

    sanction.status = 'active'
    sanction.startAt = new Date().toISOString()

    auditStore.pushAudit({
      actorName,
      actionKey: 'sanction_activated',
      resourceType: 'sanction',
      resourceLabel: sanction.targetName,
      metadata: [sanction.id, sanction.type],
    })
  }

  function revokeSanction(sanctionId: string, actorName = 'Administration') {
    const sanction = sanctions.value.find((item) => item.id === sanctionId)

    if (!sanction) {
      return
    }

    sanction.status = 'revoked'

    auditStore.pushAudit({
      actorName,
      actionKey: 'sanction_revoked',
      resourceType: 'sanction',
      resourceLabel: sanction.targetName,
      metadata: [sanction.id, sanction.type],
    })
  }

  const sanctionSummary = computed(() => ({
    total: sanctions.value.length,
    activeCount: sanctions.value.filter((item) => item.status === 'active').length,
    draftCount: sanctions.value.filter((item) => item.status === 'draft').length,
    revokedCount: sanctions.value.filter((item) => item.status === 'revoked').length,
  }))

  return {
    sanctions,
    sanctionSummary,
    activateSanction,
    revokeSanction,
  }
})
