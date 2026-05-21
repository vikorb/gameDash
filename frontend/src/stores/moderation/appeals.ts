import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModerationAuditStore } from './audit'
import { generateAppeals, MODERATION_MOCK_COUNTS } from './mock'
import type { ModerationAppeal } from './types'

export const useModerationAppealsStore = defineStore('moderation-appeals', () => {
  const auditStore = useModerationAuditStore()
  const appeals = ref<ModerationAppeal[]>(generateAppeals(MODERATION_MOCK_COUNTS.appeals))

  function acceptAppeal(appealId: string, actorName = 'Administration') {
    const appeal = appeals.value.find((item) => item.id === appealId)

    if (!appeal) {
      return
    }

    appeal.status = 'accepted'
    appeal.decisionNote = 'La demande a été acceptée après réexamen du dossier.'

    auditStore.pushAudit({
      actorName,
      actionKey: 'appeal_accepted',
      resourceType: 'appeal',
      resourceLabel: appeal.targetName,
      metadata: [appeal.id, appeal.sanctionType],
    })
  }

  function rejectAppeal(appealId: string, actorName = 'Administration') {
    const appeal = appeals.value.find((item) => item.id === appealId)

    if (!appeal) {
      return
    }

    appeal.status = 'rejected'
    appeal.decisionNote = 'La décision initiale a été maintenue après réexamen.'

    auditStore.pushAudit({
      actorName,
      actionKey: 'appeal_rejected',
      resourceType: 'appeal',
      resourceLabel: appeal.targetName,
      metadata: [appeal.id, appeal.sanctionType],
    })
  }

  function requestAppealInfo(appealId: string, actorName = 'Administration') {
    const appeal = appeals.value.find((item) => item.id === appealId)

    if (!appeal) {
      return
    }

    appeal.status = 'needsInfo'
    appeal.decisionNote =
      'Des informations complémentaires ont été demandées avant décision finale.'

    auditStore.pushAudit({
      actorName,
      actionKey: 'appeal_info_requested',
      resourceType: 'appeal',
      resourceLabel: appeal.targetName,
      metadata: [appeal.id, appeal.sanctionType],
    })
  }

  const appealSummary = computed(() => ({
    total: appeals.value.length,
    pendingCount: appeals.value.filter((item) => item.status === 'pending').length,
    acceptedCount: appeals.value.filter((item) => item.status === 'accepted').length,
    needsInfoCount: appeals.value.filter((item) => item.status === 'needsInfo').length,
  }))

  return {
    appeals,
    appealSummary,
    acceptAppeal,
    rejectAppeal,
    requestAppealInfo,
  }
})
