<template>
  <section class="moderation-page">
    <div class="page-shell">
      <!-- Hero -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('moderation.pages.sanctions.badge') }}</span>
          <h1 class="page-title">{{ t('moderation.pages.sanctions.title') }}</h1>
          <p class="page-subtitle">{{ t('moderation.pages.sanctions.subtitle') }}</p>
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
            <div class="hero-side__label">{{ t('moderation.pages.sanctions.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.sanctions.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.sanctions.side.text') }}</p>
          </div>
          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.sanctions.side.chips.active') }}</span>
            <span>{{ t('moderation.pages.sanctions.side.chips.draft') }}</span>
            <span>{{ t('moderation.pages.sanctions.side.chips.revoke') }}</span>
          </div>
        </aside>
      </header>

      <!-- Stats -->
      <section class="stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.sanctions.stats.total') }}</span>
          <strong class="stat-card__value">{{ sanctionSummary.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.sanctions.stats.totalCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.sanctions.stats.active') }}</span>
          <strong class="stat-card__value">{{ sanctionSummary.activeCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.sanctions.stats.activeCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.sanctions.stats.draft') }}</span>
          <strong class="stat-card__value">{{ sanctionSummary.draftCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.sanctions.stats.draftCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{
            t('moderation.pages.sanctions.stats.expiringSoon')
          }}</span>
          <strong class="stat-card__value">{{ sanctionSummary.expiringSoonCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.sanctions.stats.expiringSoonCaption') }}
          </div>
        </article>
      </section>

      <!-- List -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.sanctions.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.sanctions.list.subtitle') }}</p>
          </div>
          <span class="meta-item"
            >{{ displayedSanctions.length }} {{ t('moderation.pages.common.results') }}</span
          >
        </div>

        <div class="toolbar toolbar--sanctions">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.sanctions.filters.search')"
          />
          <select v-model="selectedStatus" class="select">
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedType" class="select">
            <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-model="selectedScope" class="select">
            <option v-for="o in scopeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-model="selectedSort" class="select">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

        <div v-if="displayedSanctions.length" class="summary-list">
          <button
            v-for="sanction in displayedSanctions"
            :key="sanction.id"
            type="button"
            :class="[
              'summary-card',
              `summary-card--${sanction.severity}`,
              sanction.status === 'revoked' || sanction.status === 'expired'
                ? 'summary-card--dimmed'
                : '',
            ]"
            @click="openModal(sanction)"
          >
            <div :class="['summary-card__icon', `summary-card__icon--${sanction.type}`]">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="getTypeIcon(sanction.type)" />
              </svg>
            </div>
            <div class="summary-card__body">
              <div class="summary-card__head">
                <strong class="summary-card__title">{{ sanction.targetName }}</strong>
                <span v-if="sanction.targetEmail" class="summary-card__id">{{
                  sanction.targetEmail
                }}</span>
              </div>
              <div class="summary-card__meta">
                <span>{{ getSanctionTypeLabel(sanction.type) }}</span>
                <span class="dot">·</span>
                <span>{{ getSanctionScopeLabel(sanction.scope) }}</span>
                <span class="dot">·</span>
                <span
                  >{{ t('moderation.pages.sanctions.card.moderator') }}
                  {{ sanction.createdBy }}</span
                >
              </div>
              <div class="summary-card__pills">
                <span :class="['pill', `pill--${sanction.status}`]">{{
                  getSanctionStatusLabel(sanction.status)
                }}</span>
                <span :class="['pill', `pill--${sanction.severity}`]">{{
                  getSeverityLabel(sanction.severity)
                }}</span>
                <span class="meta-item">
                  {{
                    sanction.endAt
                      ? t('moderation.pages.sanctions.card.until', {
                          date: formatDate(sanction.endAt),
                        })
                      : t('moderation.pages.common.noEndDate')
                  }}
                </span>
              </div>
            </div>
            <div class="summary-card__signals">
              <div v-if="sanction.appealCount > 0" class="signal-badge signal-badge--appeals">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiGavel" /></svg>
                <span>{{ sanction.appealCount }}</span>
              </div>
              <div v-if="sanction.evidence?.length" class="signal-badge signal-badge--evidence">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiFileSearchOutline" /></svg>
                <span>{{ sanction.evidence.length }}</span>
              </div>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiChevronRight" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.sanctions.emptyText') }}</p>
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
                <div :class="['modal__type-icon', `modal__type-icon--${selected.type}`]">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="getTypeIcon(selected.type)" />
                  </svg>
                </div>
                <div>
                  <div class="modal__id">
                    {{ getSanctionTypeLabel(selected.type) }} ·
                    {{ getSanctionScopeLabel(selected.scope) }}
                  </div>
                  <h2 class="modal__title">{{ selected.targetName }}</h2>
                  <div class="modal__subtitle" v-if="selected.targetEmail">
                    {{ selected.targetEmail }}
                  </div>
                </div>
              </div>
              <div class="modal__header-right">
                <span :class="['pill', `pill--${selected.status}`]">{{
                  getSanctionStatusLabel(selected.status)
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
                  <span>{{ t('moderation.pages.sanctions.modal.sections.info') }}</span>
                </div>
                <div class="modal__meta-grid">
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.reason')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.reason }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.policy')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.policyLabel }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.assignedTo')
                    }}</span>
                    <strong class="modal__meta-value">{{
                      selected.assignedTo || t('moderation.pages.common.notAssigned')
                    }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.startAt')
                    }}</span>
                    <strong class="modal__meta-value">{{ formatDate(selected.startAt) }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.endAt')
                    }}</span>
                    <strong
                      class="modal__meta-value"
                      :class="!selected.endAt ? 'modal__meta-value--muted' : ''"
                    >
                      {{
                        selected.endAt
                          ? formatDate(selected.endAt)
                          : t('moderation.pages.common.noEndDate')
                      }}
                    </strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.sanctions.detail.info.createdBy')
                    }}</span>
                    <strong class="modal__meta-value">{{ selected.createdBy }}</strong>
                  </div>
                </div>
              </div>

              <!-- 2. Résumé -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiTextBoxOutline" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.sections.summary') }}</span>
                </div>
                <p class="modal__preview">{{ selected.summary }}</p>
              </div>

              <!-- 3. Preuves -->
              <div v-if="selected.evidence?.length" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiFileSearchOutline" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.sections.evidence') }}</span>
                  <span class="block-count">{{ selected.evidence.length }}</span>
                </div>
                <div class="evidence-grid">
                  <div v-for="ev in selected.evidence" :key="ev.id" class="evidence-item">
                    <span class="evidence-item__label">{{ ev.label }}</span>
                    <strong class="evidence-item__value">{{ ev.value }}</strong>
                  </div>
                </div>
              </div>

              <!-- 4. Note interne -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiNoteTextOutline" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.note.title') }}</span>
                  <button
                    v-if="!editingNote"
                    type="button"
                    class="header-action"
                    @click="startEditNote"
                  >
                    <svg viewBox="0 0 24 24"><path :d="mdiPencilOutline" /></svg>
                    {{ t('moderation.pages.sanctions.modal.note.edit') }}
                  </button>
                </div>

                <!-- Display mode -->
                <div v-if="!editingNote">
                  <div v-if="selected.note" class="modal__note">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="mdiNoteTextOutline" />
                    </svg>
                    <p>{{ selected.note }}</p>
                  </div>
                  <div v-else class="block-empty">
                    <svg viewBox="0 0 24 24"><path :d="mdiNoteTextOutline" /></svg>
                    <span>{{ t('moderation.pages.sanctions.modal.note.empty') }}</span>
                  </div>
                </div>

                <!-- Edit mode -->
                <div v-else class="compose-form">
                  <textarea
                    v-model="noteInput"
                    class="compose-form__textarea"
                    rows="3"
                    :placeholder="t('moderation.pages.sanctions.modal.note.placeholder')"
                    autofocus
                  ></textarea>
                  <div class="compose-form__actions">
                    <button
                      type="button"
                      class="action-btn action-btn--ghost"
                      @click="cancelEditNote"
                    >
                      {{ t('moderation.pages.sanctions.modal.note.cancel') }}
                    </button>
                    <button type="button" class="action-btn action-btn--blue" @click="doSaveNote">
                      <svg viewBox="0 0 24 24"><path :d="mdiContentSaveOutline" /></svg>
                      {{ t('moderation.pages.sanctions.modal.note.save') }}
                    </button>
                  </div>
                </div>

                <p v-if="noteSaved" class="save-feedback">
                  <svg viewBox="0 0 24 24"><path :d="mdiCheckCircleOutline" /></svg>
                  {{ t('moderation.pages.sanctions.modal.note.saved') }}
                </p>
              </div>

              <!-- 5. Appels -->
              <div v-if="selected.appealCount > 0" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiGavel" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.sections.appeals') }}</span>
                  <span class="block-count">{{ selected.appealCount }}</span>
                </div>
                <div class="appeals-block">
                  <div class="appeals-block__icon">
                    <svg viewBox="0 0 24 24"><path :d="mdiGavel" /></svg>
                  </div>
                  <span>
                    <strong>{{ selected.appealCount }}</strong>
                    {{ t('moderation.pages.sanctions.modal.appealsCount') }}
                  </span>
                </div>
              </div>

              <!-- 6. Signalements liés -->
              <div v-if="selected.relatedReportIds?.length" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiLinkVariant" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.sections.relatedReports') }}</span>
                  <span class="block-count">{{ selected.relatedReportIds.length }}</span>
                </div>
                <div class="tags-row">
                  <span v-for="rid in selected.relatedReportIds" :key="rid" class="report-tag">
                    <svg viewBox="0 0 24 24"><path :d="mdiAlertCircleOutline" /></svg>
                    #{{ rid }}
                  </span>
                </div>
              </div>

              <!-- 7. Activité / Timeline -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiTimelineClockOutline" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.sections.activity') }}</span>
                  <span v-if="selected.activity?.length" class="block-count">{{
                    selected.activity.length
                  }}</span>
                </div>

                <div v-if="selected.activity?.length" class="timeline-list">
                  <article
                    v-for="(entry, index) in selected.activity"
                    :key="entry.id"
                    class="timeline-item"
                  >
                    <div
                      class="timeline-item__line"
                      :class="
                        index === selected.activity.length - 1 ? 'timeline-item__line--last' : ''
                      "
                    ></div>
                    <div class="timeline-item__dot"></div>
                    <div class="timeline-item__content">
                      <div class="timeline-item__head">
                        <strong class="timeline-item__actor">{{ entry.actor }}</strong>
                        <span class="timeline-item__date">{{ formatDate(entry.createdAt) }}</span>
                      </div>
                      <p class="timeline-item__message">{{ entry.message }}</p>
                    </div>
                  </article>
                </div>

                <div v-else class="block-empty">
                  <svg viewBox="0 0 24 24"><path :d="mdiTimelineClockOutline" /></svg>
                  <span>{{ t('moderation.pages.sanctions.modal.activity.empty') }}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal__footer">
              <div class="modal__footer-hint">
                {{ t('moderation.pages.sanctions.modal.actionsHint') }}
                · {{ t('moderation.pages.sanctions.card.updated') }}
                {{ formatDate(selected.lastUpdatedAt) }}
              </div>
              <div class="modal__actions">
                <button
                  v-if="selected.status === 'draft'"
                  type="button"
                  class="modal-btn modal-btn--primary"
                  @click="doActivate"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiCheckCircleOutline" /></svg>
                  {{ t('moderation.pages.sanctions.actions.activate') }}
                </button>
                <button
                  v-if="selected.status === 'active'"
                  type="button"
                  class="modal-btn modal-btn--danger"
                  @click="doRevoke"
                >
                  <svg viewBox="0 0 24 24"><path :d="mdiCancel" /></svg>
                  {{ t('moderation.pages.sanctions.actions.revoke') }}
                </button>
                <span
                  v-if="selected.status === 'expired' || selected.status === 'revoked'"
                  class="status-badge-footer"
                  :class="`status-badge-footer--${selected.status}`"
                >
                  {{ getSanctionStatusLabel(selected.status) }}
                </span>
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
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiCancel,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiClose,
  mdiContentSaveOutline,
  mdiFileSearchOutline,
  mdiGavel,
  mdiInformationOutline,
  mdiLinkVariant,
  mdiMicrophoneOff,
  mdiNoteTextOutline,
  mdiPencilOutline,
  mdiShieldOffOutline,
  mdiTextBoxOutline,
  mdiTimelineClockOutline,
  mdiTimerOffOutline,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationSanction,
  type ModerationSanctionScope,
  type ModerationSanctionStatus,
  type ModerationSanctionType,
  type ModerationSeverity,
  useModerationSanctionsStore,
} from '@/stores/moderation'

