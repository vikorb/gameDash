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
            <div class="surface-header__actions">
              <span class="meta-item">
                {{
                  t('backoffice.dashboard.ranks.totalPlayers', {
                    count: totalRankedPlayers.toLocaleString(locale),
                  })
                }}
              </span>
              <select v-model="selectedRankMode" class="rank-mode-select">
                <option value="all">{{ t('backoffice.dashboard.ranks.modeFilter.all') }}</option>
                <option v-for="mode in rankModes" :key="mode.id" :value="String(mode.id)">
                  {{ mode.name }}
                </option>
              </select>
              <button type="button" class="btn btn--ghost btn--surface" @click="goToRankManagement">
                {{ t('backoffice.dashboard.ranks.manage') }}
              </button>
            </div>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import {
  type BackofficeActivityType,
  type BackofficePeriodValue,
  type BackofficeRankKey,
  useBackofficeDashboardStore,
} from '@/stores/backoffice'
import { useUserStore } from '@/stores/userStore'

type PeriodValue = BackofficePeriodValue
type RankKey = BackofficeRankKey
type ActivityType = BackofficeActivityType

type ActivityEvent = {
  id: number
  type: ActivityType
  actor: string
  target?: string | null
  timestamp: string
}

const router = useRouter()
const userStore = useUserStore()
const dashboardStore = useBackofficeDashboardStore()
const { profile } = storeToRefs(userStore)
const { snapshot, trends, rankModes, rankDistribution, topMaps, topCreators, recentActivity } =
  storeToRefs(dashboardStore)
const { t, locale } = useI18n({ useScope: 'global' })

const selectedPeriod = ref<PeriodValue>('7d')
const selectedRankMode = ref<string>('all')

const periodOptions = computed(() => [
  { value: '7d' as const, label: t('backoffice.dashboard.period.options.7d') },
  { value: '30d' as const, label: t('backoffice.dashboard.period.options.30d') },
  { value: '90d' as const, label: t('backoffice.dashboard.period.options.90d') },
])

const periodLabel = computed(() => {
  const found = periodOptions.value.find((opt) => opt.value === selectedPeriod.value)
  return found?.label ?? ''
})

const kpiCards = computed(() => {
  const snap = snapshot.value
  const trend = trends.value

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

const totalRankedPlayers = computed(() =>
  rankDistribution.value.reduce((sum, item) => sum + item.count, 0),
)

watch(selectedPeriod, (period) => {
  void dashboardStore.fetchDashboard(
    period,
    selectedRankMode.value === 'all' ? null : Number(selectedRankMode.value),
  )
})

watch(selectedRankMode, (modeValue) => {
  void dashboardStore.fetchDashboard(
    selectedPeriod.value,
    modeValue === 'all' ? null : Number(modeValue),
  )
})

function goBackToBackoffice() {
  router.push('/backoffice')
}

function resetPeriod() {
  selectedPeriod.value = '7d'
}

function goToRankManagement() {
  router.push('/backoffice/ranks')
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
    return
  }

  void dashboardStore.fetchDashboard(selectedPeriod.value)
})
</script>

<style scoped>
.backoffice-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
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
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.page-hero > * {
  position: relative;
  z-index: 1;
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
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 720px;
  color: rgba(252, 239, 225, 0.68);
  line-height: 1.6;
}

.btn {
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.85rem 1.1rem;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover {
  filter: brightness(1.04);
}

.btn--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.hero-side {
  padding: 1.25rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.2), transparent 38%),
    rgba(18, 24, 38, 0.38);
  color: var(--color-cream);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 900;
}

.hero-side__text {
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
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
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.74rem;
  font-weight: 800;
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
}

.period-bar {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
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
  color: var(--color-cream);
  font-weight: 900;
}

.period-bar__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: rgba(252, 239, 225, 0.58);
}

.period-bar__pills {
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.35rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
}

.period-pill {
  border: none;
  background: transparent;
  padding: 0.55rem 1rem;
  font-weight: 900;
  font-size: 0.88rem;
  border-radius: 10px;
  color: rgba(252, 239, 225, 0.58);
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.period-pill:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.12);
}

.period-pill--active {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  box-shadow: 0 10px 22px -14px rgba(242, 139, 91, 0.85);
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
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.9)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
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
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
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
  font-weight: 900;
}

.kpi-card__trend svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.kpi-card__trend--up {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.28);
}

.kpi-card__trend--down {
  color: #ff9a9a;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.28);
}

.kpi-card__label {
  display: block;
  font-size: 0.82rem;
  color: rgba(252, 239, 225, 0.58);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-card__value {
  display: block;
  margin-top: 0.4rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-cream);
}

.kpi-card__caption {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.52);
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
  margin-bottom: 1.25rem;
}

.surface-header__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn--surface {
  min-height: 36px;
  padding: 0.55rem 0.8rem;
  font-size: 0.8rem;
}

.rank-mode-select {
  min-height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: rgba(18, 24, 38, 0.44);
  color: var(--color-cream);
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.55rem;
}

.surface-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  color: var(--color-cream);
  font-weight: 900;
}

.surface-subtitle {
  margin: 0.3rem 0 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.88rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.72);
  background: rgba(18, 24, 38, 0.3);
}

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
  font-weight: 900;
  color: var(--color-cream);
  flex: 1;
}

.rank-row__count {
  color: rgba(252, 239, 225, 0.64);
  font-weight: 900;
}

.rank-row__pct {
  margin-left: 0.3rem;
  color: rgba(252, 239, 225, 0.48);
  font-weight: 700;
}

.rank-row__bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.48);
  overflow: hidden;
  border: 1px solid rgba(252, 239, 225, 0.06);
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
  background: linear-gradient(135deg, #d8deea, #9aa1ae);
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

.top-list,
.activity-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.top-list {
  gap: 0.7rem;
}

.top-list__item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
}

.top-list__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 900;
  font-size: 0.88rem;
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  flex-shrink: 0;
}

.top-list__avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  font-weight: 900;
  flex-shrink: 0;
}

.top-list__body {
  flex: 1;
  min-width: 0;
}

.top-list__title {
  display: block;
  color: var(--color-cream);
  font-size: 0.94rem;
  font-weight: 900;
}

.top-list__author {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.52);
}

.top-list__metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.activity-feed {
  gap: 0.65rem;
}

.activity-feed__item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
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
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border: 1px solid rgba(80, 120, 238, 0.24);
}

.activity-feed__icon--transaction {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.24);
}

.activity-feed__icon--map {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.16);
  border: 1px solid rgba(242, 139, 91, 0.26);
}

.activity-feed__icon--sanction {
  color: #ff9a9a;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.26);
}

.activity-feed__title {
  display: block;
  font-size: 0.92rem;
  color: var(--color-cream);
  font-weight: 900;
}

.activity-feed__meta {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.52);
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .backoffice-page {
    padding: 1rem;
  }

  .page-hero,
  .period-bar,
  .surface {
    border-radius: 22px;
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .period-bar__pills {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .period-pill {
    padding-inline: 0.5rem;
  }

  .page-hero__actions,
  .top-list__item,
  .activity-feed__item {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .top-list__metrics {
    align-items: flex-start;
  }
}
</style>
