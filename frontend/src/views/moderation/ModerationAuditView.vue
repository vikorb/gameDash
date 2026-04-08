<template>
  <section class="audit-view">
    <div class="audit-shell">
      <header class="audit-hero">
        <div class="audit-hero__content">
          <span class="audit-hero__badge">{{ t('moderation.cards.audit.badge') }}</span>

          <h1 class="audit-hero__title">{{ t('moderation.cards.audit.title') }}</h1>

          <p class="audit-hero__subtitle">
            {{ t('moderation.cards.audit.subtitle') }}
          </p>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.cards.audit.actions.backToModeration') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.cards.audit.actions.resetFilters') }}
            </button>
          </div>
        </div>

        <div class="audit-hero__panel">
          <div class="audit-panel-card audit-panel-card--highlight">
            <div class="audit-panel-card__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiClipboardAccountOutline" />
              </svg>
            </div>

            <div>
              <div class="audit-panel-card__label">
                {{ t('moderation.cards.audit.side.label') }}
              </div>
              <div class="audit-panel-card__title">
                {{ t('moderation.cards.audit.side.title') }}
              </div>
              <div class="audit-panel-card__text">
                {{ t('moderation.cards.audit.side.text') }}
              </div>
            </div>
          </div>

          <div class="audit-panel-grid">
            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{
                t('moderation.cards.audit.stats.total')
              }}</span>
              <strong class="mini-stat-card__value">{{ stats.total }}</strong>
            </div>

            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{
                t('moderation.cards.audit.stats.today')
              }}</span>
              <strong class="mini-stat-card__value">{{ stats.today }}</strong>
            </div>

            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{
                t('moderation.cards.audit.stats.sanctions')
              }}</span>
              <strong class="mini-stat-card__value">{{ stats.sanctions }}</strong>
            </div>

            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{
                t('moderation.cards.audit.stats.content')
              }}</span>
              <strong class="mini-stat-card__value">{{ stats.content }}</strong>
            </div>
          </div>
        </div>
      </header>

      <section class="filters-block">
        <div class="section-heading">
          <h2 class="section-heading__title">{{ t('moderation.cards.audit.filters.title') }}</h2>
          <p class="section-heading__subtitle">
            {{ t('moderation.cards.audit.filters.subtitle') }}
          </p>
        </div>

        <div class="filters-grid">
          <input
            v-model="search"
            type="text"
            class="field"
            :placeholder="t('moderation.cards.audit.filters.search')"
          />

          <select v-model="selectedResourceType" class="field">
            <option value="all">{{ t('moderation.pages.common.filters.allResources') }}</option>
            <option v-for="item in resourceTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedActionKey" class="field">
            <option value="all">{{ t('moderation.cards.audit.filters.allActions') }}</option>
            <option v-for="item in actionOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </section>

      <section class="timeline-block">
        <div class="section-heading section-heading--row">
          <div>
            <h2 class="section-heading__title">{{ t('moderation.cards.audit.list.title') }}</h2>
            <p class="section-heading__subtitle">
              {{ t('moderation.cards.audit.list.subtitle') }}
            </p>
          </div>

          <div class="results-badge">
            {{ filteredEntries.length }} {{ t('moderation.pages.common.results') }}
          </div>
        </div>

        <div v-if="filteredEntries.length" class="timeline">
          <article v-for="entry in filteredEntries" :key="entry.id" class="timeline-card">
            <div class="timeline-card__top">
              <div class="timeline-card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="getActionIcon(entry.actionKey)" />
                </svg>
              </div>

              <div class="timeline-card__main">
                <div class="timeline-card__header">
                  <div>
                    <h3 class="timeline-card__title">{{ getActionLabel(entry.actionKey) }}</h3>
                    <p class="timeline-card__subtitle">
                      {{ entry.actorName }} • {{ getResourceTypeLabel(entry.resourceType) }}
                    </p>
                  </div>

                  <span class="timeline-card__date">{{ formatDate(entry.createdAt) }}</span>
                </div>

                <p class="timeline-card__description">
                  <strong>{{ t('moderation.cards.audit.card.resource') }}</strong>
                  {{ entry.resourceLabel }}
                </p>

                <div class="timeline-card__meta">
                  <span :class="['meta-pill', `meta-pill--${entry.resourceType}`]">
                    {{ getResourceTypeLabel(entry.resourceType) }}
                  </span>

                  <span
                    v-for="item in entry.metadata"
                    :key="item"
                    class="meta-pill meta-pill--neutral"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.cards.audit.emptyText') }}</p>
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

import { type ModerationResourceType, useModerationAuditStore } from '@/stores/moderation'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const moderationStore = useModerationAuditStore()
const userStore = useUserStore()

