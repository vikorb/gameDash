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
function cycleStatus(mapId: string) {
  const m = store.getMap(mapId)
  if (!m) return
  const order: MapStatus[] = ['draft', 'beta', 'stable']
  const next = order[(order.indexOf(m.status) + 1) % order.length]!
  store.updateMap(mapId, { status: next })
  showToast(
    locale.value === 'fr'
      ? `Statut → ${t(`maps.status.${next}`)}`
      : `Status → ${t(`maps.status.${next}`)}`,
  )
}

/* ── Inline new version ──────────────────────────────────────── */
const openVersionForms = reactive(new Set<string>())
const versionNotes = reactive<Record<string, string>>({})

function closeVersionForm(mapId: string) {
  openVersionForms.delete(mapId)
  versionNotes[mapId] = ''
}

function publishVersion(mapId: string) {
  const notes = versionNotes[mapId]?.trim()
  if (!notes) return
  store.updateMap(mapId, { releaseNotes: notes })
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

onMounted(() => {
  window.scrollTo({ top: 0 })
})
</script>

<style scoped>
.maps-mine-page {
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

/* ── KPIs ───────────────────────────────────────────────────── */
.mine-stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* ── maps-btn ───────────────────────────────────────────────── */
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

/* ── Performance chart ──────────────────────────────────────── */
.perf-chart {
  display: grid;
  gap: 0.55rem;
}

.perf-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.35fr) 1fr 60px 72px;
  align-items: center;
  gap: 0.75rem;
}

.perf-row__name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.14s ease;
}

.perf-row__name:hover {
  color: var(--color-primary);
}

.perf-row__bar-wrap {
  height: 10px;
  background: rgba(81, 96, 121, 0.1);
  border-radius: 999px;
  overflow: hidden;
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
  background: linear-gradient(90deg, #f5c842, #e8b800);
}
.perf-row__bar--draft {
  background: rgba(81, 96, 121, 0.35);
}

.perf-row__score {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  color: var(--color-ink);
  text-align: right;
}

/* ── Mine list ──────────────────────────────────────────────── */
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
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(81, 96, 121, 0.1);
  border-radius: 20px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.mine-card:hover {
  border-color: rgba(242, 139, 91, 0.25);
  box-shadow: 0 6px 18px -10px rgba(46, 50, 68, 0.2);
}

.mine-card__thumb {
  display: block;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--color-navy), var(--color-slate));
  flex-shrink: 0;
}

.mine-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mine-card__thumb:hover img {
  transform: scale(1.04);
}

.mine-card__thumb-placeholder {
  width: 100%;
  height: 100%;
}

.mine-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  font-weight: 700;
  color: var(--color-ink);
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
  border: none;
  cursor: pointer;
  font-size: 0.72rem !important;
  padding: 0.28rem 0.55rem !important;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.mine-card__status-btn:hover {
  opacity: 0.8;
  transform: scale(0.97);
}

.mine-card__version {
  padding: 0.22rem 0.48rem;
  border-radius: 999px;
  background: rgba(46, 50, 68, 0.07);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 700;
}

.mine-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

/* ── Inline stats ───────────────────────────────────────────── */
.mine-card__stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.4rem;
  border-top: 1px dashed rgba(81, 96, 121, 0.15);
}

.mine-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-ink);
}

.mine-stat svg {
  width: 14px;
  height: 14px;
  fill: var(--color-text-muted);
  flex-shrink: 0;
}

.mine-stat--muted {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.78rem;
  margin-left: auto;
}

.mine-stat__retention {
  font-weight: 800;
}
.retention--good {
  color: #146c43;
}
.retention--mid {
  color: #775500;
}
.retention--low {
  color: #8a4040;
}

/* ── Card actions ───────────────────────────────────────────── */
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

/* ── Inline version form ────────────────────────────────────── */
.mine-card__version-form {
  grid-column: 1 / -1;
  margin-top: 0.1rem;
  padding: 1rem;
  border-radius: 14px;
  background: rgba(242, 139, 91, 0.06);
  border: 1px dashed rgba(242, 139, 91, 0.3);
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

/* ── form helpers ───────────────────────────────────────────── */
.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

/* ── Toast ──────────────────────────────────────────────────── */
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
  background: var(--color-navy);
  color: var(--color-cream);
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
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
}
.toast--error {
  background: linear-gradient(135deg, #8a4040, #5e2020);
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

/* ── Responsive ─────────────────────────────────────────────── */
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
    grid-template-columns: minmax(80px, 0.3fr) 1fr 50px 64px;
  }
}

@media (max-width: 720px) {
  .mine-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .mine-card {
    grid-template-columns: 1fr auto;
  }
  .mine-card__thumb {
    display: none;
  }
}
</style>
