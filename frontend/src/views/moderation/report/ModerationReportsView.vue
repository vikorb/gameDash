<template>
  <section class="moderation-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('moderation.pages.reports.badge') }}</span>
            <h1 class="page-title">{{ t('moderation.pages.reports.title') }}</h1>
            <p class="page-subtitle">{{ t('moderation.pages.reports.subtitle') }}</p>
          </div>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.cards.audit.actions.backToModeration') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.cards.audit.actions.resetFilters') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.reports.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.reports.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.reports.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.reports.side.chips.fastReview') }}</span>
            <span>{{ t('moderation.pages.reports.side.chips.assignment') }}</span>
            <span>{{ t('moderation.pages.reports.side.chips.priority') }}</span>
          </div>
        </aside>
      </header>

      <section class="stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.reports.stats.total') }}</span>
          <strong class="stat-card__value">{{ reportSummary.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reports.stats.totalCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.reports.stats.pending') }}</span>
          <strong class="stat-card__value">{{ reportSummary.newCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reports.stats.pendingCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.reports.stats.inProgress') }}</span>
          <strong class="stat-card__value">{{ reportSummary.investigatingCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reports.stats.inProgressCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.reports.stats.resolved') }}</span>
          <strong class="stat-card__value">{{ reportSummary.resolvedCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reports.stats.resolvedCaption') }}
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.reports.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.reports.list.subtitle') }}</p>
          </div>

          <span class="meta-item">
            {{ filteredReports.length }} {{ t('moderation.pages.common.results') }}
          </span>
        </div>

        <div class="toolbar">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.reports.filters.search')"
          />

          <select v-model="selectedStatus" class="select">
            <option v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSeverity" class="select">
            <option v-for="item in severityOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div v-if="filteredReports.length" class="list-grid">
          <article v-for="report in filteredReports" :key="report.id" class="moderation-card">
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ report.subject }}</h3>
                <div class="card-subtitle">
                  {{ t('moderation.pages.reports.card.target') }} {{ report.targetName }}
                </div>
              </div>

              <span class="meta-item">{{ formatDate(report.createdAt) }}</span>
            </div>

            <div class="card-pills">
              <span :class="['pill', `pill--${report.status}`]">
                {{ getReportStatusLabel(report.status) }}
              </span>

              <span :class="['pill', `pill--${report.severity}`]">
                {{ getSeverityLabel(report.severity) }}
              </span>

              <span class="pill pill--neutral">
                {{ report.targetType }}
              </span>
            </div>

            <p class="card-text">{{ report.summary }}</p>

            <div class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.reports.card.reporter') }} {{ report.reporterName }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.reports.card.reason') }} {{ report.reason }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.reports.card.assignedTo') }}
                {{ report.assignedTo || t('moderation.pages.common.unassigned') }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.reportDetail.fields.attachments') }}
                {{ report.attachments.length }}
              </span>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="btn-inline btn-inline--ghost"
                @click="openReport(report.id)"
              >
                {{ t('moderation.pages.reports.actions.open') }}
              </button>

              <button
                v-if="!report.assignedTo"
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="moderationStore.assignReport(report.id, 'POC Admin')"
              >
                {{ t('moderation.pages.reports.actions.assign') }}
              </button>

              <button
                v-if="report.status === 'new'"
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="moderationStore.setReportStatus(report.id, 'investigating', 'POC Admin')"
              >
                {{ t('moderation.pages.reports.actions.startReview') }}
              </button>

              <button
                v-if="report.status !== 'resolved' && report.status !== 'dismissed'"
                type="button"
                class="btn-inline btn-inline--primary"
                @click="moderationStore.resolveReport(report.id, 'POC Admin')"
              >
                {{ t('moderation.pages.reports.actions.resolve') }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.reports.emptyText') }}</p>
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
  type ModerationReportStatus,
  type ModerationSeverity,
  useModerationReportsStore,
} from '@/stores/moderation'

useModerationAccess()

const router = useRouter()
const moderationStore = useModerationReportsStore()
const { reports, reportSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedStatus = ref<'all' | ModerationReportStatus>('all')
const selectedSeverity = ref<'all' | ModerationSeverity>('all')

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'new', label: t('moderation.statuses.new') },
  { value: 'investigating', label: t('moderation.statuses.investigating') },
  { value: 'resolved', label: t('moderation.statuses.resolved') },
  { value: 'dismissed', label: t('moderation.statuses.dismissed') },
])

const severityOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allSeverities') },
  { value: 'low', label: t('moderation.severities.low') },
  { value: 'medium', label: t('moderation.severities.medium') },
  { value: 'high', label: t('moderation.severities.high') },
  { value: 'critical', label: t('moderation.severities.critical') },
])

const filteredReports = computed(() => {
  const query = search.value.trim().toLowerCase()

  return [...reports.value]
    .filter((report) => {
      const matchesQuery =
        query === '' ||
        report.subject.toLowerCase().includes(query) ||
        report.targetName.toLowerCase().includes(query) ||
        report.reporterName.toLowerCase().includes(query) ||
        report.reason.toLowerCase().includes(query) ||
        (report.assignedTo ?? '').toLowerCase().includes(query) ||
        report.targetType.toLowerCase().includes(query)

      const matchesStatus = selectedStatus.value === 'all' || report.status === selectedStatus.value
      const matchesSeverity =
        selectedSeverity.value === 'all' || report.severity === selectedSeverity.value

      return matchesQuery && matchesStatus && matchesSeverity
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedSeverity.value = 'all'
}

function openReport(reportId: string | number) {
  router.push(`/moderation/reports/${reportId}`)
}

function goBackToModeration() {
  router.push('/moderation')
}

function getReportStatusLabel(status: ModerationReportStatus) {
  return t(`moderation.statuses.${status}`)
}

function getSeverityLabel(severity: ModerationSeverity) {
  return t(`moderation.severities.${severity}`)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.page-hero__content {
  display: grid;
  gap: 1rem;
}

.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pill--neutral {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
