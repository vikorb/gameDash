<template>
  <section class="moderation-page">
    <div class="page-shell">
      <!-- ─── Hero ─────────────────────────────────────────────────────── -->
      <header class="page-hero">
        <div class="page-hero__main">
          <div>
            <span class="page-badge">{{ t('moderation.pages.content.badge') }}</span>
            <h1 class="page-title">{{ t('moderation.pages.content.title') }}</h1>
            <p class="page-subtitle">{{ t('moderation.pages.content.subtitle') }}</p>
          </div>

          <div class="audit-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToModeration">
              {{ t('moderation.pages.content.actions.backToModeration') }}
            </button>
            <button type="button" class="btn btn--ghost" @click="resetFilters">
              {{ t('moderation.pages.content.actions.resetFilters') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('moderation.pages.content.side.label') }}</div>
            <div class="hero-side__title">{{ t('moderation.pages.content.side.title') }}</div>
            <p class="hero-side__text">{{ t('moderation.pages.content.side.text') }}</p>
          </div>
          <div class="hero-side__chips">
            <span>{{ t('moderation.pages.content.side.chips.visibility') }}</span>
            <span>{{ t('moderation.pages.content.side.chips.review') }}</span>
            <span>{{ t('moderation.pages.content.side.chips.quickActions') }}</span>
          </div>
        </aside>
      </header>

      <!-- ─── Stats ─────────────────────────────────────────────────────── -->
      <section class="stat-grid content-stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.total') }}</span>
          <strong class="stat-card__value">{{ contentSummary.total }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.totalCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.actionable') }}</span>
          <strong class="stat-card__value">{{ contentSummary.actionableCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.actionableCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.review') }}</span>
          <strong class="stat-card__value">{{ contentSummary.reviewCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.reviewCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderation.pages.content.stats.hidden') }}</span>
          <strong class="stat-card__value">{{ contentSummary.hiddenCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.hiddenCaption') }}
          </div>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{
            t('moderation.pages.content.stats.highPriority')
          }}</span>
          <strong class="stat-card__value">{{ contentSummary.highPriorityCount }}</strong>
          <div class="stat-card__caption">
            {{ t('moderation.pages.content.stats.highPriorityCaption') }}
          </div>
        </article>
      </section>

      <!-- ─── List + toolbar ───────────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('moderation.pages.content.list.title') }}</h2>
            <p class="surface-subtitle">{{ t('moderation.pages.content.list.subtitle') }}</p>
          </div>
          <div class="surface-header__meta">
            <span class="meta-item"
              >{{ filteredContent.length }} {{ t('moderation.pages.common.results') }}</span
            >
            <span class="meta-item meta-item--subtle">{{
              t('moderation.pages.content.list.filtered', { count: activeFilterCount })
            }}</span>
          </div>
        </div>

        <div class="toolbar content-toolbar">
          <input
            v-model="search"
            class="field"
            :placeholder="t('moderation.pages.content.filters.search')"
          />
          <select v-model="selectedStatus" class="select">
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedType" class="select">
            <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-model="selectedSeverity" class="select">
            <option v-for="o in severityOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="selectedOrigin" class="select">
            <option v-for="o in originOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <select v-model="sortBy" class="select">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>

        <!-- ─── Summary cards ─────────────────────────────────────────── -->
        <div v-if="filteredContent.length" class="summary-list">
          <button
            v-for="item in filteredContent"
            :key="item.id"
            type="button"
            class="summary-card"
            :class="[
              `summary-card--${item.severity}`,
              item.status === 'hidden' ? 'summary-card--dimmed' : '',
            ]"
            @click="openModal(item)"
          >
            <!-- Left: type icon + id -->
            <div class="summary-card__icon" :class="`summary-card__icon--${item.type}`">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="getTypeIcon(item.type)" />
              </svg>
            </div>

            <!-- Center: main info -->
            <div class="summary-card__body">
              <div class="summary-card__head">
                <span class="summary-card__id">#{{ item.id }}</span>
                <strong class="summary-card__title">{{ item.title }}</strong>
              </div>

              <div class="summary-card__meta">
                <span class="summary-card__author">{{ item.authorName }}</span>
                <span class="summary-card__dot">·</span>
                <span class="summary-card__date">{{ formatDate(item.updatedAt) }}</span>
              </div>

              <div class="summary-card__pills">
                <span :class="['pill', `pill--${item.severity}`]">{{
                  getSeverityLabel(item.severity)
                }}</span>
                <span :class="['pill', `pill--${item.status}`]">{{
                  getContentStatusLabel(item.status)
                }}</span>
                <span class="meta-item">{{ getContentTypeLabel(item.type) }}</span>
                <template v-if="item.tags.length">
                  <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="tag-item"
                    >#{{ tag }}</span
                  >
                  <span v-if="item.tags.length > 2" class="tag-more"
                    >+{{ item.tags.length - 2 }}</span
                  >
                </template>
              </div>
            </div>

            <!-- Right: signals + chevron -->
            <div class="summary-card__signals">
              <div class="signal-badge signal-badge--flags">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiFlagOutline" /></svg>
                <span>{{ item.flagCount }}</span>
              </div>
              <div class="signal-badge signal-badge--reports">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="mdiAlertCircleOutline" />
                </svg>
                <span>{{ item.reportsCount }}</span>
              </div>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiChevronRight" />
              </svg>
            </div>
          </button>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('moderation.pages.content.emptyText') }}</p>
        </div>
      </section>
    </div>

    <!-- ─── Detail modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selected" class="modal-backdrop" @click.self="closeModal">
          <div class="modal" role="dialog" aria-modal="true" :aria-label="selected.title">
            <!-- Modal header -->
            <div class="modal__header" :class="`modal__header--${selected.severity}`">
              <div class="modal__header-left">
                <div class="modal__type-icon" :class="`modal__type-icon--${selected.type}`">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="getTypeIcon(selected.type)" />
                  </svg>
                </div>
                <div>
                  <div class="modal__id">
                    #{{ selected.id }} · {{ getContentTypeLabel(selected.type) }}
                  </div>
                  <h2 class="modal__title">{{ selected.title }}</h2>
                  <div class="modal__author">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="mdiAccountOutline" />
                    </svg>
                    {{ selected.authorName }}
                  </div>
                </div>
              </div>

              <div class="modal__header-right">
                <span :class="['pill', `pill--${selected.severity}`]">{{
                  getSeverityLabel(selected.severity)
                }}</span>
                <span :class="['pill', `pill--${selected.status}`]">{{
                  getContentStatusLabel(selected.status)
                }}</span>
                <button type="button" class="modal__close" @click="closeModal" aria-label="Fermer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
                </button>
              </div>
            </div>

            <!-- Modal body -->
            <div class="modal__body">
              <!-- Map link — toujours visible, label adapté selon le type -->
              <div class="map-link-block">
                <div class="map-link-block__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="mdiMapMarkerOutline" />
                  </svg>
                </div>
                <div class="map-link-block__content">
                  <span class="map-link-block__label">
                    {{
                      selected.type === 'map'
                        ? t('moderation.pages.content.modal.mapLabel')
                        : t('moderation.pages.content.modal.mapLabelParent')
                    }}
                  </span>
                  <strong class="map-link-block__name">{{ getMapName(selected) }}</strong>
                </div>
                <a
                  :href="getMapUrl(selected)"
                  class="map-link-block__cta"
                  target="_blank"
                  rel="noopener"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiOpenInNew" /></svg>
                  {{ t('moderation.pages.content.modal.viewMap') }}
                </a>
              </div>

              <!-- Preview -->
              <div class="modal__section">
                <div class="modal__section-label">
                  {{ t('moderation.pages.content.modal.preview') }}
                </div>
                <p class="modal__preview">{{ selected.preview }}</p>
              </div>

              <!-- Meta grid -->
              <div class="modal__meta-grid">
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.card.category')
                  }}</span>
                  <strong class="modal__meta-value">{{ selected.category }}</strong>
                </div>
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.modal.origin')
                  }}</span>
                  <strong class="modal__meta-value">{{
                    getContentOriginLabel(selected.origin)
                  }}</strong>
                </div>
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.card.flags')
                  }}</span>
                  <strong class="modal__meta-value modal__meta-value--alert">{{
                    selected.flagCount
                  }}</strong>
                </div>
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.card.reports')
                  }}</span>
                  <strong class="modal__meta-value modal__meta-value--alert">{{
                    selected.reportsCount
                  }}</strong>
                </div>
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.modal.created')
                  }}</span>
                  <strong class="modal__meta-value">{{ formatDate(selected.createdAt) }}</strong>
                </div>
                <div class="modal__meta-item">
                  <span class="modal__meta-label">{{
                    t('moderation.pages.content.modal.updated')
                  }}</span>
                  <strong class="modal__meta-value">{{ formatDate(selected.updatedAt) }}</strong>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="selected.tags.length" class="modal__section">
                <div class="modal__section-label">
                  {{ t('moderation.pages.content.modal.tags') }}
                </div>
                <div class="modal__tags">
                  <span v-for="tag in selected.tags" :key="tag" class="tag-item">#{{ tag }}</span>
                </div>
              </div>

              <!-- Moderation note -->
              <div v-if="selected.moderationNote" class="modal__section">
                <div class="modal__section-label">
                  {{ t('moderation.pages.content.card.note') }}
                </div>
                <div class="modal__note">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiNoteTextOutline" /></svg>
                  <p>{{ selected.moderationNote }}</p>
                </div>
              </div>

              <!-- Last action -->
              <div class="modal__last-action">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClockOutline" /></svg>
                <span
                  >{{ t('moderation.pages.content.card.lastAction') }}
                  {{ formatLastAction(selected) }}</span
                >
              </div>
            </div>

            <!-- Modal footer / actions -->
            <div class="modal__footer">
              <div class="modal__footer-hint">
                {{ t('moderation.pages.content.modal.actionsHint') }}
              </div>

              <div class="modal__actions">
                <button
                  type="button"
                  class="modal-btn modal-btn--secondary"
                  :disabled="selected.status === 'review'"
                  @click="doReview"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiEyeOutline" /></svg>
                  {{
                    selected.status === 'review'
                      ? t('moderation.pages.content.actions.inReview')
                      : t('moderation.pages.content.actions.review')
                  }}
                </button>

                <button
                  type="button"
                  :class="[
                    'modal-btn',
                    isHiddenOrRestricted(selected) ? 'modal-btn--restore' : 'modal-btn--danger',
                  ]"
                  @click="doVisibility"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="isHiddenOrRestricted(selected) ? mdiEyeOutline : mdiEyeOffOutline" />
                  </svg>
                  {{ getVisibilityActionLabel(selected.status) }}
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
  mdiAccountOutline,
  mdiAlertCircleOutline,
  mdiChevronRight,
  mdiClockOutline,
  mdiClose,
  mdiCommentOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiFlagOutline,
  mdiImageOutline,
  mdiMapMarkerOutline,
  mdiNoteTextOutline,
  mdiOpenInNew,
  mdiPuzzleOutline,
  mdiShieldSearch,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationContentItem,
  type ModerationContentOrigin,
  type ModerationContentStatus,
  type ModerationContentType,
  type ModerationSeverity,
  useModerationContentStore,
} from '@/stores/moderation'

