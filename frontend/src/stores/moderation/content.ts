import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import { useModerationAuditStore } from './audit'
import type { ModerationContentItem, ModerationContentStatus } from './types'

type ContentListResponse = {
  data: Array<Partial<ModerationContentItem> & { id: string | number }>
}

type ContentResponse = {
  data: Partial<ModerationContentItem> & { id: string | number }
}

function normalizeContentItem(item: Partial<ModerationContentItem> & { id: string | number }) {
  return {
    id: String(item.id),
    title: item.title ?? 'Contenu modéré',
    authorName: item.authorName ?? '—',
    type: item.type ?? 'map',
    status: item.status ?? 'visible',
    category: item.category ?? '—',
    flagCount: Number(item.flagCount ?? 0),
    reportsCount: Number(item.reportsCount ?? 0),
    severity: item.severity ?? 'low',
    origin: item.origin ?? 'community',
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    preview: item.preview ?? '',
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    lastActionAt: item.lastActionAt ?? null,
    lastActionBy: item.lastActionBy ?? null,
    moderationNote: item.moderationNote ?? '',
  } satisfies ModerationContentItem
}

function endpointForStatus(status: ModerationContentStatus) {
  if (status === 'visible') return 'restore'
  if (status === 'review') return 'review'
  return 'hide'
}

export const useModerationContentStore = defineStore('moderation-content', () => {
  const auditStore = useModerationAuditStore()
  const contentItems = ref<ModerationContentItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function replaceContentItem(item: ModerationContentItem) {
    const index = contentItems.value.findIndex((current) => current.id === item.id)

    if (index === -1) {
      contentItems.value.unshift(item)
      return
    }

    contentItems.value[index] = item
  }

  async function fetchContentItems() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<ContentListResponse>('/moderation/content')
      contentItems.value = response.data.map(normalizeContentItem)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les contenus.'
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

  async function setContentStatus(
    contentId: string,
    nextStatus: ModerationContentStatus,
    actorName = 'Administration',
    moderationNote?: string,
  ) {
    const action = endpointForStatus(nextStatus)
    const response = await apiRequest<ContentResponse>(`/moderation/content/${contentId}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName, moderationNote }),
    })

    const normalized = normalizeContentItem(response.data)
    if (moderationNote?.trim()) normalized.moderationNote = moderationNote.trim()
    replaceContentItem(normalized)
    await refreshAudit()
  }

  function hideContent(contentId: string, actorName = 'Administration', moderationNote?: string) {
    return setContentStatus(contentId, 'hidden', actorName, moderationNote)
  }

  function restoreContent(contentId: string, actorName = 'Administration', moderationNote?: string) {
    return setContentStatus(contentId, 'visible', actorName, moderationNote)
  }

  async function toggleContentVisibility(contentId: string, actorName = 'Administration') {
    const content = contentItems.value.find((item) => item.id === contentId)

    if (!content) return

    if (content.status === 'hidden' || content.status === 'restricted') {
      await restoreContent(contentId, actorName)
      return
    }

    await hideContent(contentId, actorName)
  }

  function markContentForReview(contentId: string, actorName = 'Administration', moderationNote?: string) {
    return setContentStatus(contentId, 'review', actorName, moderationNote)
  }

  async function resetContentItems() {
    await fetchContentItems()
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
    loading,
    error,
    contentSummary,
    fetchContentItems,
    setContentStatus,
    hideContent,
    restoreContent,
    toggleContentVisibility,
    markContentForReview,
    resetContentItems,
  }
})
