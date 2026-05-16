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
.btn,
.action-btn,
.modal-btn,
.header-action {
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
.header-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.action-btn:disabled,
.modal-btn:disabled,
.header-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary,
.modal-btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.modal-btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost,
.action-btn--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.action-btn--ghost:hover:not(:disabled) {
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
.modal-btn svg,
.header-action svg {
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

.modal-btn--danger {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.32);
}

.modal-btn--danger:hover:not(:disabled) {
  color: #ffd0d0;
  background: rgba(225, 91, 91, 0.22);
  border-color: rgba(225, 91, 91, 0.46);
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
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 12px;
}

.toolbar--sanctions {
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(150px, 0.5fr)
    minmax(150px, 0.5fr)
    minmax(150px, 0.5fr)
    minmax(160px, 0.55fr);
}

.field,
.select,
.compose-form__textarea {
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

.compose-form__textarea {
  min-height: 96px;
  padding: 0.85rem 0.95rem;
  resize: vertical;
  line-height: 1.55;
}

.field::placeholder,
.compose-form__textarea::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field:hover,
.select:hover,
.compose-form__textarea:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field:focus,
.select:focus,
.compose-form__textarea:focus {
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
.signal-badge,
.report-tag,
.status-badge-footer {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.pill,
.meta-item,
.report-tag,
.status-badge-footer {
  padding: 0.34rem 0.65rem;
  font-size: 0.76rem;
}

.pill--draft {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.pill--active {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.pill--expired {
  color: rgba(252, 239, 225, 0.6);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.pill--revoked {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
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

.summary-card--dimmed {
  opacity: 0.58;
}

.summary-card--dimmed:hover {
  opacity: 0.86;
}

.summary-card__icon,
.modal__type-icon,
.appeals-block__icon {
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
.modal__type-icon svg,
.appeals-block__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.summary-card__icon--warning,
.modal__type-icon--warning {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.summary-card__icon--temporaryBan,
.modal__type-icon--temporaryBan {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.summary-card__icon--permanentBan,
.modal__type-icon--permanentBan {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.24);
}

.summary-card__icon--mute,
.modal__type-icon--mute {
  color: #c7a6ff;
  background: rgba(128, 90, 213, 0.16);
  border-color: rgba(128, 90, 213, 0.28);
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
  min-width: 0;
}

.summary-card__title {
  color: var(--color-cream);
  font-size: 0.96rem;
  font-weight: 900;
}

.summary-card__id {
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.78rem;
  font-weight: 800;
}

.summary-card__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.56);
  flex-wrap: wrap;
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
  gap: 0.3rem;
  padding: 0.32rem 0.58rem;
  font-size: 0.76rem;
}

.signal-badge svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.signal-badge--appeals {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.signal-badge--evidence {
  color: #c7a6ff;
  background: rgba(128, 90, 213, 0.16);
  border-color: rgba(128, 90, 213, 0.28);
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
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
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
  padding: 1rem;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.85rem;
  font-weight: 800;
}

.block-empty svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  opacity: 0.65;
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
  line-height: 1.4;
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
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.86rem;
  line-height: 1.45;
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
  transition:
    color 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.modal__close:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
  transform: translateY(-1px);
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

/* ── Header action ───────────────────────────────────────── */
.header-action {
  margin-left: auto;
  min-height: 32px;
  padding: 0.42rem 0.7rem;
  border-radius: 12px;
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
  font-size: 0.76rem;
}

.header-action:hover:not(:disabled) {
  color: #c6d6ff;
  background: rgba(80, 120, 238, 0.2);
  border-color: rgba(80, 120, 238, 0.42);
}

/* ── Meta grid / preview / evidence ──────────────────────── */
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

.modal__meta-value--muted {
  color: rgba(252, 239, 225, 0.5);
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

/* ── Note / compose ──────────────────────────────────────── */
.modal__note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.95rem;
  border-radius: 16px;
  border: 1px solid rgba(80, 120, 238, 0.24);
  background: rgba(80, 120, 238, 0.12);
  color: rgba(252, 239, 225, 0.78);
}

.modal__note svg {
  width: 18px;
  height: 18px;
  fill: #9ab8ff;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.modal__note p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
}

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.compose-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.save-feedback {
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

.save-feedback svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* ── Appeals / related reports ───────────────────────────── */
.appeals-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(242, 139, 91, 0.24);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.14), transparent 38%),
    rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  line-height: 1.5;
}

.appeals-block__icon {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.appeals-block strong {
  color: var(--color-cream);
  font-weight: 900;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.report-tag {
  gap: 0.35rem;
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
}

.report-tag svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* ── Timeline ────────────────────────────────────────────── */
.timeline-list {
  display: grid;
  gap: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 0.75rem;
  position: relative;
}

.timeline-item__line {
  grid-column: 1;
  grid-row: 1 / 3;
  width: 2px;
  min-height: 56px;
  margin: 0.35rem auto 0;
  background: rgba(252, 239, 225, 0.12);
  border-radius: 999px;
}

.timeline-item__line--last {
  background: transparent;
}

.timeline-item__dot {
  position: absolute;
  top: 0.35rem;
  left: 10px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.14);
  z-index: 1;
}

.timeline-item__content {
  grid-column: 2;
  padding-bottom: 1rem;
}

.timeline-item__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.timeline-item__actor {
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 900;
}

.timeline-item__date {
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.78rem;
  font-weight: 800;
}

.timeline-item__message {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.88rem;
  line-height: 1.55;
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

.status-badge-footer--expired {
  color: rgba(252, 239, 225, 0.62);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.status-badge-footer--revoked {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
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

  .toolbar--sanctions {
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

  .modal__actions,
  .compose-form__actions {
    width: 100%;
    justify-content: stretch;
  }

  .appeals-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-item__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
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

  .hero-side__chips span {
    width: 100%;
    justify-content: center;
  }

  .modal__block-header {
    flex-wrap: wrap;
  }

  .header-action {
    width: 100%;
    margin-left: 0;
  }
}
</style>
