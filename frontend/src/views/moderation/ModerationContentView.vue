<template>
  <section class="moderation-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__main">
          <div>
            <span class="page-badge">{{ t('moderation.pages.content.badge') }}</span>
            <h1 class="page-title">{{ t('moderation.pages.content.title') }}</h1>
            <p class="page-subtitle">{{ t('moderation.pages.content.subtitle') }}</p>
          </div>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.pages.content.actions.backToModeration') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.pages.content.actions.resetFilters') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.content.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.content.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.content.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.content.side.chips.visibility') }}</span>
            <span>{{ t('moderation.pages.content.side.chips.review') }}</span>
            <span>{{ t('moderation.pages.content.side.chips.quickActions') }}</span>
          </div>
        </aside>
      </header>

      <section class="stat-grid content-stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.total') }}</span>
          <strong class="stat-card__value">{{ contentSummary.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.totalCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.actionable') }}</span>
          <strong class="stat-card__value">{{ contentSummary.actionableCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.actionableCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.review') }}</span>
          <strong class="stat-card__value">{{ contentSummary.reviewCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.reviewCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.hidden') }}</span>
          <strong class="stat-card__value">{{ contentSummary.hiddenCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.hiddenCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{
            t('moderation.pages.content.stats.highPriority')
          }}</span>
          <strong class="stat-card__value">{{ contentSummary.highPriorityCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.highPriorityCaption') }}
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.content.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.content.list.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span class="meta-item">
              {{ filteredContent.length }} {{ t('moderation.pages.common.results') }}
            </span>
            <span class="meta-item meta-item--subtle">
              {{ t('moderation.pages.content.list.filtered', { count: activeFilterCount }) }}
            </span>
          </div>
        </div>

        <div class="toolbar content-toolbar">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.content.filters.search')"
          />

          <select v-model="selectedStatus" class="select">
            <option v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedType" class="select">
            <option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSeverity" class="select">
            <option v-for="item in severityOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedOrigin" class="select">
            <option v-for="item in originOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="sortBy" class="select">
            <option v-for="item in sortOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div v-if="filteredContent.length" class="list-grid">
          <article
            v-for="item in filteredContent"
            :key="item.id"
            class="moderation-card moderation-card--content"
          >
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="card-subtitle">
                  {{ t('moderation.pages.content.card.author') }} {{ item.authorName }}
                </div>
              </div>

              <div class="card-top__aside">
                <span :class="['pill', `pill--${item.severity}`]">
                  {{ getSeverityLabel(item.severity) }}
                </span>
                <span class="meta-item">{{ formatDate(item.updatedAt) }}</span>
              </div>
            </div>

            <div class="card-pills">
              <span :class="['pill', `pill--${item.status}`]">
                {{ getContentStatusLabel(item.status) }}
              </span>

              <span class="meta-item">{{ getContentTypeLabel(item.type) }}</span>
              <span class="meta-item">{{ getContentOriginLabel(item.origin) }}</span>
            </div>

            <p class="card-text">{{ item.preview }}</p>

            <div class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.content.card.category') }} {{ item.category }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.content.card.flags') }} {{ item.flagCount }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.content.card.reports') }} {{ item.reportsCount }}
              </span>
            </div>

            <div v-if="item.tags.length" class="card-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag-item">#{{ tag }}</span>
            </div>

            <div v-if="item.moderationNote" class="moderation-note">
              <span class="moderation-note__label">
                {{ t('moderation.pages.content.card.note') }}
              </span>
              <p class="moderation-note__text">{{ item.moderationNote }}</p>
            </div>

            <div class="card-footer">
              <div class="card-footer__meta">
                <span class="meta-item meta-item--subtle">
                  {{ t('moderation.pages.content.card.lastAction') }}
                  {{ formatLastAction(item) }}
                </span>
              </div>

              <div class="card-actions">
                <button
                  type="button"
                  class="btn-inline btn-inline--secondary"
                  :disabled="item.status === 'review'"
                  @click="moderationStore.markContentForReview(item.id, 'POC Admin')"
                >
                  {{
                    item.status === 'review'
                      ? t('moderation.pages.content.actions.inReview')
                      : t('moderation.pages.content.actions.review')
                  }}
                </button>

                <button
                  type="button"
                  class="btn-inline btn-inline--primary"
                  @click="handleVisibilityAction(item)"
                >
                  {{ getVisibilityActionLabel(item.status) }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.content.emptyText') }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationContentItem,
  type ModerationContentOrigin,
  type ModerationContentStatus,
  type ModerationContentType,
  type ModerationSeverity,
  useModerationContentStore,
} from '@/stores/moderation'

useModerationAccess()

type ContentSortOption = 'updatedDesc' | 'createdDesc' | 'flagsDesc' | 'severityDesc'

const router = useRouter()
const moderationStore = useModerationContentStore()
const { contentItems, contentSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedStatus = ref<'all' | ModerationContentStatus>('all')
const selectedType = ref<'all' | ModerationContentType>('all')
const selectedSeverity = ref<'all' | ModerationSeverity>('all')
const selectedOrigin = ref<'all' | ModerationContentOrigin>('all')
const sortBy = ref<ContentSortOption>('updatedDesc')

const severityOrder: Record<ModerationSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'visible', label: t('moderation.contentStatuses.visible') },
  { value: 'hidden', label: t('moderation.contentStatuses.hidden') },
  { value: 'review', label: t('moderation.contentStatuses.review') },
  { value: 'restricted', label: t('moderation.contentStatuses.restricted') },
])

const typeOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allTypes') },
  { value: 'map', label: t('moderation.contentTypes.map') },
  { value: 'hunt', label: t('moderation.contentTypes.hunt') },
  { value: 'comment', label: t('moderation.contentTypes.comment') },
  { value: 'asset', label: t('moderation.contentTypes.asset') },
])

const severityOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.content.filters.allSeverities') },
  { value: 'low', label: t('moderation.severities.low') },
  { value: 'medium', label: t('moderation.severities.medium') },
  { value: 'high', label: t('moderation.severities.high') },
  { value: 'critical', label: t('moderation.severities.critical') },
])

const originOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.content.filters.allOrigins') },
  { value: 'community', label: t('moderation.contentOrigins.community') },
  { value: 'automated', label: t('moderation.contentOrigins.automated') },
  { value: 'internal', label: t('moderation.contentOrigins.internal') },
])

