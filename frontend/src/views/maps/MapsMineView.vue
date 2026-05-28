<template>
  <main class="moderation-page maps-mine-page">
    <div class="page-shell">
      <!-- ── Breadcrumb ──────────────────────────────────────────── -->
      <nav class="detail-nav">
        <RouterLink to="/maps" class="detail-nav__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          {{ t('maps.detail.backToMaps') }}
        </RouterLink>
        <span class="detail-nav__sep">/</span>
        <span class="detail-nav__current">{{ t('maps.mine.title') }}</span>
      </nav>

      <!-- ── Hero ───────────────────────────────────────────────── -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{ t('maps.mine.badge') }}</span>
          <h1 class="page-title">{{ t('maps.mine.title') }}</h1>
          <p class="page-subtitle">{{ t('maps.mine.subtitle') }}</p>
          <div class="audit-hero__actions">
            <RouterLink to="/maps/create" class="btn btn--primary maps-btn">
              <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
                <path :d="mdiPlus" />
              </svg>
              {{ t('maps.actions.create') }}
            </RouterLink>
          </div>
        </div>
        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('maps.mine.heroLabel') }}</div>
            <div class="hero-side__title">
              {{ store.myMaps.length }} {{ t('maps.mine.mapsPublished') }}
            </div>
            <p class="hero-side__text">{{ t('maps.mine.heroText') }}</p>
          </div>
          <div class="hero-side__chips">
            <span>{{ t('maps.mine.stableCount', { n: stableMaps }) }}</span>
            <span>{{ t('maps.mine.betaCount', { n: betaMaps }) }}</span>
            <span>{{ t('maps.mine.draftCount', { n: draftMaps }) }}</span>
          </div>
        </aside>
      </header>

      <!-- ── KPIs ───────────────────────────────────────────────── -->
      <section class="stat-grid mine-stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.mine.kpi.maps') }}</span>
          <span class="stat-card__value">{{ store.myMaps.length }}</span>
          <span class="stat-card__caption">{{ t('maps.mine.kpi.mapsCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.mine.kpi.tests') }}</span>
          <span class="stat-card__value">{{ formatNumber(store.myTotalTests) }}</span>
          <span class="stat-card__caption">{{ t('maps.mine.kpi.testsCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.mine.kpi.avgScore') }}</span>
          <span class="stat-card__value">{{ formatNumber(store.myAvgScore) }}</span>
          <span class="stat-card__caption">{{ t('maps.mine.kpi.avgScoreCaption') }}</span>
        </article>
        <article class="stat-card">
          <span class="stat-card__label">{{ t('maps.mine.kpi.likes') }}</span>
          <span class="stat-card__value">{{ formatNumber(store.myTotalLikes) }}</span>
          <span class="stat-card__caption">{{ t('maps.mine.kpi.likesCaption') }}</span>
        </article>
      </section>

      <!-- ── Performance chart ──────────────────────────────────── -->
      <section v-if="sortedByScore.length > 0" class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('maps.mine.chart.title') }}</h2>
            <p class="surface-subtitle">{{ t('maps.mine.chart.subtitle') }}</p>
          </div>
        </div>
        <div class="perf-chart">
          <div v-for="m in sortedByScore" :key="m.id" class="perf-row">
            <RouterLink :to="`/maps/${m.id}`" class="perf-row__name">
              {{ m.title }}
            </RouterLink>
            <div class="perf-row__bar-wrap">
              <div
                class="perf-row__bar"
                :style="{ width: `${Math.max(4, (m.stats.score / store.myTopScore) * 100)}%` }"
                :class="`perf-row__bar--${m.status}`"
              />
            </div>
            <span class="perf-row__score">{{ formatNumber(m.stats.score) }}</span>
            <span :class="['pill', `pill--${pillStatus(m.status)}`]" style="font-size: 0.68rem">
              {{ t(`maps.status.${m.status}`) }}
            </span>
          </div>
        </div>
      </section>

      <!-- ── Maps list ──────────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('maps.mine.list.title') }}</h2>
            <p class="surface-subtitle">
              {{ t('maps.mine.list.subtitle', { count: sortedMaps.length }) }}
            </p>
          </div>
          <select v-model="sortMine" class="select" style="max-width: 200px">
            <option value="score">{{ t('maps.mine.sort.score') }}</option>
            <option value="tests">{{ t('maps.mine.sort.tests') }}</option>
            <option value="recent">{{ t('maps.mine.sort.recent') }}</option>
          </select>
        </div>

        <div v-if="sortedMaps.length > 0" class="mine-list">
          <article v-for="m in sortedMaps" :key="m.id" class="mine-card">
            <!-- Thumbnail -->
            <RouterLink :to="`/maps/${m.id}`" class="mine-card__thumb">
              <img
                v-if="m.screenshots[0]"
                :src="m.screenshots[0].url"
                :alt="m.title"
                loading="lazy"
              />
              <div v-else class="mine-card__thumb-placeholder" />
            </RouterLink>

            <!-- Content -->
            <div class="mine-card__body">
              <div class="mine-card__head">
                <h3 class="mine-card__title">{{ m.title }}</h3>
                <div class="mine-card__badges">
                  <!-- Clickable status pill cycles through statuses -->
                  <button
                    type="button"
                    :class="['pill', `pill--${pillStatus(m.status)}`, 'mine-card__status-btn']"
                    :title="t('maps.mine.card.cycleStatusHint')"
                    @click="cycleStatus(m.id)"
                  >
                    {{ t(`maps.status.${m.status}`) }}
                    <svg
                      viewBox="0 0 24 24"
                      style="width: 10px; height: 10px; fill: currentColor; margin-left: 2px"
                      aria-hidden="true"
                    >
                      <path :d="mdiRefresh" />
                    </svg>
                  </button>
                  <span class="mine-card__version">v{{ m.current_version_number }}</span>
                </div>
              </div>

              <div class="mine-card__tags">
                <span v-for="tag in m.tags.slice(0, 3)" :key="tag.id" class="tag-item">
                  {{ tagLabel(tag) }}
                </span>
              </div>

              <!-- Inline stats -->
              <div class="mine-card__stats">
                <span class="mine-stat">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPlayCircle" /></svg>
                  {{ formatNumber(m.stats.tests_count) }}
                </span>
                <span class="mine-stat">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiThumbUp" /></svg>
                  {{ likeRate(m) }}%
                </span>
                <span class="mine-stat">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiTrophy" /></svg>
                  {{ formatNumber(m.stats.score) }}
                </span>
                <span class="mine-stat">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiChartLine" /></svg>
                  <span :class="['mine-stat__retention', retentionClass(m.stats.retention)]">
                    {{ Math.round(m.stats.retention * 100) }}%
                  </span>
                </span>
                <span class="mine-stat mine-stat--muted">
                  {{ formatRelativeDate(m.updated_at) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mine-card__actions">
              <RouterLink
                :to="`/maps/${m.id}`"
                class="btn-inline btn-inline--secondary mine-action-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiEye" /></svg>
              </RouterLink>
              <RouterLink
                :to="`/maps/${m.id}/edit`"
                class="btn-inline btn-inline--secondary mine-action-btn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPencil" /></svg>
              </RouterLink>
            </div>

            <!-- Inline new version form -->
            <Transition name="version-form">
              <div v-if="openVersionForms.has(m.id)" class="mine-card__version-form">
                <label class="form-label">{{ t('maps.mine.card.releaseNotesLabel') }}</label>
                <textarea
                  v-model="versionNotes[m.id]"
                  class="field form-textarea"
                  :placeholder="t('maps.mine.card.releaseNotesPlaceholder')"
                  rows="2"
                />
                <div class="mine-card__version-form-actions">
                  <button
                    type="button"
                    class="btn-inline btn-inline--secondary"
                    @click="closeVersionForm(m.id)"
                  >
                    {{ t('maps.mine.card.cancel') }}
                  </button>
                  <button
                    type="button"
                    class="btn-inline btn-inline--primary"
                    :disabled="!versionNotes[m.id]?.trim()"
                    @click="publishVersion(m.id)"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style="width: 14px; height: 14px; fill: currentColor"
                      aria-hidden="true"
                    >
                      <path :d="mdiCheck" />
                    </svg>
                    {{ t('maps.mine.card.publishVersion') }}
                  </button>
                </div>
              </div>
            </Transition>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('maps.mine.empty.title') }}</h3>
          <p class="empty-state__text">{{ t('maps.mine.empty.text') }}</p>
          <RouterLink
            to="/maps/create"
            class="btn btn--primary maps-btn"
            style="margin-top: 1rem; display: inline-flex; text-decoration: none"
          >
            <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
              <path :d="mdiPlus" />
            </svg>
            {{ t('maps.actions.create') }}
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" :class="['toast', `toast--${toast.type}`]">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiCheck" /></svg>
        {{ toast.message }}
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiChartLine,
  mdiCheck,
  mdiEye,
  mdiPencil,
  mdiPlayCircle,
  mdiPlus,
  mdiRefresh,
  mdiThumbUp,
  mdiTrophy,
} from '@mdi/js'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { useMapsStore } from '@/stores/mapsStore'
import type { MapItem, MapStatus } from '@/types/maps'

