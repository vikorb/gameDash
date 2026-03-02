<template>
  <BaseCard class="player-card rank-card">
    <h3 class="rank-title">{{ t('home.player_dashboard.rank.title') }}</h3>
    <p class="rank-level">{{ t('home.player_dashboard.rank.level', { level: 24 }) }}</p>
    <p class="rank-xp">18 200 XP / 25 000 XP (72%)</p>

    <div
      class="rank-progress"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="72"
    >
      <span class="rank-progress__fill" />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/ui/BaseCard.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.player-card {
  background: color-mix(in srgb, var(--color-background-secondary) 88%, var(--color-cream));
  border: 1px solid color-mix(in srgb, var(--color-background-secondary) 58%, var(--color-cream));
}

.rank-title {
  margin: 0;
  font-size: 3.2rem;
  color: var(--color-primary-strong);
  letter-spacing: 0.04em;
}

.rank-level {
  margin: 0.3rem 0 0;
  font-size: 2.1rem;
  color: var(--color-primary-strong);
  font-weight: 700;
}

.rank-xp {
  margin: 0.3rem 0 0.7rem;
  color: color-mix(in srgb, var(--color-cream) 80%, var(--color-background-secondary));
  font-size: 0.9rem;
}

.rank-progress {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 75%, var(--color-background-secondary));
  overflow: hidden;
}

.rank-progress__fill {
  display: block;
  width: 72%;
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
}
</style>