useModerationAccess()

type ContentSortOption = 'updatedDesc' | 'createdDesc' | 'flagsDesc' | 'severityDesc'

const router = useRouter()
const moderationStore = useModerationContentStore()
const { contentItems, contentSummary } = storeToRefs(moderationStore)
const { t, locale } = useI18n({ useScope: 'global' })

onMounted(() => {
  void moderationStore.fetchContentItems()
})

// ─── Modal state ────────────────────────────────────────────────────────────
const selected = ref<ModerationContentItem | null>(null)

function openModal(item: ModerationContentItem) {
  selected.value = item
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selected.value = null
  document.body.style.overflow = ''
}

function syncSelectedFromStore() {
  if (selected.value) {
    const fresh = contentItems.value.find((i) => i.id === selected.value!.id)
    if (fresh) selected.value = fresh
  }
}

async function doReview() {
  if (!selected.value) return
  await moderationStore.markContentForReview(selected.value.id, 'POC Admin')
  syncSelectedFromStore()
}

async function doVisibility() {
  if (!selected.value) return
  if (isHiddenOrRestricted(selected.value)) {
    await moderationStore.restoreContent(selected.value.id, 'POC Admin')
  } else {
    await moderationStore.hideContent(selected.value.id, 'POC Admin')
  }
  syncSelectedFromStore()
}