const store = useMapsStore()
const { t, locale } = useI18n({ useScope: 'global' })

/* ── Sorting ─────────────────────────────────────────────────── */
type SortMine = 'score' | 'tests' | 'recent'
const sortMine = ref<SortMine>('score')

const sortedMaps = computed(() => {
  const list = [...store.myMaps]
  if (sortMine.value === 'score') list.sort((a, b) => b.stats.score - a.stats.score)
  else if (sortMine.value === 'tests')
    list.sort((a, b) => b.stats.tests_count - a.stats.tests_count)
  else list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  return list
})

const sortedByScore = computed(() =>
  [...store.myMaps].sort((a, b) => b.stats.score - a.stats.score),
)

/* ── Hero stats ──────────────────────────────────────────────── */
const stableMaps = computed(() => store.myMaps.filter((m) => m.status === 'stable').length)
const betaMaps = computed(() => store.myMaps.filter((m) => m.status === 'beta').length)
const draftMaps = computed(() => store.myMaps.filter((m) => m.status === 'draft').length)

/* ── Helpers ─────────────────────────────────────────────────── */
function pillStatus(status: MapStatus) {
  if (status === 'stable') return 'visible'
  if (status === 'beta') return 'review'
  return 'draft'
}

function tagLabel(tag: { label_fr: string; label_en: string }) {
  return locale.value === 'fr' ? tag.label_fr : tag.label_en
}

