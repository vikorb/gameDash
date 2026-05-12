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
import { mdiChartTimelineVariant, mdiMagnify, mdiPlus } from '@mdi/js'
import { computed } from 'vue'
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

function onView(id: string) {
  router.push(`/maps/${id}`)
}
</script>

<style scoped>
.maps-page {
  padding-bottom: 3rem;
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
  fill: var(--color-text-muted);
  pointer-events: none;
}

.search-field .field {
  padding-left: 2.6rem;
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

.maps-stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.maps-toolbar {
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(160px, 0.7fr));
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
  border: 1px solid rgba(81, 96, 121, 0.12);
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.creator-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.creator-card__body {
  min-width: 0;
}

.creator-card__name {
  margin: 0;
  color: var(--color-ink);
  font-size: 0.96rem;
  font-weight: 800;
}

.creator-card__meta {
  margin: 0.2rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.creator-card__metrics {
  margin-top: 0.55rem;
  display: flex;
  gap: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.creator-card__metrics strong {
  color: var(--color-ink);
  font-weight: 800;
  margin-right: 0.2rem;
}

@media (max-width: 1300px) {
  .maps-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .maps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .maps-toolbar {
    grid-template-columns: 1fr;
  }

  .creators-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .maps-stat-grid,
  .maps-grid,
  .creators-grid {
    grid-template-columns: 1fr;
  }
}
</style>
