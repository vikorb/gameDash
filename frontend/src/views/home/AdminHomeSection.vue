<template>
  <section class="admin-home">
    <article class="hub-hero">
      <div class="hub-hero__head">
        <h2>{{ t('home.admin.quickLinks.title') }}</h2>
        <RouterLink class="hub-hero__link" to="/backoffice/dashboard">
          {{ t('home.admin.actions.openDashboard') }}
        </RouterLink>
      </div>

      <p class="hub-hero__subtitle">{{ t('home.admin.hub.subtitle') }}</p>

      <p v-if="dashboardStore.loading" class="state-text">{{ t('home.admin.states.loading') }}</p>
      <p v-else-if="dashboardStore.error" class="state-text state-text--error">
        {{ t('home.admin.states.activityError') }}
      </p>

      <div v-else class="hub-kpis">
        <div class="hub-kpi">
          <span class="hub-kpi__label">{{ t('home.admin.kpis.activeUsers') }}</span>
          <strong class="hub-kpi__value">{{ dashboardStore.snapshot.activeUsers }}</strong>
        </div>
        <div class="hub-kpi">
          <span class="hub-kpi__label">{{ t('home.admin.kpis.matchesPerDay') }}</span>
          <strong class="hub-kpi__value">{{ dashboardStore.snapshot.matchesPerDay }}</strong>
        </div>
        <div class="hub-kpi">
          <span class="hub-kpi__label">{{ t('home.admin.kpis.transactionsPerDay') }}</span>
          <strong class="hub-kpi__value">{{ dashboardStore.snapshot.transactionsPerDay }}</strong>
        </div>
        <div class="hub-kpi">
          <span class="hub-kpi__label">{{ t('home.admin.kpis.pendingReports') }}</span>
          <strong class="hub-kpi__value">{{ dashboardStore.snapshot.pendingReports }}</strong>
        </div>
      </div>
    </article>

    <section class="hub-grid">
      <RouterLink
        v-for="card in moduleCards"
        :key="card.titleKey"
        :to="card.to"
        class="hub-card"
      >
        <div class="hub-card__top">
          <h3 class="hub-card__title">{{ t(card.titleKey) }}</h3>
          <span class="hub-card__metric">{{ card.metric }}</span>
        </div>
        <p class="hub-card__text">{{ t(card.textKey) }}</p>
        <span class="hub-card__cta">{{ t('home.admin.actions.openDashboard') }}</span>
      </RouterLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { useBackofficeDashboardStore } from '@/stores/backoffice/dashboard'
import { useModerationAuditStore } from '@/stores/moderation'

const dashboardStore = useBackofficeDashboardStore()
const auditStore = useModerationAuditStore()
const { t } = useI18n({ useScope: 'global' })

const moduleCards = computed(() => [
  {
    to: '/backoffice/dashboard',
    titleKey: 'home.admin.quickLinks.dashboard',
    textKey: 'home.admin.hub.cards.dashboard',
    metric: dashboardStore.snapshot.activeUsers,
  },
  {
    to: '/backoffice/matchmaking',
    titleKey: 'home.admin.quickLinks.matchmaking',
    textKey: 'home.admin.hub.cards.matchmaking',
    metric: dashboardStore.snapshot.matchesPerDay,
  },
  {
    to: '/backoffice/economy',
    titleKey: 'home.admin.quickLinks.economy',
    textKey: 'home.admin.hub.cards.economy',
    metric: dashboardStore.snapshot.transactionsPerDay,
  },
  {
    to: '/moderation/users',
    titleKey: 'home.admin.quickLinks.users',
    textKey: 'home.admin.hub.cards.users',
    metric: dashboardStore.snapshot.activeUsers,
  },
  {
    to: '/moderation/reports',
    titleKey: 'home.admin.quickLinks.reports',
    textKey: 'home.admin.hub.cards.reports',
    metric: dashboardStore.snapshot.pendingReports,
  },
  {
    to: '/moderation/audit',
    titleKey: 'home.admin.actions.openAudit',
    textKey: 'home.admin.hub.cards.audit',
    metric: auditStore.auditEntries.length,
  },
])

onMounted(async () => {
  await Promise.allSettled([dashboardStore.fetchDashboard('30d'), auditStore.fetchAuditEntries()])
})
</script>

<style scoped>
.admin-home {
  display: grid;
  gap: 0.9rem;
  margin-top: 1.1rem;
}

.hub-hero {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: linear-gradient(140deg, rgba(63, 79, 112, 0.85), rgba(31, 36, 53, 0.92));
  box-shadow: 0 18px 40px -28px rgba(0, 0, 0, 0.85);
}

.hub-hero__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.hub-hero__head h2 {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.14rem;
  font-weight: 900;
}

.hub-hero__link {
  color: var(--color-primary-strong);
  font-weight: 800;
  font-size: 0.82rem;
  text-decoration: none;
}

.hub-hero__link:hover {
  text-decoration: underline;
}

.hub-hero__subtitle {
  margin: 0.35rem 0 0.75rem;
  color: rgba(252, 239, 225, 0.7);
  font-size: 0.86rem;
}

.hub-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}

.hub-kpi {
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(13, 20, 35, 0.45);
  padding: 0.5rem;
  display: grid;
  gap: 0.18rem;
}

.hub-kpi__label {
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.72rem;
}

.hub-kpi__value {
  color: var(--color-cream);
  font-size: 1.2rem;
  font-weight: 900;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.hub-card {
  padding: 0.85rem;
  border-radius: 15px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: linear-gradient(180deg, rgba(72, 84, 108, 0.75), rgba(35, 40, 56, 0.93));
  text-decoration: none;
  display: grid;
  gap: 0.5rem;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.hub-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.56);
}

.hub-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
}

.hub-card__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 0.94rem;
  font-weight: 800;
}

.hub-card__metric {
  color: var(--color-primary-strong);
  font-size: 0.82rem;
  font-weight: 900;
}

.hub-card__text {
  margin: 0;
  color: rgba(252, 239, 225, 0.7);
  font-size: 0.79rem;
  min-height: 2.2em;
}

.hub-card__cta {
  color: var(--color-primary-strong);
  font-size: 0.78rem;
  font-weight: 800;
}

.state-text {
  margin: 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.9rem;
}

.state-text--error {
  color: #f6b3b3;
}

@media (max-width: 980px) {
  .hub-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hub-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hub-grid {
    grid-template-columns: 1fr;
  }
}
</style>