function likeRate(m: MapItem) {
  const total = m.stats.likes_count + m.stats.dislikes_count
  return total === 0 ? 0 : Math.round((m.stats.likes_count / total) * 100)
}

function retentionClass(r: number) {
  if (r >= 0.6) return 'retention--good'
  if (r >= 0.3) return 'retention--mid'
  return 'retention--low'
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return n.toString()
}

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  const isFr = locale.value === 'fr'
  if (days === 0) return isFr ? "aujourd'hui" : 'today'
  if (days < 7) return isFr ? `il y a ${days}j` : `${days}d ago`
  const w = Math.floor(days / 7)
  if (days < 30) return isFr ? `il y a ${w}sem` : `${w}w ago`
  const m = Math.floor(days / 30)
  return isFr ? `il y a ${m}mois` : `${m}mo ago`
}

/* ── Status cycling ──────────────────────────────────────────── */
async function cycleStatus(mapId: string | number) {
  const m = store.getMap(mapId)
  if (!m) return
  const order: MapStatus[] = ['draft', 'beta', 'stable']
  const next = order[(order.indexOf(m.status) + 1) % order.length]!
  await store.updateMap(mapId, { status: next })
  showToast(
    locale.value === 'fr'
      ? `Statut → ${t(`maps.status.${next}`)}`
      : `Status → ${t(`maps.status.${next}`)}`,
  )
}

/* ── Inline new version ──────────────────────────────────────── */
const openVersionForms = reactive(new Set<string | number>())
const versionNotes = reactive<Record<string, string>>({})

