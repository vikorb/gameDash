<template>
  <BaseCard class="player-card competitive-card">
    <h4 class="competitive-title">{{ t('home.player_dashboard.competitive.title') }}</h4>

    <div class="competitive-line">
      <span class="label">{{ t('home.player_dashboard.competitive.mmr') }}</span>
      <strong class="value">1476</strong>
    </div>

    <div class="competitive-line">
      <span class="label">{{ t('home.player_dashboard.competitive.winrate') }}</span>
      <strong class="value">57%</strong>
    </div>

    <p class="competitive-link">{{ t('home.player_dashboard.competitive.link') }}</p>
  </BaseCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/ui/BaseCard.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.player-card {
  background: color-mix(in srgb, var(--color-bg) 78%, var(--color-background-secondary));
  border: 1px solid color-mix(in srgb, var(--color-background-secondary) 60%, var(--color-cream));
  color: var(--color-cream);
}

.competitive-title {
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

.competitive-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.55rem 0;
}

.label {
  color: color-mix(in srgb, var(--color-cream) 78%, var(--color-background-secondary));
  font-size: 0.95rem;
}

.value {
  color: var(--color-cream);
  font-size: 1.55rem;
}

.competitive-link {
  margin: 0.9rem 0 0;
  font-size: 0.95rem;
  color: color-mix(in srgb, var(--color-cream) 88%, var(--color-background-secondary));
}
</style>
