<template>
  <BaseCard class="player-card shop-card">
    <h3 class="card-title">{{ t('home.player_dashboard.shop.title') }}</h3>

    <div class="shop-list">
      <article v-for="item in shopItems" :key="item.key" class="shop-item">
        <span class="shop-item__dot" aria-hidden="true" />
        <div class="shop-item__content">
          <p class="shop-item__name">{{ t(item.nameKey) }}</p>
          <p class="shop-item__price">{{ item.price }}</p>
        </div>
      </article>
    </div>

    <p class="shop-footnote">{{ t('home.player_dashboard.shop.footnote') }}</p>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseCard from '@/components/ui/BaseCard.vue'

const { t } = useI18n({ useScope: 'global' })

const shopItems = computed(() => [
  {
    key: 'orange',
    nameKey: 'home.player_dashboard.shop.orange_pack',
    price: '1200 ★',
  },
  {
    key: 'premium',
    nameKey: 'home.player_dashboard.shop.premium_pack',
    price: '2400 ★',
  },
])
</script>

<style scoped>
.player-card {
  background: color-mix(in srgb, var(--color-background-secondary) 85%, var(--color-cream));
  border: 1px solid color-mix(in srgb, var(--color-background-secondary) 55%, var(--color-cream));
}

.card-title {
  color: var(--color-cream);
  font-size: 2rem;
  margin: 0 0 1rem;
}

.shop-list {
  display: grid;
  gap: 0.75rem;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-radius: 14px;
  padding: 0.8rem;
  background: color-mix(in srgb, var(--color-bg) 70%, var(--color-background-secondary));
}

.shop-item__dot {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: var(--color-primary);
  flex: 0 0 52px;
}

.shop-item__content {
  display: grid;
  gap: 0.2rem;
}

.shop-item__name {
  margin: 0;
  color: var(--color-cream);
  font-size: 1.05rem;
}

.shop-item__price {
  margin: 0;
  color: var(--color-primary-strong);
  font-size: 2rem;
  font-weight: 700;
}

.shop-footnote {
  margin: 0.8rem 0 0;
  color: color-mix(in srgb, var(--color-cream) 70%, var(--color-background-secondary));
  font-size: 0.95rem;
}
</style>