function closeVersionForm(mapId: string | number) {
  openVersionForms.delete(mapId)
  versionNotes[String(mapId)] = ''
}

async function publishVersion(mapId: string | number) {
  const notes = versionNotes[String(mapId)]?.trim()
  if (!notes) return
  await store.publishVersion(mapId, notes)
  closeVersionForm(mapId)
  const m = store.getMap(mapId)
  showToast(
    locale.value === 'fr'
      ? `v${m?.current_version_number} publiée !`
      : `v${m?.current_version_number} published!`,
    'success',
  )
}

/* ── Toast ───────────────────────────────────────────────────── */
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3000)
}

onMounted(async () => {
  window.scrollTo({ top: 0 })
  await store.loadMaps()
})
</script>

<style scoped>
.maps-mine-page {
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
  grid-template-columns: minmax(0, 1fr) 360px;
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

.audit-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.25rem;
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

/* ── Buttons / inputs ───────────────────────────────────── */
.btn,
.btn-inline {
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
    opacity 0.16s ease;
}

.btn {
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

.btn:hover:not(:disabled),
.btn-inline:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-inline:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn--primary,
.btn-inline--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.btn-inline--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost,
.btn-inline--secondary {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover,
.btn-inline--secondary:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.btn-inline {
  min-height: 36px;
  padding: 0.48rem 0.82rem;
  font-size: 0.82rem;
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

.field,
.select {
  width: 100%;
  min-height: 42px;
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
  padding: 0.8rem 0.9rem;
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

/* ── Pills / tags ────────────────────────────────────────── */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.34rem 0.68rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: rgba(18, 24, 38, 0.72);
  color: var(--color-cream);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.8);
}

.pill--visible {
  background: rgba(242, 139, 91, 0.22);
  color: var(--color-cream);
  border-color: rgba(242, 139, 91, 0.45);
}

.pill--review {
  background: rgba(247, 167, 132, 0.18);
  color: var(--color-cream);
  border-color: rgba(247, 167, 132, 0.4);
}

.pill--draft {
  background: rgba(81, 96, 121, 0.72);
  color: rgba(252, 239, 225, 0.82);
  border-color: rgba(252, 239, 225, 0.12);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.58rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.76rem;
  font-weight: 800;
}

/* ── KPIs ────────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.mine-stat-grid {
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

/* ── Surface ─────────────────────────────────────────────── */
.surface {
  padding: 1.15rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.surface + .surface {
  margin-top: 1.35rem;
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

/* ── Performance chart ───────────────────────────────────── */
.perf-chart {
  display: grid;
  gap: 0.6rem;
}

.perf-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.35fr) 1fr 64px 76px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.22);
}

.perf-row__name {
  font-size: 0.86rem;
  font-weight: 900;
  color: var(--color-cream);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.14s ease;
}

.perf-row__name:hover {
  color: var(--color-primary-strong);
}

.perf-row__bar-wrap {
  height: 10px;
  background: rgba(18, 24, 38, 0.55);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(252, 239, 225, 0.06);
}

.perf-row__bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.perf-row__bar--stable {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-strong));
}

.perf-row__bar--beta {
  background: linear-gradient(90deg, #f7a784, #f28b5b);
}

.perf-row__bar--draft {
  background: linear-gradient(90deg, rgba(252, 239, 225, 0.28), rgba(81, 96, 121, 0.68));
}

.perf-row__score {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
  font-size: 0.88rem;
  color: var(--color-primary-strong);
  text-align: right;
}

/* ── Mine list ───────────────────────────────────────────── */
.mine-list {
  display: grid;
  gap: 0.85rem;
}

.mine-card {
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 0.85rem;
  border-radius: 22px;
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

.mine-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.mine-card__thumb {
  display: block;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background:
    radial-gradient(circle at top left, rgba(242, 139, 91, 0.22), transparent 36%),
    linear-gradient(135deg, #202637, var(--color-navy), var(--color-slate));
  flex-shrink: 0;
  border: 1px solid rgba(252, 239, 225, 0.08);
}

.mine-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    filter 0.2s ease;
}

.mine-card__thumb:hover img {
  transform: scale(1.04);
  filter: saturate(1.08) contrast(1.04);
}

.mine-card__thumb-placeholder {
  width: 100%;
  height: 100%;
}

.mine-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mine-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mine-card__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 900;
  color: var(--color-cream);
  line-height: 1.2;
}

.mine-card__badges {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.mine-card__status-btn {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.72rem !important;
  padding: 0.28rem 0.55rem !important;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease,
    border-color 0.16s ease;
}

.mine-card__status-btn:hover {
  opacity: 0.92;
  transform: scale(0.97);
  border-color: rgba(242, 139, 91, 0.5);
}

.mine-card__version {
  padding: 0.24rem 0.52rem;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.72);
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.7rem;
  font-weight: 900;
}

.mine-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

/* ── Inline stats ────────────────────────────────────────── */
.mine-card__stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.45rem;
  border-top: 1px dashed rgba(252, 239, 225, 0.12);
}

