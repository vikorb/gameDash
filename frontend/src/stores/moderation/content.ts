import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModerationAuditStore } from './audit'
import { generateContentItems, MODERATION_MOCK_COUNTS, nowIso } from './mock'
import type { ModerationContentItem, ModerationContentStatus } from './types'

function cloneContentItems(items: ModerationContentItem[]): ModerationContentItem[] {
  return items.map((item) => ({
    ...item,
    tags: [...item.tags],
  }))
}

const initialContentItems = cloneContentItems(
  generateContentItems(MODERATION_MOCK_COUNTS.contentItems),
)

function resolveAuditActionKey(
  previousStatus: ModerationContentStatus,
  nextStatus: ModerationContentStatus,
) {
  if (nextStatus === 'review') {
    return 'content_review_requested' as const
  }

  if (nextStatus === 'visible' && previousStatus !== 'visible') {
    return 'content_restored' as const
  }

  return 'content_hidden' as const
}

export const useModerationContentStore = defineStore('moderation-content', () => {
  const auditStore = useModerationAuditStore()
  const contentItems = ref<ModerationContentItem[]>(cloneContentItems(initialContentItems))

  function setContentStatus(
    contentId: string,
    nextStatus: ModerationContentStatus,
    actorName = 'Administration',
    moderationNote?: string,
  ) {
    const content = contentItems.value.find((item) => item.id === contentId)

    if (!content) {
      return
    }

    const previousStatus = content.status
    const trimmedNote = moderationNote?.trim()

    if (previousStatus === nextStatus && !trimmedNote) {
      return
    }

    const actionAt = nowIso()

    content.status = nextStatus
    content.updatedAt = actionAt
    content.lastActionAt = actionAt
    content.lastActionBy = actorName

    if (trimmedNote) {
      content.moderationNote = trimmedNote
    }

    auditStore.pushAudit({
      actorName,
      actionKey: resolveAuditActionKey(previousStatus, nextStatus),
      resourceType: 'content',
      resourceLabel: content.title,
      metadata: [content.id, previousStatus, nextStatus],
    })
  }

  function hideContent(contentId: string, actorName = 'Administration', moderationNote?: string) {
    setContentStatus(contentId, 'hidden', actorName, moderationNote)
  }

  function restoreContent(
    contentId: string,
    actorName = 'Administration',
    moderationNote?: string,
  ) {
    setContentStatus(contentId, 'visible', actorName, moderationNote)
  }

  function toggleContentVisibility(contentId: string, actorName = 'Administration') {
    const content = contentItems.value.find((item) => item.id === contentId)

    if (!content) {
      return
    }

    if (content.status === 'hidden' || content.status === 'restricted') {
      restoreContent(contentId, actorName)
      return
    }

    hideContent(contentId, actorName)
  }

  function markContentForReview(
    contentId: string,
    actorName = 'Administration',
    moderationNote?: string,
  ) {
    setContentStatus(contentId, 'review', actorName, moderationNote)
  }

  function resetContentItems() {
    contentItems.value = cloneContentItems(initialContentItems)
  }

  const contentSummary = computed(() => ({
    total: contentItems.value.length,
    reviewCount: contentItems.value.filter((item) => item.status === 'review').length,
    hiddenCount: contentItems.value.filter((item) => item.status === 'hidden').length,
    visibleCount: contentItems.value.filter((item) => item.status === 'visible').length,
    restrictedCount: contentItems.value.filter((item) => item.status === 'restricted').length,
    actionableCount: contentItems.value.filter((item) => item.status !== 'visible').length,
    highPriorityCount: contentItems.value.filter(
      (item) => item.severity === 'high' || item.severity === 'critical',
    ).length,
  }))

  return {
    contentItems,
    contentSummary,
    setContentStatus,
    hideContent,
    restoreContent,
    toggleContentVisibility,
    markContentForReview,
    resetContentItems,
  }
})
