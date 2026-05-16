<template>
  <main class="moderation-page maps-activity-page">
    <div class="page-shell">
      <nav class="detail-nav">
        <RouterLink to="/maps" class="detail-nav__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          {{ t('maps.detail.backToMaps') }}
        </RouterLink>
        <span class="detail-nav__sep">/</span>
        <span class="detail-nav__current">{{ t('maps.activity.title') }}</span>
      </nav>

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
            <span>💬 {{ store.myComments.length }} {{ t('maps.activity.tab.commented') }}</span>
          </div>
        </aside>
      </header>

      <!-- Tab bar -->
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

      <!-- Content -->
      <section class="surface activity-surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t(currentTab.labelKey) }}</h2>
            <p class="surface-subtitle">{{ currentDescription }}</p>
          </div>
        </div>

        <Transition name="tab-fade" mode="out-in">
          <div :key="activeTab">
            <!-- Map grids (favorites / liked / disliked / tested) -->
            <template v-if="activeTab !== 'commented'">
              <div v-if="displayedMaps.length > 0" class="maps-grid">
                <MapCard v-for="map in displayedMaps" :key="map.id" :map="map" @view="onView" />
              </div>
              <div v-else class="empty-state activity-empty">
                <div class="activity-empty__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="currentTab.icon" /></svg>
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
            </template>

            <!-- Comment history -->
            <template v-else>
              <div v-if="store.myComments.length > 0" class="comment-history-list">
                <article v-for="comment in store.myComments" :key="comment.id" class="chi-card">
                  <RouterLink :to="`/maps/${comment.mapId}`" class="chi-thumb">
                    <img
                      v-if="getMapThumb(comment.mapId)"
                      :src="getMapThumb(comment.mapId)"
                      :alt="getMapTitle(comment.mapId)"
                      loading="lazy"
                    />
                    <div v-else class="chi-thumb-placeholder" />
                  </RouterLink>

                  <div class="chi-body">
                    <div class="chi-map-name">{{ getMapTitle(comment.mapId) }}</div>
                    <p class="chi-content">"{{ comment.content }}"</p>
                    <div class="chi-meta">
                      <span>{{ formatRelativeDate(comment.created_at) }}</span>
                      <RouterLink :to="`/maps/${comment.mapId}`" class="chi-link">
                        {{ t('maps.activity.comments.viewMap') }} →
                      </RouterLink>
                    </div>
                  </div>

                  <button
                    type="button"
                    :class="['chi-like-btn', { 'is-active': comment.user_liked }]"
                    @click="store.toggleCommentLike(comment.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="comment.user_liked ? mdiHeart : mdiHeartOutline" />
                    </svg>
                    {{ comment.likes_count }}
                  </button>
                </article>
              </div>

              <div v-else class="empty-state activity-empty">
                <div class="activity-empty__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiCommentText" /></svg>
                </div>
                <h3 class="empty-state__title">{{ t('maps.activity.empty.commented.title') }}</h3>
                <p class="empty-state__text">{{ t('maps.activity.empty.commented.text') }}</p>
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
            </template>
          </div>
        </Transition>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiCommentText,
  mdiCompass,
  mdiHeart,
  mdiHeartOutline,
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
const { t, locale } = useI18n({ useScope: 'global' })

type TabKey = 'favorites' | 'liked' | 'disliked' | 'tested' | 'commented'

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
  {
    key: 'commented',
    labelKey: 'maps.activity.tab.commented',
    icon: mdiCommentText,
    emptyTitle: 'maps.activity.empty.commented.title',
    emptyText: 'maps.activity.empty.commented.text',
    descKey: 'maps.activity.desc.commented',
  },
]

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
      return []
  }
})

const currentDescription = computed(() =>
  activeTab.value === 'commented'
    ? t(currentTab.value.descKey, { count: store.myComments.length })
    : t(currentTab.value.descKey, { count: displayedMaps.value.length }),
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
    case 'commented':
      return store.myComments.length
  }
}

function onView(id: string) {
  router.push(`/maps/${id}`)
}

/* Comment history helpers */
function getMapTitle(mapId: string) {
  return store.getMap(mapId)?.title ?? mapId
}
function getMapThumb(mapId: string) {
  return store.getMap(mapId)?.screenshots[0]?.url ?? ''
}

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000),
    isFr = locale.value === 'fr'
  if (days === 0) return isFr ? "aujourd'hui" : 'today'
  if (days === 1) return isFr ? 'hier' : 'yesterday'
  if (days < 7) return isFr ? `il y a ${days} jours` : `${days} days ago`
  const w = Math.floor(days / 7)
  if (days < 30) return isFr ? `il y a ${w} sem.` : `${w}w ago`
  const m = Math.floor(days / 30)
  return isFr ? `il y a ${m} mois` : `${m}mo ago`
}

onMounted(() => {
  window.scrollTo({ top: 0 })
})
</script>

<style scoped>
.maps-activity-page {
  padding-bottom: 3rem;
  color: var(--color-cream);
}