.mine-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.78);
}

.mine-stat svg {
  width: 14px;
  height: 14px;
  fill: var(--color-primary-strong);
  flex-shrink: 0;
}

.mine-stat--muted {
  color: rgba(252, 239, 225, 0.5);
  font-weight: 700;
  font-size: 0.78rem;
  margin-left: auto;
}

.mine-stat__retention {
  font-weight: 900;
}

.retention--good {
  color: #7ee0ad;
}

.retention--mid {
  color: var(--color-primary-strong);
}

.retention--low {
  color: #ff9a9a;
}

/* ── Card actions ────────────────────────────────────────── */
.mine-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.mine-action-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.mine-action-btn svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

/* ── Inline version form ─────────────────────────────────── */
.mine-card__version-form {
  grid-column: 1 / -1;
  margin-top: 0.1rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(18, 24, 38, 0.28);
  border: 1px dashed rgba(242, 139, 91, 0.36);
}

.mine-card__version-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.version-form-enter-active,
.version-form-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.version-form-enter-from,
.version-form-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Form helpers ────────────────────────────────────────── */
.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.62);
  margin-bottom: 0.4rem;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
  font-family: inherit;
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

/* ── Toast ───────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 1.8rem;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.5rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.96);
  color: var(--color-cream);
  font-weight: 900;
  font-size: 0.95rem;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.36);
  z-index: 9999;
  white-space: nowrap;
}

.toast svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}

.toast--success {
  background: linear-gradient(135deg, #2d6a4f, #1b4332);
  border-color: rgba(61, 191, 125, 0.35);
}

.toast--error {
  background: linear-gradient(135deg, #8a4040, #5e2020);
  border-color: rgba(225, 91, 91, 0.35);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .mine-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .mine-card {
    grid-template-columns: 140px 1fr auto;
  }

  .perf-row {
    grid-template-columns: minmax(90px, 0.35fr) 1fr 56px 68px;
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

  .audit-hero__actions {
    flex-direction: column;
  }

  .audit-hero__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .mine-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .surface-header {
    flex-direction: column;
    align-items: stretch;
  }

  .surface-header .select {
    max-width: none !important;
  }

  .mine-card {
    grid-template-columns: 1fr auto;
  }

  .mine-card__thumb {
    display: none;
  }

  .perf-row {
    grid-template-columns: 1fr 58px;
    gap: 0.55rem;
  }

  .perf-row__bar-wrap,
  .perf-row .pill {
    grid-column: 1 / -1;
  }

  .perf-row__score {
    text-align: right;
  }
}

@media (max-width: 560px) {
  .mine-stat-grid {
    grid-template-columns: 1fr;
  }

  .mine-card {
    grid-template-columns: 1fr;
  }

  .mine-card__actions {
    flex-direction: row;
  }

  .mine-action-btn {
    flex: 1;
    width: auto;
  }

  .mine-stat--muted {
    margin-left: 0;
    width: 100%;
  }

  .mine-card__version-form-actions {
    flex-direction: column;
  }

  .mine-card__version-form-actions .btn-inline {
    width: 100%;
    justify-content: center;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    transform: none;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(10px);
  }
}
</style>
