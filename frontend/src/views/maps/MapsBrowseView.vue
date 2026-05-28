<template>
  <main class="moderation-page maps-page">
    <div class="page-shell">
      <!-- Hero -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('maps.badge') }}</span>
          <h1 class="page-title">{{ t('maps.title') }}</h1>
          <p class="page-subtitle">{{ t('maps.subtitle') }}</p>

          <div class="audit-hero__actions">
            <RouterLink to="/maps/create" class="btn btn--primary maps-btn">
              <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                <path :d="mdiPlus" />
              </svg>
              {{ t('maps.actions.create') }}
            </RouterLink>
            <RouterLink to="/maps/mine" class="btn btn--ghost maps-btn">
              <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                <path :d="mdiChartTimelineVariant" />
              </svg>
              {{ t('maps.actions.myMaps') }}
            </RouterLink>
            <RouterLink to="/maps/activity" class="btn btn--ghost maps-btn">
              <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                <path :d="mdiHistory" />
              </svg>
              {{ t('maps.actions.activity') }}
            </RouterLink>
          </div>
        </div>

        <aside v-if="featured" class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('maps.hero.featured') }}</div>
            <div class="hero-side__title">{{ featured.title }}</div>
            <p class="hero-side__text">
              {{ t('maps.card.by') }} <strong>{{ featured.creator.username }}</strong> ·
              {{ t('maps.hero.score', { score: formatNumber(featured.stats.score) }) }}
            </p>
          </div>
          <div class="hero-side__chips">
            <span v-for="tag in featured.tags.slice(0, 3)" :key="tag.id">
              {{ tagLabel(tag) }}
            </span>
          </div>
        </aside>
      </header>

      <!-- KPIs -->
      <section class="stat-grid maps-stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.stats.totalMaps') }}</span>
          <span class="stat-card__value">{{ store.totalMaps }}</span>
          <span class="stat-card__caption">{{ t('maps.stats.totalMapsCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.stats.totalCreators') }}</span>
          <span class="stat-card__value">{{ store.totalCreators }}</span>
          <span class="stat-card__caption">{{ t('maps.stats.totalCreatorsCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.stats.testsToday') }}</span>
          <span class="stat-card__value">{{ formatNumber(store.totalTestsLast24h) }}</span>
          <span class="stat-card__caption">{{ t('maps.stats.testsTodayCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.stats.topScore') }}</span>
          <span class="stat-card__value">{{ formatNumber(store.topScore) }}</span>
          <span class="stat-card__caption">{{ t('maps.stats.topScoreCaption') }}</span>
        </article>
      </section>

      <!-- Browse / Filters / Grid -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('maps.browse.title') }}</h2>
            <p class="surface-subtitle">
              {{ t('maps.browse.subtitle', { count: filtered.length }) }}
            </p>
          </div>
          <Transition name="fade-btn">
            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn btn--ghost maps-btn"
              @click="resetFilters"
            >
              <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                <path :d="mdiFilterRemove" />
              </svg>
              {{ t('maps.filters.reset') }}
            </button>
          </Transition>
        </div>

        <div class="toolbar maps-toolbar">
          <div class="search-field">
            <svg viewBox="0 0 24 24" class="search-field__icon" aria-hidden="true">
              <path :d="mdiMagnify" />
            </svg>
            <input
              v-model="store.search"
              type="search"
              class="field"
              :placeholder="t('maps.filters.search')"
            />
          </div>

          <select v-model="store.selectedTag" class="select">
            <option value="">{{ t('maps.filters.allTags') }}</option>
            <option v-for="tag in store.tagLibrary" :key="tag.id" :value="tag.slug">
              {{ tagLabel(tag) }}
            </option>
          </select>

          <select v-model="store.selectedStatus" class="select">
            <option value="">{{ t('maps.filters.allStatus') }}</option>
            <option value="stable">{{ t('maps.status.stable') }}</option>
            <option value="beta">{{ t('maps.status.beta') }}</option>
            <option value="draft">{{ t('maps.status.draft') }}</option>
          </select>

          <select v-model="store.sortKey" class="select">
            <option value="popular">{{ t('maps.filters.sort.popular') }}</option>
            <option value="recent">{{ t('maps.filters.sort.recent') }}</option>
            <option value="top">{{ t('maps.filters.sort.top') }}</option>
            <option value="mostTested">{{ t('maps.filters.sort.mostTested') }}</option>
          </select>
        </div>

        <div v-if="filtered.length > 0" class="maps-grid">
          <MapCard v-for="map in filtered" :key="map.id" :map="map" @view="onView" />
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('maps.empty.title') }}</h3>
          <p class="empty-state__text">{{ t('maps.empty.text') }}</p>
        </div>
      </section>

      <!-- Top creators -->
      <section class="surface maps-creators-surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('maps.creators.title') }}</h2>
            <p class="surface-subtitle">{{ t('maps.creators.subtitle') }}</p>
          </div>
        </div>

        <div class="creators-grid">
          <article v-for="creator in store.topCreators" :key="creator.id" class="creator-card">
            <div class="creator-card__avatar">
              {{ creator.username.charAt(0).toUpperCase() }}
            </div>
            <div class="creator-card__body">
              <h3 class="creator-card__name">{{ creator.username }}</h3>
              <p class="creator-card__meta">
                {{ creator.region }} · {{ creator.maps.length }}
                {{ t('maps.creators.mapsLabel') }}
              </p>
              <div class="creator-card__metrics">
                <span>
                  <strong>{{ formatNumber(creator.total_tests) }}</strong>
                  {{ t('maps.creators.tests') }}
                </span>
                <span>
                  <strong>{{ formatNumber(creator.total_likes) }}</strong>
                  {{ t('maps.creators.likes') }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { mdiChartTimelineVariant, mdiFilterRemove, mdiHistory, mdiMagnify, mdiPlus } from '@mdi/js'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import MapCard from '@/components/MapCard.vue'
import { useMapsStore } from '@/stores/mapsStore'
import type { MapTag } from '@/types/maps'

const store = useMapsStore()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })

