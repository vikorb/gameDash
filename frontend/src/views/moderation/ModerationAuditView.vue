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
.moderation-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

/* ── Layout ─────────────────────────────────────────────── */
.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

/* ── Hero / Header ───────────────────────────────────────── */
.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 1.25rem;
  align-items: stretch;
  margin-bottom: 1.35rem;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.24), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.page-hero > * {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  margin: 1rem 0 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.9rem 0 0;
  color: rgba(252, 239, 225, 0.7);
  font-size: 1rem;
  line-height: 1.65;
}

.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

/* ── Hero side ───────────────────────────────────────────── */
.hero-side {
  min-height: 100%;
  padding: 1.15rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.2), transparent 38%),
    rgba(18, 24, 38, 0.38);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.15;
}

.hero-side__text {
  margin: 0.55rem 0 0;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.88rem;
  line-height: 1.55;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.hero-side__chips span {
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.74rem;
  font-weight: 800;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 42px;
  padding: 0.7rem 1rem;
  border-radius: 14px;
  border: 1px solid transparent;
  font-size: 0.88rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    filter 0.16s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

/* ── Stats ───────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.stat-grid--audit {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.9)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1;
}

.stat-card__caption {
  display: block;
  margin-top: 0.45rem;
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* ── Surface ─────────────────────────────────────────────── */
.surface {
  padding: 1.15rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.surface-header--audit {
  align-items: flex-start;
}

.surface-header--audit-list {
  align-items: flex-start;
  margin-top: 1.25rem;
  margin-bottom: 1rem;
}

.surface-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.surface-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.9rem;
  line-height: 1.55;
}

.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
}

/* ── Toolbar / inputs ────────────────────────────────────── */
.toolbar {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.toolbar--audit {
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(180px, 0.55fr)
    minmax(180px, 0.55fr)
    minmax(180px, 0.55fr);
}

.field,
.select {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.85rem 0.95rem;
  font: inherit;
  font-weight: 800;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.field::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field:hover,
.select:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
  transform: translateY(-1px);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

/* ── Badges / meta ───────────────────────────────────────── */
.meta-item,
.audit-resource-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.34rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.76rem;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.audit-summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.audit-resource-pill--report {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
}

.audit-resource-pill--content {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.audit-resource-pill--sanction {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.audit-resource-pill--appeal {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.audit-resource-pill--user {
  color: #c7a6ff;
  background: rgba(128, 90, 213, 0.16);
  border-color: rgba(128, 90, 213, 0.28);
}

/* ── Timeline / audit entries ────────────────────────────── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline-card,
.audit-entry-card {
  width: 100%;
  padding: 0.95rem 1.05rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.58), rgba(46, 50, 68, 0.92)), var(--color-navy);
  color: var(--color-cream);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.timeline-card:hover,
.audit-entry-card:hover {
  transform: translateX(3px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.timeline-card--dense {
  padding: 0.95rem 1.05rem;
}

.timeline-card__top {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.timeline-card__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1.35;
}

.timeline-card__text {
  margin: 0.7rem 0 0;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.9rem;
  line-height: 1.55;
}

.timeline-card__text strong {
  color: var(--color-primary-strong);
  font-weight: 900;
}

.timeline-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.audit-entry-card__icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border: 1px solid rgba(242, 139, 91, 0.24);
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
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.9rem;
}

.audit-entry-card__header-end {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
  flex-shrink: 0;
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1rem;
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.68), rgba(46, 50, 68, 0.94)), var(--color-navy);
  text-align: center;
}

.empty-state--compact {
  padding: 2rem 1rem;
}

.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}

.empty-state__text {
  max-width: 520px;
  margin: 0.6rem auto 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1180px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .stat-grid--audit {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar--audit {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .moderation-page {
    padding: 1rem;
  }

  .page-hero,
  .surface,
  .stat-card,
  .empty-state {
    border-radius: 22px;
  }

  .page-hero,
  .surface {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .audit-hero__actions,
  .surface-header,
  .audit-entry-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .surface-header__meta,
  .audit-entry-card__header-end {
    justify-content: flex-start;
  }

  .btn {
    width: 100%;
  }

  .stat-grid--audit {
    grid-template-columns: 1fr;
  }

  .timeline-card__top {
    flex-direction: column;
  }

  .audit-entry-card__icon {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 520px) {
  .audit-summary-chips,
  .timeline-card__meta {
    flex-direction: column;
  }

  .meta-item,
  .audit-resource-pill,
  .hero-side__chips span {
    width: 100%;
    justify-content: center;
  }
}
</style>
