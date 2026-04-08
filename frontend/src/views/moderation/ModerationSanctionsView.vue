<template>
  <section class="moderation-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('moderation.pages.sanctions.badge') }}</span>
          <h1 class="page-title">{{ t('moderation.pages.sanctions.title') }}</h1>
          <p class="page-subtitle">{{ t('moderation.pages.sanctions.subtitle') }}</p>
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
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.sanctions.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.sanctions.list.subtitle') }}</p>
          </div>

          <span class="meta-item"
            >{{ filteredSanctions.length }} {{ t('moderation.pages.common.results') }}</span
          >
        </div>

        <div class="toolbar">
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
        </div>

        <div v-if="filteredSanctions.length" class="list-grid">
          <article v-for="sanction in filteredSanctions" :key="sanction.id" class="moderation-card">
            <div class="card-top">
              <div>
                <h3 class="card-title">{{ sanction.targetName }}</h3>
                <div class="card-subtitle">
                  {{ t('moderation.pages.sanctions.card.moderator') }} {{ sanction.createdBy }}
                </div>
              </div>

              <span class="meta-item">
                {{
                  sanction.endAt
                    ? formatDate(sanction.endAt)
                    : t('moderation.pages.common.noEndDate')
                }}
              </span>
            </div>

            <div class="card-pills">
              <span :class="['pill', `pill--${sanction.status}`]">
                {{ getSanctionStatusLabel(sanction.status) }}
              </span>

              <span class="meta-item">{{ getSanctionTypeLabel(sanction.type) }}</span>
            </div>

            <p class="card-text">{{ sanction.note }}</p>

            <div class="card-meta">
              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.reason') }} {{ sanction.reason }}
              </span>

              <span class="meta-item">
                {{ t('moderation.pages.sanctions.card.start') }} {{ formatDate(sanction.startAt) }}
              </span>
            </div>

            <div class="card-actions">
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

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationSanctionStatus,
  type ModerationSanctionType,
  useModerationSanctionsStore,
} from '@/stores/moderation'

useModerationAccess()

const moderationStore = useModerationSanctionsStore()
const { sanctions, sanctionSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

const search = ref('')
const selectedStatus = ref<'all' | ModerationSanctionStatus>('all')
const selectedType = ref<'all' | ModerationSanctionType>('all')

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

const filteredSanctions = computed(() => {
  const query = search.value.trim().toLowerCase()

  return sanctions.value.filter((item) => {
    const matchesQuery =
      query === '' ||
      item.targetName.toLowerCase().includes(query) ||
      item.reason.toLowerCase().includes(query) ||
      item.createdBy.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query)

    const matchesStatus = selectedStatus.value === 'all' || item.status === selectedStatus.value
    const matchesType = selectedType.value === 'all' || item.type === selectedType.value

    return matchesQuery && matchesStatus && matchesType
  })
})

function getSanctionStatusLabel(status: ModerationSanctionStatus) {
  return t(`moderation.sanctionStatuses.${status}`)
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
