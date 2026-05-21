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
.page-hero__content {
  display: grid;
  gap: 1rem;
}
.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.dot {
  opacity: 0.4;
}

/* ─── Summary list ─────────────────────────────────────────────────────────── */
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.summary-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  border-radius: 18px;
  border: 1px solid rgba(81, 96, 121, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.22)),
    rgba(252, 239, 225, 0.7);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.14s ease;
}
.summary-card:hover {
  transform: translateX(3px);
  border-color: rgba(242, 139, 91, 0.35);
  box-shadow: 0 6px 20px -10px rgba(242, 139, 91, 0.4);
}
.summary-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.summary-card--high {
  border-left: 3px solid #d97706;
}
.summary-card--critical {
  border-left: 3px solid #dc2626;
}
.summary-card--medium {
  border-left: 3px solid #2563eb;
}
.summary-card--low {
  border-left: 3px solid #6b7280;
}
.summary-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-card__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
.summary-card__icon--new {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.summary-card__icon--investigating {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.summary-card__icon--resolved {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.summary-card__icon--dismissed {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
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
  font-weight: 700;
  color: var(--color-text-muted);
}
.summary-card__title {
  color: var(--color-ink);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-card__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.summary-card__pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.45rem;
}
.meta-item--assigned {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.meta-item--unassigned {
  background: rgba(107, 114, 128, 0.1);
  color: var(--color-text-muted);
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
  padding: 0.3rem 0.55rem;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
}
.signal-badge svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
.signal-badge--attach {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.signal-badge--evidence {
  background: rgba(93, 44, 168, 0.1);
  color: #5d2ca8;
}
.signal-badge--notes {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}
.chevron {
  width: 20px;
  height: 20px;
  fill: var(--color-text-muted);
  opacity: 0.5;
  flex-shrink: 0;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.summary-card:hover .chevron {
  opacity: 1;
  transform: translateX(2px);
}

/* ─── Modal shell ─────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(28, 32, 48, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal {
  width: 100%;
  max-width: 780px;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  background: rgba(252, 239, 225, 0.99);
  box-shadow:
    0 32px 64px -20px rgba(28, 32, 48, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(81, 96, 121, 0.1);
  flex-shrink: 0;
}
.modal__header--critical {
  background: rgba(220, 38, 38, 0.06);
}
.modal__header--high {
  background: rgba(217, 119, 6, 0.06);
}
.modal__header--medium {
  background: rgba(37, 99, 235, 0.05);
}
.modal__header--low {
  background: rgba(107, 114, 128, 0.04);
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
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.modal__type-icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}
.modal__type-icon--new {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.modal__type-icon--investigating {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.modal__type-icon--resolved {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.modal__type-icon--dismissed {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}
.modal__id {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-text-muted);
}
.modal__title {
  margin: 0.25rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  color: var(--color-ink);
  line-height: 1.25;
}
.modal__subtitle {
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.84rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}
.modal__subtitle svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}
.modal__header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.modal__close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(81, 96, 121, 0.1);
  color: var(--color-ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.modal__close:hover {
  background: rgba(81, 96, 121, 0.18);
}
.modal__close svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
}

/* Blocks */
.modal__block {
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(81, 96, 121, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.modal__block:last-child {
  border-bottom: none;
}
.modal__block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}
.modal__block-header svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
  flex-shrink: 0;
}
.block-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.35rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(81, 96, 121, 0.12);
  color: var(--color-ink);
}
.small-badge {
  font-size: 0.72rem;
  padding: 0.2rem 0.5rem;
}

/* Meta grid */
.modal__meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.modal__meta-item {
  padding: 0.6rem 0.75rem;
  border-radius: 12px;
  background: rgba(81, 96, 121, 0.05);
  border: 1px solid rgba(81, 96, 121, 0.08);
}
.modal__meta-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.modal__meta-value {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-ink);
}

.modal__preview {
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-ink);
  line-height: 1.6;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.05);
  border-left: 3px solid rgba(81, 96, 121, 0.15);
}

/* Evidence */
.evidence-grid {
  display: grid;
  gap: 0.4rem;
}
.evidence-item {
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  background: rgba(93, 44, 168, 0.05);
  border: 1px solid rgba(93, 44, 168, 0.1);
}
.evidence-item__label {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted);
}
.evidence-item__value {
  display: block;
  margin-top: 0.15rem;
  font-weight: 700;
  color: var(--color-ink);
  font-size: 0.88rem;
}

/* Inline form */
.inline-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.inline-form__input {
  flex: 1;
  min-width: 140px;
  min-height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0.5rem 0.75rem;
  color: var(--color-ink);
  font: inherit;
  outline: none;
  font-size: 0.88rem;
}
.inline-form__input:focus {
  border-color: var(--color-primary);
}

/* Action buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  border-radius: 12px;
  padding: 0.6rem 0.95rem;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
  white-space: nowrap;
}
.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
}
.action-btn svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}
.action-btn--sm {
  padding: 0.5rem 0.8rem;
  font-size: 0.78rem;
}
.action-btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-cream);
}
.action-btn--blue {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.action-btn--ghost {
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

/* Messages */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.message-item {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.message-item__avatar {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}
.message-item--note .message-item__avatar {
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
}
.message-item--reply .message-item__avatar {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.message-item__avatar--reply {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.message-item__body {
  flex: 1;
  min-width: 0;
}
.message-item__head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.message-item__head strong {
  font-size: 0.83rem;
  color: var(--color-ink);
}
.message-item__date {
  font-size: 0.73rem;
  color: var(--color-text-muted);
}
.message-item__text {
  margin: 0.2rem 0 0;
  font-size: 0.86rem;
  color: var(--color-ink);
  line-height: 1.55;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: rgba(81, 96, 121, 0.05);
}

.block-empty {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.block-empty svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
  opacity: 0.45;
  flex-shrink: 0;
}

.compose-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.compose-form__textarea {
  flex: 1;
  border-radius: 12px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0.6rem 0.85rem;
  color: var(--color-ink);
  font: inherit;
  font-size: 0.86rem;
  resize: none;
  outline: none;
  line-height: 1.5;
}
.compose-form__textarea:focus {
  border-color: var(--color-primary);
}

/* Attachments */
.attach-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.attach-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.05);
  border: 1px solid rgba(81, 96, 121, 0.08);
}
.attach-item__preview {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(81, 96, 121, 0.1);
}
.attach-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.attach-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
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
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.attach-item__meta {
  display: block;
  margin-top: 0.12rem;
  font-size: 0.73rem;
  color: var(--color-text-muted);
}
.attach-item__desc {
  display: block;
  margin-top: 0.12rem;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  font-style: italic;
}
.attach-item__actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}
.attach-action {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.15s ease;
}
.attach-action svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}
.attach-action--open {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.attach-action--open:hover {
  background: rgba(37, 99, 235, 0.18);
}
.attach-action--delete {
  background: rgba(220, 38, 38, 0.08);
  color: #991b1b;
}
.attach-action--delete:hover {
  background: rgba(220, 38, 38, 0.15);
}

/* Upload */
.upload-zone {
  border-radius: 16px;
  border: 2px dashed rgba(81, 96, 121, 0.2);
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
  position: relative;
  overflow: hidden;
}
.upload-zone--dragover {
  border-color: var(--color-primary);
  background: rgba(242, 139, 91, 0.06);
}
.upload-zone--staged {
  border-style: solid;
  border-color: rgba(81, 96, 121, 0.15);
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
  background: rgba(81, 96, 121, 0.03);
}
.upload-empty__icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: rgba(81, 96, 121, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}
.upload-empty__icon svg {
  width: 21px;
  height: 21px;
  fill: currentColor;
}
.upload-empty__label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0;
}
.upload-empty__hint {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.upload-staged {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  flex-wrap: wrap;
}
.upload-staged__preview {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(81, 96, 121, 0.1);
}
.upload-staged__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.upload-staged__file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.upload-staged__file-icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}
.upload-staged__info {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.upload-staged__name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-ink);
}
.upload-staged__size {
  font-size: 0.73rem;
  color: var(--color-text-muted);
}
.upload-staged__desc {
  border: none;
  border-bottom: 1px solid rgba(81, 96, 121, 0.2);
  background: transparent;
  outline: none;
  font: inherit;
  font-size: 0.8rem;
  color: var(--color-ink);
  padding: 0.2rem 0;
}
.upload-staged__desc:focus {
  border-bottom-color: var(--color-primary);
}
.upload-staged__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.upload-feedback {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #15803d;
  font-weight: 600;
  margin: 0;
}
.upload-feedback svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

/* Footer */
.modal__footer {
  padding: 0.9rem 1.5rem 1.4rem;
  border-top: 1px solid rgba(81, 96, 121, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.modal__footer-hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  flex: 1;
}
.modal__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  border-radius: 13px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.modal-btn:hover {
  transform: translateY(-1px);
}
.modal-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
.modal-btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-cream);
}
.modal-btn--secondary {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.modal-btn--ghost {
  background: rgba(107, 114, 128, 0.1);
  color: var(--color-ink);
}

/* Transitions */
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

@media (max-width: 720px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .modal {
    max-height: 92vh;
    border-radius: 28px 28px 0 0;
    max-width: 100%;
  }
  .modal__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(40px);
  }
  .summary-card {
    flex-wrap: wrap;
  }
  .summary-card__signals {
    margin-left: auto;
  }
  .upload-staged {
    flex-direction: column;
  }
  .compose-form {
    flex-direction: column;
  }
  .compose-form .action-btn {
    align-self: flex-end;
  }
}
</style>
