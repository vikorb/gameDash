<template>
  <section class="moderation-page">
    <div class="page-shell" v-if="report">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('moderation.pages.reportDetail.badge') }}</span>
            <h1 class="page-title">{{ report.subject }}</h1>
            <p class="page-subtitle">
              {{ t('moderation.pages.reportDetail.subtitle') }}
            </p>
          </div>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.cards.audit.actions.backToModeration') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="goBackToReports">
              {{ t('moderation.pages.reportDetail.actions.backToReports') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.reportDetail.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.reportDetail.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.reportDetail.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ getReportStatusLabel(report.status) }}</span>
            <span>{{ getSeverityLabel(report.severity) }}</span>
            <span>{{ report.assignedTo || t('moderation.pages.common.unassigned') }}</span>
          </div>
        </aside>
      </header>

      <section class="stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.reportDetail.meta.status') }}</span>
          <strong class="stat-card__value">
            {{ getReportStatusLabel(report.status) }}
          </strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reportDetail.meta.statusCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">
            {{ t('moderation.pages.reportDetail.meta.severity') }}
          </span>
          <strong class="stat-card__value">
            {{ getSeverityLabel(report.severity) }}
          </strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reportDetail.meta.severityCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">
            {{ t('moderation.pages.reportDetail.meta.assignedTo') }}
          </span>
          <strong class="stat-card__value">
            {{ report.assignedTo || t('moderation.pages.common.unassigned') }}
          </strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reportDetail.meta.assignedCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">
            {{ t('moderation.pages.reportDetail.meta.attachments') }}
          </span>
          <strong class="stat-card__value">{{ report.attachments.length }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.reportDetail.meta.attachmentsCaption') }}
          </div>
        </article>
      </section>

      <div class="detail-layout">
        <div class="detail-main">
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('moderation.pages.reportDetail.cards.overview') }}
                </h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.overviewSubtitle') }}
                </p>
              </div>
            </div>

            <div class="detail-summary">
              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.target')
                }}</span>
                <span class="detail-value">{{ report.targetName }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.targetType')
                }}</span>
                <span class="detail-value">{{ report.targetType }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.reporter')
                }}</span>
                <span class="detail-value">{{ report.reporterName }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.reason')
                }}</span>
                <span class="detail-value">{{ report.reason }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.createdAt')
                }}</span>
                <span class="detail-value">{{ formatDate(report.createdAt) }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{
                  t('moderation.pages.reportDetail.fields.updatedAt')
                }}</span>
                <span class="detail-value">{{ formatDate(report.updatedAt) }}</span>
              </div>
            </div>

            <div class="report-body">
              <h3 class="section-title">{{ t('moderation.pages.reportDetail.fields.summary') }}</h3>
              <p class="report-paragraph">{{ report.summary }}</p>
            </div>

            <div v-if="report.evidence.length" class="report-body">
              <h3 class="section-title">
                {{ t('moderation.pages.reportDetail.fields.evidence') }}
              </h3>

              <div class="evidence-list">
                <div v-for="item in report.evidence" :key="item.id" class="evidence-item">
                  <span class="evidence-label">{{ item.label }}</span>
                  <span class="evidence-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('moderation.pages.reportDetail.cards.attachments') }}
                </h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.attachmentsSubtitle') }}
                </p>
              </div>
            </div>

            <div v-if="mockAssetOptions.length" class="attachment-builder">
              <select v-model="selectedMockAssetKey" class="select">
                <option value="">
                  {{ t('moderation.pages.reportDetail.placeholders.attachmentAsset') }}
                </option>
                <option v-for="item in mockAssetOptions" :key="item.key" :value="item.key">
                  {{ item.name }}
                </option>
              </select>

              <input
                v-model="attachmentDescription"
                class="field"
                :placeholder="t('moderation.pages.reportDetail.placeholders.attachmentDescription')"
              />

              <button
                type="button"
                class="btn-inline btn-inline--secondary"
                :disabled="!selectedMockAsset"
                @click="addMockAttachment"
              >
                {{ t('moderation.pages.reportDetail.actions.addAttachment') }}
              </button>
            </div>

            <div v-if="imageAttachments.length" class="attachment-block">
              <h3 class="section-title">{{ t('moderation.pages.reportDetail.fields.images') }}</h3>

              <div class="attachment-grid attachment-grid--images">
                <article
                  v-for="attachment in imageAttachments"
                  :key="attachment.id"
                  class="attachment-card attachment-card--image"
                >
                  <img :src="attachment.url" :alt="attachment.name" class="attachment-preview" />

                  <div class="attachment-card__body">
                    <strong class="attachment-name">{{ attachment.name }}</strong>
                    <p v-if="attachment.description" class="attachment-description">
                      {{ attachment.description }}
                    </p>

                    <div class="attachment-meta">
                      <span>{{ attachment.addedBy }}</span>
                      <span>{{ formatDate(attachment.addedAt) }}</span>
                    </div>

                    <div class="attachment-actions">
                      <a
                        class="btn-inline btn-inline--ghost"
                        :href="attachment.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ t('moderation.pages.reportDetail.actions.previewAttachment') }}
                      </a>

                      <button
                        type="button"
                        class="btn-inline btn-inline--ghost danger"
                        @click="removeAttachment(attachment.id)"
                      >
                        {{ t('moderation.pages.reportDetail.actions.removeAttachment') }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div v-if="fileAttachments.length" class="attachment-block">
              <h3 class="section-title">{{ t('moderation.pages.reportDetail.fields.files') }}</h3>

              <div class="attachment-grid">
                <article
                  v-for="attachment in fileAttachments"
                  :key="attachment.id"
                  class="attachment-card"
                >
                  <div class="attachment-file-icon">FILE</div>

                  <div class="attachment-card__body">
                    <strong class="attachment-name">{{ attachment.name }}</strong>
                    <p v-if="attachment.description" class="attachment-description">
                      {{ attachment.description }}
                    </p>

                    <div class="attachment-meta">
                      <span>{{ attachment.addedBy }}</span>
                      <span>{{ formatDate(attachment.addedAt) }}</span>
                    </div>

                    <div class="attachment-actions">
                      <a
                        class="btn-inline btn-inline--ghost"
                        :href="attachment.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ t('moderation.pages.reportDetail.actions.previewAttachment') }}
                      </a>

                      <button
                        type="button"
                        class="btn-inline btn-inline--ghost danger"
                        @click="removeAttachment(attachment.id)"
                      >
                        {{ t('moderation.pages.reportDetail.actions.removeAttachment') }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div
              v-if="!imageAttachments.length && !fileAttachments.length"
              class="empty-state empty-state--compact"
            >
              <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
              <p class="empty-state__text">
                {{ t('moderation.pages.reportDetail.emptyAttachments') }}
              </p>
            </div>
          </section>

          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('moderation.pages.reportDetail.cards.actions') }}
                </h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.actionsSubtitle') }}
                </p>
              </div>
            </div>

            <div class="assignment-box">
              <input
                v-model="assignee"
                class="field"
                :placeholder="t('moderation.pages.reportDetail.placeholders.assignee')"
              />

              <button
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="applyAssignment"
              >
                {{ t('moderation.pages.reportDetail.actions.applyAssignment') }}
              </button>

              <button type="button" class="btn-inline btn-inline--ghost" @click="assignToMe">
                {{ t('moderation.pages.reportDetail.actions.assignToMe') }}
              </button>
            </div>

            <div class="action-grid">
              <button
                v-if="report.status !== 'investigating'"
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="setInvestigating"
              >
                {{ t('moderation.pages.reportDetail.actions.setInvestigating') }}
              </button>

              <button
                v-if="report.status !== 'resolved'"
                type="button"
                class="btn-inline btn-inline--primary"
                @click="resolveCurrentReport"
              >
                {{ t('moderation.pages.reportDetail.actions.resolve') }}
              </button>

              <button
                v-if="report.status !== 'dismissed'"
                type="button"
                class="btn-inline btn-inline--ghost danger"
                @click="dismissCurrentReport"
              >
                {{ t('moderation.pages.reportDetail.actions.dismiss') }}
              </button>

              <button
                v-if="report.status === 'resolved' || report.status === 'dismissed'"
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="reopenCurrentReport"
              >
                {{ t('moderation.pages.reportDetail.actions.reopen') }}
              </button>
            </div>
          </section>

          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('moderation.pages.reportDetail.cards.reply') }}</h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.replySubtitle') }}
                </p>
              </div>
            </div>

            <textarea
              v-model="replyMessage"
              class="textarea"
              rows="5"
              :placeholder="t('moderation.pages.reportDetail.placeholders.reply')"
            />

            <div class="form-actions">
              <button type="button" class="btn-inline btn-inline--primary" @click="sendReply">
                {{ t('moderation.pages.reportDetail.actions.sendReply') }}
              </button>
            </div>

            <div v-if="report.replies.length" class="stack-list">
              <article v-for="reply in report.replies" :key="reply.id" class="stack-card">
                <div class="stack-card__top">
                  <strong>{{ reply.author }}</strong>
                  <span class="meta-item">{{ formatDate(reply.createdAt) }}</span>
                </div>
                <p class="stack-card__text">{{ reply.message }}</p>
              </article>
            </div>
          </section>
        </div>

        <aside class="detail-side">
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('moderation.pages.reportDetail.cards.internalNotes') }}
                </h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.internalNotesSubtitle') }}
                </p>
              </div>
            </div>

            <textarea
              v-model="internalNote"
              class="textarea"
              rows="4"
              :placeholder="t('moderation.pages.reportDetail.placeholders.internalNote')"
            />

            <div class="form-actions">
              <button
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="addInternalNote"
              >
                {{ t('moderation.pages.reportDetail.actions.addNote') }}
              </button>
            </div>

            <div v-if="report.internalNotes.length" class="stack-list">
              <article v-for="note in report.internalNotes" :key="note.id" class="stack-card">
                <div class="stack-card__top">
                  <strong>{{ note.author }}</strong>
                  <span class="meta-item">{{ formatDate(note.createdAt) }}</span>
                </div>
                <p class="stack-card__text">{{ note.message }}</p>
              </article>
            </div>
          </section>

          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('moderation.pages.reportDetail.cards.activity') }}
                </h2>
                <p class="surface-subtitle">
                  {{ t('moderation.pages.reportDetail.cards.activitySubtitle') }}
                </p>
              </div>
            </div>

            <div v-if="orderedActivity.length" class="timeline">
              <article v-for="item in orderedActivity" :key="item.id" class="timeline-item">
                <div class="timeline-item__dot"></div>
                <div class="timeline-item__content">
                  <div class="timeline-item__top">
                    <strong>{{ item.actor }}</strong>
                    <span class="meta-item">{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <p class="timeline-item__text">{{ item.message }}</p>
                </div>
              </article>
            </div>

            <div v-else class="empty-state empty-state--compact">
              <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
              <p class="empty-state__text">
                {{ t('moderation.pages.reportDetail.emptyActivity') }}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>

    <div v-else class="page-shell">
      <section class="surface empty-state">
        <h3 class="empty-state__title">{{ t('moderation.pages.reportDetail.notFoundTitle') }}</h3>
        <p class="empty-state__text">{{ t('moderation.pages.reportDetail.notFoundText') }}</p>
        <div class="form-actions">
          <button type="button" class="btn btn--primary" @click="goBackToReports">
            {{ t('moderation.pages.reportDetail.actions.backToReports') }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { mockReportAssetCatalog } from '@/assets/img/report/catalog'
import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationReportActivity,
  type ModerationReportStatus,
  type ModerationSeverity,
  useModerationReportsStore,
} from '@/stores/moderation'

useModerationAccess()

const route = useRoute()
const router = useRouter()
const moderationStore = useModerationReportsStore()
const { t, locale } = useI18n({ useScope: 'global' })

const assignee = ref('')
const internalNote = ref('')
const replyMessage = ref('')
const selectedMockAssetKey = ref('')
const attachmentDescription = ref('')

const reportId = computed(() => String(route.params.id ?? ''))
const report = computed(() => moderationStore.getReportById(reportId.value))

const orderedActivity = computed<ModerationReportActivity[]>(() => {
  if (!report.value) {
    return []
  }

  return [...report.value.activity].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

const mockAssetOptions = computed(() => mockReportAssetCatalog)

const selectedMockAsset = computed(
  () => mockAssetOptions.value.find((item) => item.key === selectedMockAssetKey.value) ?? null,
)

const imageAttachments = computed(() => {
  if (!report.value) {
    return []
  }

  return report.value.attachments.filter((item) => item.type === 'image')
})

const fileAttachments = computed(() => {
  if (!report.value) {
    return []
  }

  return report.value.attachments.filter((item) => item.type === 'file')
})

watch(
  report,
  (nextReport) => {
    assignee.value = nextReport?.assignedTo ?? ''
  },
  { immediate: true },
)

function goBackToReports() {
  router.push('/moderation/reports')
}

function goBackToModeration() {
  router.push('/moderation')
}

function applyAssignment() {
  if (!report.value) {
    return
  }

  const value = assignee.value.trim()
  if (!value) {
    return
  }

  moderationStore.assignReport(report.value.id, value)
}

function assignToMe() {
  if (!report.value) {
    return
  }

  assignee.value = 'POC Admin'
  moderationStore.assignReport(report.value.id, 'POC Admin')
}

function setInvestigating() {
  if (!report.value) {
    return
  }

  moderationStore.setReportStatus(report.value.id, 'investigating', 'POC Admin')
}

function resolveCurrentReport() {
  if (!report.value) {
    return
  }

  moderationStore.resolveReport(report.value.id, 'POC Admin')
}

function dismissCurrentReport() {
  if (!report.value) {
    return
  }

  moderationStore.dismissReport(report.value.id, 'POC Admin')
}

function reopenCurrentReport() {
  if (!report.value) {
    return
  }

  moderationStore.setReportStatus(report.value.id, 'investigating', 'POC Admin')
}

function addInternalNote() {
  if (!report.value) {
    return
  }

  const message = internalNote.value.trim()
  if (!message) {
    return
  }

  moderationStore.addReportInternalNote(report.value.id, message, 'POC Admin')
  internalNote.value = ''
}

function sendReply() {
  if (!report.value) {
    return
  }

  const message = replyMessage.value.trim()
  if (!message) {
    return
  }

  moderationStore.replyToReport(report.value.id, message, 'POC Admin')
  replyMessage.value = ''
}

function addMockAttachment() {
  if (!report.value || !selectedMockAsset.value) {
    return
  }

  moderationStore.addReportAttachment(
    report.value.id,
    {
      name: selectedMockAsset.value.name,
      type: selectedMockAsset.value.type,
      url: selectedMockAsset.value.url,
      mimeType: selectedMockAsset.value.mimeType,
      description: attachmentDescription.value.trim(),
      source: 'mock',
    },
    'POC Admin',
  )

  selectedMockAssetKey.value = ''
  attachmentDescription.value = ''
}

function removeAttachment(attachmentId: string) {
  if (!report.value) {
    return
  }

  moderationStore.removeReportAttachment(report.value.id, attachmentId, 'POC Admin')
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

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.95fr);
  gap: 1.25rem;
  align-items: start;
}

.detail-main,
.detail-side {
  display: grid;
  gap: 1.25rem;
}

.detail-summary {
  display: grid;
  gap: 0.9rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-label {
  color: var(--text-muted, rgba(124, 124, 124, 0.65));
  font-size: 0.92rem;
}

.detail-value {
  font-weight: 600;
  text-align: right;
}

.report-body {
  margin-top: 1.25rem;
}

.section-title {
  margin: 0 0 0.8rem;
  font-size: 1rem;
  font-weight: 700;
}

.report-paragraph {
  margin: 0;
  line-height: 1.65;
  color: var(--text-secondary, rgba(71, 71, 71, 0.82));
}

.evidence-list,
.stack-list {
  display: grid;
  gap: 0.85rem;
}

.evidence-item,
.stack-card,
.attachment-card {
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.evidence-label {
  display: block;
  font-size: 0.82rem;
  opacity: 0.7;
  margin-bottom: 0.35rem;
}

.evidence-value {
  font-weight: 600;
}

.assignment-box,
.action-grid,
.form-actions,
.attachment-builder,
.attachment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.assignment-box .field,
.attachment-builder .field {
  flex: 1 1 240px;
}

.attachment-builder .select {
  min-width: 240px;
}

.textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  border-radius: 16px;
  padding: 0.95rem 1rem;
  outline: none;
}

.stack-card__top,
.timeline-item__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stack-card__text,
.timeline-item__text,
.attachment-description {
  margin: 0;
  line-height: 1.55;
  color: var(--text-secondary, rgba(79, 79, 79, 0.82));
}

.timeline {
  display: grid;
  gap: 0.95rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
}

.timeline-item__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin-top: 0.35rem;
  background: rgba(114, 137, 218, 0.95);
  box-shadow: 0 0 0 4px rgba(114, 137, 218, 0.18);
}

.timeline-item__content {
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.attachment-block {
  margin-top: 1.25rem;
}

.attachment-grid {
  display: grid;
  gap: 1rem;
}

.attachment-grid--images {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.attachment-card--image {
  padding: 0;
  overflow: hidden;
}

.attachment-preview {
  display: block;
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.04);
}

.attachment-card__body {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.attachment-name {
  display: block;
  font-weight: 700;
}

.attachment-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.85rem;
  opacity: 0.75;
}

.attachment-file-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(114, 137, 218, 0.12);
  color: rgba(114, 137, 218, 1);
  margin-bottom: 1rem;
}

.empty-state--compact {
  padding: 1rem 0;
}

.danger {
  border-color: rgba(255, 107, 107, 0.35);
}

@media (max-width: 1080px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
