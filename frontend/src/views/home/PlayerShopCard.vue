<template>
  <BaseCard class="player-card shop-card">
    <div class="card-head">
      <h3 class="card-title">{{ t('home.player_dashboard.shop.title') }}</h3>
      <RouterLink class="shop-link" to="/shop">{{ t('home.player_dashboard.shop.open') }}</RouterLink>
    </div>

    <p class="shop-ribbon">{{ t('home.player_dashboard.shop.announcement') }}</p>
    <p class="shop-caption">{{ t('home.player_dashboard.shop.caption') }}</p>

    <p v-if="shopStore.loading" class="shop-state">
      {{ t('home.player_dashboard.shop.loading') }}
    </p>

    <div v-else-if="latestItems.length" class="shop-grid">
      <button
        v-for="item in latestItems"
        :key="item.id"
        type="button"
        class="shop-card"
        @click="goToShopItem(item.id)"
      >
        <div class="shop-card__media-wrap">
          <img class="shop-card__media" :src="picsumUrl(item.imageSeed, 240, 180)" :alt="item.name" />
          <span v-if="item.isNew" class="shop-card__badge">NEW</span>
        </div>

        <div class="shop-card__body">
          <div class="shop-card__title-row">
            <p class="shop-card__name">{{ item.name }}</p>
          </div>
          <p class="shop-card__meta">{{ item.rarity }} · {{ item.category }}</p>
          <p class="shop-card__teaser">{{ t('home.player_dashboard.shop.teaser') }}</p>
        </div>

        <div class="shop-card__footer">
          <p class="shop-card__price">{{ formatPrice(item.price, item.currency) }}</p>
          <span class="shop-card__cta">{{ t('home.player_dashboard.shop.productCta') }}</span>
        </div>
      </button>
    </div>

    <p v-else class="shop-state">
      {{ t('home.player_dashboard.shop.empty') }}
    </p>

    <p class="shop-footnote">{{ t('home.player_dashboard.shop.footnote') }}</p>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import BaseCard from '@/components/ui/BaseCard.vue'
import { useShopStore } from '@/stores/shopStore'
import { picsumUrl } from '@/stores/shopUtils'
import type { Currency, ShopItem } from '@/types/shops'

const { t } = useI18n({ useScope: 'global' })
const shopStore = useShopStore()
const router = useRouter()

const latestItems = computed<ShopItem[]>(() => {
  const byIdDesc = [...shopStore.shopItems].sort((a, b) => b.id - a.id)
  const newItems = byIdDesc.filter((item) => item.available && item.isNew)

  if (newItems.length >= 2) return newItems.slice(0, 3)

  const fallback = byIdDesc.filter((item) => item.available)
  return fallback.slice(0, 3)
})

function formatPrice(price: number, currency: Currency): string {
  return `${price} ${currency === 'hard' ? '★' : '¤'}`
}

function goToShopItem(itemId: number): void {
  void router.push({
    path: '/shop',
    query: {
      tab: 'catalogue',
      item: String(itemId),
    },
  })
}

onMounted(async () => {
  if (shopStore.shopItems.length === 0) {
    await shopStore.fetchShopState()
  }
})
</script>

<style scoped>
.player-card {
  background: linear-gradient(140deg, rgba(56, 70, 98, 0.82), rgba(30, 36, 54, 0.92));
  border: 1px solid rgba(252, 239, 225, 0.14);
  box-shadow: 0 18px 34px -26px rgba(0, 0, 0, 0.84);
}

.card-title {
  color: var(--color-cream);
  font-size: 1.55rem;
  margin: 0;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
}

.shop-link {
  color: var(--color-primary-strong);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 800;
}

.shop-link:hover {
  text-decoration: underline;
}

.shop-caption {
  margin: 0.35rem 0 0.65rem;
  color: color-mix(in srgb, var(--color-cream) 62%, var(--color-background-secondary));
  font-size: 0.83rem;
}

.shop-ribbon {
  margin: 0.45rem 0 0;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.46);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  margin-top: 0.35rem;
  padding: 0;
}

.shop-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 0.28rem;
  background: linear-gradient(120deg, rgba(20, 26, 43, 0.72), rgba(36, 43, 66, 0.82));
  width: 100%;
  border: 1px solid rgba(252, 239, 225, 0.08);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease,
    filter 0.16s ease;
}

.shop-card:hover {
  border-color: color-mix(in srgb, var(--color-primary-strong) 52%, transparent);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -12px rgba(0, 0, 0, 0.75);
  filter: saturate(1.08);
}

.shop-card__media-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.shop-card__media {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.shop-card__body {
  display: grid;
  gap: 0.18rem;
  padding: 0.45rem 0.55rem 0.35rem;
}

.shop-card__title-row {
  display: flex;
  align-items: center;
  gap: 0.28rem;
}

.shop-card__name {
  margin: 0;
  color: var(--color-cream);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.15;
}

.shop-card__meta {
  margin: 0;
  text-transform: capitalize;
  color: color-mix(in srgb, var(--color-cream) 68%, var(--color-background-secondary));
  font-size: 0.66rem;
}

.shop-card__teaser {
  margin: 0;
  color: rgba(252, 239, 225, 0.74);
  font-size: 0.64rem;
}

.shop-card__badge {
  position: absolute;
  top: 0.32rem;
  right: 0.32rem;
  border-radius: 999px;
  padding: 0.08rem 0.32rem;
  background: rgba(242, 139, 91, 0.22);
  border: 1px solid rgba(242, 139, 91, 0.45);
  color: var(--color-primary-strong);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.shop-card__footer {
  padding: 0 0.55rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.shop-card__price {
  margin: 0;
  color: var(--color-primary-strong);
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.12rem 0.4rem;
  border: 1px solid rgba(242, 139, 91, 0.34);
  background: rgba(242, 139, 91, 0.14);
}

.shop-card__cta {
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.63rem;
  font-weight: 700;
}

.shop-footnote {
  margin: 0.55rem 0 0;
  color: color-mix(in srgb, var(--color-cream) 70%, var(--color-background-secondary));
  font-size: 0.78rem;
}

.shop-state {
  margin: 0;
  color: color-mix(in srgb, var(--color-cream) 70%, var(--color-background-secondary));
}

@media (max-width: 980px) {
  .shop-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .shop-grid {
    grid-template-columns: 1fr;
  }
}
</style>