useModerationAccess()

const router = useRouter()
const moderationStore = useModerationSanctionsStore()
const { sanctions, sanctionSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

// ─── Modal state ──────────────────────────────────────────────────────────────
const selected = ref<ModerationSanction | null>(null)
const editingNote = ref(false)
const noteInput = ref('')
const noteSaved = ref(false)

function openModal(sanction: ModerationSanction) {
  selected.value = sanction
  editingNote.value = false
  noteInput.value = ''
  noteSaved.value = false
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selected.value = null
  editingNote.value = false
  document.body.style.overflow = ''
}

function sync() {
  if (selected.value) {
    const fresh = sanctions.value.find((s) => s.id === selected.value!.id)
    if (fresh) selected.value = fresh
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────
function doActivate() {
  if (!selected.value) return
  moderationStore.activateSanction(selected.value.id, 'POC Admin')
  sync()
}

function doRevoke() {
  if (!selected.value) return
  moderationStore.revokeSanction(selected.value.id, 'POC Admin')
  sync()
}

// ─── Note editing ─────────────────────────────────────────────────────────────
function startEditNote() {
  noteInput.value = selected.value?.note ?? ''
  editingNote.value = true
  noteSaved.value = false
}

function cancelEditNote() {
  editingNote.value = false
  noteInput.value = ''
}

function doSaveNote() {
  if (!selected.value) return
  const store = moderationStore as unknown as Record<string, unknown>
  if (typeof store['updateSanctionNote'] === 'function') {
    ;(store['updateSanctionNote'] as (id: string, note: string, actor: string) => void)(
      selected.value.id,
      noteInput.value.trim(),
      'POC Admin',
    )
    sync()
  } else {
    // POC fallback: mutate locally
    selected.value = { ...selected.value, note: noteInput.value.trim() }
  }
  editingNote.value = false
  noteSaved.value = true
  setTimeout(() => {
    noteSaved.value = false
  }, 3500)
}

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
const selectedStatus = ref<'all' | ModerationSanctionStatus>('all')
const selectedType = ref<'all' | ModerationSanctionType>('all')
const selectedScope = ref<'all' | ModerationSanctionScope>('all')
const selectedSort = ref<'updatedDesc' | 'endAsc' | 'severityDesc'>('updatedDesc')
const severityOrder: Record<ModerationSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'draft', label: t('moderation.sanctionStatuses.draft') },
  { value: 'active', label: t('moderation.sanctionStatuses.active') },
  { value: 'expired', label: t('moderation.sanctionStatuses.expired') },
  { value: 'revoked', label: t('moderation.sanctionStatuses.revoked') },
])
const typeOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allTypes') },
  { value: 'warning', label: t('moderation.sanctionTypes.warning') },
  { value: 'temporaryBan', label: t('moderation.sanctionTypes.temporaryBan') },
  { value: 'permanentBan', label: t('moderation.sanctionTypes.permanentBan') },
  { value: 'mute', label: t('moderation.sanctionTypes.mute') },
])
const scopeOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.sanctions.filters.allScopes') },
  { value: 'account', label: t('moderation.sanctionScopes.account') },
  { value: 'chat', label: t('moderation.sanctionScopes.chat') },
  { value: 'ugc', label: t('moderation.sanctionScopes.ugc') },
  { value: 'profile', label: t('moderation.sanctionScopes.profile') },
  { value: 'matchmaking', label: t('moderation.sanctionScopes.matchmaking') },
])
const sortOptions = computed(() => [
  { value: 'updatedDesc', label: t('moderation.pages.sanctions.filters.sortUpdated') },
  { value: 'endAsc', label: t('moderation.pages.sanctions.filters.sortEndingSoon') },
  { value: 'severityDesc', label: t('moderation.pages.sanctions.filters.sortSeverity') },
])

