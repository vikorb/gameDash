<template>
  <section class="moderation-page">
    <div class="page-shell">
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
          <span class="stat-card__label">
            {{ t('moderation.pages.sanctions.stats.expiringSoon') }}
          </span>
          <strong class="stat-card__value">{{ sanctionSummary.expiringSoonCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.sanctions.stats.expiringSoonCaption') }}
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.sanctions.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.sanctions.list.subtitle') }}</p>
          </div>

          <span class="meta-item">
            {{ displayedSanctions.length }} {{ t('moderation.pages.common.results') }}
          </span>
        </div>

        <div class="toolbar toolbar--sanctions">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.sanctions.filters.search')"
          />

          <select v-model="selectedStatus" class="select">
            <option v-for="item in statusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedType" class="select">
            <option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedScope" class="select">
            <option v-for="item in scopeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>

          <select v-model="selectedSort" class="select">
            <option v-for="item in sortOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <div v-if="displayedSanctions.length" class="list-grid">
          <article
            v-for="sanction in displayedSanctions"
            :key="sanction.id"
            class="moderation-card moderation-card--sanction"
          >
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ sanction.targetName }}</h3>
                <div class="card-subtitle">
                  {{ sanction.targetEmail || t('moderation.pages.common.noEndDate') }}
                </div>
              </div>

              <div class="card-top__end">
                <span :class="['pill', `pill--${sanction.status}`]">
                  {{ getSanctionStatusLabel(sanction.status) }}
                </span>

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

            <div class="card-pills">
              <span class="meta-item">{{ getSanctionTypeLabel(sanction.type) }}</span>
              <span class="meta-item">{{ getSanctionScopeLabel(sanction.scope) }}</span>
              <span :class="['pill', `pill--${sanction.severity}`]">
                {{ getSeverityLabel(sanction.severity) }}
              </span>
            </div>

            <p class="card-text">{{ sanction.summary }}</p>

            <div class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.reason') }} {{ sanction.reason }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.policy') }} {{ sanction.policyLabel }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.moderator') }} {{ sanction.createdBy }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.updated') }}
                {{ formatDate(sanction.lastUpdatedAt) }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.appeals') }} {{ sanction.appealCount }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.start') }} {{ formatDate(sanction.startAt) }}
              </span>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="btn-inline btn-inline--secondary"
                @click="openSanctionDetails(sanction.id)"
              >
                {{ t('moderation.pages.sanctions.actions.viewDetails') }}
              </button>

              <button
                v-if="sanction.status === 'draft'"
                type="button"
                class="btn-inline btn-inline--primary"
                @click="moderationStore.activateSanction(sanction.id, 'POC Admin')"
              >
                {{ t('moderation.pages.sanctions.actions.activate') }}
              </button>

              <button
                v-if="sanction.status === 'active'"
                type="button"
                class="btn-inline btn-inline--danger"
                @click="moderationStore.revokeSanction(sanction.id, 'POC Admin')"
              >
                {{ t('moderation.pages.sanctions.actions.revoke') }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.sanctions.emptyText') }}</p>
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
  const query = search.value.trim().toLowerCase()

  return sanctions.value
    .filter((item) => {
      const matchesQuery =
        query === '' ||
        item.targetName.toLowerCase().includes(query) ||
        (item.targetEmail ?? '').toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.createdBy.toLowerCase().includes(query) ||
        item.note.toLowerCase().includes(query) ||
        item.policyLabel.toLowerCase().includes(query)

      const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
      const matchesType = selectedType.value === 'all' || item.type === selectedType.value
      const matchesScope = selectedScope.value === 'all' || item.scope === selectedScope.value

      return matchesQuery && matchesStatus && matchesType && matchesScope
    })
    .slice()
    .sort((a, b) => {
      switch (selectedSort.value) {
        case 'endAsc': {
          const aTime = a.endAt ? new Date(a.endAt).getTime() : Number.POSITIVE_INFINITY
          const bTime = b.endAt ? new Date(b.endAt).getTime() : Number.POSITIVE_INFINITY
          return aTime - bTime
        }

        case 'severityDesc':
          return severityOrder[b.severity] - severityOrder[a.severity]

        case 'updatedDesc':
        default:
          return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
      }
    })
})

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

function openSanctionDetails(sanctionId: string) {
  router.push({ name: 'moderationSanctionDetail', params: { id: sanctionId } })
}

function getSanctionStatusLabel(status: ModerationSanctionStatus) {
  return t(`moderation.sanctionStatuses.${status}`)
}

function getSanctionTypeLabel(type: ModerationSanctionType) {
  return t(`moderation.sanctionTypes.${type}`)
}

function getSanctionScopeLabel(scope: ModerationSanctionScope) {
  return t(`moderation.sanctionScopes.${scope}`)
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