function isHiddenOrRestricted(item: ModerationContentItem) {
  return item.status === 'hidden' || item.status === 'restricted'
}

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selected.value) closeModal()
}
window.addEventListener('keydown', onKeydown)
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// ─── Filters ────────────────────────────────────────────────────────────────
const search = ref('')
const selectedStatus = ref<'all' | ModerationContentStatus>('all')
const selectedType = ref<'all' | ModerationContentType>('all')
const selectedSeverity = ref<'all' | ModerationSeverity>('all')
const selectedOrigin = ref<'all' | ModerationContentOrigin>('all')
const sortBy = ref<ContentSortOption>('updatedDesc')

const severityOrder: Record<ModerationSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

const statusOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allStatuses') },
  { value: 'visible', label: t('moderation.contentStatuses.visible') },
  { value: 'hidden', label: t('moderation.contentStatuses.hidden') },
  { value: 'review', label: t('moderation.contentStatuses.review') },
  { value: 'restricted', label: t('moderation.contentStatuses.restricted') },
])

const typeOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.common.filters.allTypes') },
  { value: 'map', label: t('moderation.contentTypes.map') },
  { value: 'hunt', label: t('moderation.contentTypes.hunt') },
  { value: 'comment', label: t('moderation.contentTypes.comment') },
  { value: 'asset', label: t('moderation.contentTypes.asset') },
])

const severityOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.content.filters.allSeverities') },
  { value: 'low', label: t('moderation.severities.low') },
  { value: 'medium', label: t('moderation.severities.medium') },
  { value: 'high', label: t('moderation.severities.high') },
  { value: 'critical', label: t('moderation.severities.critical') },
])

const originOptions = computed(() => [
  { value: 'all', label: t('moderation.pages.content.filters.allOrigins') },
  { value: 'community', label: t('moderation.contentOrigins.community') },
  { value: 'automated', label: t('moderation.contentOrigins.automated') },
  { value: 'internal', label: t('moderation.contentOrigins.internal') },
])

const sortOptions = computed(() => [
  { value: 'updatedDesc', label: t('moderation.pages.content.filters.sortUpdatedDesc') },
  { value: 'createdDesc', label: t('moderation.pages.content.filters.sortCreatedDesc') },
  { value: 'flagsDesc', label: t('moderation.pages.content.filters.sortFlagsDesc') },
  { value: 'severityDesc', label: t('moderation.pages.content.filters.sortSeverityDesc') },
])

const activeFilterCount = computed(
  () =>
    [
      search.value.trim() !== '',
      selectedStatus.value !== 'all',
      selectedType.value !== 'all',
      selectedSeverity.value !== 'all',
      selectedOrigin.value !== 'all',
      sortBy.value !== 'updatedDesc',
    ].filter(Boolean).length,
)

