<template>
  <section class="moderation-page">
    <div class="page-shell">
      <!-- Hero -->
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

      <!-- Stats -->
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

      <!-- List -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.reports.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.reports.list.subtitle') }}</p>
          </div>
          <span class="meta-item"
            >{{ filteredReports.length }} {{ t('moderation.pages.common.results') }}</span
          >
        </div>

        <div class="toolbar">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.reports.filters.search')"
          />
          <select v-model="selectedStatus" class="select">
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedSeverity" class="select">
            <option v-for="o in severityOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>

        <div v-if="filteredReports.length" class="summary-list">
          <button
            v-for="report in filteredReports"
            :key="report.id"
            type="button"
            :class="['summary-card', `summary-card--${report.severity}`]"
            @click="openModal(report)"
          >
            <div :class="['summary-card__icon', `summary-card__icon--${report.status}`]">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="getStatusIcon(report.status)" />
              </svg>
            </div>
            <div class="summary-card__body">
              <div class="summary-card__head">
                <span class="summary-card__id">#{{ report.id }}</span>
                <strong class="summary-card__title">{{ report.subject }}</strong>
              </div>
              <div class="summary-card__meta">
                <span>{{ report.targetName }}</span>
                <span class="dot">·</span>
                <span
                  >{{ t('moderation.pages.reports.card.reporter') }} {{ report.reporterName }}</span
                >
                <span class="dot">·</span>
                <span>{{ formatDate(report.createdAt) }}</span>
              </div>
              <div class="summary-card__pills">
                <span :class="['pill', `pill--${report.status}`]">{{
                  getReportStatusLabel(report.status)
                }}</span>
                <span :class="['pill', `pill--${report.severity}`]">{{
                  getSeverityLabel(report.severity)
                }}</span>
                <span class="meta-item">{{ report.targetType }}</span>
                <span v-if="report.assignedTo" class="meta-item meta-item--assigned">{{
                  report.assignedTo
                }}</span>
                <span v-else class="meta-item meta-item--unassigned">{{
                  t('moderation.pages.common.unassigned')
                }}</span>
              </div>
            </div>
            <div class="summary-card__signals">
              <div v-if="report.attachments.length" class="signal-badge signal-badge--attach">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPaperclip" /></svg>
                <span>{{ report.attachments.length }}</span>
              </div>
              <div v-if="report.evidence.length" class="signal-badge signal-badge--evidence">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiFileSearchOutline" /></svg>
                <span>{{ report.evidence.length }}</span>
              </div>
              <div v-if="report.internalNotes?.length" class="signal-badge signal-badge--notes">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiNoteTextOutline" /></svg>
                <span>{{ report.internalNotes.length }}</span>
              </div>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiChevronRight" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.reports.emptyText') }}</p>
        </div>
      </section>
    </div>

    <!-- ─── Modal enrichi ──────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selected" class="modal-backdrop" @click.self="closeModal">
          <div class="modal" role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="modal__header" :class="`modal__header--${selected.severity}`">
              <div class="modal__header-left">
                <div :class="['modal__type-icon', `modal__type-icon--${selected.status}`]">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="getStatusIcon(selected.status)" />
                  </svg>
                </div>
                <div>
                  <div class="modal__id">#{{ selected.id }} · {{ selected.targetType }}</div>
                  <h2 class="modal__title">{{ selected.subject }}</h2>
                  <div class="modal__subtitle">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="mdiAccountOutline" />
                    </svg>
                    {{ selected.targetName }}
                    <span class="dot">·</span>
                    {{ t('moderation.pages.reports.card.reporter') }} {{ selected.reporterName }}
                  </div>
                </div>
              </div>
              <div class="modal__header-right">
                <span :class="['pill', `pill--${selected.status}`]">{{
                  getReportStatusLabel(selected.status)
                }}</span>
                <span :class="['pill', `pill--${selected.severity}`]">{{
                  getSeverityLabel(selected.severity)
                }}</span>
                <button type="button" class="modal__close" @click="closeModal" aria-label="Fermer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="modal__body">
              <!-- 1. Informations -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiInformationOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.sections.info') }}</span>
                </div>
                <div class="modal__meta-grid">
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.reason')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.reason }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.assignedTo')
                    }}</span>
                    <strong class="modal__meta-value">{{
                      selected.assignedTo || t('moderation.pages.common.unassigned')
                    }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.createdAt')
                    }}</span>
                    <strong class="modal__meta-value">{{ formatDate(selected.createdAt) }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.updatedAt')
                    }}</span>
                    <strong class="modal__meta-value">{{ formatDate(selected.updatedAt) }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.attachments')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.attachments.length }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.reportDetail.fields.evidence')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.evidence.length }}</strong>
                  </div>
                </div>
              </div>

              <!-- 2. Résumé -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiTextBoxOutline" /></svg>
                  <span>{{ t('moderation.pages.reportDetail.fields.summary') }}</span>
                </div>
                <p class="modal__preview">{{ selected.summary }}</p>
              </div>

              <!-- 3. Preuves -->
              <div v-if="selected.evidence.length" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiFileSearchOutline" /></svg>
                  <span>{{ t('moderation.pages.reportDetail.fields.evidence') }}</span>
                  <span class="block-count">{{ selected.evidence.length }}</span>
                </div>
                <div class="evidence-grid">
                  <div v-for="ev in selected.evidence" :key="ev.id" class="evidence-item">
                    <span class="evidence-item__label">{{ ev.label }}</span>
                    <strong class="evidence-item__value">{{ ev.value }}</strong>
                  </div>
                </div>
              </div>

              <!-- 4. Assignation -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiAccountCheckOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.assign.title') }}</span>
                  <span
                    v-if="selected.assignedTo"
                    class="meta-item meta-item--assigned small-badge"
                    >{{ selected.assignedTo }}</span
                  >
                  <span v-else class="meta-item meta-item--unassigned small-badge">{{
                    t('moderation.pages.common.unassigned')
                  }}</span>
                </div>
                <div class="inline-form">
                  <input
                    v-model="assignInput"
                    class="inline-form__input"
                    :placeholder="t('moderation.pages.reports.actions.assignPlaceholder')"
                  />
                  <button
                    type="button"
                    class="action-btn action-btn--blue"
                    :disabled="!assignInput.trim()"
                    @click="doAssign"
                  >
                    {{ t('moderation.pages.reports.actions.assign') }}
                  </button>
                  <button type="button" class="action-btn action-btn--ghost" @click="doAssignToMe">
                    {{ t('moderation.pages.reports.modal.assign.me') }}
                  </button>
                </div>
              </div>

              <!-- 5. Notes internes -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiNoteTextOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.notes.title') }}</span>
                  <span v-if="selected.internalNotes?.length" class="block-count">{{
                    selected.internalNotes.length
                  }}</span>
                </div>
                <div v-if="selected.internalNotes?.length" class="message-list">
                  <article
                    v-for="note in selected.internalNotes"
                    :key="note.id"
                    class="message-item message-item--note"
                  >
                    <div class="message-item__avatar">
                      {{ note.author.charAt(0).toUpperCase() }}
                    </div>
                    <div class="message-item__body">
                      <div class="message-item__head">
                        <strong>{{ note.author }}</strong>
                        <span class="message-item__date">{{ formatDate(note.createdAt) }}</span>
                      </div>
                      <p class="message-item__text">{{ note.message }}</p>
                    </div>
                  </article>
                </div>
                <div v-else class="block-empty">
                  <svg viewBox="0 0 24 24"><path :d="mdiNoteTextOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.notes.empty') }}</span>
                </div>
                <div class="compose-form">
                  <textarea
                    v-model="noteInput"
                    class="compose-form__textarea"
                    rows="2"
                    :placeholder="t('moderation.pages.reports.modal.notes.placeholder')"
                  ></textarea>
                  <button
                    type="button"
                    class="action-btn action-btn--blue"
                    :disabled="!noteInput.trim()"
                    @click="doAddNote"
                  >
                    <svg viewBox="0 0 24 24"><path :d="mdiSend" /></svg>
                    {{ t('moderation.pages.reports.modal.notes.add') }}
                  </button>
                </div>
              </div>

              <!-- 6. Réponses au signalant -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiMessageReplyTextOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.replies.title') }}</span>
                  <span v-if="selected.replies?.length" class="block-count">{{
                    selected.replies.length
                  }}</span>
                </div>
                <div v-if="selected.replies?.length" class="message-list">
                  <article
                    v-for="reply in selected.replies"
                    :key="reply.id"
                    class="message-item message-item--reply"
                  >
                    <div class="message-item__avatar message-item__avatar--reply">
                      {{ reply.author.charAt(0).toUpperCase() }}
                    </div>
                    <div class="message-item__body">
                      <div class="message-item__head">
                        <strong>{{ reply.author }}</strong>
                        <span class="message-item__date">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <p class="message-item__text">{{ reply.message }}</p>
                    </div>
                  </article>
                </div>
                <div v-else class="block-empty">
                  <svg viewBox="0 0 24 24"><path :d="mdiMessageReplyTextOutline" /></svg>
                  <span>{{ t('moderation.pages.reports.modal.replies.empty') }}</span>
                </div>
                <div class="compose-form">
                  <textarea
                    v-model="replyInput"
                    class="compose-form__textarea"
                    rows="2"
                    :placeholder="t('moderation.pages.reports.modal.replies.placeholder')"
                  ></textarea>
                  <button
                    type="button"
                    class="action-btn action-btn--primary"
                    :disabled="!replyInput.trim()"
                    @click="doReply"
                  >
                    <svg viewBox="0 0 24 24"><path :d="mdiSend" /></svg>
                    {{ t('moderation.pages.reports.modal.replies.send') }}
                  </button>
                </div>
              </div>

              <!-- 7. Pièces jointes + Upload -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiPaperclip" /></svg>
                  <span>{{ t('moderation.pages.reportDetail.cards.attachments') }}</span>
                  <span v-if="selected.attachments.length" class="block-count">{{
                    selected.attachments.length
                  }}</span>
                </div>

                <div v-if="selected.attachments.length" class="attach-list">
                  <div v-for="att in selected.attachments" :key="att.id" class="attach-item">
                    <div v-if="att.type === 'image'" class="attach-item__preview">
                      <img :src="att.url" :alt="att.name" class="attach-item__img" />
                    </div>
                    <div v-else class="attach-item__icon">
                      <svg viewBox="0 0 24 24"><path :d="mdiFileDocumentOutline" /></svg>
                    </div>
                    <div class="attach-item__body">
                      <strong class="attach-item__name">{{ att.name }}</strong>
                      <span class="attach-item__meta"
                        >{{ att.addedBy }} · {{ formatDate(att.addedAt) }}</span
                      >
                      <span v-if="att.description" class="attach-item__desc">{{
                        att.description
                      }}</span>
                    </div>
                    <div class="attach-item__actions">
                      <a
                        :href="att.url"
                        target="_blank"
                        rel="noopener"
                        class="attach-action attach-action--open"
                        @click.stop
                      >
                        <svg viewBox="0 0 24 24"><path :d="mdiOpenInNew" /></svg>
                      </a>
                      <button
                        type="button"
                        class="attach-action attach-action--delete"
                        @click.stop="doRemoveAttachment(att.id)"
                      >
                        <svg viewBox="0 0 24 24"><path :d="mdiTrashCanOutline" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Upload zone -->
                <div
                  class="upload-zone"
                  :class="{
                    'upload-zone--dragover': isDragOver,
                    'upload-zone--staged': !!stagedFile,
                  }"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="onDrop"
                >
                  <!-- Staged -->
                  <div v-if="stagedFile" class="upload-staged">
                    <div class="upload-staged__preview">
                      <img
                        v-if="stagedPreviewUrl"
                        :src="stagedPreviewUrl"
                        class="upload-staged__img"
                        :alt="stagedFile.name"
                      />
                      <div v-else class="upload-staged__file-icon">
                        <svg viewBox="0 0 24 24"><path :d="mdiFileDocumentOutline" /></svg>
                      </div>
                    </div>
                    <div class="upload-staged__info">
                      <strong class="upload-staged__name">{{ stagedFile.name }}</strong>
                      <span class="upload-staged__size">{{ formatSize(stagedFile.size) }}</span>
                      <input
                        v-model="uploadDescription"
                        class="upload-staged__desc"
                        :placeholder="t('moderation.pages.reports.modal.upload.descPlaceholder')"
                      />
                    </div>
                    <div class="upload-staged__actions">
                      <button
                        type="button"
                        class="action-btn action-btn--ghost action-btn--sm"
                        @click="cancelUpload"
                      >
                        {{ t('moderation.pages.reports.modal.upload.cancel') }}
                      </button>
                      <button
                        type="button"
                        class="action-btn action-btn--primary action-btn--sm"
                        @click="confirmUpload"
                      >
                        <svg viewBox="0 0 24 24"><path :d="mdiUpload" /></svg>
                        {{ t('moderation.pages.reports.modal.upload.confirm') }}
                      </button>
                    </div>
                  </div>

                  <!-- Drop zone -->
                  <div v-else class="upload-empty" @click="fileInputRef?.click()">
                    <div class="upload-empty__icon">
                      <svg viewBox="0 0 24 24"><path :d="mdiCloudUploadOutline" /></svg>
                    </div>
                    <p class="upload-empty__label">
                      {{ t('moderation.pages.reports.modal.upload.zone') }}
                    </p>
                    <span class="upload-empty__hint">{{
                      t('moderation.pages.reports.modal.upload.hint')
                    }}</span>
                    <button
                      type="button"
                      class="action-btn action-btn--ghost action-btn--sm"
                      @click.stop="fileInputRef?.click()"
                    >
                      {{ t('moderation.pages.reports.modal.upload.button') }}
                    </button>
                  </div>

                  <input
                    ref="fileInputRef"
                    type="file"
                    class="upload-input"
                    accept="image/*,.pdf,.txt,.doc,.docx,.zip"
                    @change="onFileSelect"
                  />
                </div>

                <p v-if="uploadSuccess" class="upload-feedback">
                  <svg viewBox="0 0 24 24"><path :d="mdiCheckCircleOutline" /></svg>
                  {{ t('moderation.pages.reports.modal.upload.success') }}
                </p>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="modal__footer">
              <div class="modal__footer-hint">
                {{ t('moderation.pages.reports.modal.actionsHint') }}
              </div>
              <div class="modal__actions">
                <button
                  v-if="selected.status === 'new'"
                  type="button"
                  class="modal-btn modal-btn--secondary"
                  @click="doStartReview"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiMagnify" /></svg>
                  {{ t('moderation.pages.reports.actions.startReview') }}
                </button>
                <button
                  v-if="selected.status !== 'resolved' && selected.status !== 'dismissed'"
                  type="button"
                  class="modal-btn modal-btn--primary"
                  @click="doResolve"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiCheckCircleOutline" /></svg>
                  {{ t('moderation.pages.reports.actions.resolve') }}
                </button>
                <button
                  v-if="selected.status !== 'resolved' && selected.status !== 'dismissed'"
                  type="button"
                  class="modal-btn modal-btn--ghost"
                  @click="doDismiss"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiCloseCircleOutline" /></svg>
                  {{ t('moderation.pages.reports.actions.dismiss') }}
                </button>
                <button
                  v-if="selected.status === 'resolved' || selected.status === 'dismissed'"
                  type="button"
                  class="modal-btn modal-btn--secondary"
                  @click="doReopen"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiRefresh" /></svg>
                  {{ t('moderation.pages.reports.actions.reopen') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import {
  mdiAccountCheckOutline,
  mdiAccountOutline,
  mdiAlertCircleOutline,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiClose,
  mdiCloseCircleOutline,
  mdiCloudUploadOutline,
  mdiFileDocumentOutline,
  mdiFileSearchOutline,
  mdiInformationOutline,
  mdiMagnify,
  mdiMessageReplyTextOutline,
  mdiNoteTextOutline,
  mdiOpenInNew,
  mdiPaperclip,
  mdiRefresh,
  mdiSend,
  mdiTextBoxOutline,
  mdiTrashCanOutline,
  mdiUpload,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationReport,
  type ModerationReportStatus,
  type ModerationSeverity,
  useModerationReportsStore,
} from '@/stores/moderation'

useModerationAccess()

const router = useRouter()
const moderationStore = useModerationReportsStore()
const { reports, reportSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

// ─── Modal ────────────────────────────────────────────────────────────────────
const selected = ref<ModerationReport | null>(null)
const assignInput = ref('')
const noteInput = ref('')
const replyInput = ref('')

// Upload
const fileInputRef = ref<HTMLInputElement | null>(null)
const stagedFile = ref<File | null>(null)
const stagedPreviewUrl = ref<string | null>(null)
const uploadDescription = ref('')
const isDragOver = ref(false)
const uploadSuccess = ref(false)

function openModal(report: ModerationReport) {
  selected.value = report
  assignInput.value = ''
  noteInput.value = ''
  replyInput.value = ''
  cancelUpload()
  uploadSuccess.value = false
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  if (stagedPreviewUrl.value) URL.revokeObjectURL(stagedPreviewUrl.value)
  selected.value = null
  stagedFile.value = null
  stagedPreviewUrl.value = null
  document.body.style.overflow = ''
}

function sync() {
  if (selected.value) {
    const fresh = reports.value.find((r) => r.id === selected.value!.id)
    if (fresh) selected.value = fresh
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────
function doStartReview() {
  if (!selected.value) return
  moderationStore.setReportStatus(selected.value.id, 'investigating', 'POC Admin')
  sync()
}
function doResolve() {
  if (!selected.value) return
  moderationStore.resolveReport(selected.value.id, 'POC Admin')
  sync()
}
function doDismiss() {
  if (!selected.value) return
  moderationStore.dismissReport(selected.value.id, 'POC Admin')
  sync()
}
function doReopen() {
  if (!selected.value) return
  moderationStore.setReportStatus(selected.value.id, 'investigating', 'POC Admin')
  sync()
}
function doAssign() {
  if (!selected.value || !assignInput.value.trim()) return
  moderationStore.assignReport(selected.value.id, assignInput.value.trim())
  assignInput.value = ''
  sync()
}
function doAssignToMe() {
  if (!selected.value) return
  moderationStore.assignReport(selected.value.id, 'POC Admin')
  assignInput.value = ''
  sync()
}
function doAddNote() {
  if (!selected.value || !noteInput.value.trim()) return
  moderationStore.addReportInternalNote(selected.value.id, noteInput.value.trim(), 'POC Admin')
  noteInput.value = ''
  sync()
}
function doReply() {
  if (!selected.value || !replyInput.value.trim()) return
  moderationStore.replyToReport(selected.value.id, replyInput.value.trim(), 'POC Admin')
  replyInput.value = ''
  sync()
}
function doRemoveAttachment(attachmentId: string) {
  if (!selected.value) return
  moderationStore.removeReportAttachment(selected.value.id, attachmentId, 'POC Admin')
  sync()
}

// ─── Upload ──────────────────────────────────────────────────────────────────
function stageFile(file: File) {
  stagedFile.value = file
  uploadDescription.value = ''
  uploadSuccess.value = false
  if (file.type.startsWith('image/')) {
    if (stagedPreviewUrl.value) URL.revokeObjectURL(stagedPreviewUrl.value)
    stagedPreviewUrl.value = URL.createObjectURL(file)
  } else {
    stagedPreviewUrl.value = null
  }
}
function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) stageFile(file)
  ;(e.target as HTMLInputElement).value = ''
}
function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) stageFile(file)
}
function cancelUpload() {
  if (stagedPreviewUrl.value) {
    URL.revokeObjectURL(stagedPreviewUrl.value)
    stagedPreviewUrl.value = null
  }
  stagedFile.value = null
  uploadDescription.value = ''
  isDragOver.value = false
}
function confirmUpload() {
  if (!selected.value || !stagedFile.value) return
  const file = stagedFile.value
  moderationStore.addReportAttachment(
    selected.value.id,
    {
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: stagedPreviewUrl.value || `blob:poc/${file.name}`,
      mimeType: file.type,
      description: uploadDescription.value.trim(),
      source: 'upload',
    },
    'POC Admin',
  )
  cancelUpload()
  uploadSuccess.value = true
  sync()
  setTimeout(() => {
    uploadSuccess.value = false
  }, 4000)
}

// ─── Keyboard ────────────────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selected.value) closeModal()
}
window.addEventListener('keydown', onKeydown)
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// ─── Filters ─────────────────────────────────────────────────────────────────
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
  const q = search.value.trim().toLowerCase()
  return [...reports.value]
    .filter((r) => {
      const mq =
        q === '' ||
        r.subject.toLowerCase().includes(q) ||
        r.targetName.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        (r.assignedTo ?? '').toLowerCase().includes(q) ||
        r.targetType.toLowerCase().includes(q)
      return (
        mq &&
        (selectedStatus.value === 'all' || r.status === selectedStatus.value) &&
        (selectedSeverity.value === 'all' || r.severity === selectedSeverity.value)
      )
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedSeverity.value = 'all'
}
function goBackToModeration() {
  router.push('/moderation')
}
function getReportStatusLabel(s: ModerationReportStatus) {
  return t(`moderation.statuses.${s}`)
}
function getSeverityLabel(s: ModerationSeverity) {
  return t(`moderation.severities.${s}`)
}
function getStatusIcon(s: ModerationReportStatus) {
  if (s === 'investigating') return mdiMagnify
  if (s === 'resolved') return mdiCheckCircleOutline
  if (s === 'dismissed') return mdiCloseCircleOutline
  return mdiAlertCircleOutline
}
function formatDate(v: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(v))
}
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

