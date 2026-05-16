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
.decision-btn,
.modal__close-btn {
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
.decision-btn:hover:not(:disabled),
.modal__close-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.decision-btn:disabled,
.modal__close-btn:disabled {
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

.btn--ghost,
.modal__close-btn {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.modal__close-btn:hover:not(:disabled) {
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

.stat-grid--appeals {
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

.surface-header--appeals {
  align-items: flex-start;
}

.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
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
}

.toolbar--appeals {
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(155px, 0.5fr)
    minmax(170px, 0.55fr)
    minmax(155px, 0.5fr);
}

.field,
.select,
.decision-form__textarea {
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

.decision-form__textarea {
  min-height: 96px;
  padding: 0.85rem 0.95rem;
  resize: vertical;
  line-height: 1.55;
}

.field::placeholder,
.decision-form__textarea::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field:hover,
.select:hover,
.decision-form__textarea:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field:focus,
.select:focus,
.decision-form__textarea:focus {
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

/* ── Status chips ────────────────────────────────────────── */
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
  min-height: 40px;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 900;
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.76);
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.status-chip:hover {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.12);
  border-color: rgba(242, 139, 91, 0.34);
}

.status-chip--active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: transparent;
  box-shadow: 0 14px 26px -20px rgba(242, 139, 91, 0.95);
}

.status-chip--empty {
  opacity: 0.5;
}

.status-chip strong {
  font-size: 0.85rem;
  font-weight: 900;
}

.status-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-chip__dot--pending {
  background: #9ab8ff;
}

.status-chip__dot--needsInfo {
  background: var(--color-primary-strong);
}

.status-chip__dot--accepted {
  background: #7ee0ad;
}

.status-chip__dot--rejected {
  background: #ff9a9a;
}

/* ── Pills / badges ──────────────────────────────────────── */
.pill,
.meta-item,
.signal-badge,
.decision-status-badge,
.needs-info-badge {
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
.decision-status-badge,
.needs-info-badge {
  padding: 0.34rem 0.65rem;
  font-size: 0.76rem;
}

.pill--pending,
.decision-status-badge--pending {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.pill--needsInfo,
.decision-status-badge--needsInfo,
.needs-info-badge {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.pill--accepted,
.decision-status-badge--accepted {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.pill--rejected,
.decision-status-badge--rejected {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
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
  align-items: flex-start;
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

.summary-card--pending {
  border-left: 3px solid rgba(80, 120, 238, 0.7);
}

.summary-card--needsInfo {
  border-left: 3px solid rgba(242, 139, 91, 0.8);
}

.summary-card--accepted {
  border-left: 3px solid rgba(61, 191, 125, 0.7);
}

.summary-card--rejected {
  border-left: 3px solid rgba(225, 91, 91, 0.85);
  opacity: 0.72;
}

.summary-card--rejected:hover {
  opacity: 0.9;
}

.summary-card__icon,
.modal__type-icon,
.sanction-context-block__icon,
.appealed-action-card__icon,
.outcome-block__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.summary-card__icon {
  margin-top: 2px;
}

.summary-card__icon svg,
.modal__type-icon svg,
.sanction-context-block__icon svg,
.appealed-action-card__icon svg,
.outcome-block__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.summary-card__icon--pending,
.modal__type-icon--pending {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.summary-card__icon--needsInfo,
.modal__type-icon--needsInfo {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.summary-card__icon--accepted,
.modal__type-icon--accepted {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.24);
}

.summary-card__icon--rejected,
.modal__type-icon--rejected {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.24);
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

.summary-card__preview {
  margin: 0.6rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.84rem;
  line-height: 1.55;
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
  gap: 0.3rem;
  padding: 0.32rem 0.58rem;
  font-size: 0.74rem;
}

.signal-badge svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.signal-badge--pending {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
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
.empty-state {
  padding: 3rem 1rem;
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.68), rgba(46, 50, 68, 0.94)), var(--color-navy);
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
  max-width: 900px;
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

.modal__header--pending::before {
  background: radial-gradient(circle at top left, rgba(80, 120, 238, 0.2), transparent 38%);
}

.modal__header--needsInfo::before {
  background: radial-gradient(circle at top left, rgba(242, 139, 91, 0.22), transparent 38%);
}

.modal__header--accepted::before {
  background: radial-gradient(circle at top left, rgba(61, 191, 125, 0.2), transparent 38%);
}

.modal__header--rejected::before {
  background: radial-gradient(circle at top left, rgba(225, 91, 91, 0.2), transparent 38%);
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

/* ── Meta grid ───────────────────────────────────────────── */
.modal__meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.modal__meta-item {
  padding: 0.8rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
}

.modal__meta-label {
  display: block;
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__meta-value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-cream);
  font-weight: 900;
  line-height: 1.35;
}

.modal__meta-value.mono {
  font-family: 'Space Grotesk', ui-monospace, monospace;
  font-size: 0.8rem;
}

/* ── Sanction context ────────────────────────────────────── */
.sanction-context-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
}

.sanction-context-block--warning {
  border-color: rgba(242, 139, 91, 0.22);
  background: rgba(242, 139, 91, 0.1);
}

.sanction-context-block--temporaryBan {
  border-color: rgba(80, 120, 238, 0.22);
  background: rgba(80, 120, 238, 0.1);
}

.sanction-context-block--permanentBan {
  border-color: rgba(225, 91, 91, 0.22);
  background: rgba(225, 91, 91, 0.1);
}

.sanction-context-block--mute {
  border-color: rgba(128, 90, 213, 0.24);
  background: rgba(128, 90, 213, 0.12);
}

.sanction-context-block__icon {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.sanction-context-block--temporaryBan .sanction-context-block__icon {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.sanction-context-block--permanentBan .sanction-context-block__icon {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.24);
}

.sanction-context-block--mute .sanction-context-block__icon {
  color: #c7a6ff;
  background: rgba(128, 90, 213, 0.16);
  border-color: rgba(128, 90, 213, 0.28);
}

.sanction-context-block__type {
  display: block;
  color: var(--color-cream);
  font-size: 0.96rem;
  font-weight: 900;
}

.sanction-context-block__desc {
  margin: 0.3rem 0 0;
  color: rgba(252, 239, 225, 0.64);
  font-size: 0.86rem;
  line-height: 1.55;
}

/* ── Appealed action ─────────────────────────────────────── */
.appealed-action-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.1), transparent 38%),
    rgba(18, 24, 38, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appealed-action-card--warning {
  border-color: rgba(242, 139, 91, 0.22);
}

.appealed-action-card--temporaryBan {
  border-color: rgba(80, 120, 238, 0.22);
}

.appealed-action-card--permanentBan {
  border-color: rgba(225, 91, 91, 0.22);
}

.appealed-action-card--mute {
  border-color: rgba(128, 90, 213, 0.24);
}

.appealed-action-card__main {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.appealed-action-card__icon {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.appealed-action-card__eyebrow {
  display: block;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.appealed-action-card__title {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-cream);
  font-size: 1rem;
  font-weight: 900;
}

.appealed-action-card__desc {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.64);
  font-size: 0.88rem;
  line-height: 1.55;
}

.appealed-action-card__facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.appealed-action-card__fact {
  padding: 0.75rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
  min-width: 0;
}

.appealed-action-card__fact span {
  display: block;
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.appealed-action-card__fact strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-cream);
  font-size: 0.82rem;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appealed-action-details {
  padding: 0.95rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
}

.appealed-action-details__title {
  margin-bottom: 0.7rem;
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.appealed-action-details__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.appealed-action-details__list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.appealed-action-details__list li span {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 900;
}

.appealed-action-details__list li p {
  margin: 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.86rem;
  line-height: 1.5;
}

/* ── Appeal timeline ─────────────────────────────────────── */
.appeal-timeline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: center;
  gap: 0.4rem;
}

.appeal-timeline__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
}

.appeal-timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  margin-top: 0.3rem;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}

.appeal-timeline__item strong {
  display: block;
  color: var(--color-cream);
  font-size: 0.76rem;
  font-weight: 900;
}

.appeal-timeline__item p {
  margin: 0.18rem 0 0;
  color: rgba(252, 239, 225, 0.54);
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appeal-timeline__line {
  height: 1px;
  background: rgba(252, 239, 225, 0.14);
}

/* ── Appeal message / decision note ──────────────────────── */
.appeal-message {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
}

.appeal-message p {
  margin: 0;
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.95rem;
  line-height: 1.65;
}

.decision-note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.95rem;
  border-radius: 16px;
  color: rgba(252, 239, 225, 0.78);
}

.decision-note svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.decision-note p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
}

.decision-note--accepted {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.12);
  border: 1px solid rgba(61, 191, 125, 0.3);
}

.decision-note--rejected {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.12);
  border: 1px solid rgba(225, 91, 91, 0.3);
}

.decision-note--needsInfo {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.12);
  border: 1px solid rgba(242, 139, 91, 0.3);
}

/* ── Decision form / buttons ─────────────────────────────── */
.decision-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.decision-form__label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.1);
  border: 1px solid rgba(242, 139, 91, 0.22);
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.decision-form__hint {
  margin: 0;
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.78rem;
  line-height: 1.45;
}

.decision-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.decision-btn {
  justify-content: flex-start;
  gap: 0.75rem;
  min-height: 78px;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  text-align: left;
}

.decision-btn svg {
  width: 24px;
  height: 24px;
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
  font-weight: 900;
}

.decision-btn em {
  margin-top: 0.18rem;
  font-style: normal;
  font-size: 0.74rem;
  line-height: 1.35;
  opacity: 0.8;
}

.decision-btn--info {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.decision-btn--info:hover {
  color: #c6d6ff;
  background: rgba(80, 120, 238, 0.2);
  border-color: rgba(80, 120, 238, 0.42);
}

.decision-btn--reject {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.32);
}

.decision-btn--reject:hover {
  color: #ffd0d0;
  background: rgba(225, 91, 91, 0.22);
  border-color: rgba(225, 91, 91, 0.46);
}

.decision-btn--accept {
  color: var(--color-navy);
  background: linear-gradient(135deg, #7ee0ad, #3dbf7d);
  border-color: rgba(61, 191, 125, 0.42);
  box-shadow: 0 16px 30px -20px rgba(61, 191, 125, 0.7);
}

.decision-btn--accept:hover {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(61, 191, 125, 0.85);
}

/* ── Outcome block ───────────────────────────────────────── */
.outcome-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
}

.outcome-block--accepted {
  background: rgba(61, 191, 125, 0.12);
  border: 1px solid rgba(61, 191, 125, 0.3);
}

.outcome-block--rejected {
  background: rgba(225, 91, 91, 0.12);
  border: 1px solid rgba(225, 91, 91, 0.3);
}

.outcome-block__icon {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.24);
}

.outcome-block--rejected .outcome-block__icon {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.24);
}

