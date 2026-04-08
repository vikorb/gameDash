<template>
  <section class="moderation-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('moderation.pages.audit.badge') }}</span>
          <h1 class="page-title">{{ t('moderation.pages.audit.title') }}</h1>
          <p class="page-subtitle">{{ t('moderation.pages.audit.subtitle') }}</p>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.pages.audit.actions.backToModeration') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.pages.audit.actions.resetFilters') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.audit.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.audit.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.audit.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.audit.side.chips.traceability') }}</span>
            <span>{{ t('moderation.pages.audit.side.chips.history') }}</span>
            <span>{{ t('moderation.pages.audit.side.chips.security') }}</span>
          </div>
        </aside>
      </header>

      <section class="stat-grid stat-grid--audit">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.audit.stats.total') }}</span>
          <strong class="stat-card__value">{{ stats.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.audit.stats.totalCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.audit.stats.today') }}</span>
          <strong class="stat-card__value">{{ stats.today }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.audit.stats.todayCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.audit.stats.sanctions') }}</span>
          <strong class="stat-card__value">{{ stats.sanctions }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.audit.stats.sanctionsCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.audit.stats.content') }}</span>
          <strong class="stat-card__value">{{ stats.content }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.audit.stats.contentCaption') }}
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header surface-header--audit">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.audit.filters.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.audit.filters.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span v-if="activeFilterCount > 0" class="meta-item">
              {{ t('moderation.pages.audit.filters.filtered', { count: activeFilterCount }) }}
            </span>
          </div>
        </div>

        <div class="toolbar toolbar--audit">
          <input
            v-model="search"
            type="text"
            class="field"
            :placeholder="t('moderation.pages.audit.filters.search')"
          />

          <select v-model="selectedResourceType" class="select">
            <option value="all">{{ t('moderation.pages.common.filters.allResources') }}</option>
            <option v-for="item in resourceTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedActionKey" class="select">
            <option value="all">{{ t('moderation.pages.audit.filters.allActions') }}</option>
            <option v-for="item in actionOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSort" class="select">
            <option v-for="item in sortOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="surface-header surface-header--audit-list">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.audit.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.audit.list.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span class="meta-item">
              {{ sortedEntries.length }} {{ t('moderation.pages.common.results') }}
            </span>
          </div>
        </div>

        <div class="audit-summary-chips">
          <span class="meta-item">
            {{ t('moderation.resourceTypes.report') }} · {{ stats.reports }}
          </span>
          <span class="meta-item">
            {{ t('moderation.resourceTypes.content') }} · {{ stats.content }}
          </span>
          <span class="meta-item">
            {{ t('moderation.resourceTypes.sanction') }} · {{ stats.sanctions }}
          </span>
          <span class="meta-item">
            {{ t('moderation.resourceTypes.appeal') }} · {{ stats.appeals }}
          </span>
          <span class="meta-item">
            {{ t('moderation.resourceTypes.user') }} · {{ stats.users }}
          </span>
        </div>

        <div v-if="sortedEntries.length" class="timeline">
          <article
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="timeline-card timeline-card--dense audit-entry-card"
          >
            <div class="timeline-card__top">
              <div class="audit-entry-card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="getActionIcon(entry.actionKey)" />
                </svg>
              </div>

              <div class="audit-entry-card__body">
                <div class="audit-entry-card__header">
                  <div>
                    <h3 class="timeline-card__title">{{ getActionLabel(entry.actionKey) }}</h3>
                    <p class="audit-entry-card__subtitle">
                      {{ entry.actorName }} · {{ getResourceTypeLabel(entry.resourceType) }}
                    </p>
                  </div>

                  <div class="audit-entry-card__header-end">
                    <span class="meta-item">{{ entry.id }}</span>
                    <span class="meta-item">{{ formatDate(entry.createdAt) }}</span>
                  </div>
                </div>

                <p class="timeline-card__text">
                  <strong>{{ t('moderation.pages.audit.card.resource') }}</strong>
                  {{ entry.resourceLabel }}
                </p>

                <div class="timeline-card__meta">
                  <span
                    :class="['audit-resource-pill', `audit-resource-pill--${entry.resourceType}`]"
                  >
                    {{ getResourceTypeLabel(entry.resourceType) }}
                  </span>

                  <span v-for="item in entry.metadata" :key="item" class="meta-item">
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state empty-state--compact">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.audit.emptyText') }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiClipboardAccountOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiFileDocumentAlertOutline,
  mdiGavel,
  mdiHelpCircleOutline,
  mdiShieldCheckOutline,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import {
  type ModerationAuditEntry,
  type ModerationResourceType,
  useModerationAuditStore,
} from '@/stores/moderation'
import { useUserStore } from '@/stores/userStore'

type AuditActionKey = ModerationAuditEntry['actionKey']
type AuditSortMode = 'createdDesc' | 'createdAsc' | 'actorAsc'

const router = useRouter()
const moderationStore = useModerationAuditStore()
const userStore = useUserStore()

const { auditEntries } = storeToRefs(moderationStore)
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedResourceType = ref<'all' | ModerationResourceType>('all')
const selectedActionKey = ref<'all' | AuditActionKey>('all')
const selectedSort = ref<AuditSortMode>('createdDesc')

const resourceTypeOptions = computed(() => [
  { value: 'report', label: t('moderation.resourceTypes.report') },
  { value: 'content', label: t('moderation.resourceTypes.content') },
  { value: 'sanction', label: t('moderation.resourceTypes.sanction') },
  { value: 'appeal', label: t('moderation.resourceTypes.appeal') },
  { value: 'user', label: t('moderation.resourceTypes.user') },
])

const actionOptions = computed(() => [
  { value: 'report_assigned', label: t('moderation.auditActions.report_assigned') },
  { value: 'report_resolved', label: t('moderation.auditActions.report_resolved') },
  { value: 'content_hidden', label: t('moderation.auditActions.content_hidden') },
  { value: 'content_restored', label: t('moderation.auditActions.content_restored') },
  {
    value: 'content_review_requested',
    label: t('moderation.auditActions.content_review_requested'),
  },
  { value: 'sanction_activated', label: t('moderation.auditActions.sanction_activated') },
  { value: 'sanction_revoked', label: t('moderation.auditActions.sanction_revoked') },
  { value: 'appeal_accepted', label: t('moderation.auditActions.appeal_accepted') },
  { value: 'appeal_rejected', label: t('moderation.auditActions.appeal_rejected') },
  { value: 'appeal_info_requested', label: t('moderation.auditActions.appeal_info_requested') },
])

const sortOptions = computed(() => [
  { value: 'createdDesc', label: t('moderation.pages.audit.filters.sortNewest') },
  { value: 'createdAsc', label: t('moderation.pages.audit.filters.sortOldest') },
  { value: 'actorAsc', label: t('moderation.pages.audit.filters.sortActor') },
])

const filteredEntries = computed(() => {
  const query = search.value.trim().toLowerCase()

  return auditEntries.value.filter((entry) => {
    const matchesSearch =
      query === '' ||
      entry.id.toLowerCase().includes(query) ||
      entry.actorName.toLowerCase().includes(query) ||
      entry.resourceLabel.toLowerCase().includes(query) ||
      entry.metadata.some((item) => item.toLowerCase().includes(query)) ||
      getActionLabel(entry.actionKey).toLowerCase().includes(query)

    const matchesResource =
      selectedResourceType.value === 'all' || entry.resourceType === selectedResourceType.value

    const matchesAction =
      selectedActionKey.value === 'all' || entry.actionKey === selectedActionKey.value

    return matchesSearch && matchesResource && matchesAction
  })
})

const sortedEntries = computed(() => {
  const items = [...filteredEntries.value]

  items.sort((first, second) => {
    if (selectedSort.value === 'actorAsc') {
      return first.actorName.localeCompare(second.actorName)
    }

    const firstDate = new Date(first.createdAt).getTime()
    const secondDate = new Date(second.createdAt).getTime()

    if (selectedSort.value === 'createdAsc') {
      return firstDate - secondDate
    }

    return secondDate - firstDate
  })

  return items
})

const stats = computed(() => {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000

  return {
    total: auditEntries.value.length,
    today: auditEntries.value.filter(
      (entry) => now - new Date(entry.createdAt).getTime() <= dayInMs,
    ).length,
    reports: auditEntries.value.filter((entry) => entry.resourceType === 'report').length,
    content: auditEntries.value.filter((entry) => entry.resourceType === 'content').length,
    sanctions: auditEntries.value.filter((entry) => entry.resourceType === 'sanction').length,
    appeals: auditEntries.value.filter((entry) => entry.resourceType === 'appeal').length,
    users: auditEntries.value.filter((entry) => entry.resourceType === 'user').length,
  }
})

const activeFilterCount = computed(() => {
  let count = 0

  if (search.value.trim() !== '') count += 1
  if (selectedResourceType.value !== 'all') count += 1
  if (selectedActionKey.value !== 'all') count += 1
  if (selectedSort.value !== 'createdDesc') count += 1

  return count
})

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})

function goBackToModeration() {
  router.push('/moderation')
}

function resetFilters() {
  search.value = ''
  selectedResourceType.value = 'all'
  selectedActionKey.value = 'all'
  selectedSort.value = 'createdDesc'
}

function getActionLabel(actionKey: AuditActionKey) {
  return t(`moderation.auditActions.${actionKey}`)
}

function getResourceTypeLabel(type: ModerationResourceType) {
  return t(`moderation.resourceTypes.${type}`)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getActionIcon(actionKey: AuditActionKey) {
  switch (actionKey) {
    case 'report_assigned':
      return mdiAlertOutline
    case 'report_resolved':
      return mdiCheckCircleOutline
    case 'content_hidden':
      return mdiEyeOffOutline
    case 'content_restored':
      return mdiEyeOutline
    case 'content_review_requested':
      return mdiFileDocumentAlertOutline
    case 'sanction_activated':
      return mdiGavel
    case 'sanction_revoked':
      return mdiShieldCheckOutline
    case 'appeal_accepted':
      return mdiCheckCircleOutline
    case 'appeal_rejected':
      return mdiGavel
    case 'appeal_info_requested':
      return mdiHelpCircleOutline
    default:
      return mdiClipboardAccountOutline
  }
}
</script>

<style scoped>
.stat-grid--audit {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.toolbar--audit {
  grid-template-columns: minmax(0, 1.55fr) repeat(3, minmax(180px, 0.55fr));
}

.surface-header--audit {
  align-items: flex-start;
}

.surface-header--audit-list {
  margin-top: 1.25rem;
  margin-bottom: 1rem;
}

.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.audit-summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.audit-entry-card__icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(81, 96, 121, 0.09);
  color: var(--color-ink);
  flex-shrink: 0;
}

.audit-entry-card__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.audit-entry-card__body {
  flex: 1;
  min-width: 0;
}

.audit-entry-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.audit-entry-card__subtitle {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.audit-entry-card__header-end {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
}

.audit-resource-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.36rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.audit-resource-pill--report {
  color: #775500;
  background: rgba(255, 193, 7, 0.18);
}

.audit-resource-pill--content {
  color: #146c43;
  background: rgba(61, 191, 125, 0.16);
}

.audit-resource-pill--sanction {
  color: #8a4040;
  background: rgba(214, 69, 69, 0.14);
}

.audit-resource-pill--appeal {
  color: #3c5a96;
  background: rgba(80, 126, 255, 0.14);
}

.audit-resource-pill--user {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.12);
}

@media (max-width: 1180px) {
  .stat-grid--audit,
  .toolbar--audit {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .audit-entry-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .audit-entry-card__header-end {
    justify-content: flex-start;
  }
}
</style>