/* ── Hero ───────────────────────────────────────────────── */
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

.page-hero__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
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
.btn,
.action-btn,
.modal-btn,
.attach-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 14px;
  border: 1px solid transparent;
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

.btn {
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

.btn:hover:not(:disabled),
.action-btn:hover:not(:disabled),
.modal-btn:hover:not(:disabled),
.attach-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.action-btn:disabled,
.modal-btn:disabled,
.attach-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary,
.action-btn--primary,
.modal-btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.action-btn--primary:hover:not(:disabled),
.modal-btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost,
.action-btn--ghost,
.modal-btn--ghost,
.modal-btn--secondary {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.action-btn--ghost:hover:not(:disabled),
.modal-btn--ghost:hover:not(:disabled),
.modal-btn--secondary:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.action-btn {
  min-height: 38px;
  padding: 0.58rem 0.9rem;
  font-size: 0.82rem;
  white-space: nowrap;
}

.action-btn svg,
.modal-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

.action-btn--blue {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.action-btn--blue:hover:not(:disabled) {
  color: #c6d6ff;
  background: rgba(80, 120, 238, 0.2);
  border-color: rgba(80, 120, 238, 0.42);
}

.action-btn--sm {
  min-height: 34px;
  padding: 0.45rem 0.7rem;
  border-radius: 12px;
  font-size: 0.76rem;
}

/* ── Stats ───────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.35rem;
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

/* ── Surface / toolbar ───────────────────────────────────── */
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

.toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(160px, 0.55fr) minmax(160px, 0.55fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.field,
.select,
.inline-form__input,
.compose-form__textarea,
.upload-staged__desc {
  width: 100%;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
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

.field,
.select {
  min-height: 46px;
  padding: 0.85rem 0.95rem;
}

.field::placeholder,
.inline-form__input::placeholder,
.compose-form__textarea::placeholder,
.upload-staged__desc::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field:hover,
.select:hover,
.inline-form__input:hover,
.compose-form__textarea:hover,
.upload-staged__desc:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field:focus,
.select:focus,
.inline-form__input:focus,
.compose-form__textarea:focus,
.upload-staged__desc:focus {
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

/* ── Pills / badges ──────────────────────────────────────── */
.pill,
.meta-item,
.small-badge {
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

.meta-item--assigned {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.meta-item--unassigned {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
}

.pill--new {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.pill--investigating {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.pill--resolved {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.pill--dismissed {
  color: rgba(252, 239, 225, 0.58);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.pill--low {
  color: rgba(252, 239, 225, 0.72);
  background: rgba(18, 24, 38, 0.34);
}

.pill--medium {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.pill--high {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.16);
  border-color: rgba(242, 139, 91, 0.34);
}

.pill--critical {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.16);
  border-color: rgba(225, 91, 91, 0.34);
}

/* ── Summary list ────────────────────────────────────────── */
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.95rem 1.05rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.58), rgba(46, 50, 68, 0.92)), var(--color-navy);
  color: var(--color-cream);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.summary-card:hover {
  transform: translateX(3px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.summary-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.summary-card--low {
  border-left: 3px solid rgba(252, 239, 225, 0.24);
}

.summary-card--medium {
  border-left: 3px solid rgba(80, 120, 238, 0.7);
}

.summary-card--high {
  border-left: 3px solid rgba(242, 139, 91, 0.8);
}

.summary-card--critical {
  border-left: 3px solid rgba(225, 91, 91, 0.85);
}

.summary-card__icon,
.modal__type-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.summary-card__icon svg,
.modal__type-icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.summary-card__icon--new,
.modal__type-icon--new {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.summary-card__icon--investigating,
.modal__type-icon--investigating {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.summary-card__icon--resolved,
.modal__type-icon--resolved {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.24);
}

.summary-card__icon--dismissed,
.modal__type-icon--dismissed {
  color: rgba(252, 239, 225, 0.54);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.summary-card__body {
  flex: 1;
  min-width: 0;
}

.summary-card__head {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  min-width: 0;
}

.summary-card__id {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.52);
}

.summary-card__title {
  color: var(--color-cream);
  font-size: 0.96rem;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.56);
}

.dot {
  opacity: 0.45;
}

.summary-card__pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.summary-card__signals {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.signal-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 900;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
}

.signal-badge svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.signal-badge--attach {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.signal-badge--evidence {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.signal-badge--notes {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.chevron {
  width: 20px;
  height: 20px;
  fill: rgba(252, 239, 225, 0.48);
  flex-shrink: 0;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    fill 0.18s ease;
}

.summary-card:hover .chevron {
  fill: var(--color-primary-strong);
  transform: translateX(2px);
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-state,
.block-empty {
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.68), rgba(46, 50, 68, 0.94)), var(--color-navy);
  text-align: center;
}

.empty-state {
  padding: 3rem 1rem;
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

.block-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 1.15rem;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.85rem;
  font-weight: 800;
}

.block-empty svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
  opacity: 0.62;
}

/* ── Modal shell ─────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 14, 24, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal {
  width: 100%;
  max-width: 860px;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
  color: var(--color-cream);
  box-shadow: 0 30px 80px -38px rgba(0, 0, 0, 0.95);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.modal__header::before {
  content: '';
  position: absolute;
  inset: -1px;
  pointer-events: none;
  opacity: 0.75;
}

.modal__header--critical::before {
  background: radial-gradient(circle at top left, rgba(225, 91, 91, 0.22), transparent 38%);
}

.modal__header--high::before {
  background: radial-gradient(circle at top left, rgba(242, 139, 91, 0.2), transparent 38%);
}

.modal__header--medium::before {
  background: radial-gradient(circle at top left, rgba(80, 120, 238, 0.18), transparent 38%);
}

.modal__header--low::before {
  background: radial-gradient(circle at top left, rgba(252, 239, 225, 0.08), transparent 38%);
}

.modal__header > * {
  position: relative;
  z-index: 1;
}

.modal__header-left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 0;
}

.modal__type-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
}

.modal__type-icon svg {
  width: 26px;
  height: 26px;
}

.modal__id {
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.78rem;
  font-weight: 900;
}

.modal__title {
  margin: 0.25rem 0 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.modal__subtitle {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.86rem;
}

.modal__subtitle svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.modal__header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.modal__close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.72);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal__close:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.modal__close svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Modal blocks ────────────────────────────────────────── */
.modal__block {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.modal__block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary-strong);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.modal__block-header svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

.block-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  padding: 0 0.4rem;
  border-radius: 999px;
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border: 1px solid rgba(242, 139, 91, 0.24);
  font-size: 0.72rem;
  font-weight: 900;
}

/* ── Meta grid / evidence ────────────────────────────────── */
.modal__meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.modal__meta-item,
.evidence-item {
  padding: 0.8rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
}

.modal__meta-label,
.evidence-item__label {
  display: block;
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__meta-value,
.evidence-item__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-cream);
  font-weight: 900;
  line-height: 1.35;
}

.modal__preview {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.42);
  color: rgba(252, 239, 225, 0.78);
  line-height: 1.65;
  white-space: pre-wrap;
}

.evidence-grid {
  display: grid;
  gap: 0.55rem;
}

/* ── Forms / messages ────────────────────────────────────── */
.inline-form {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  flex-wrap: wrap;
}

.inline-form__input {
  flex: 1;
  min-width: 180px;
  min-height: 40px;
  padding: 0.65rem 0.85rem;
  border-radius: 14px;
}

.message-list,
.attach-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.85rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.28);
}

.message-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.78rem;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
}

.message-item--reply .message-item__avatar,
.message-item__avatar--reply {
  background: rgba(80, 120, 238, 0.14);
  color: #9ab8ff;
  border-color: rgba(80, 120, 238, 0.24);
}

.message-item__body {
  flex: 1;
  min-width: 0;
}

.message-item__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.message-item__head strong {
  color: var(--color-cream);
  font-size: 0.86rem;
  font-weight: 900;
}

.message-item__date {
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.76rem;
}

.message-item__text {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.88rem;
  line-height: 1.55;
}

.compose-form {
  display: flex;
  align-items: flex-end;
  gap: 0.55rem;
}

.compose-form__textarea {
  min-height: 78px;
  padding: 0.8rem 0.9rem;
  resize: vertical;
  line-height: 1.5;
}

/* ── Attachments ─────────────────────────────────────────── */
.attach-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.28);
}

.attach-item__preview {
  width: 58px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.42);
}

.attach-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attach-item__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border: 1px solid rgba(80, 120, 238, 0.24);
  flex-shrink: 0;
}

.attach-item__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.attach-item__body {
  flex: 1;
  min-width: 0;
}

.attach-item__name {
  display: block;
  color: var(--color-cream);
  font-size: 0.88rem;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attach-item__meta,
.attach-item__desc {
  display: block;
  margin-top: 0.18rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.76rem;
  line-height: 1.35;
}

.attach-item__desc {
  font-style: italic;
}

.attach-item__actions {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.attach-action {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
  text-decoration: none;
}

.attach-action svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.attach-action--open {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.attach-action--open:hover {
  color: #c6d6ff;
  background: rgba(80, 120, 238, 0.2);
  border-color: rgba(80, 120, 238, 0.42);
}

.attach-action--delete {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
}

.attach-action--delete:hover {
  color: #ffd0d0;
  background: rgba(225, 91, 91, 0.22);
  border-color: rgba(225, 91, 91, 0.46);
}

/* ── Upload ──────────────────────────────────────────────── */
.upload-zone {
  margin-top: 0.3rem;
  border-radius: 18px;
  border: 1px dashed rgba(252, 239, 225, 0.18);
  background: rgba(18, 24, 38, 0.26);
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.upload-zone--dragover {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(242, 139, 91, 0.1);
}

.upload-zone--staged {
  border-style: solid;
  border-color: rgba(242, 139, 91, 0.28);
}

.upload-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 1.5rem;
  cursor: pointer;
  text-align: center;
}

.upload-empty:hover {
  background: rgba(242, 139, 91, 0.06);
}

.upload-empty__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-empty__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.upload-empty__label {
  margin: 0;
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 900;
}

.upload-empty__hint {
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.78rem;
  line-height: 1.45;
}

.upload-staged {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  flex-wrap: wrap;
}

.upload-staged__preview {
  width: 62px;
  height: 62px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.42);
}

.upload-staged__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-staged__file-icon {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
}

.upload-staged__file-icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

.upload-staged__info {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.upload-staged__name {
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 900;
}

.upload-staged__size {
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.76rem;
}

.upload-staged__desc {
  min-height: 38px;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
}

.upload-staged__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.upload-feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  margin: 0;
  padding: 0.6rem 0.8rem;
  border-radius: 14px;
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
  font-size: 0.82rem;
  font-weight: 900;
}

.upload-feedback svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* ── Modal footer ────────────────────────────────────────── */
.modal__footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(252, 239, 225, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.modal__footer-hint {
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.8rem;
  line-height: 1.45;
  flex: 1;
  min-width: 220px;
}

.modal__actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.modal-btn {
  min-height: 40px;
  padding: 0.65rem 0.95rem;
  font-size: 0.84rem;
}

/* ── Transitions ─────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1180px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .modal__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .moderation-page {
    padding: 1rem;
  }

  .page-hero,
  .surface,
  .modal,
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
  .modal__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn,
  .modal-btn,
  .action-btn {
    width: 100%;
  }

  .summary-card {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .summary-card__signals {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    max-height: 92vh;
    max-width: 100%;
    border-radius: 28px 28px 0 0;
  }

  .modal__header {
    flex-direction: column;
  }

  .modal__header-right {
    justify-content: flex-start;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__meta-grid {
    grid-template-columns: 1fr;
  }

  .inline-form,
  .compose-form,
  .upload-staged,
  .attach-item {
    flex-direction: column;
    align-items: stretch;
  }

  .attach-item__preview,
  .upload-staged__preview {
    width: 100%;
    height: 160px;
  }

  .upload-staged__actions,
  .attach-item__actions,
  .modal__actions {
    width: 100%;
    justify-content: stretch;
  }

  .attach-action {
    flex: 1;
    width: auto;
  }

  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(40px);
  }
}

@media (max-width: 520px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .summary-card__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .summary-card__title {
    white-space: normal;
  }

  .hero-side__chips span {
    width: 100%;
    justify-content: center;
  }
}
</style>
