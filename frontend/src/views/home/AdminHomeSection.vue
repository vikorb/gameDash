<template>
  <section class="admin-home">
    <div class="admin-home__charts-grid">
      <AdminAverageMMRChart />
      <AdminShopPurchasesChart />
    </div>

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
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { useBackofficeDashboardStore } from '@/stores/backoffice/dashboard'
import AdminAverageMMRChart from '@/views/home/AdminAverageMMRChart.vue'
import AdminShopPurchasesChart from '@/views/home/AdminShopPurchasesChart.vue'

const dashboardStore = useBackofficeDashboardStore()
const { t } = useI18n({ useScope: 'global' })

onMounted(async () => {
  await dashboardStore.fetchDashboard('30d')
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

.state-text {
  margin: 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.9rem;
}

.state-text--error {
  color: #f6b3b3;
}

.admin-home__charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

@media (max-width: 980px) {
  .hub-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-home__charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
