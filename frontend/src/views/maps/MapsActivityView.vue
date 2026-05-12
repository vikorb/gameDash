<template>
  <main class="moderation-page maps-activity-page">
    <div class="page-shell">
      <!-- ── Breadcrumb ──────────────────────────────────────────── -->
      <nav class="detail-nav">
        <RouterLink to="/maps" class="detail-nav__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          {{ t('maps.detail.backToMaps') }}
        </RouterLink>
        <span class="detail-nav__sep">/</span>
        <span class="detail-nav__current">{{ t('maps.activity.title') }}</span>
      </nav>

      <!-- ── Hero ───────────────────────────────────────────────── -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('maps.activity.badge') }}</span>
          <h1 class="page-title">{{ t('maps.activity.title') }}</h1>
          <p class="page-subtitle">{{ t('maps.activity.subtitle') }}</p>
        </div>
        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('maps.activity.heroLabel') }}</div>
            <div class="hero-side__title">
              {{ totalActivity }} {{ t('maps.activity.totalInteractions') }}
            </div>
            <p class="hero-side__text">{{ t('maps.activity.heroText') }}</p>
          </div>
          <div class="hero-side__chips">
            <span>❤️ {{ store.favoriteMaps.length }} {{ t('maps.activity.tab.favorites') }}</span>
            <span>👍 {{ store.likedMaps.length }} {{ t('maps.activity.tab.liked') }}</span>
            <span>🎮 {{ store.testedMaps.length }} {{ t('maps.activity.tab.tested') }}</span>
          </div>
        </aside>
      </header>

      <!-- ── Tab bar ─────────────────────────────────────────────── -->
      <div class="activity-tabs">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          :class="['activity-tab', { 'is-active': activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <svg viewBox="0 0 24 24" class="activity-tab__icon" aria-hidden="true">
            <path :d="tab.icon" />
          </svg>
          {{ t(tab.labelKey) }}
          <span class="activity-tab__count">{{ tabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- ── Content ─────────────────────────────────────────────── -->
      <section class="surface activity-surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t(currentTab.labelKey) }}</h2>
            <p class="surface-subtitle">{{ currentDescription }}</p>
          </div>
        </div>

        <Transition name="tab-fade" mode="out-in">
          <div :key="activeTab">
            <!-- Maps grid -->
            <div v-if="displayedMaps.length > 0" class="maps-grid">
              <MapCard v-for="map in displayedMaps" :key="map.id" :map="map" @view="onView" />
            </div>

            <!-- Empty state -->
            <div v-else class="empty-state activity-empty">
              <div class="activity-empty__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="currentTab.icon" />
                </svg>
              </div>
              <h3 class="empty-state__title">{{ t(currentTab.emptyTitle) }}</h3>
              <p class="empty-state__text">{{ t(currentTab.emptyText) }}</p>
              <RouterLink
                to="/maps"
                class="btn btn--primary maps-btn"
                style="margin-top: 1.1rem; display: inline-flex; text-decoration: none"
              >
                <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                  <path :d="mdiCompass" />
                </svg>
                {{ t('maps.activity.explore') }}
              </RouterLink>
            </div>
          </div>
        </Transition>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiCompass,
  mdiHeart,
  mdiPlayCircle,
  mdiThumbDown,
  mdiThumbUp,
} from '@mdi/js'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import MapCard from '@/components/MapCard.vue'
import { useMapsStore } from '@/stores/mapsStore'

const store = useMapsStore()
const router = useRouter()
const { t } = useI18n({ useScope: 'global' })

/* ── Tabs config ─────────────────────────────────────────────── */
type TabKey = 'favorites' | 'liked' | 'disliked' | 'tested'

interface Tab {
  key: TabKey
  labelKey: string
  icon: string
  emptyTitle: string
  emptyText: string
  descKey: string
}

const TABS: Tab[] = [
  {
    key: 'favorites',
    labelKey: 'maps.activity.tab.favorites',
    icon: mdiHeart,
    emptyTitle: 'maps.activity.empty.favorites.title',
    emptyText: 'maps.activity.empty.favorites.text',
    descKey: 'maps.activity.desc.favorites',
  },
  {
    key: 'liked',
    labelKey: 'maps.activity.tab.liked',
    icon: mdiThumbUp,
    emptyTitle: 'maps.activity.empty.liked.title',
    emptyText: 'maps.activity.empty.liked.text',
    descKey: 'maps.activity.desc.liked',
  },
  {
    key: 'disliked',
    labelKey: 'maps.activity.tab.disliked',
    icon: mdiThumbDown,
    emptyTitle: 'maps.activity.empty.disliked.title',
    emptyText: 'maps.activity.empty.disliked.text',
    descKey: 'maps.activity.desc.disliked',
  },
  {
    key: 'tested',
    labelKey: 'maps.activity.tab.tested',
    icon: mdiPlayCircle,
    emptyTitle: 'maps.activity.empty.tested.title',
    emptyText: 'maps.activity.empty.tested.text',
    descKey: 'maps.activity.desc.tested',
  },
]

/* ── State ───────────────────────────────────────────────────── */
const activeTab = ref<TabKey>('favorites')

const currentTab = computed(() => TABS.find((t) => t.key === activeTab.value) ?? TABS[0]!)

const displayedMaps = computed(() => {
  switch (activeTab.value) {
    case 'favorites':
      return store.favoriteMaps
    case 'liked':
      return store.likedMaps
    case 'disliked':
      return store.dislikedMaps
    case 'tested':
      return store.testedMaps
    default:
      return store.favoriteMaps
  }
})

const currentDescription = computed(() =>
  t(currentTab.value.descKey, { count: displayedMaps.value.length }),
)

const totalActivity = computed(
  () =>
    new Set([
      ...store.favoriteMaps.map((m) => m.id),
      ...store.likedMaps.map((m) => m.id),
      ...store.dislikedMaps.map((m) => m.id),
      ...store.testedMaps.map((m) => m.id),
    ]).size,
)

function tabCount(key: TabKey) {
  switch (key) {
    case 'favorites':
      return store.favoriteMaps.length
    case 'liked':
      return store.likedMaps.length
    case 'disliked':
      return store.dislikedMaps.length
    case 'tested':
      return store.testedMaps.length
  }
}

/* ── Navigation ──────────────────────────────────────────────── */
function onView(id: string) {
  router.push(`/maps/${id}`)
}

onMounted(() => {
  window.scrollTo({ top: 0 })
})
</script>

<style scoped>
.maps-activity-page {
  padding-bottom: 3rem;
}

/* ── Breadcrumb ─────────────────────────────────────────────── */
.detail-nav {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.1rem;
  font-size: 0.9rem;
  color: rgba(252, 239, 225, 0.7);
}
.detail-nav__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(252, 239, 225, 0.85);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.16s ease;
}
.detail-nav__back:hover {
  color: var(--color-primary);
}
.detail-nav__back svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
.detail-nav__sep {
  opacity: 0.4;
}
.detail-nav__current {
  color: rgba(252, 239, 225, 0.98);
  font-weight: 700;
}