.outcome-block__title {
  display: block;
  color: var(--color-cream);
  font-size: 0.96rem;
  font-weight: 900;
}

.outcome-block__text {
  margin: 0.3rem 0 0;
  color: rgba(252, 239, 225, 0.64);
  font-size: 0.86rem;
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

  .stat-grid--appeals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar--appeals {
    grid-template-columns: 1fr;
  }

  .modal__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .appealed-action-card__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .decision-actions {
    grid-template-columns: 1fr;
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

  .surface-header__meta {
    justify-content: flex-start;
  }

  .btn,
  .modal__close-btn {
    width: 100%;
  }

  .status-chip {
    flex: 1 1 calc(50% - 0.45rem);
    justify-content: center;
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

  .sanction-context-block,
  .appealed-action-card__main,
  .outcome-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .appeal-timeline {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .appeal-timeline__line {
    display: none;
  }

  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(40px);
  }
}

@media (max-width: 520px) {
  .stat-grid--appeals,
  .appealed-action-card__facts {
    grid-template-columns: 1fr;
  }

  .status-chip {
    flex-basis: 100%;
  }

  .summary-card__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .summary-card__preview {
    -webkit-line-clamp: 3;
  }

  .hero-side__chips span {
    width: 100%;
    justify-content: center;
  }

  .modal__block-header {
    flex-wrap: wrap;
  }

  .needs-info-badge,
  .decision-status-badge {
    margin-left: 0;
  }
}
</style>
