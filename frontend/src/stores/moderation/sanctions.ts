import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModerationAuditStore } from './audit'
import { generateSanctions, getDefaultSanctionEndAt, MODERATION_MOCK_COUNTS, nowIso } from './mock'
import type { ModerationSanction } from './types'

export const useModerationSanctionsStore = defineStore('moderation-sanctions', () => {
  const auditStore = useModerationAuditStore()
  const sanctions = ref<ModerationSanction[]>(generateSanctions(MODERATION_MOCK_COUNTS.sanctions))

  function pushSanctionActivity(sanction: ModerationSanction, actorName: string, message: string) {
    const createdAt = nowIso()

    sanction.activity = [
      {
        id: `sanction-activity-${Math.random().toString(36).slice(2, 10)}`,
        actor: actorName,
        message,
        createdAt,
      },
      ...sanction.activity,
    ]

    sanction.lastUpdatedAt = createdAt
  }

  function getSanctionById(sanctionId: string) {
    return sanctions.value.find((item) => item.id === sanctionId)
  }

  function activateSanction(sanctionId: string, actorName = 'Administration') {
    const sanction = getSanctionById(sanctionId)

    if (!sanction || sanction.status === 'active') {
      return
    }

    sanction.status = 'active'
    sanction.startAt = nowIso()

    if ((sanction.type === 'temporaryBan' || sanction.type === 'mute') && sanction.endAt === '') {
      sanction.endAt = getDefaultSanctionEndAt(sanction.type)
    }

    pushSanctionActivity(sanction, actorName, 'Sanction activated')

    auditStore.pushAudit({
      actorName,
      actionKey: 'sanction_activated',
      resourceType: 'sanction',
      resourceLabel: sanction.targetName,
      metadata: [sanction.id, sanction.type, sanction.scope],
    })
  }

  function revokeSanction(sanctionId: string, actorName = 'Administration') {
    const sanction = getSanctionById(sanctionId)

    if (!sanction || sanction.status === 'revoked') {
      return
    }

    sanction.status = 'revoked'

    if (sanction.endAt === '') {
      sanction.endAt = nowIso()
    }

    pushSanctionActivity(sanction, actorName, 'Sanction revoked')

    auditStore.pushAudit({
      actorName,
      actionKey: 'sanction_revoked',
      resourceType: 'sanction',
      resourceLabel: sanction.targetName,
      metadata: [sanction.id, sanction.type, sanction.scope],
    })
  }

  const sanctionSummary = computed(() => {
    const currentTime = Date.now()

    const expiringSoonCount = sanctions.value.filter((item) => {
      if (item.status !== 'active' || item.endAt === '') {
        return false
      }

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
    sanctionSummary,
    getSanctionById,
    activateSanction,
    revokeSanction,
  }
})