const filteredContent = computed(() =>
  contentItems.value
    .filter((item) => {
      const q = search.value.trim().toLowerCase()
      const matchesQuery =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q) ||
        item.moderationNote.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))

      return (
        matchesQuery &&
        (selectedStatus.value === 'all' || item.status === selectedStatus.value) &&
        (selectedType.value === 'all' || item.type === selectedType.value) &&
        (selectedSeverity.value === 'all' || item.severity === selectedSeverity.value) &&
        (selectedOrigin.value === 'all' || item.origin === selectedOrigin.value)
      )
    })
    .slice()
    .sort((a, b) => {
      switch (sortBy.value) {
        case 'createdDesc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'flagsDesc':
          return b.flagCount !== a.flagCount
            ? b.flagCount - a.flagCount
            : b.reportsCount - a.reportsCount
        case 'severityDesc':
          return severityOrder[b.severity] !== severityOrder[a.severity]
            ? severityOrder[b.severity] - severityOrder[a.severity]
            : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    }),
)

// ─── Helpers ────────────────────────────────────────────────────────────────
function resetFilters() {
  search.value = ''
  selectedStatus.value = 'all'
  selectedType.value = 'all'
  selectedSeverity.value = 'all'
  selectedOrigin.value = 'all'
  sortBy.value = 'updatedDesc'
}

function goBackToModeration() {
  router.push('/moderation')
}

