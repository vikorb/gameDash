<template>
  <section class="backoffice-view">
    <div class="backoffice-shell">
      <header class="hero">
        <div class="hero__content">
          <span class="hero__badge">{{ t('backoffice.hub.badge') }}</span>

          <h1 class="hero__title">{{ t('backoffice.hub.title') }}</h1>

          <p class="hero__subtitle">
            {{ t('backoffice.hub.subtitle') }}
          </p>

          <div class="hero__actions">
            <button
              type="button"
              class="btn btn--primary"
              @click="router.push('/backoffice/dashboard')"
            >
              {{ t('backoffice.hub.primaryAction') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="router.push('/moderation')">
              {{ t('backoffice.hub.secondaryAction') }}
            </button>
          </div>
        </div>

        <div class="hero__panel">
          <div class="hero-panel-card hero-panel-card--highlight">
            <div class="hero-panel-card__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiViewDashboardOutline" />
              </svg>
            </div>

            <div>
              <div class="hero-panel-card__label">{{ t('backoffice.hub.highlight.label') }}</div>
              <div class="hero-panel-card__title">{{ t('backoffice.hub.highlight.title') }}</div>
              <div class="hero-panel-card__text">
                {{ t('backoffice.hub.highlight.text') }}
              </div>
            </div>
          </div>

          <div class="hero-panel-grid">
            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{ t('backoffice.hub.stats.role.label') }}</span>
              <strong class="mini-stat-card__value">{{ roleLabel }}</strong>
            </div>

            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{ t('backoffice.hub.stats.audit.label') }}</span>
              <strong class="mini-stat-card__value">{{
                t('backoffice.hub.stats.audit.value')
              }}</strong>
            </div>
          </div>
        </div>
      </header>

      <section class="sections-block">
        <div class="section-heading">
          <h2 class="section-heading__title">{{ t('backoffice.hub.sections.title') }}</h2>
          <p class="section-heading__subtitle">
            {{ t('backoffice.hub.sections.subtitle') }}
          </p>
        </div>

        <div class="sections-grid">
          <article
            v-for="section in sections"
            :key="section.key"
            :class="['section-card', section.highlight ? 'section-card--highlight' : '']"
          >
            <div class="section-card__top">
              <div class="section-card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="section.icon" />
                </svg>
              </div>

              <span v-if="section.badge" class="section-card__badge is-live">
                {{ section.badge }}
              </span>
            </div>

            <div class="section-card__body">
              <h3 class="section-card__title">{{ section.title }}</h3>
              <p class="section-card__description">{{ section.description }}</p>

              <div class="section-card__chips">
                <span v-for="item in section.items" :key="item" class="section-chip">
                  {{ item }}
                </span>
              </div>
            </div>

            <div class="section-card__footer">
              <button type="button" class="card-action" @click="router.push(section.to)">
                {{ t('backoffice.hub.actions.open') }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiChartLineVariant,
  mdiCurrencyUsd,
  mdiShieldAccountOutline,
  mdiSwordCross,
  mdiViewDashboardOutline,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t } = useI18n({ useScope: 'global' })

type BackofficeSection = {
  key: string
  title: string
  description: string
  icon: string
  items: string[]
  to: string
  highlight?: boolean
  badge?: string
}

const sections = computed<BackofficeSection[]>(() => [
  {
    key: 'dashboard',
    title: t('backoffice.hub.cards.dashboard.title'),
    description: t('backoffice.hub.cards.dashboard.description'),
    icon: mdiChartLineVariant,
    items: [
      t('backoffice.hub.cards.dashboard.items.kpis'),
      t('backoffice.hub.cards.dashboard.items.ranks'),
      t('backoffice.hub.cards.dashboard.items.maps'),
    ],
    to: '/backoffice/dashboard',
    highlight: true,
    badge: t('backoffice.hub.cards.dashboard.badge'),
  },
  {
    key: 'matchmaking',
    title: t('backoffice.hub.cards.matchmaking.title'),
    description: t('backoffice.hub.cards.matchmaking.description'),
    icon: mdiSwordCross,
    items: [
      t('backoffice.hub.cards.matchmaking.items.queues'),
      t('backoffice.hub.cards.matchmaking.items.settings'),
      t('backoffice.hub.cards.matchmaking.items.audit'),
    ],
    to: '/backoffice/matchmaking',
  },
  {
    key: 'economy',
    title: t('backoffice.hub.cards.economy.title'),
    description: t('backoffice.hub.cards.economy.description'),
    icon: mdiCurrencyUsd,
    items: [
      t('backoffice.hub.cards.economy.items.prices'),
      t('backoffice.hub.cards.economy.items.rewards'),
      t('backoffice.hub.cards.economy.items.currencies'),
    ],
    to: '/backoffice/economy',
  },
  {
    key: 'moderation',
    title: t('backoffice.hub.cards.moderation.title'),
    description: t('backoffice.hub.cards.moderation.description'),
    icon: mdiShieldAccountOutline,
    items: [
      t('backoffice.hub.cards.moderation.items.users'),
      t('backoffice.hub.cards.moderation.items.reports'),
      t('backoffice.hub.cards.moderation.items.maps'),
    ],
    to: '/moderation',
  },
])