const { auditEntries } = storeToRefs(moderationStore)
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedResourceType = ref<'all' | ModerationResourceType>('all')
const selectedActionKey = ref<'all' | string>('all')

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
  {
    value: 'appeal_info_requested',
    label: t('moderation.auditActions.appeal_info_requested'),
  },
])

const filteredEntries = computed(() => {
  const query = search.value.trim().toLowerCase()

  return auditEntries.value.filter((entry) => {
    const matchesSearch =
      query === '' ||
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

const stats = computed(() => {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000

  return {
    total: auditEntries.value.length,
    today: auditEntries.value.filter((entry) => {
      const entryDate = new Date(entry.createdAt).getTime()
      return now - entryDate <= dayInMs
    }).length,
    sanctions: auditEntries.value.filter((entry) => entry.resourceType === 'sanction').length,
    content: auditEntries.value.filter((entry) => entry.resourceType === 'content').length,
  }
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
}

function getActionLabel(actionKey: string) {
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

function getActionIcon(actionKey: string) {
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
.audit-view {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
}

.audit-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.audit-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 1.5rem;
  align-items: stretch;
}

.audit-hero__content,
.audit-hero__panel,
.filters-block,
.timeline-block {
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  box-shadow: var(--shadow-md);
}

.audit-hero__content {
  padding: 2rem;
}

.audit-hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}

.audit-hero__title {
  margin: 1rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  color: var(--color-ink);
}

.audit-hero__subtitle {
  margin: 1rem 0 0;
  max-width: 720px;
  color: var(--color-text-muted);
  font-size: 1rem;
}

.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.2rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  box-shadow: 0 16px 30px -18px rgba(242, 139, 91, 0.8);
}

.btn--primary:hover,
.card-action:hover {
  transform: translateY(-1px);
}

.btn--ghost {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

.audit-hero__panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audit-panel-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.15rem;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(46, 50, 68, 0.97), rgba(81, 96, 121, 0.95));
  color: var(--color-cream);
}

.audit-panel-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
}

.audit-panel-card__icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

.audit-panel-card__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.78;
  letter-spacing: 0.04em;
}

.audit-panel-card__title {
  margin-top: 0.3rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.audit-panel-card__text {
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.92rem;
}

.audit-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-stat-card {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.12);
}

.mini-stat-card__label {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.mini-stat-card__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 700;
}

.filters-block,
.timeline-block {
  margin-top: 1.5rem;
  padding: 1.5rem;
}

.section-heading {
  margin-bottom: 1.25rem;
}

.section-heading--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-heading__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.55rem;
  color: var(--color-ink);
}

.section-heading__subtitle {
  margin: 0.4rem 0 0;
  color: var(--color-text-muted);
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 0.8fr));
  gap: 1rem;
}

.field {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(81, 96, 121, 0.14);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-ink);
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  outline: none;
}

.field:focus {
  border-color: rgba(242, 139, 91, 0.45);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.12);
}

.results-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink);
  font-size: 0.82rem;
  font-weight: 700;
}

.timeline {
  display: grid;
  gap: 1rem;
}

.timeline-card {
  border-radius: 22px;
  border: 1px solid rgba(46, 50, 68, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.18)),
    rgba(252, 239, 225, 0.7);
  box-shadow: var(--shadow-sm);
  padding: 1.15rem;
}

.timeline-card__top {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.timeline-card__icon {
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

.timeline-card__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.timeline-card__main {
  flex: 1;
  min-width: 0;
}

.timeline-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.timeline-card__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 1.05rem;
}

.timeline-card__subtitle {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.timeline-card__date {
  white-space: nowrap;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.timeline-card__description {
  margin: 0.85rem 0 0;
  color: var(--color-ink);
  font-size: 0.94rem;
  line-height: 1.5;
}

.timeline-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.95rem;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.36rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.meta-pill--neutral {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
}

.meta-pill--report {
  color: #775500;
  background: rgba(255, 193, 7, 0.18);
}

.meta-pill--content {
  color: #146c43;
  background: rgba(61, 191, 125, 0.16);
}

.meta-pill--sanction {
  color: #8a4040;
  background: rgba(214, 69, 69, 0.14);
}

.meta-pill--appeal {
  color: #3c5a96;
  background: rgba(80, 126, 255, 0.14);
}

.meta-pill--user {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.12);
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px dashed rgba(81, 96, 121, 0.2);
}

.empty-state__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 1.1rem;
}

.empty-state__text {
  margin: 0.55rem 0 0;
  color: var(--color-text-muted);
}

@media (max-width: 1100px) {
  .audit-hero,
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .audit-view {
    padding: 1rem;
  }

  .audit-hero__content,
  .audit-hero__panel,
  .filters-block,
  .timeline-block {
    border-radius: 22px;
  }

  .audit-panel-grid {
    grid-template-columns: 1fr;
  }

  .audit-hero__actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .section-heading--row,
  .timeline-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-card__date {
    white-space: normal;
  }
}
</style>