function getMapUrl(item: ModerationContentItem) {
  // type === 'map' : le contenu EST la map → lien direct
  if (item.type === 'map') return `/maps/${item.id}`

  // Autres types (comment, asset, hunt) : le contenu appartient à une map parente.
  // On essaie d'abord le champ mapId si le store l'expose, puis on extrait du titre.
  const asAny = item as Record<string, unknown>
  if (typeof asAny['mapId'] === 'number' || typeof asAny['mapId'] === 'string') {
    return `/maps/${asAny['mapId']}`
  }

  // Fallback : parse "#N" dans le titre (ex. "Commentaire sous une carte #15" → /maps/map-15)
  const match = item.title.match(/#(\d+)/)
  if (match) return `/maps/map-${match[1]}`

  // Dernier recours
  return `/maps?ref=${item.id}`
}

function getMapName(item: ModerationContentItem) {
  if (item.type === 'map') return item.title

  const asAny = item as Record<string, unknown>
  if (typeof asAny['mapTitle'] === 'string') return asAny['mapTitle'] as string

  const match = item.title.match(/#(\d+)/)
  if (match) return `Map #${match[1]}`

  return `Map liée au contenu #${item.id}`
}

function getTypeIcon(type: ModerationContentType) {
  switch (type) {
    case 'map':
      return mdiMapMarkerOutline
    case 'comment':
      return mdiCommentOutline
    case 'asset':
      return mdiImageOutline
    case 'hunt':
      return mdiPuzzleOutline
    default:
      return mdiShieldSearch
  }
}

function getContentStatusLabel(status: ModerationContentStatus) {
  return t(`moderation.contentStatuses.${status}`)
}

function getContentTypeLabel(type: ModerationContentType) {
  return t(`moderation.contentTypes.${type}`)
}

function getContentOriginLabel(origin: ModerationContentOrigin) {
  return t(`moderation.contentOrigins.${origin}`)
}

function getSeverityLabel(severity: ModerationSeverity) {
  return t(`moderation.severities.${severity}`)
}

function getVisibilityActionLabel(status: ModerationContentStatus) {
  return isHiddenOrRestricted({ status } as ModerationContentItem)
    ? t('moderation.pages.content.actions.restore')
    : t('moderation.pages.content.actions.hide')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatLastAction(item: ModerationContentItem) {
  if (!item.lastActionAt) return t('moderation.pages.content.card.lastActionFallback')
  return t('moderation.pages.content.card.lastActionValue', {
    actor: item.lastActionBy ?? 'Administration',
    date: formatDate(item.lastActionAt),
  })
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

.page-hero__main {
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
.modal-btn {
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
.modal-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.modal-btn:disabled {
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

.btn--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled) {
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

.content-stat-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
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

.surface-header__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.toolbar {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 12px;
}

.content-toolbar {
  grid-template-columns:
    minmax(0, 1.4fr)
    minmax(145px, 0.5fr)
    minmax(145px, 0.5fr)
    minmax(145px, 0.5fr)
    minmax(145px, 0.5fr)
    minmax(160px, 0.55fr);
}

.field,
.select {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.85rem 0.95rem;
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

.field::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field:hover,
.select:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field:focus,
.select:focus {
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
.tag-item,
.tag-more {
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

.meta-item--subtle {
  color: rgba(252, 239, 225, 0.56);
}

.tag-item,
.tag-more {
  color: rgba(252, 239, 225, 0.72);
  background: rgba(18, 24, 38, 0.3);
}

.pill--visible {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.pill--review {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.pill--hidden,
.pill--restricted {
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
.map-link-block__icon {
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
.map-link-block__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.summary-card__icon--map,
.modal__type-icon--map,
.map-link-block__icon {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.24);
}

.summary-card__icon--comment,
.modal__type-icon--comment {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.summary-card__icon--asset,
.modal__type-icon--asset {
  color: #c7a6ff;
  background: rgba(128, 90, 213, 0.16);
  border-color: rgba(128, 90, 213, 0.28);
}

.summary-card__icon--hunt,
.modal__type-icon--hunt {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.24);
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
  font-family: 'Space Grotesk', monospace;
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

.summary-card__author,
.summary-card__date {
  display: inline-flex;
  align-items: center;
}

.summary-card__dot {
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

.signal-badge--flags {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.signal-badge--reports {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
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
  max-width: 760px;
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
  font-family: 'Space Grotesk', monospace;
}

.modal__title {
  margin: 0.25rem 0 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1.2;
}

.modal__author {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.86rem;
}

.modal__author svg {
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

/* ── Map link ────────────────────────────────────────────── */
.map-link-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(242, 139, 91, 0.24);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.14), transparent 38%),
    rgba(18, 24, 38, 0.32);
}

.map-link-block__content {
  flex: 1;
  min-width: 0;
}

.map-link-block__label {
  display: block;
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.map-link-block__name {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-cream);
  font-size: 0.95rem;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-link-block__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 38px;
  padding: 0.6rem 0.9rem;
  border-radius: 14px;
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  font-size: 0.84rem;
  font-weight: 900;
  text-decoration: none;
  flex-shrink: 0;
  transition:
    transform 0.16s ease,
    filter 0.16s ease,
    box-shadow 0.16s ease;
  box-shadow: 0 14px 28px -20px rgba(242, 139, 91, 0.95);
}

.map-link-block__cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.map-link-block__cta svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

/* ── Modal sections ─────────────────────────────────────── */
.modal__section {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
}

.modal__section-label {
  margin-bottom: 0.55rem;
  color: var(--color-primary-strong);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
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

.modal__meta-value--alert {
  color: #ffb3b3;
}

.modal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

/* ── Note / last action ──────────────────────────────────── */
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

.modal__last-action {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.85rem 0.95rem;
  border-radius: 16px;
  border: 1px dashed rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.24);
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.82rem;
  line-height: 1.45;
}

.modal__last-action svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ── Modal footer / actions ──────────────────────────────── */
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

.modal-btn svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.modal-btn--secondary {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.modal-btn--secondary:hover:not(:disabled) {
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

.modal-btn--restore {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.32);
}

.modal-btn--restore:hover:not(:disabled) {
  color: #9af0c3;
  background: rgba(61, 191, 125, 0.2);
  border-color: rgba(61, 191, 125, 0.46);
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
@media (max-width: 1280px) {
  .content-stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .content-toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .content-toolbar .field {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1180px) {
  .page-hero {
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

  .surface-header__meta {
    justify-content: flex-start;
  }

  .btn,
  .modal-btn,
  .map-link-block__cta {
    width: 100%;
  }

  .content-stat-grid,
  .content-toolbar {
    grid-template-columns: 1fr;
  }

  .content-toolbar .field {
    grid-column: auto;
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

  .map-link-block {
    flex-direction: column;
    align-items: stretch;
  }

  .map-link-block__icon {
    width: 48px;
    height: 48px;
  }

  .modal__actions {
    width: 100%;
    justify-content: stretch;
  }

  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(40px);
  }
}

@media (max-width: 520px) {
  .content-stat-grid {
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