const displayedSanctions = computed(() => {
  const q = search.value.trim().toLowerCase()
  return sanctions.value
    .filter((item) => {
      const mq =
        q === '' ||
        item.targetName.toLowerCase().includes(q) ||
        (item.targetEmail ?? '').toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.createdBy.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.policyLabel.toLowerCase().includes(q)
      return (
        mq &&
        (selectedStatus.value === 'all' || item.status === selectedStatus.value) &&
        (selectedType.value === 'all' || item.type === selectedType.value) &&
        (selectedScope.value === 'all' || item.scope === selectedScope.value)
      )
    })
    .slice()
    .sort((a, b) => {
      if (selectedSort.value === 'endAsc') {
        const aT = a.endAt ? new Date(a.endAt).getTime() : Infinity
        const bT = b.endAt ? new Date(b.endAt).getTime() : Infinity
        return aT - bT
      }
      if (selectedSort.value === 'severityDesc')
        return severityOrder[b.severity] - severityOrder[a.severity]
      return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
    })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedType.value = 'all'
  selectedScope.value = 'all'
  selectedSort.value = 'updatedDesc'
}
function goBackToModeration() {
  router.push('/moderation')
}
function getTypeIcon(type: ModerationSanctionType) {
  switch (type) {
    case 'warning':
      return mdiAlertOutline
    case 'temporaryBan':
      return mdiTimerOffOutline
    case 'permanentBan':
      return mdiShieldOffOutline
    case 'mute':
      return mdiMicrophoneOff
    default:
      return mdiAlertOutline
  }
}
function getSanctionStatusLabel(s: ModerationSanctionStatus) {
  return t(`moderation.sanctionStatuses.${s}`)
}
function getSanctionTypeLabel(s: ModerationSanctionType) {
  return t(`moderation.sanctionTypes.${s}`)
}
function getSanctionScopeLabel(s: ModerationSanctionScope) {
  return t(`moderation.sanctionScopes.${s}`)
}
function getSeverityLabel(s: ModerationSeverity) {
  return t(`moderation.severities.${s}`)
}
function formatDate(v: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(v))
}
</script>