const filtered = computed(() => store.filteredMaps)
const featured = computed(() => store.featuredMap)

function tagLabel(tag: MapTag) {
  return locale.value === 'fr' ? tag.label_fr : tag.label_en
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return n.toString()
}

function onView(id: string | number) {
  router.push(`/maps/${id}`)
}

const hasActiveFilters = computed(
  () =>
    !!store.search || !!store.selectedTag || !!store.selectedStatus || store.sortKey !== 'popular',
)

function resetFilters() {
  store.search = ''
  store.selectedTag = ''
  store.selectedStatus = ''
  store.sortKey = 'popular'
}

onMounted(async () => {
  window.scrollTo({ top: 0 })
  await store.loadMaps()
})
</script>

<style scoped>
.maps-page {
  min-height: 100vh;
  padding-bottom: 3rem;
  color: var(--color-cream);
}

.page-shell {
  width: min(1440px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1.25rem;
  align-items: stretch;
  margin-bottom: 1.35rem;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  overflow: hidden;
  position: relative;
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
  margin-bottom: 0.75rem;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3.3rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.85rem 0 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 1rem;
  line-height: 1.65;
}

.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.btn {
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.7rem 1rem;
  font-weight: 900;
  font-size: 0.88rem;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.maps-btn__icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.hero-side {
  min-height: 100%;
  padding: 1.15rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.22), transparent 38%),
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

.hero-side__text strong {
  color: var(--color-cream);
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

.stat-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.maps-stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.88)), var(--color-navy);
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
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.96)), var(--color-navy);
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
  font-size: 1.65rem;
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

.surface {
  padding: 1.15rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.94)), var(--color-navy);
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
  margin-bottom: 1.2rem;
}

.maps-toolbar {
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(160px, 0.7fr));
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.search-field__icon {
  position: absolute;
  left: 0.95rem;
  width: 18px;
  height: 18px;
  fill: rgba(252, 239, 225, 0.52);
  pointer-events: none;
}

.search-field .field {
  padding-left: 2.6rem;
}

.field,
.select {
  width: 100%;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.field {
  padding: 0 0.9rem;
}

.select {
  padding: 0 0.85rem;
  cursor: pointer;
}

.field::placeholder {
  color: rgba(252, 239, 225, 0.42);
}

.field:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

.maps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.maps-creators-surface {
  margin-top: 1.4rem;
}

.creators-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.creator-card {
  padding: 1.1rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.6), rgba(46, 50, 68, 0.9)), var(--color-navy);
  display: flex;
  gap: 0.85rem;
  align-items: center;
  box-shadow: 0 16px 36px -30px rgba(0, 0, 0, 0.85);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.creator-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.creator-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.1rem;
  flex-shrink: 0;
  box-shadow: 0 14px 28px -18px rgba(242, 139, 91, 0.95);
}

.creator-card__body {
  min-width: 0;
}

.creator-card__name {
  margin: 0;
  color: var(--color-cream);
  font-size: 0.96rem;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creator-card__meta {
  margin: 0.2rem 0 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.8rem;
  line-height: 1.4;
}

.creator-card__metrics {
  margin-top: 0.55rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.78rem;
}

.creator-card__metrics strong {
  color: var(--color-primary-strong);
  font-weight: 900;
  margin-right: 0.2rem;
}

.empty-state {
  padding: 3rem 1rem;
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.26);
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

:deep(.map-card) {
  height: 100%;
}

@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .maps-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .maps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .creators-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .maps-toolbar {
    grid-template-columns: 1fr;
  }

  .surface-header {
    flex-direction: column;
    align-items: stretch;
  }

  .surface-header .btn {
    width: fit-content;
  }
}

@media (max-width: 720px) {
  .page-shell {
    width: min(100% - 1rem, 1440px);
    padding-top: 1rem;
  }

  .page-hero,
  .surface {
    border-radius: 22px;
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .audit-hero__actions {
    flex-direction: column;
  }

  .audit-hero__actions .btn,
  .surface-header .btn {
    width: 100%;
    justify-content: center;
  }

  .maps-stat-grid,
  .maps-grid,
  .creators-grid {
    grid-template-columns: 1fr;
  }

  .creator-card {
    align-items: flex-start;
  }
}

.fade-btn-enter-active,
.fade-btn-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
