<template>
  <section class="moderation-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('moderation.pages.appeals.badge') }}</span>
          <h1 class="page-title">{{ t('moderation.pages.appeals.title') }}</h1>
          <p class="page-subtitle">{{ t('moderation.pages.appeals.subtitle') }}</p>
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

      <section class="stat-grid">
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
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.appeals.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.appeals.list.subtitle') }}</p>
          </div>

          <span class="meta-item"
            >{{ filteredAppeals.length }} {{ t('moderation.pages.common.results') }}</span
          >
        </div>

        <div class="toolbar">
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

          <div />
        </div>

        <div v-if="filteredAppeals.length" class="list-grid">
          <article v-for="appeal in filteredAppeals" :key="appeal.id" class="moderation-card">
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ appeal.targetName }}</h3>
                <div class="card-subtitle">
                  {{ t('moderation.pages.appeals.card.sanction') }}
                  {{ getSanctionTypeLabel(appeal.sanctionType) }}
                </div>
              </div>

              <span class="meta-item">{{ formatDate(appeal.submittedAt) }}</span>
            </div>

            <div class="card-pills">
              <span :class="['pill', `pill--${appeal.status}`]">
                {{ getAppealStatusLabel(appeal.status) }}
              </span>
            </div>

            <p class="card-text">{{ appeal.message }}</p>

            <div v-if="appeal.decisionNote" class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.appeals.card.note') }} {{ appeal.decisionNote }}
              </span>
            </div>

            <div
              v-if="appeal.status === 'pending' || appeal.status === 'needsInfo'"
              class="card-actions"
            >
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

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationAppealStatus,
  type ModerationSanctionType,
  useModerationAppealsStore,
} from '@/stores/moderation'

useModerationAccess()

const moderationStore = useModerationAppealsStore()
const { appeals, appealSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedStatus = ref<'all' | ModerationAppealStatus>('all')

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'pending', label: t('moderation.appealStatuses.pending') },
  { value: 'accepted', label: t('moderation.appealStatuses.accepted') },
  { value: 'rejected', label: t('moderation.appealStatuses.rejected') },
  { value: 'needsInfo', label: t('moderation.appealStatuses.needsInfo') },
])

const filteredAppeals = computed(() => {
  const query = search.value.trim().toLowerCase()

  return appeals.value.filter((item) => {
    const matchesQuery =
      query === '' ||
      item.targetName.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query) ||
      item.decisionNote.toLowerCase().includes(query)

    const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value

    return matchesQuery && matchesStatus
  })
})

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
