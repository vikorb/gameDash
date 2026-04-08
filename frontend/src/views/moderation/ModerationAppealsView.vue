<template>
  <section class="moderation-page">
    <div class="page-shell">
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

      <section class="surface">
        <div class="surface-header surface-header--appeals">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.appeals.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.appeals.list.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span class="meta-item">
              {{ sortedAppeals.length }} {{ t('moderation.pages.common.results') }}
            </span>

            <span v-if="activeFilterCount > 0" class="meta-item">
              {{ t('moderation.pages.appeals.list.filtered', { count: activeFilterCount }) }}
            </span>
          </div>
        </div>

        <div class="toolbar toolbar--appeals">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.appeals.filters.search')"
          />

          <select v-model="selectedStatus" class="select">
            <option v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSanctionType" class="select">
            <option v-for="item in sanctionTypeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSort" class="select">
            <option v-for="item in sortOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div class="surface-header__chips">
          <span class="meta-item">
            {{ t('moderation.appealStatuses.pending') }} · {{ pendingCount }}
          </span>
          <span class="meta-item">
            {{ t('moderation.appealStatuses.needsInfo') }} · {{ needsInfoCount }}
          </span>
          <span class="meta-item">
            {{ t('moderation.appealStatuses.accepted') }} · {{ acceptedCount }}
          </span>
          <span class="meta-item">
            {{ t('moderation.appealStatuses.rejected') }} · {{ rejectedCount }}
          </span>
        </div>

        <div v-if="sortedAppeals.length" class="list-grid">
          <article v-for="appeal in sortedAppeals" :key="appeal.id" class="moderation-card">
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ appeal.targetName }}</h3>
                <div class="card-subtitle">
                  {{ t('moderation.pages.appeals.card.sanction') }}
                  {{ getSanctionTypeLabel(appeal.sanctionType) }}
                </div>
              </div>

              <div class="card-top__end">
                <span class="meta-item">{{ appeal.id }}</span>
                <span class="meta-item">{{ formatDate(appeal.submittedAt) }}</span>
              </div>
            </div>

            <div class="card-pills">
              <span :class="['pill', `pill--${appeal.status}`]">
                {{ getAppealStatusLabel(appeal.status) }}
              </span>

              <span class="meta-item">
                {{ getSanctionTypeLabel(appeal.sanctionType) }}
              </span>
            </div>

            <p class="card-text">{{ appeal.message }}</p>

            <div class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.appeals.card.submittedAt') }}
                {{ formatDate(appeal.submittedAt) }}
              </span>

              <span v-if="appeal.decisionNote" class="meta-item">
                {{ t('moderation.pages.appeals.card.note') }} {{ appeal.decisionNote }}
              </span>
            </div>

            <div v-if="isActionable(appeal.status)" class="card-actions appeal-card__actions">
              <button
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="moderationStore.requestAppealInfo(appeal.id, 'POC Admin')"
              >
                {{ t('moderation.pages.appeals.actions.requestInfo') }}
              </button>

              <button
                type="button"
                class="btn-inline btn-inline--danger"
                @click="moderationStore.rejectAppeal(appeal.id, 'POC Admin')"
              >
                {{ t('moderation.pages.appeals.actions.reject') }}
              </button>

              <button
                type="button"
                class="btn-inline btn-inline--primary"
                @click="moderationStore.acceptAppeal(appeal.id, 'POC Admin')"
              >
                {{ t('moderation.pages.appeals.actions.accept') }}
              </button>
            </div>

            <div v-else class="appeal-card__footer">
              <span class="meta-item">
                {{ t('moderation.pages.appeals.card.decisionLabel') }}
                {{ getAppealStatusLabel(appeal.status) }}
              </span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.appeals.emptyText') }}</p>
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
  type ModerationAppeal,
  type ModerationAppealStatus,
  type ModerationSanctionType,
  useModerationAppealsStore,
} from '@/stores/moderation'

useModerationAccess()

const router = useRouter()
const moderationStore = useModerationAppealsStore()
const { appeals, appealSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

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
  const query = search.value.trim().toLowerCase()

  return appeals.value.filter((item) => {
    const matchesQuery =
      query === '' ||
      item.id.toLowerCase().includes(query) ||
      item.targetName.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query) ||
      item.decisionNote.toLowerCase().includes(query)

    const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
    const matchesSanctionType =
      selectedSanctionType.value === 'all' || item.sanctionType === selectedSanctionType.value

    return matchesQuery && matchesStatus && matchesSanctionType
  })
})

const sortedAppeals = computed(() => {
  const items = [...filteredAppeals.value]

  items.sort((a, b) => compareAppeals(a, b, selectedSort.value))

  return items
})

const pendingCount = computed(
  () => appeals.value.filter((item) => item.status === 'pending').length,
)
const needsInfoCount = computed(
  () => appeals.value.filter((item) => item.status === 'needsInfo').length,
)
const acceptedCount = computed(
  () => appeals.value.filter((item) => item.status === 'accepted').length,
)
const rejectedCount = computed(
  () => appeals.value.filter((item) => item.status === 'rejected').length,
)
const decidedCount = computed(() => acceptedCount.value + rejectedCount.value)

const activeFilterCount = computed(() => {
  let count = 0

  if (search.value.trim() !== '') count += 1
  if (selectedStatus.value !== 'all') count += 1
  if (selectedSanctionType.value !== 'all') count += 1
  if (selectedSort.value !== 'pendingFirst') count += 1

  return count
})

function compareAppeals(
  first: ModerationAppeal,
  second: ModerationAppeal,
  sortMode: 'submittedDesc' | 'submittedAsc' | 'pendingFirst',
) {
  const firstDate = new Date(first.submittedAt).getTime()
  const secondDate = new Date(second.submittedAt).getTime()

  if (sortMode === 'submittedAsc') {
    return firstDate - secondDate
  }

  if (sortMode === 'submittedDesc') {
    return secondDate - firstDate
  }

  const firstPriority = getAppealPriority(first.status)
  const secondPriority = getAppealPriority(second.status)

  if (firstPriority !== secondPriority) {
    return firstPriority - secondPriority
  }

  return secondDate - firstDate
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.stat-grid--appeals {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.surface-header--appeals {
  align-items: flex-start;
}

.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.surface-header__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.toolbar--appeals {
  grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(180px, 0.6fr));
}

.card-top__end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.55rem;
}

.appeal-card__actions {
  justify-content: flex-start;
}

.appeal-card__footer {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

@media (max-width: 1180px) {
  .stat-grid--appeals,
  .toolbar--appeals {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .card-top__end {
    align-items: flex-start;
  }
}
</style>