<style scoped>
.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
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
.summary-card--dimmed {
  opacity: 0.6;
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
.summary-card__icon--warning {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}
.summary-card__icon--temporaryBan {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.summary-card__icon--permanentBan {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.summary-card__icon--mute {
  background: rgba(93, 44, 168, 0.1);
  color: #5d2ca8;
}
.summary-card__body {
  flex: 1;
  min-width: 0;
}
.summary-card__head {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.summary-card__title {
  color: var(--color-ink);
  font-size: 0.95rem;
  font-weight: 700;
}
.summary-card__id {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
.summary-card__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}
.summary-card__pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.45rem;
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
.signal-badge--appeals {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}
.signal-badge--evidence {
  background: rgba(93, 44, 168, 0.1);
  color: #5d2ca8;
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

/* ─── Modal ─────────────────────────────────────────────────────────────────── */
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
  max-width: 760px;
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
.modal__type-icon--warning {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}
.modal__type-icon--temporaryBan {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.modal__type-icon--permanentBan {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.modal__type-icon--mute {
  background: rgba(93, 44, 168, 0.1);
  color: #5d2ca8;
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
}
.modal__subtitle {
  margin-top: 0.25rem;
  font-size: 0.84rem;
  color: var(--color-text-muted);
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

/* Header action (edit button in header) */
.header-action {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: none;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border-radius: 8px;
  padding: 0.3rem 0.6rem;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.header-action:hover {
  background: rgba(37, 99, 235, 0.15);
}
.header-action svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
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
.modal__meta-value--muted {
  color: var(--color-text-muted);
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

/* Note */
.modal__note {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.15);
}
.modal__note svg {
  width: 17px;
  height: 17px;
  fill: #2563eb;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.modal__note p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-ink);
  line-height: 1.55;
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

/* Compose form */
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
.compose-form__actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  transition: transform 0.15s ease;
  white-space: nowrap;
}
.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
}
.action-btn svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
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

.save-feedback {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #15803d;
  font-weight: 600;
  margin: 0;
}
.save-feedback svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

/* Appeals block */
.appeals-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(217, 119, 6, 0.08);
  border: 1px solid rgba(217, 119, 6, 0.2);
  font-size: 0.9rem;
  color: var(--color-ink);
}
.appeals-block strong {
  font-size: 1.05rem;
}
.appeals-block__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 119, 6, 0.15);
  color: #92400e;
  flex-shrink: 0;
}
.appeals-block__icon svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

/* Related reports */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.report-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 10px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.15);
  color: #991b1b;
  font-size: 0.8rem;
  font-weight: 700;
}
.report-tag svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}

/* Timeline */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 1rem;
}
.timeline-item {
  display: grid;
  grid-template-columns: 0 16px 1fr;
  grid-template-rows: auto;
  gap: 0 0.75rem;
  position: relative;
  padding-bottom: 1rem;
}
.timeline-item:last-child {
  padding-bottom: 0;
}
.timeline-item__line {
  grid-column: 2;
  grid-row: 1 / 3;
  width: 2px;
  background: rgba(81, 96, 121, 0.15);
  margin: 8px auto 0;
  border-radius: 999px;
}
.timeline-item__line--last {
  background: transparent;
}
.timeline-item__dot {
  position: absolute;
  left: 1rem;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.18);
  transform: translateX(-4px);
}
.timeline-item__content {
  grid-column: 3;
}
.timeline-item__head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.timeline-item__actor {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--color-ink);
}
.timeline-item__date {
  font-size: 0.73rem;
  color: var(--color-text-muted);
}
.timeline-item__message {
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  color: var(--color-ink);
  line-height: 1.5;
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
  gap: 0.6rem;
  align-items: center;
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
.modal-btn--danger {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.status-badge-footer {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}
.status-badge-footer--expired {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}
.status-badge-footer--revoked {
  background: rgba(220, 38, 38, 0.08);
  color: #991b1b;
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
  .compose-form {
    flex-direction: column;
  }
  .compose-form__actions {
    flex-direction: row;
  }
}

.toolbar--sanctions {
  grid-template-columns: minmax(0, 1.5fr) repeat(4, minmax(160px, 0.5fr));
}
</style>