const sortOptions = computed(() => [
  { value: 'updatedDesc', label: t('moderation.pages.content.filters.sortUpdatedDesc') },
  { value: 'createdDesc', label: t('moderation.pages.content.filters.sortCreatedDesc') },
  { value: 'flagsDesc', label: t('moderation.pages.content.filters.sortFlagsDesc') },
  { value: 'severityDesc', label: t('moderation.pages.content.filters.sortSeverityDesc') },
])

const activeFilterCount = computed(() => {
  return [
    search.value.trim() !== '',
    selectedStatus.value !== 'all',
    selectedType.value !== 'all',
    selectedSeverity.value !== 'all',
    selectedOrigin.value !== 'all',
    sortBy.value !== 'updatedDesc',
  ].filter(Boolean).length
})

const filteredContent = computed(() => {
  const query = search.value.trim().toLowerCase()

  return contentItems.value
    .filter((item) => {
      const matchesQuery =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.authorName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.moderationNote.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))

      const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
      const matchesType = selectedType.value === 'all' || item.type === selectedType.value
      const matchesSeverity =
        selectedSeverity.value === 'all' || item.severity === selectedSeverity.value
      const matchesOrigin = selectedOrigin.value === 'all' || item.origin === selectedOrigin.value

      return matchesQuery && matchesStatus && matchesType && matchesSeverity && matchesOrigin
    })
    .slice()
    .sort((a, b) => {
      switch (sortBy.value) {
        case 'createdDesc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

        case 'flagsDesc':
          if (b.flagCount !== a.flagCount) {
            return b.flagCount - a.flagCount
          }
          return b.reportsCount - a.reportsCount

        case 'severityDesc':
          if (severityOrder[b.severity] !== severityOrder[a.severity]) {
            return severityOrder[b.severity] - severityOrder[a.severity]
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()

        case 'updatedDesc':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
})

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedType.value = 'all'
  selectedSeverity.value = 'all'
  selectedOrigin.value = 'all'
  sortBy.value = 'updatedDesc'
}

function goBackToModeration() {
  void router.push('/moderation')
}

function getContentStatusLabel(status: ModerationContentStatus) {
  return t(`moderation.contentStatuses.${status}`)
}

function getContentTypeLabel(type: ModerationContentType) {
  return t(`moderation.contentTypes.${type}`)
}

function getContentOriginLabel(origin: ModerationContentOrigin) {
  return t(`moderation.contentOrigins.${origin}`)
}

function getSeverityLabel(severity: ModerationSeverity) {
  return t(`moderation.severities.${severity}`)
}

function getVisibilityActionLabel(status: ModerationContentStatus) {
  return status === 'hidden' || status === 'restricted'
    ? t('moderation.pages.content.actions.restore')
    : t('moderation.pages.content.actions.hide')
}

function handleVisibilityAction(item: ModerationContentItem) {
  if (item.status === 'hidden' || item.status === 'restricted') {
    moderationStore.restoreContent(item.id, 'POC Admin')
    return
  }

  moderationStore.hideContent(item.id, 'POC Admin')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatLastAction(item: ModerationContentItem) {
  if (!item.lastActionAt) {
    return t('moderation.pages.content.card.lastActionFallback')
  }

  return t('moderation.pages.content.card.lastActionValue', {
    actor: item.lastActionBy ?? 'Administration',
    date: formatDate(item.lastActionAt),
  })
}
</script>
