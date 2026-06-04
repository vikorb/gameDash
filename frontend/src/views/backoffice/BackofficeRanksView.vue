<template>
  <section class="ranks-page">
    <div class="ranks-shell">
      <header class="ranks-hero">
        <div>
          <span class="ranks-badge">{{ t('backoffice.ranks.badge') }}</span>
          <h1 class="ranks-title">{{ t('backoffice.ranks.title') }}</h1>
          <p class="ranks-subtitle">{{ t('backoffice.ranks.subtitle') }}</p>
        </div>

        <button type="button" class="ranks-back-btn" @click="goToDashboard">
          {{ t('backoffice.ranks.actions.backToDashboard') }}
        </button>
      </header>

      <section class="ranks-summary">
        <div class="summary-chip">
          <span>{{ t('backoffice.ranks.summary.totalRanks') }}</span>
          <strong>{{ ranks.length }}</strong>
        </div>
        <div class="summary-chip">
          <span>{{ t('backoffice.ranks.summary.totalDivisions') }}</span>
          <strong>{{ totalDivisions }}</strong>
        </div>
      </section>

      <section class="ranks-grid">
        <article v-for="rank in ranks" :key="rank.id" :class="['rank-card', `rank-card--${getRankTone(rank.name)}`]">
          <header class="rank-card__header">
            <div>
              <h2 class="rank-card__title">{{ rank.name }}</h2>
              <p class="rank-card__xp">
                XP {{ rank.minXp.toLocaleString(locale) }} - {{ rank.maxXp.toLocaleString(locale) }}
              </p>
            </div>
            <span class="rank-card__count">
              {{ t('backoffice.ranks.divisionCount', { count: rank.divisions.length }) }}
            </span>
          </header>

          <ul class="division-list">
            <li v-for="division in rank.divisions" :key="division.id" class="division-row">
              <div class="division-row__left">
                <span class="division-row__order">#{{ division.order }}</span>
                <span class="division-row__name">{{ division.name }}</span>
              </div>
              <span class="division-row__xp">
                {{ division.minXp.toLocaleString(locale) }} - {{ division.maxXp.toLocaleString(locale) }} XP
              </span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useBackofficeRanksStore } from '@/stores/backoffice'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const ranksStore = useBackofficeRanksStore()
const { t, locale } = useI18n({ useScope: 'global' })

const { profile } = storeToRefs(userStore)
const { ranks, totalDivisions } = storeToRefs(ranksStore)

const normalizedTones = computed(() => ({
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
  master: 'master',
  grandmaster: 'grandmaster',
}))

function getRankTone(rankName: string) {
  const key = rankName.trim().toLowerCase()
  return normalizedTones.value[key as keyof typeof normalizedTones.value] ?? 'master'
}

function goToDashboard() {
  router.push('/backoffice/dashboard')
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
    return
  }

  void ranksStore.fetchRanks()
})
</script>

<style scoped>
.ranks-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.ranks-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.ranks-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(145deg, rgba(54, 57, 63, 0.94), rgba(30, 31, 34, 0.96)),
    radial-gradient(circle at 84% 12%, rgba(88, 101, 242, 0.24), transparent 36%);
  padding: 1.5rem;
  box-shadow: 0 20px 44px -26px rgba(0, 0, 0, 0.86);
}

.ranks-badge {
  display: inline-flex;
  padding: 0.34rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(88, 101, 242, 0.4);
  background: rgba(88, 101, 242, 0.16);
  color: #cfd5ff;
  font-size: 0.73rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ranks-title {
  margin: 0.8rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 2.4vw, 2.4rem);
  letter-spacing: -0.03em;
}

.ranks-subtitle {
  margin: 0.45rem 0 0;
  color: rgba(252, 239, 225, 0.66);
  max-width: 700px;
}

.ranks-back-btn {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(88, 101, 242, 0.35);
  background: rgba(88, 101, 242, 0.22);
  color: #e7e9ff;
  font-weight: 800;
  padding: 0.72rem 1rem;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}

.ranks-back-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.ranks-summary {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.summary-chip {
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(30, 31, 34, 0.85);
  padding: 0.46rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.8rem;
}

.summary-chip strong {
  color: var(--color-cream);
  font-size: 0.9rem;
}

.ranks-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.rank-card {
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(170deg, rgba(54, 57, 63, 0.95), rgba(30, 31, 34, 0.98));
  box-shadow: 0 16px 36px -24px rgba(0, 0, 0, 0.82);
  padding: 1.1rem;
}

.rank-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.85rem;
}

.rank-card__title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 900;
}

.rank-card__xp {
  margin: 0.22rem 0 0;
  font-size: 0.82rem;
  color: rgba(252, 239, 225, 0.58);
}

.rank-card__count {
  font-size: 0.76rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.3rem 0.56rem;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.72);
}

.division-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.division-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.34);
  padding: 0.52rem 0.62rem;
}

.division-row__left {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.division-row__order {
  font-size: 0.72rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.56);
}

.division-row__name {
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--color-cream);
}

.division-row__xp {
  font-size: 0.76rem;
  color: rgba(252, 239, 225, 0.64);
  font-weight: 700;
  text-align: right;
}

.rank-card--bronze {
  border-color: rgba(176, 135, 88, 0.4);
}

.rank-card--silver {
  border-color: rgba(216, 222, 234, 0.36);
}

.rank-card--gold {
  border-color: rgba(241, 194, 90, 0.42);
}

.rank-card--platinum {
  border-color: rgba(96, 214, 196, 0.4);
}

.rank-card--diamond {
  border-color: rgba(116, 169, 255, 0.4);
}

.rank-card--master {
  border-color: rgba(255, 106, 168, 0.4);
}

.rank-card--grandmaster {
  border-color: rgba(255, 79, 79, 0.44);
}

@media (max-width: 980px) {
  .ranks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ranks-page {
    padding: 1rem;
  }

  .ranks-hero {
    flex-direction: column;
  }

  .ranks-back-btn {
    width: 100%;
  }

  .division-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .division-row__xp {
    text-align: left;
  }
}
</style>