const roleLabel = computed(() => {
  const role = profile.value?.role ?? ''

  if (role === 'admin') return t('backoffice.hub.roles.admin')
  if (role === 'moderator') return t('backoffice.hub.roles.moderator')

  return t('backoffice.hub.roles.staff')
})

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})
</script>

<style scoped>
.backoffice-view {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.backoffice-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 1.5rem;
  align-items: stretch;
}

.hero__content,
.hero__panel,
.sections-block {
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.hero__content {
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.hero__content::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 14% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 90% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.hero__content > * {
  position: relative;
  z-index: 1;
}

.hero__badge {
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

.hero__title {
  margin: 1rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  color: var(--color-cream);
  font-weight: 900;
}

.hero__subtitle {
  margin: 1rem 0 0;
  max-width: 720px;
  color: rgba(252, 239, 225, 0.68);
  font-size: 1rem;
  line-height: 1.65;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.btn {
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.85rem 1.15rem;
  font-weight: 900;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
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
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
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

.hero__panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-panel-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.15rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.16), transparent 38%),
    rgba(18, 24, 38, 0.36);
  color: var(--color-cream);
}

.hero-panel-card--highlight {
  border-color: rgba(242, 139, 91, 0.32);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.22), transparent 40%),
    rgba(18, 24, 38, 0.42);
}

.hero-panel-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
}

.hero-panel-card__icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

.hero-panel-card__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.95;
  letter-spacing: 0.08em;
}

.hero-panel-card__title {
  margin-top: 0.3rem;
  color: var(--color-cream);
  font-size: 1.15rem;
  font-weight: 900;
}

.hero-panel-card__text {
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
}

.hero-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-stat-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
}

.mini-stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mini-stat-card__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-primary-strong);
  font-size: 1rem;
  font-weight: 900;
}

.sections-block {
  margin-top: 1.5rem;
  padding: 1.5rem;
}

.section-heading {
  margin-bottom: 1.25rem;
}

.section-heading__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.55rem;
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.03em;
}

.section-heading__subtitle {
  margin: 0.4rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  line-height: 1.55;
}

.sections-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-card {
  min-height: 260px;
  padding: 1.25rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.58), rgba(46, 50, 68, 0.92)), var(--color-navy);
  box-shadow: 0 16px 36px -30px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.section-card--highlight {
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 20px 44px -32px rgba(242, 139, 91, 0.85);
}

.section-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
}

.section-card__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.section-card__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.76rem;
  font-weight: 900;
}

.section-card__badge.is-live {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.28);
}

.section-card__body {
  margin-top: 1rem;
  flex: 1;
}

.section-card__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 1.15rem;
  font-weight: 900;
}

.section-card__description {
  margin: 0.55rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.94rem;
  line-height: 1.55;
}

.section-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.section-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.78);
  background: rgba(18, 24, 38, 0.3);
}

.section-card__footer {
  margin-top: 1.2rem;
}

.card-action {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(242, 139, 91, 0.42);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font-weight: 900;
  cursor: pointer;
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
}

.card-action:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .backoffice-view {
    padding: 1rem;
  }

  .hero__content,
  .hero__panel,
  .sections-block {
    border-radius: 22px;
    padding: 1rem;
  }

  .hero-panel-grid {
    grid-template-columns: 1fr;
  }

  .hero__actions {
    flex-direction: column;
  }

  .btn,
  .card-action {
    width: 100%;
  }
}
</style>