/* ── Tab bar ────────────────────────────────────────────────── */
.activity-tabs {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.3rem;
  flex-wrap: wrap;
}

.activity-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  background: rgba(252, 239, 225, 0.12);
  color: rgba(252, 239, 225, 0.75);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.activity-tab:hover {
  background: rgba(252, 239, 225, 0.18);
  color: rgba(252, 239, 225, 0.95);
  transform: translateY(-1px);
}

.activity-tab.is-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  border-color: transparent;
  color: var(--color-cream);
  box-shadow: 0 8px 20px -10px rgba(242, 139, 91, 0.7);
  transform: translateY(-1px);
}

.activity-tab__icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
}

.activity-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
}

.activity-tab.is-active .activity-tab__count {
  background: rgba(255, 255, 255, 0.28);
}

/* ── Activity surface ───────────────────────────────────────── */
.activity-surface {
  margin-top: 1rem;
}

/* ── Maps grid (same as browse) ─────────────────────────────── */
.maps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

/* ── Tab transition ─────────────────────────────────────────── */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ── Empty state ────────────────────────────────────────────── */
.activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1rem;
  text-align: center;
}

.activity-empty__icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(242, 139, 91, 0.1);
  border: 1.5px solid rgba(242, 139, 91, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.activity-empty__icon svg {
  width: 30px;
  height: 30px;
  fill: var(--color-primary);
}

/* ── Shared helpers ─────────────────────────────────────────── */
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

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .maps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .maps-grid {
    grid-template-columns: 1fr;
  }
  .activity-tabs {
    gap: 0.4rem;
  }
  .activity-tab {
    padding: 0.55rem 0.8rem;
    font-size: 0.82rem;
  }
}
</style>
