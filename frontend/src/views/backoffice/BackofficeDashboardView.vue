<template>
  <section class="backoffice-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('backoffice.dashboard.badge') }}</span>
            <h1 class="page-title">{{ t('backoffice.dashboard.title') }}</h1>
            <p class="page-subtitle">{{ t('backoffice.dashboard.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToBackoffice">
              {{ t('backoffice.common.actions.backToBackoffice') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetPeriod">
              {{ t('backoffice.common.actions.resetPeriod') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('backoffice.dashboard.side.label') }}</div>
            <div class="hero-side__title">{{ t('backoffice.dashboard.side.title') }}</div>
            <p class="hero-side__text">{{ t('backoffice.dashboard.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('backoffice.dashboard.side.chips.live') }}</span>
            <span>{{ t('backoffice.dashboard.side.chips.poc') }}</span>
            <span>{{ t('backoffice.dashboard.side.chips.rbac') }}</span>
          </div>
        </aside>
      </header>

      <section class="period-bar">
        <div>
          <h2 class="period-bar__title">{{ t('backoffice.dashboard.period.title') }}</h2>
          <p class="period-bar__subtitle">{{ t('backoffice.dashboard.period.subtitle') }}</p>
        </div>

        <div class="period-bar__pills">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            type="button"
            :class="['period-pill', selectedPeriod === option.value ? 'period-pill--active' : '']"
            @click="selectedPeriod = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="kpi-grid">
        <article v-for="kpi in kpiCards" :key="kpi.key" class="kpi-card">
          <div class="kpi-card__top">
            <div class="kpi-card__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="kpi.icon" />
              </svg>
            </div>
            <span :class="['kpi-card__trend', `kpi-card__trend--${kpi.trendDirection}`]">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="kpi.trendDirection === 'up' ? mdiTrendingUp : mdiTrendingDown" />
              </svg>
              {{ kpi.trend }}
            </span>
          </div>

          <div class="kpi-card__body">
            <span class="kpi-card__label">{{ kpi.label }}</span>
            <strong class="kpi-card__value">{{ kpi.value }}</strong>
            <span class="kpi-card__caption">{{ kpi.caption }}</span>
          </div>
        </article>
      </section>

      <div class="dashboard-grid">
        <section class="surface dashboard-surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('backoffice.dashboard.ranks.title') }}</h2>
              <p class="surface-subtitle">{{ t('backoffice.dashboard.ranks.subtitle') }}</p>
            </div>
            <span class="meta-item">
              {{
                t('backoffice.dashboard.ranks.totalPlayers', {
                  count: totalRankedPlayers.toLocaleString(locale),
                })
              }}
            </span>
          </div>

          <div class="rank-chart">
            <div v-for="rank in rankDistribution" :key="rank.key" class="rank-row">
              <div class="rank-row__head">
                <span :class="['rank-dot', `rank-dot--${rank.key}`]"></span>
                <span class="rank-row__name">{{ getRankLabel(rank.key) }}</span>
                <span class="rank-row__count">
                  {{ rank.count.toLocaleString(locale) }}
                  <span class="rank-row__pct">({{ rank.percentage.toFixed(1) }}%)</span>
                </span>
              </div>

              <div class="rank-row__bar">
                <div
                  :class="['rank-row__fill', `rank-row__fill--${rank.key}`]"
                  :style="{ width: `${rank.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section class="surface dashboard-surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('backoffice.dashboard.topMaps.title') }}</h2>
              <p class="surface-subtitle">{{ t('backoffice.dashboard.topMaps.subtitle') }}</p>
            </div>
            <span class="meta-item">
              {{ t('backoffice.dashboard.topMaps.period', { label: periodLabel }) }}
            </span>
          </div>

          <ol class="top-list">
            <li v-for="(map, index) in topMaps" :key="map.id" class="top-list__item">
              <span class="top-list__rank">{{ index + 1 }}</span>

              <div class="top-list__body">
                <strong class="top-list__title">{{ map.title }}</strong>
                <span class="top-list__author">
                  {{ t('backoffice.dashboard.topMaps.by') }} {{ map.author }}
                </span>
              </div>

              <div class="top-list__metrics">
                <span class="meta-item">
                  {{ map.tests.toLocaleString(locale) }}
                  {{ t('backoffice.dashboard.topMaps.tests') }}
                </span>
                <span class="meta-item"> ★ {{ map.rating.toFixed(1) }} </span>
              </div>
            </li>
          </ol>
        </section>

        <section class="surface dashboard-surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('backoffice.dashboard.topCreators.title') }}</h2>
              <p class="surface-subtitle">{{ t('backoffice.dashboard.topCreators.subtitle') }}</p>
            </div>
          </div>

          <ol class="top-list">
            <li v-for="(creator, index) in topCreators" :key="creator.id" class="top-list__item">
              <span class="top-list__rank">{{ index + 1 }}</span>

              <div class="top-list__avatar">{{ creator.name.charAt(0).toUpperCase() }}</div>

              <div class="top-list__body">
                <strong class="top-list__title">{{ creator.name }}</strong>
                <span class="top-list__author">
                  {{ t('backoffice.dashboard.topCreators.maps', { count: creator.mapsPublished }) }}
                </span>
              </div>

              <div class="top-list__metrics">
                <span class="meta-item">
                  {{ creator.totalTests.toLocaleString(locale) }}
                  {{ t('backoffice.dashboard.topCreators.tests') }}
                </span>
              </div>
            </li>
          </ol>
        </section>

        <section class="surface dashboard-surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('backoffice.dashboard.activity.title') }}</h2>
              <p class="surface-subtitle">{{ t('backoffice.dashboard.activity.subtitle') }}</p>
            </div>
          </div>

          <ul class="activity-feed">
            <li v-for="event in recentActivity" :key="event.id" class="activity-feed__item">
              <div :class="['activity-feed__icon', `activity-feed__icon--${event.type}`]">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="getActivityIcon(event.type)" />
                </svg>
              </div>

              <div class="activity-feed__body">
                <strong class="activity-feed__title">{{ getActivityLabel(event) }}</strong>
                <span class="activity-feed__meta">
                  {{ event.actor }} · {{ formatRelativeTime(event.timestamp) }}
                </span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiAccountGroupOutline,
  mdiCartOutline,
  mdiCashMultiple,
  mdiMapMarkerCheckOutline,
  mdiShieldAlertOutline,
  mdiSwordCross,
  mdiTrendingDown,
  mdiTrendingUp,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

type PeriodValue = '7d' | '30d' | '90d'
type RankKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'
type ActivityType = 'match' | 'transaction' | 'map' | 'sanction'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })

const selectedPeriod = ref<PeriodValue>('7d')

const periodOptions = computed(() => [
  { value: '7d' as const, label: t('backoffice.dashboard.period.options.7d') },
  { value: '30d' as const, label: t('backoffice.dashboard.period.options.30d') },
  { value: '90d' as const, label: t('backoffice.dashboard.period.options.90d') },
])

const periodLabel = computed(() => {
  const found = periodOptions.value.find((opt) => opt.value === selectedPeriod.value)
  return found?.label ?? ''
})

// --- Mock data POC ----------------------------------------------------------

type PeriodSnapshot = {
  activeUsers: number
  matchesPerDay: number
  transactionsPerDay: number
  mapsPublished: number
  virtualRevenue: number
  pendingReports: number
}

const snapshots: Record<PeriodValue, PeriodSnapshot> = {
  '7d': {
    activeUsers: 1842,
    matchesPerDay: 3120,
    transactionsPerDay: 412,
    mapsPublished: 87,
    virtualRevenue: 18430,
    pendingReports: 23,
  },
  '30d': {
    activeUsers: 5294,
    matchesPerDay: 2890,
    transactionsPerDay: 387,
    mapsPublished: 342,
    virtualRevenue: 72180,
    pendingReports: 41,
  },
  '90d': {
    activeUsers: 12480,
    matchesPerDay: 2715,
    transactionsPerDay: 365,
    mapsPublished: 1024,
    virtualRevenue: 218400,
    pendingReports: 58,
  },
}

const trends: Record<
  PeriodValue,
  Record<keyof PeriodSnapshot, { value: string; direction: 'up' | 'down' }>
> = {
  '7d': {
    activeUsers: { value: '+12.4%', direction: 'up' },
    matchesPerDay: { value: '+5.8%', direction: 'up' },
    transactionsPerDay: { value: '+3.1%', direction: 'up' },
    mapsPublished: { value: '+8.0%', direction: 'up' },
    virtualRevenue: { value: '+9.7%', direction: 'up' },
    pendingReports: { value: '-2.5%', direction: 'down' },
  },
  '30d': {
    activeUsers: { value: '+7.2%', direction: 'up' },
    matchesPerDay: { value: '+2.4%', direction: 'up' },
    transactionsPerDay: { value: '-1.2%', direction: 'down' },
    mapsPublished: { value: '+14.5%', direction: 'up' },
    virtualRevenue: { value: '+6.1%', direction: 'up' },
    pendingReports: { value: '+8.4%', direction: 'up' },
  },
  '90d': {
    activeUsers: { value: '+18.9%', direction: 'up' },
    matchesPerDay: { value: '+1.5%', direction: 'up' },
    transactionsPerDay: { value: '+0.8%', direction: 'up' },
    mapsPublished: { value: '+22.1%', direction: 'up' },
    virtualRevenue: { value: '+12.8%', direction: 'up' },
    pendingReports: { value: '+15.2%', direction: 'up' },
  },
}

const kpiCards = computed(() => {
  const snap = snapshots[selectedPeriod.value]
  const trend = trends[selectedPeriod.value]

  return [
    {
      key: 'activeUsers',
      label: t('backoffice.dashboard.kpis.activeUsers'),
      value: snap.activeUsers.toLocaleString(locale.value),
      caption: t('backoffice.dashboard.kpis.activeUsersCaption', { period: periodLabel.value }),
      icon: mdiAccountGroupOutline,
      trend: trend.activeUsers.value,
      trendDirection: trend.activeUsers.direction,
    },
    {
      key: 'matchesPerDay',
      label: t('backoffice.dashboard.kpis.matches'),
      value: snap.matchesPerDay.toLocaleString(locale.value),
      caption: t('backoffice.dashboard.kpis.matchesCaption'),
      icon: mdiSwordCross,
      trend: trend.matchesPerDay.value,
      trendDirection: trend.matchesPerDay.direction,
    },
    {
      key: 'transactionsPerDay',
      label: t('backoffice.dashboard.kpis.transactions'),
      value: snap.transactionsPerDay.toLocaleString(locale.value),
      caption: t('backoffice.dashboard.kpis.transactionsCaption'),
      icon: mdiCartOutline,
      trend: trend.transactionsPerDay.value,
      trendDirection: trend.transactionsPerDay.direction,
    },
    {
      key: 'mapsPublished',
      label: t('backoffice.dashboard.kpis.maps'),
      value: snap.mapsPublished.toLocaleString(locale.value),
      caption: t('backoffice.dashboard.kpis.mapsCaption', { period: periodLabel.value }),
      icon: mdiMapMarkerCheckOutline,
      trend: trend.mapsPublished.value,
      trendDirection: trend.mapsPublished.direction,
    },
    {
      key: 'virtualRevenue',
      label: t('backoffice.dashboard.kpis.revenue'),
      value: `${snap.virtualRevenue.toLocaleString(locale.value)} ⬢`,
      caption: t('backoffice.dashboard.kpis.revenueCaption'),
      icon: mdiCashMultiple,
      trend: trend.virtualRevenue.value,
      trendDirection: trend.virtualRevenue.direction,
    },
    {
      key: 'pendingReports',
      label: t('backoffice.dashboard.kpis.reports'),
      value: snap.pendingReports.toLocaleString(locale.value),
      caption: t('backoffice.dashboard.kpis.reportsCaption'),
      icon: mdiShieldAlertOutline,
      trend: trend.pendingReports.value,
      trendDirection: trend.pendingReports.direction,
    },
  ]
})

const rankDistribution = computed<Array<{ key: RankKey; count: number; percentage: number }>>(
  () => {
    const base: Array<{ key: RankKey; count: number }> = [
      { key: 'bronze', count: 4820 },
      { key: 'silver', count: 3210 },
      { key: 'gold', count: 2150 },
      { key: 'platinum', count: 1080 },
      { key: 'diamond', count: 480 },
      { key: 'master', count: 120 },
    ]

    const multiplier =
      selectedPeriod.value === '7d' ? 1 : selectedPeriod.value === '30d' ? 1.2 : 1.45

    const scaled = base.map((item) => ({ ...item, count: Math.round(item.count * multiplier) }))
    const total = scaled.reduce((sum, item) => sum + item.count, 0)

    return scaled.map((item) => ({
      ...item,
      percentage: total === 0 ? 0 : (item.count / total) * 100,
    }))
  },
)

const totalRankedPlayers = computed(() =>
  rankDistribution.value.reduce((sum, item) => sum + item.count, 0),
)

const topMaps = ref([
  { id: 1, title: 'Neon Crucible', author: 'pixelqueen', tests: 12480, rating: 4.8 },
  { id: 2, title: 'Forgotten Outpost', author: 'shadowfox', tests: 9820, rating: 4.6 },
  { id: 3, title: 'Skybreaker', author: 'neo_runner', tests: 8190, rating: 4.5 },
  { id: 4, title: 'Ember Run', author: 'helios', tests: 7240, rating: 4.4 },
  { id: 5, title: 'Hollow Frontier', author: 'raven', tests: 6510, rating: 4.3 },
])

const topCreators = ref([
  { id: 1, name: 'pixelqueen', mapsPublished: 24, totalTests: 38200 },
  { id: 2, name: 'shadowfox', mapsPublished: 18, totalTests: 29150 },
  { id: 3, name: 'neo_runner', mapsPublished: 15, totalTests: 22480 },
  { id: 4, name: 'mira', mapsPublished: 11, totalTests: 15920 },
])

type ActivityEvent = {
  id: number
  type: ActivityType
  actor: string
  target?: string
  timestamp: string
}

const recentActivity = ref<ActivityEvent[]>([
  { id: 1, type: 'sanction', actor: 'alice', target: 'shadowfox', timestamp: minutesAgo(4) },
  {
    id: 2,
    type: 'map',
    actor: 'pixelqueen',
    target: 'Neon Crucible v3',
    timestamp: minutesAgo(11),
  },
  {
    id: 3,
    type: 'transaction',
    actor: 'luna',
    target: '500 hard currency',
    timestamp: minutesAgo(18),
  },
  { id: 4, type: 'match', actor: 'neo_runner', target: 'Ranked 5v5', timestamp: minutesAgo(27) },
  { id: 5, type: 'map', actor: 'helios', target: 'Ember Run v2', timestamp: minutesAgo(42) },
  { id: 6, type: 'sanction', actor: 'enzo', target: 'thorium', timestamp: minutesAgo(58) },
])

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

// --- Helpers ----------------------------------------------------------------

function goBackToBackoffice() {
  router.push('/backoffice')
}

function resetPeriod() {
  selectedPeriod.value = '7d'
}

function getRankLabel(key: RankKey) {
  return t(`backoffice.dashboard.ranks.labels.${key}`)
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'match':
      return mdiSwordCross
    case 'transaction':
      return mdiCartOutline
    case 'map':
      return mdiMapMarkerCheckOutline
    case 'sanction':
      return mdiShieldAlertOutline
    default:
      return mdiAccountGroupOutline
  }
}

function getActivityLabel(event: ActivityEvent) {
  return t(`backoffice.dashboard.activity.events.${event.type}`, {
    actor: event.actor,
    target: event.target ?? '',
  })
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.round(diffMs / (60 * 1000))

  if (diffMinutes < 1) return t('backoffice.dashboard.activity.justNow')
  if (diffMinutes < 60) return t('backoffice.dashboard.activity.minutesAgo', { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return t('backoffice.dashboard.activity.hoursAgo', { count: diffHours })

  const diffDays = Math.floor(diffHours / 24)
  return t('backoffice.dashboard.activity.daysAgo', { count: diffDays })
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})
</script>

<style scoped>
.backoffice-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: var(--shadow-md);
}

.page-hero__content {
  display: grid;
  gap: 1rem;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-badge {
  display: inline-flex;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}

.page-title {
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  color: var(--color-ink);
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 720px;
  color: var(--color-text-muted);
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
}

.btn--ghost {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

.hero-side {
  padding: 1.25rem;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(46, 50, 68, 0.97), rgba(81, 96, 121, 0.95));
  color: var(--color-cream);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-side__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.78;
}

.hero-side__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.hero-side__text {
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.92rem;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.hero-side__chips span {
  display: inline-flex;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  background: rgba(252, 239, 225, 0.14);
  color: var(--color-cream);
}

.period-bar {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 24px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.period-bar__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.15rem;
  color: var(--color-ink);
}

.period-bar__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: var(--color-text-muted);
}

.period-bar__pills {
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.35rem;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.08);
}

.period-pill {
  border: none;
  background: transparent;
  padding: 0.55rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 10px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.18s ease;
}

.period-pill--active {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  box-shadow: 0 8px 16px -10px rgba(242, 139, 91, 0.7);
}

.kpi-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.kpi-card {
  padding: 1.25rem;
  border-radius: 22px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kpi-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(81, 96, 121, 0.09);
  color: var(--color-ink);
}

.kpi-card__icon svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.kpi-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.kpi-card__trend svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.kpi-card__trend--up {
  color: #146c43;
  background: rgba(61, 191, 125, 0.16);
}

.kpi-card__trend--down {
  color: #9f2f2f;
  background: rgba(225, 91, 91, 0.16);
}

.kpi-card__label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.kpi-card__value {
  display: block;
  margin-top: 0.4rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.kpi-card__caption {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.dashboard-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.surface {
  padding: 1.5rem;
  border-radius: 24px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.surface-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  color: var(--color-ink);
}

.surface-subtitle {
  margin: 0.3rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: rgba(81, 96, 121, 0.08);
}

/* Rank chart */
.rank-chart {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.rank-row__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.4rem;
  font-size: 0.88rem;
}

.rank-row__name {
  font-weight: 700;
  color: var(--color-ink);
  flex: 1;
}

.rank-row__count {
  color: var(--color-text-muted);
  font-weight: 600;
}

.rank-row__pct {
  margin-left: 0.3rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.rank-row__bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(81, 96, 121, 0.1);
  overflow: hidden;
}

.rank-row__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.rank-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-dot--bronze,
.rank-row__fill--bronze {
  background: linear-gradient(135deg, #b08758, #8b6440);
}

.rank-dot--silver,
.rank-row__fill--silver {
  background: linear-gradient(135deg, #c5cad4, #9aa1ae);
}

.rank-dot--gold,
.rank-row__fill--gold {
  background: linear-gradient(135deg, #f1c25a, #d49b2a);
}

.rank-dot--platinum,
.rank-row__fill--platinum {
  background: linear-gradient(135deg, #9adfd6, #65b8ae);
}

.rank-dot--diamond,
.rank-row__fill--diamond {
  background: linear-gradient(135deg, #87aaff, #5078ee);
}

.rank-dot--master,
.rank-row__fill--master {
  background: linear-gradient(135deg, #ba8df0, #7a4ecd);
}

/* Top lists */
.top-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.top-list__item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: 16px;
  background: rgba(81, 96, 121, 0.05);
  border: 1px solid rgba(81, 96, 121, 0.08);
}

.top-list__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-ink);
  background: rgba(252, 239, 225, 1);
  border: 1px solid rgba(81, 96, 121, 0.15);
  flex-shrink: 0;
}

.top-list__avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  font-weight: 700;
  flex-shrink: 0;
}

.top-list__body {
  flex: 1;
  min-width: 0;
}

.top-list__title {
  display: block;
  color: var(--color-ink);
  font-size: 0.94rem;
}

.top-list__author {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.top-list__metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

/* Activity feed */
.activity-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.activity-feed__item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: 14px;
  background: rgba(81, 96, 121, 0.05);
}

.activity-feed__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-feed__icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.activity-feed__icon--match {
  color: #31598c;
  background: rgba(49, 89, 140, 0.12);
}

.activity-feed__icon--transaction {
  color: #146c43;
  background: rgba(61, 191, 125, 0.16);
}

.activity-feed__icon--map {
  color: #8a5c1d;
  background: rgba(242, 139, 91, 0.18);
}

.activity-feed__icon--sanction {
  color: #9f2f2f;
  background: rgba(225, 91, 91, 0.16);
}

.activity-feed__title {
  display: block;
  font-size: 0.92rem;
  color: var(--color-ink);
}

.activity-feed__meta {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .backoffice-page {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .period-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .period-bar__pills {
    justify-content: space-between;
  }

  .period-pill {
    flex: 1;
  }
}
</style>
