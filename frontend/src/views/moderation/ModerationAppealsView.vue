<template>
  <section class="moderation-page">
    <div class="page-shell">
      <!-- Hero -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('moderation.pages.appeals.badge') }}</span>
          <h1 class="page-title">{{ t('moderation.pages.appeals.title') }}</h1>
          <p class="page-subtitle">{{ t('moderation.pages.appeals.subtitle') }}</p>
          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.pages.appeals.actions.backToModeration') }}
            </button>
            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.pages.appeals.actions.resetFilters') }}
            </button>
          </div>
        </div>
        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.appeals.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.appeals.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.appeals.side.text') }}</p>
          </div>
          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.appeals.side.chips.pending') }}</span>
            <span>{{ t('moderation.pages.appeals.side.chips.context') }}</span>
            <span>{{ t('moderation.pages.appeals.side.chips.decision') }}</span>
          </div>
        </aside>
      </header>

      <!-- Stats -->
      <section class="stat-grid stat-grid--appeals">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.appeals.stats.total') }}</span>
          <strong class="stat-card__value">{{ appealSummary.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.appeals.stats.totalCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.appeals.stats.pending') }}</span>
          <strong class="stat-card__value">{{ appealSummary.pendingCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.appeals.stats.pendingCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.appeals.stats.needsInfo') }}</span>
          <strong class="stat-card__value">{{ appealSummary.needsInfoCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.appeals.stats.needsInfoCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.appeals.stats.decided') }}</span>
          <strong class="stat-card__value">{{ decidedCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.appeals.stats.decidedCaption') }}
          </div>
        </article>
      </section>

      <!-- List -->
      <section class="surface">
        <div class="surface-header surface-header--appeals">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.appeals.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.appeals.list.subtitle') }}</p>
          </div>
          <div class="surface-header__meta">
            <span class="meta-item"
              >{{ sortedAppeals.length }} {{ t('moderation.pages.common.results') }}</span
            >
            <span v-if="activeFilterCount > 0" class="meta-item">
              {{ t('moderation.pages.appeals.list.filtered', { count: activeFilterCount }) }}
            </span>
          </div>
        </div>

        <!-- Quick-count chips -->
        <div class="status-chips">
          <button
            v-for="chip in statusChips"
            :key="chip.status"
            type="button"
            :class="[
              'status-chip',
              selectedStatus === chip.status ? 'status-chip--active' : '',
              chip.count === 0 ? 'status-chip--empty' : '',
            ]"
            @click="selectedStatus = selectedStatus === chip.status ? 'all' : chip.status"
          >
            <span :class="['status-chip__dot', `status-chip__dot--${chip.status}`]"></span>
            {{ chip.label }}
            <strong>{{ chip.count }}</strong>
          </button>
        </div>

        <div class="toolbar toolbar--appeals">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.appeals.filters.search')"
          />
          <select v-model="selectedStatus" class="select">
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedSanctionType" class="select">
            <option v-for="o in sanctionTypeOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedSort" class="select">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

        <div v-if="sortedAppeals.length" class="summary-list">
          <button
            v-for="appeal in sortedAppeals"
            :key="appeal.id"
            type="button"
            :class="['summary-card', `summary-card--${appeal.status}`]"
            @click="openModal(appeal)"
          >
            <div :class="['summary-card__icon', `summary-card__icon--${appeal.status}`]">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="getStatusIcon(appeal.status)" />
              </svg>
            </div>
            <div class="summary-card__body">
              <div class="summary-card__head">
                <strong class="summary-card__title">{{ appeal.targetName }}</strong>
                <span class="summary-card__id">{{ appeal.id }}</span>
              </div>
              <div class="summary-card__meta">
                <span>{{ getSanctionTypeLabel(appeal.sanctionType) }}</span>
                <span class="dot">·</span>
                <span
                  >{{ t('moderation.pages.appeals.card.submittedAt') }}
                  {{ formatDate(appeal.submittedAt) }}</span
                >
              </div>
              <div class="summary-card__pills">
                <span :class="['pill', `pill--${appeal.status}`]">{{
                  getAppealStatusLabel(appeal.status)
                }}</span>
                <span class="meta-item">{{ getSanctionTypeLabel(appeal.sanctionType) }}</span>
              </div>
              <p class="summary-card__preview">{{ truncate(appeal.message, 110) }}</p>
            </div>
            <div class="summary-card__signals">
              <div v-if="isActionable(appeal.status)" class="signal-badge signal-badge--pending">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClockAlertOutline" /></svg>
                <span>{{ t('moderation.pages.appeals.actionRequired') }}</span>
              </div>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiChevronRight" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.appeals.emptyText') }}</p>
        </div>
      </section>
    </div>

    <!-- ─── Modal enrichi ──────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selected" class="modal-backdrop" @click.self="closeModal">
          <div class="modal" role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="modal__header" :class="`modal__header--${selected.status}`">
              <div class="modal__header-left">
                <div :class="['modal__type-icon', `modal__type-icon--${selected.status}`]">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="getStatusIcon(selected.status)" />
                  </svg>
                </div>
                <div>
                  <div class="modal__id">
                    {{ selected.id }} · {{ getSanctionTypeLabel(selected.sanctionType) }}
                  </div>
                  <h2 class="modal__title">{{ selected.targetName }}</h2>
                  <div class="modal__subtitle">
                    {{ t('moderation.pages.appeals.card.submittedAt') }}
                    {{ formatDate(selected.submittedAt) }}
                  </div>
                </div>
              </div>
              <div class="modal__header-right">
                <span :class="['pill', `pill--${selected.status}`]">{{
                  getAppealStatusLabel(selected.status)
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
                  <span>{{ t('moderation.pages.appeals.modal.sections.info') }}</span>
                </div>
                <div class="modal__meta-grid">
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.appeals.modal.meta.id')
                    }}</span>
                    <strong class="modal__meta-value mono">{{ selected.id }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.appeals.modal.meta.sanctionType')
                    }}</span>
                    <strong class="modal__meta-value">{{
                      getSanctionTypeLabel(selected.sanctionType)
                    }}</strong>
                  </div>
                  <div class="modal__meta-item">
                    <span class="modal__meta-label">{{
                      t('moderation.pages.appeals.modal.meta.submitted')
                    }}</span>
                    <strong class="modal__meta-value">{{
                      formatDate(selected.submittedAt)
                    }}</strong>
                  </div>
                </div>
              </div>

              <!-- 2. Contexte sanction -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiGavel" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.sanctionContext') }}</span>
                </div>
                <div
                  class="sanction-context-block"
                  :class="`sanction-context-block--${selected.sanctionType}`"
                >
                  <div class="sanction-context-block__icon">
                    <svg viewBox="0 0 24 24">
                      <path :d="getSanctionTypeIcon(selected.sanctionType)" />
                    </svg>
                  </div>
                  <div>
                    <strong class="sanction-context-block__type">{{
                      getSanctionTypeLabel(selected.sanctionType)
                    }}</strong>
                    <p class="sanction-context-block__desc">
                      {{ getSanctionTypeDesc(selected.sanctionType) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 3. Action contestée -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiInformationOutline" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.appealedAction.title') }}</span>
                </div>

                <div
                  class="appealed-action-card"
                  :class="`appealed-action-card--${selected.sanctionType}`"
                >
                  <div class="appealed-action-card__main">
                    <div class="appealed-action-card__icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="getSanctionTypeIcon(selected.sanctionType)" />
                      </svg>
                    </div>

                    <div>
                      <span class="appealed-action-card__eyebrow">
                        {{ t('moderation.pages.appeals.modal.appealedAction.summaryLabel') }}
                      </span>

                      <strong class="appealed-action-card__title">
                        {{ getAppealedActionTitle(selected) }}
                      </strong>

                      <p class="appealed-action-card__desc">
                        {{ getAppealedActionDescription(selected) }}
                      </p>
                    </div>
                  </div>

                  <div class="appealed-action-card__facts">
                    <div
                      v-for="fact in getAppealedActionFacts(selected)"
                      :key="fact.label"
                      class="appealed-action-card__fact"
                    >
                      <span>{{ fact.label }}</span>
                      <strong>{{ fact.value }}</strong>
                    </div>
                  </div>

                  <div class="appealed-action-details">
                    <div class="appealed-action-details__title">
                      {{ t('moderation.pages.appeals.modal.appealedAction.detailsTitle') }}
                    </div>

                    <ul class="appealed-action-details__list">
                      <li
                        v-for="(detail, index) in getAppealedActionDetails(selected)"
                        :key="`${selected.id}-appealed-action-${index}`"
                      >
                        <span>{{ index + 1 }}</span>
                        <p>{{ detail }}</p>
                      </li>
                    </ul>
                  </div>

                  <div class="appeal-timeline">
                    <div class="appeal-timeline__item">
                      <span class="appeal-timeline__dot"></span>
                      <div>
                        <strong>{{
                          t('moderation.pages.appeals.modal.appealedAction.timeline.action')
                        }}</strong>
                        <p>{{ getAppealedActionDate(selected) }}</p>
                      </div>
                    </div>

                    <div class="appeal-timeline__line"></div>

                    <div class="appeal-timeline__item">
                      <span class="appeal-timeline__dot"></span>
                      <div>
                        <strong>{{
                          t('moderation.pages.appeals.modal.appealedAction.timeline.sanction')
                        }}</strong>
                        <p>{{ getSanctionTypeLabel(selected.sanctionType) }}</p>
                      </div>
                    </div>

                    <div class="appeal-timeline__line"></div>

                    <div class="appeal-timeline__item">
                      <span class="appeal-timeline__dot"></span>
                      <div>
                        <strong>{{
                          t('moderation.pages.appeals.modal.appealedAction.timeline.appeal')
                        }}</strong>
                        <p>{{ formatDate(selected.submittedAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Message du joueur -->
              <div class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiMessageTextOutline" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.message') }}</span>
                </div>
                <div class="appeal-message">
                  <p>{{ selected.message }}</p>
                </div>
              </div>

              <!-- 5. Note de décision existante (si décidé) -->
              <div v-if="selected.decisionNote" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiNoteTextOutline" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.decisionNote') }}</span>
                  <span
                    :class="['decision-status-badge', `decision-status-badge--${selected.status}`]"
                  >
                    {{ getAppealStatusLabel(selected.status) }}
                  </span>
                </div>
                <div class="decision-note" :class="`decision-note--${selected.status}`">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiNoteTextOutline" /></svg>
                  <p>{{ selected.decisionNote }}</p>
                </div>
              </div>

              <!-- 6. Prendre une décision (si actionable) -->
              <div v-if="isActionable(selected.status)" class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiScaleBalance" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.sections.decision') }}</span>
                  <span v-if="selected.status === 'needsInfo'" class="needs-info-badge">
                    {{ t('moderation.pages.appeals.modal.awaitingInfo') }}
                  </span>
                </div>

                <div class="decision-form">
                  <label class="decision-form__label">{{
                    t('moderation.pages.appeals.modal.addNote')
                  }}</label>
                  <textarea
                    v-model="decisionNoteInput"
                    class="decision-form__textarea"
                    rows="3"
                    :placeholder="t('moderation.pages.appeals.modal.notePlaceholder')"
                  ></textarea>
                  <p class="decision-form__hint">
                    {{ t('moderation.pages.appeals.modal.noteHint') }}
                  </p>
                </div>

                <div class="decision-actions">
                  <button
                    type="button"
                    class="decision-btn decision-btn--info"
                    @click="doRequestInfo"
                  >
                    <svg viewBox="0 0 24 24"><path :d="mdiHelpCircleOutline" /></svg>
                    <span>
                      <strong>{{ t('moderation.pages.appeals.actions.requestInfo') }}</strong>
                      <em>{{ t('moderation.pages.appeals.modal.actions.requestInfoDesc') }}</em>
                    </span>
                  </button>

                  <button type="button" class="decision-btn decision-btn--reject" @click="doReject">
                    <svg viewBox="0 0 24 24"><path :d="mdiCloseCircleOutline" /></svg>
                    <span>
                      <strong>{{ t('moderation.pages.appeals.actions.reject') }}</strong>
                      <em>{{ t('moderation.pages.appeals.modal.actions.rejectDesc') }}</em>
                    </span>
                  </button>

                  <button type="button" class="decision-btn decision-btn--accept" @click="doAccept">
                    <svg viewBox="0 0 24 24"><path :d="mdiCheckCircleOutline" /></svg>
                    <span>
                      <strong>{{ t('moderation.pages.appeals.actions.accept') }}</strong>
                      <em>{{ t('moderation.pages.appeals.modal.actions.acceptDesc') }}</em>
                    </span>
                  </button>
                </div>
              </div>

              <!-- 7. Statut final (si déjà décidé) -->
              <div v-else class="modal__block">
                <div class="modal__block-header">
                  <svg viewBox="0 0 24 24"><path :d="mdiCheckDecagramOutline" /></svg>
                  <span>{{ t('moderation.pages.appeals.modal.sections.outcome') }}</span>
                </div>
                <div class="outcome-block" :class="`outcome-block--${selected.status}`">
                  <div class="outcome-block__icon">
                    <svg viewBox="0 0 24 24"><path :d="getStatusIcon(selected.status)" /></svg>
                  </div>
                  <div>
                    <strong class="outcome-block__title">{{
                      getAppealStatusLabel(selected.status)
                    }}</strong>
                    <p class="outcome-block__text">{{ getOutcomeDesc(selected.status) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal__footer">
              <div class="modal__footer-hint">
                {{
                  isActionable(selected.status)
                    ? t('moderation.pages.appeals.modal.actionableHint')
                    : t('moderation.pages.appeals.modal.decidedHint', {
                        status: getAppealStatusLabel(selected.status),
                      })
                }}
              </div>
              <button type="button" class="modal__close-btn" @click="closeModal">
                {{ t('moderation.pages.appeals.modal.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import {
  mdiAlertOutline,
  mdiCheckCircleOutline,
  mdiCheckDecagramOutline,
  mdiChevronRight,
  mdiClockAlertOutline,
  mdiClose,
  mdiCloseCircleOutline,
  mdiGavel,
  mdiHelpCircleOutline,
  mdiInformationOutline,
  mdiMessageCheckOutline,
  mdiMessageOffOutline,
  mdiMessageQuestionOutline,
  mdiMessageReplyTextOutline,
  mdiMessageTextOutline,
  mdiMicrophoneOff,
  mdiNoteTextOutline,
  mdiScaleBalance,
  mdiShieldOffOutline,
  mdiTimerOffOutline,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationAppeal,
  type ModerationAppealStatus,
  type ModerationSanctionType,
  useModerationAppealsStore,
} from '@/stores/moderation'

type AppealActionContext = ModerationAppeal & {
  appealedActionTitle?: string
  appealedActionDescription?: string
  appealedActionAt?: string
  appealedActionResource?: string
  appealedActionOrigin?: string
  appealedActionDetails?: string[]
}

useModerationAccess()

const router = useRouter()
const moderationStore = useModerationAppealsStore()
const { appeals, appealSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

// ─── Modal state ──────────────────────────────────────────────────────────────
const selected = ref<ModerationAppeal | null>(null)
const decisionNoteInput = ref('')

function openModal(appeal: ModerationAppeal) {
  selected.value = appeal
  decisionNoteInput.value = ''
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selected.value = null
  document.body.style.overflow = ''
}

function sync() {
  if (selected.value) {
    const fresh = appeals.value.find((a) => a.id === selected.value!.id)
    if (fresh) selected.value = fresh
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────
function doRequestInfo() {
  if (!selected.value) return
  moderationStore.requestAppealInfo(selected.value.id, 'POC Admin')
  sync()
}

function doReject() {
  if (!selected.value) return
  moderationStore.rejectAppeal(selected.value.id, 'POC Admin')
  sync()
}

function doAccept() {
  if (!selected.value) return
  moderationStore.acceptAppeal(selected.value.id, 'POC Admin')
  sync()
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
const selectedStatus = ref<'all' | ModerationAppealStatus>('all')
const selectedSanctionType = ref<'all' | ModerationSanctionType>('all')
const selectedSort = ref<'submittedDesc' | 'submittedAsc' | 'pendingFirst'>('pendingFirst')

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'pending', label: t('moderation.appealStatuses.pending') },
  { value: 'accepted', label: t('moderation.appealStatuses.accepted') },
  { value: 'rejected', label: t('moderation.appealStatuses.rejected') },
  { value: 'needsInfo', label: t('moderation.appealStatuses.needsInfo') },
])

const sanctionTypeOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.appeals.filters.allSanctionTypes') },
  { value: 'warning', label: t('moderation.sanctionTypes.warning') },
  { value: 'temporaryBan', label: t('moderation.sanctionTypes.temporaryBan') },
  { value: 'permanentBan', label: t('moderation.sanctionTypes.permanentBan') },
  { value: 'mute', label: t('moderation.sanctionTypes.mute') },
])

const sortOptions = computed(() => [
  { value: 'pendingFirst', label: t('moderation.pages.appeals.filters.sortPendingFirst') },
  { value: 'submittedDesc', label: t('moderation.pages.appeals.filters.sortNewest') },
  { value: 'submittedAsc', label: t('moderation.pages.appeals.filters.sortOldest') },
])

const filteredAppeals = computed(() => {
  const q = search.value.trim().toLowerCase()
  return appeals.value.filter((item) => {
    const mq =
      q === '' ||
      item.id.toLowerCase().includes(q) ||
      item.targetName.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      (item.decisionNote ?? '').toLowerCase().includes(q)
    return (
      mq &&
      (selectedStatus.value === 'all' || item.status === selectedStatus.value) &&
      (selectedSanctionType.value === 'all' || item.sanctionType === selectedSanctionType.value)
    )
  })
})

const sortedAppeals = computed(() =>
  [...filteredAppeals.value].sort((a, b) => compareAppeals(a, b, selectedSort.value)),
)

const pendingCount = computed(() => appeals.value.filter((i) => i.status === 'pending').length)
const needsInfoCount = computed(() => appeals.value.filter((i) => i.status === 'needsInfo').length)
const acceptedCount = computed(() => appeals.value.filter((i) => i.status === 'accepted').length)
const rejectedCount = computed(() => appeals.value.filter((i) => i.status === 'rejected').length)
const decidedCount = computed(() => acceptedCount.value + rejectedCount.value)

const statusChips = computed(() => [
  {
    status: 'pending' as const,
    label: t('moderation.appealStatuses.pending'),
    count: pendingCount.value,
  },
  {
    status: 'needsInfo' as const,
    label: t('moderation.appealStatuses.needsInfo'),
    count: needsInfoCount.value,
  },
  {
    status: 'accepted' as const,
    label: t('moderation.appealStatuses.accepted'),
    count: acceptedCount.value,
  },
  {
    status: 'rejected' as const,
    label: t('moderation.appealStatuses.rejected'),
    count: rejectedCount.value,
  },
])

const activeFilterCount = computed(() => {
  let c = 0
  if (search.value.trim() !== '') c++
  if (selectedStatus.value !== 'all') c++
  if (selectedSanctionType.value !== 'all') c++
  if (selectedSort.value !== 'pendingFirst') c++
  return c
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAppealedActionContext(appeal: ModerationAppeal) {
  return appeal as AppealActionContext
}

function getAppealedActionTitle(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  return (
    context.appealedActionTitle ||
    t(`moderation.pages.appeals.modal.appealedAction.titles.${appeal.sanctionType}`)
  )
}

function getAppealedActionDescription(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  return (
    context.appealedActionDescription ||
    t(`moderation.pages.appeals.modal.appealedAction.descriptions.${appeal.sanctionType}`)
  )
}

function getAppealedActionDate(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  return context.appealedActionAt
    ? formatDate(context.appealedActionAt)
    : t('moderation.pages.appeals.modal.appealedAction.unknownDate')
}

function getAppealedActionResource(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  return (
    context.appealedActionResource ||
    t('moderation.pages.appeals.modal.appealedAction.resourceFallback')
  )
}

function getAppealedActionOrigin(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  return (
    context.appealedActionOrigin ||
    t('moderation.pages.appeals.modal.appealedAction.originFallback')
  )
}

function getAppealedActionFacts(appeal: ModerationAppeal) {
  return [
    {
      label: t('moderation.pages.appeals.modal.appealedAction.facts.player'),
      value: appeal.targetName,
    },
    {
      label: t('moderation.pages.appeals.modal.appealedAction.facts.sanction'),
      value: getSanctionTypeLabel(appeal.sanctionType),
    },
    {
      label: t('moderation.pages.appeals.modal.appealedAction.facts.resource'),
      value: getAppealedActionResource(appeal),
    },
    {
      label: t('moderation.pages.appeals.modal.appealedAction.facts.origin'),
      value: getAppealedActionOrigin(appeal),
    },
  ]
}

function getAppealedActionDetails(appeal: ModerationAppeal) {
  const context = getAppealedActionContext(appeal)

  if (context.appealedActionDetails?.length) {
    return context.appealedActionDetails
  }

  return [
    t(`moderation.pages.appeals.modal.appealedAction.details.${appeal.sanctionType}.one`),
    t(`moderation.pages.appeals.modal.appealedAction.details.${appeal.sanctionType}.two`),
    t(`moderation.pages.appeals.modal.appealedAction.details.${appeal.sanctionType}.three`),
  ]
}

function compareAppeals(a: ModerationAppeal, b: ModerationAppeal, mode: string) {
  const aT = new Date(a.submittedAt).getTime()
  const bT = new Date(b.submittedAt).getTime()
  if (mode === 'submittedAsc') return aT - bT
  if (mode === 'submittedDesc') return bT - aT
  const ap = getAppealPriority(a.status)
  const bp = getAppealPriority(b.status)
  if (ap !== bp) return ap - bp
  return bT - aT
}

function getAppealPriority(status: ModerationAppealStatus) {
  switch (status) {
    case 'pending':
      return 0
    case 'needsInfo':
      return 1
    case 'accepted':
      return 2
    case 'rejected':
      return 3
  }
}

function isActionable(status: ModerationAppealStatus) {
  return status === 'pending' || status === 'needsInfo'
}

function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedSanctionType.value = 'all'
  selectedSort.value = 'pendingFirst'
}

function goBackToModeration() {
  router.push('/moderation')
}

function getAppealStatusLabel(status: ModerationAppealStatus) {
  return t(`moderation.appealStatuses.${status}`)
}

function getSanctionTypeLabel(type: ModerationSanctionType) {
  return t(`moderation.sanctionTypes.${type}`)
}

function getSanctionTypeIcon(type: ModerationSanctionType) {
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
      return mdiGavel
  }
}

function getSanctionTypeDesc(type: ModerationSanctionType) {
  return t(`moderation.pages.appeals.modal.sanctionDescs.${type}`)
}

function getStatusIcon(status: ModerationAppealStatus) {
  switch (status) {
    case 'pending':
      return mdiMessageReplyTextOutline
    case 'needsInfo':
      return mdiMessageQuestionOutline
    case 'accepted':
      return mdiMessageCheckOutline
    case 'rejected':
      return mdiMessageOffOutline
  }
}

function getOutcomeDesc(status: ModerationAppealStatus) {
  return t(`moderation.pages.appeals.modal.outcomes.${status}`)
}

function truncate(text: string, maxLen: number) {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
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
.stat-grid--appeals {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.dot {
  opacity: 0.4;
}

/* ─── Status chips ──────────────────────────────────────────────────────────── */
.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1rem;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink);
  transition: all 0.15s ease;
}
.status-chip:hover {
  background: rgba(81, 96, 121, 0.14);
}
.status-chip--active {
  background: var(--color-ink);
  color: var(--color-cream);
}
.status-chip--empty {
  opacity: 0.5;
}
.status-chip strong {
  font-size: 0.85rem;
}
.status-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-chip__dot--pending {
  background: #2563eb;
}
.status-chip__dot--needsInfo {
  background: #d97706;
}
.status-chip__dot--accepted {
  background: #15803d;
}
.status-chip__dot--rejected {
  background: #991b1b;
}

.toolbar--appeals {
  grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(160px, 0.5fr));
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
  align-items: flex-start;
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
.summary-card--pending {
  border-left: 3px solid #2563eb;
}
.summary-card--needsInfo {
  border-left: 3px solid #d97706;
}
.summary-card--accepted {
  border-left: 3px solid #15803d;
}
.summary-card--rejected {
  border-left: 3px solid #991b1b;
  opacity: 0.8;
}
.summary-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.summary-card__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
.summary-card__icon--pending {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.summary-card__icon--needsInfo {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}
.summary-card__icon--accepted {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.summary-card__icon--rejected {
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
  flex-wrap: wrap;
}
.summary-card__title {
  color: var(--color-ink);
  font-size: 0.95rem;
  font-weight: 700;
}
.summary-card__id {
  font-size: 0.74rem;
  color: var(--color-text-muted);
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
  margin-top: 0.4rem;
}
.summary-card__preview {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.summary-card__signals {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  padding-top: 2px;
}
.signal-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.55rem;
  border-radius: 10px;
  font-size: 0.74rem;
  font-weight: 700;
}
.signal-badge svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.signal-badge--pending {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
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

.surface-header--appeals {
  align-items: flex-start;
}
.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
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
  max-width: 700px;
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
.modal__header--pending {
  background: rgba(37, 99, 235, 0.05);
}
.modal__header--needsInfo {
  background: rgba(217, 119, 6, 0.05);
}
.modal__header--accepted {
  background: rgba(22, 163, 74, 0.05);
}
.modal__header--rejected {
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
.modal__type-icon--pending {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.modal__type-icon--needsInfo {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}
.modal__type-icon--accepted {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.modal__type-icon--rejected {
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
.modal__meta-value.mono {
  font-family: 'Space Grotesk', monospace;
  font-size: 0.8rem;
}

/* Sanction context block */
.sanction-context-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
}
.sanction-context-block__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sanction-context-block__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
.sanction-context-block--warning {
  background: rgba(217, 119, 6, 0.08);
  border: 1px solid rgba(217, 119, 6, 0.18);
}
.sanction-context-block--warning .sanction-context-block__icon {
  background: rgba(217, 119, 6, 0.15);
  color: #92400e;
}
.sanction-context-block--temporaryBan {
  background: rgba(37, 99, 235, 0.07);
  border: 1px solid rgba(37, 99, 235, 0.15);
}
.sanction-context-block--temporaryBan .sanction-context-block__icon {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
.sanction-context-block--permanentBan {
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.14);
}
.sanction-context-block--permanentBan .sanction-context-block__icon {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.sanction-context-block--mute {
  background: rgba(93, 44, 168, 0.06);
  border: 1px solid rgba(93, 44, 168, 0.14);
}
.sanction-context-block--mute .sanction-context-block__icon {
  background: rgba(93, 44, 168, 0.1);
  color: #5d2ca8;
}
.sanction-context-block__type {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-ink);
}
.sanction-context-block__desc {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

/* Appeal message */
.appeal-message {
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: rgba(81, 96, 121, 0.05);
  border-left: 3px solid rgba(81, 96, 121, 0.2);
}
.appeal-message p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-ink);
  line-height: 1.65;
}

/* Decision note */
.decision-status-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}
.decision-status-badge--accepted {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}
.decision-status-badge--rejected {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.decision-status-badge--needsInfo {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}

.decision-note {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border-radius: 14px;
}
.decision-note svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.decision-note p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-ink);
  line-height: 1.55;
}
.decision-note--accepted {
  background: rgba(22, 163, 74, 0.07);
  border: 1px solid rgba(22, 163, 74, 0.2);
  color: #15803d;
}
.decision-note--rejected {
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.15);
  color: #991b1b;
}
.decision-note--needsInfo {
  background: rgba(217, 119, 6, 0.07);
  border: 1px solid rgba(217, 119, 6, 0.2);
  color: #92400e;
}

/* Needs info badge */
.needs-info-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
  text-transform: none;
  letter-spacing: normal;
}

/* Decision form */
.decision-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.decision-form__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-ink);
}
.decision-form__textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0.75rem 1rem;
  color: var(--color-ink);
  font: inherit;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  min-height: 80px;
  line-height: 1.5;
}
.decision-form__textarea:focus {
  border-color: var(--color-primary);
}
.decision-form__hint {
  margin: 0;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

/* Decision buttons (large, with description) */
.decision-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}
.decision-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.decision-btn:hover {
  transform: translateY(-2px);
}
.decision-btn svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
  flex-shrink: 0;
}
.decision-btn span {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.decision-btn strong {
  font-size: 0.88rem;
  font-weight: 700;
}
.decision-btn em {
  font-style: normal;
  font-size: 0.74rem;
  margin-top: 0.1rem;
  opacity: 0.8;
}
.decision-btn--info {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.18);
  color: #1d4ed8;
}
.decision-btn--info:hover {
  box-shadow: 0 8px 20px -10px rgba(37, 99, 235, 0.4);
}
.decision-btn--reject {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(220, 38, 38, 0.16);
  color: #991b1b;
}
.decision-btn--reject:hover {
  box-shadow: 0 8px 20px -10px rgba(220, 38, 38, 0.4);
}
.decision-btn--accept {
  background: rgba(22, 163, 74, 0.08);
  border-color: rgba(22, 163, 74, 0.18);
  color: #15803d;
}
.decision-btn--accept:hover {
  box-shadow: 0 8px 20px -10px rgba(22, 163, 74, 0.35);
}

/* Outcome block (decided) */
.outcome-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 16px;
}
.outcome-block__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.outcome-block__icon svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
.outcome-block--accepted {
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.2);
}
.outcome-block--accepted .outcome-block__icon {
  background: rgba(22, 163, 74, 0.14);
  color: #15803d;
}
.outcome-block--rejected {
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.15);
}
.outcome-block--rejected .outcome-block__icon {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}
.outcome-block__title {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-ink);
}
.outcome-block__text {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
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
.modal__close-btn {
  border: none;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink);
  transition: background 0.15s ease;
}
.modal__close-btn:hover {
  background: rgba(81, 96, 121, 0.14);
}

/* ─── Appealed action block ─────────────────────────────────────────────────── */
.appealed-action-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(81, 96, 121, 0.1);
  background: rgba(255, 255, 255, 0.52);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appealed-action-card--warning {
  background: rgba(217, 119, 6, 0.06);
  border-color: rgba(217, 119, 6, 0.16);
}

.appealed-action-card--temporaryBan {
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.15);
}

.appealed-action-card--permanentBan {
  background: rgba(220, 38, 38, 0.05);
  border-color: rgba(220, 38, 38, 0.14);
}

.appealed-action-card--mute {
  background: rgba(93, 44, 168, 0.05);
  border-color: rgba(93, 44, 168, 0.14);
}

.appealed-action-card__main {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.appealed-action-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.appealed-action-card__icon svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.appealed-action-card__eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.appealed-action-card__title {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--color-ink);
}

.appealed-action-card__desc {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.appealed-action-card__facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.appealed-action-card__fact {
  padding: 0.6rem 0.7rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(81, 96, 121, 0.08);
  min-width: 0;
}

.appealed-action-card__fact span {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.appealed-action-card__fact strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appealed-action-details {
  padding: 0.85rem;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.05);
}

.appealed-action-details__title {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.65rem;
}

.appealed-action-details__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.appealed-action-details__list li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
}

.appealed-action-details__list li span {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(81, 96, 121, 0.1);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 800;
}

.appealed-action-details__list li p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--color-ink);
}

.appeal-timeline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: center;
  gap: 0.4rem;
}

.appeal-timeline__item {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  min-width: 0;
}

.appeal-timeline__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--color-primary);
  margin-top: 0.28rem;
  flex-shrink: 0;
}

.appeal-timeline__item strong {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-ink);
}

.appeal-timeline__item p {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appeal-timeline__line {
  height: 1px;
  background: rgba(81, 96, 121, 0.18);
}

@media (max-width: 720px) {
  .appealed-action-card__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .appeal-timeline {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .appeal-timeline__line {
    display: none;
  }
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

@media (max-width: 900px) {
  .stat-grid--appeals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(40px);
  }
  .toolbar--appeals {
    grid-template-columns: 1fr;
  }
  .status-chips {
    gap: 0.35rem;
  }
  .decision-actions {
    grid-template-columns: 1fr;
  }
  .modal__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