/* ── Layout ─────────────────────────────────────────────── */
.page-shell {
  width: min(1440px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 3rem;
}

/* ── Breadcrumb ──────────────────────────────────────────── */
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
  font-weight: 800;
  transition:
    color 0.16s ease,
    transform 0.16s ease;
}

.detail-nav__back:hover {
  color: var(--color-primary-strong);
  transform: translateX(-2px);
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
  color: var(--color-cream);
  font-weight: 900;
}

/* ── Hero ───────────────────────────────────────────────── */
.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 1.25rem;
  align-items: stretch;
  margin-bottom: 1.35rem;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  overflow: hidden;
  position: relative;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
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
    box-shadow 0.16s ease,
    opacity 0.16s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled) {
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

/* ── Surface ─────────────────────────────────────────────── */
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

/* ── Tabs ────────────────────────────────────────────────── */
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
  min-height: 44px;
  padding: 0.65rem 1.1rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.76);
  font-weight: 900;
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
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.34);
  color: var(--color-cream);
  transform: translateY(-1px);
}

.activity-tab.is-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  color: var(--color-navy);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
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
  background: rgba(252, 239, 225, 0.12);
  color: currentColor;
  font-size: 0.78rem;
  font-weight: 900;
  line-height: 1;
}

.activity-tab.is-active .activity-tab__count {
  background: rgba(46, 50, 68, 0.16);
  color: var(--color-navy);
}

.activity-surface {
  margin-top: 1rem;
}

/* ── Map grid ────────────────────────────────────────────── */
.maps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

:deep(.map-card) {
  height: 100%;
}

/* ── Tab transition ──────────────────────────────────────── */
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

/* ── Empty state ─────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1rem;
  border-radius: 24px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.68), rgba(46, 50, 68, 0.94)), var(--color-navy);
  text-align: center;
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
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

.activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.8rem 1rem;
  text-align: center;
}

.activity-empty__icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(242, 139, 91, 0.12);
  border: 1px solid rgba(242, 139, 91, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 16px 30px -24px rgba(242, 139, 91, 0.9);
}

.activity-empty__icon svg {
  width: 30px;
  height: 30px;
  fill: var(--color-primary-strong);
}

/* ── Comment history ─────────────────────────────────────── */
.comment-history-list {
  display: grid;
  gap: 0.85rem;
}

.chi-card {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.58), rgba(46, 50, 68, 0.92)), var(--color-navy);
  box-shadow: 0 16px 36px -30px rgba(0, 0, 0, 0.85);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.chi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.chi-thumb {
  display: block;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background:
    radial-gradient(circle at top left, rgba(242, 139, 91, 0.22), transparent 36%),
    linear-gradient(135deg, #202637, var(--color-navy), var(--color-slate));
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.08);
}

.chi-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    filter 0.2s ease;
}

.chi-card:hover .chi-thumb img {
  transform: scale(1.04);
  filter: saturate(1.08) contrast(1.04);
}

.chi-thumb-placeholder {
  width: 100%;
  height: 100%;
}

.chi-body {
  min-width: 0;
}

.chi-map-name {
  margin-bottom: 0.35rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 0.98rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chi-content {
  margin: 0;
  color: rgba(252, 239, 225, 0.66);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.chi-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.55rem;
  font-size: 0.78rem;
  color: rgba(252, 239, 225, 0.52);
  flex-wrap: wrap;
}

.chi-link {
  color: var(--color-primary-strong);
  font-weight: 900;
  text-decoration: none;
  transition: color 0.14s ease;
}

.chi-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.chi-like-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 54px;
  padding: 0.52rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.82rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    color 0.14s ease,
    border-color 0.14s ease,
    background 0.14s ease,
    transform 0.14s ease;
  flex-shrink: 0;
  align-self: center;
}

.chi-like-btn svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.chi-like-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(225, 91, 91, 0.38);
  color: #ff9a9a;
  background: rgba(225, 91, 91, 0.1);
}

.chi-like-btn.is-active {
  background: rgba(225, 91, 91, 0.16);
  color: #ff9a9a;
  border-color: rgba(225, 91, 91, 0.38);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .maps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .chi-card {
    grid-template-columns: 120px minmax(0, 1fr) auto;
  }
}

@media (max-width: 760px) {
  .page-shell {
    width: min(100% - 1rem, 1440px);
    padding-top: 1rem;
  }

  .page-hero,
  .surface,
  .empty-state {
    border-radius: 22px;
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .activity-tabs {
    gap: 0.45rem;
  }

  .activity-tab {
    flex: 1 1 calc(50% - 0.45rem);
    justify-content: center;
    padding: 0.58rem 0.75rem;
    font-size: 0.82rem;
  }

  .maps-grid {
    grid-template-columns: 1fr;
  }

  .surface-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chi-card {
    grid-template-columns: 1fr auto;
  }

  .chi-thumb {
    display: none;
  }
}

@media (max-width: 520px) {
  .activity-tab {
    flex-basis: 100%;
  }

  .chi-card {
    grid-template-columns: 1fr;
  }

  .chi-like-btn {
    width: 100%;
  }

  .hero-side__chips span {
    width: 100%;
  }
}
</style>
