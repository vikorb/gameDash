<template>
  <section class="shop-page">
    <div class="page-shell">
      <!-- ─── Hero ─────────────────────────────────────────────────── -->
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('shop.badge') }}</span>
            <h1 class="page-title">{{ t('shop.title') }}</h1>
            <p class="page-subtitle">{{ t('shop.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <router-link to="/inventory" class="btn btn--ghost">
              🎒 {{ t('shop.goToInventory') }}
            </router-link>
            <button type="button" class="btn btn--primary" @click="showTopUp = true">
              ⬢ {{ t('shop.wallet.topup') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('shop.wallet.label') }}</div>
            <div class="hero-side__title">{{ t('shop.wallet.title') }}</div>
            <p class="hero-side__text">{{ t('shop.wallet.text') }}</p>
          </div>

          <div class="hero-side__wallets">
            <div class="wallet-row wallet-row--soft">
              <span class="wallet-row__icon">⬣</span>
              <div>
                <span class="wallet-row__label">{{ t('shop.wallet.soft') }}</span>
                <strong class="wallet-row__val">{{
                  store.wallet.soft.toLocaleString(locale)
                }}</strong>
              </div>
            </div>
            <div class="wallet-row wallet-row--hard">
              <span class="wallet-row__icon">⬢</span>
              <div>
                <span class="wallet-row__label">{{ t('shop.wallet.hard') }}</span>
                <strong class="wallet-row__val">{{
                  store.wallet.hard.toLocaleString(locale)
                }}</strong>
              </div>
            </div>
          </div>
        </aside>
      </header>

      <!-- ─── Featured ─────────────────────────────────────────────── -->
      <section v-if="store.featuredItems.length" class="currency-grid">
        <article
          v-for="item in store.featuredItems"
          :key="item.id"
          :class="['currency-card', `currency-card--${item.rarity}`]"
          @click="openPurchase(item)"
        >
          <div class="currency-card__icon">{{ item.icon }}</div>
          <div class="currency-card__body">
            <span :class="['rarity-pill', `rarity-pill--${item.rarity}`]">
              ⭐ {{ t(`shop.rarity.${item.rarity}`) }}
            </span>
            <strong class="currency-card__value">{{ item.name }}</strong>
            <span class="currency-card__caption">
              {{ item.slot ? t(`shop.slots.${item.slot}`) : t(`shop.categories.${item.category}`) }}
            </span>
          </div>
          <div class="featured-price">
            <span :class="['currency-badge', `currency-badge--${item.currency}`]">
              {{ item.currency === 'soft' ? '⬣' : '⬢' }}
            </span>
            <strong>{{ item.price.toLocaleString(locale) }}</strong>
          </div>
        </article>
      </section>

      <!-- ─── Filters + grid ───────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('shop.browse.title') }}</h2>
            <p class="surface-subtitle">{{ t('shop.browse.subtitle') }}</p>
          </div>
          <div class="surface-header__meta">
            <span class="meta-item">{{ filteredItems.length }} {{ t('shop.browse.count') }}</span>
            <span class="meta-item meta-item--owned">
              {{ store.inventory.length }} {{ t('shop.browse.owned') }}
            </span>
          </div>
        </div>

        <div class="toolbar">
          <div class="cat-tabs">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.value"
              type="button"
              :class="[
                'btn-inline',
                selectedCategory === cat.value ? 'btn-inline--primary' : 'btn-inline--ghost',
              ]"
              @click="selectedCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>

          <select v-model="selectedCurrency" class="select">
            <option v-for="c in CURRENCIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>

          <input
            v-model="search"
            type="text"
            class="input input--toolbar"
            :placeholder="t('shop.search.placeholder')"
          />
        </div>

        <div v-if="filteredItems.length" class="items-grid">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            :class="[
              'item-card',
              `item-card--${item.rarity}`,
              store.isOwned(item.id) ? 'item-card--owned' : '',
            ]"
            @click="!store.isOwned(item.id) && openPurchase(item)"
          >
            <div class="item-card__top">
              <span v-if="item.isNew" class="new-badge">NEW</span>
              <span :class="['rarity-dot', `rarity-dot--${item.rarity}`]"></span>
            </div>

            <div class="item-card__icon">{{ item.icon }}</div>

            <div class="item-card__body">
              <strong class="item-card__name">{{ item.name }}</strong>
              <span class="item-card__meta">
                {{
                  item.slot ? t(`shop.slots.${item.slot}`) : t(`shop.categories.${item.category}`)
                }}
              </span>
            </div>

            <div class="item-card__footer">
              <div v-if="!store.isOwned(item.id)" class="item-price">
                <span :class="['currency-badge', `currency-badge--${item.currency}`]">
                  {{ item.currency === 'soft' ? '⬣' : '⬢' }}
                </span>
                <span class="item-price__val">{{ item.price.toLocaleString(locale) }}</span>
              </div>

              <button
                type="button"
                :class="[
                  'btn-inline',
                  'btn-inline--small',
                  store.isOwned(item.id)
                    ? 'btn-inline--owned'
                    : canAfford(item)
                      ? 'btn-inline--primary'
                      : 'btn-inline--broke',
                ]"
                :disabled="store.isOwned(item.id)"
              >
                {{
                  store.isOwned(item.id)
                    ? t('shop.item.owned')
                    : canAfford(item)
                      ? t('shop.item.buy')
                      : t('shop.item.insufficient')
                }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('shop.empty.title') }}</h3>
          <p class="empty-state__text">{{ t('shop.empty.text') }}</p>
        </div>
      </section>

      <!-- ─── Purchase modal ───────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="purchaseItem" class="modal-backdrop" @click.self="closePurchase">
            <div :class="['modal-box', `modal-box--${purchaseItem.rarity}`]">
              <button type="button" class="modal-close" @click="closePurchase">✕</button>

              <div class="modal-icon">{{ purchaseItem.icon }}</div>

              <span :class="['rarity-pill', `rarity-pill--${purchaseItem.rarity}`]">
                {{ t(`shop.rarity.${purchaseItem.rarity}`) }}
              </span>

              <h3 class="modal-title">{{ purchaseItem.name }}</h3>
              <p class="modal-meta">
                {{
                  purchaseItem.slot
                    ? t(`shop.slots.${purchaseItem.slot}`)
                    : t(`shop.categories.${purchaseItem.category}`)
                }}
              </p>

              <div class="modal-price-row">
                <span :class="['currency-badge', `currency-badge--${purchaseItem.currency}`]">
                  {{ purchaseItem.currency === 'soft' ? '⬣' : '⬢' }}
                </span>
                <strong class="modal-price-val">{{
                  purchaseItem.price.toLocaleString(locale)
                }}</strong>
                <span class="modal-balance">
                  /
                  {{
                    (purchaseItem.currency === 'soft'
                      ? store.wallet.soft
                      : store.wallet.hard
                    ).toLocaleString(locale)
                  }}
                  {{ t('shop.wallet.' + purchaseItem.currency) }}
                </span>
              </div>

              <div
                v-if="purchaseFeedback"
                :class="['feedback-banner', `feedback-banner--${purchaseFeedback.type}`]"
              >
                {{ purchaseFeedback.message }}
              </div>

              <div
                v-if="!purchaseFeedback || purchaseFeedback.type === 'error'"
                class="modal-actions"
              >
                <button type="button" class="btn btn--ghost" @click="closePurchase">
                  {{ t('shop.purchase.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn btn--primary"
                  :disabled="!canAfford(purchaseItem) || purchasing"
                  @click="confirmPurchase"
                >
                  {{ purchasing ? '…' : t('shop.purchase.confirm') }}
                </button>
              </div>

              <button
                v-else
                type="button"
                class="btn btn--primary btn--full"
                @click="closePurchase"
              >
                OK
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ─── Top-Up modal ─────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showTopUp" class="modal-backdrop" @click.self="closeTopUp">
            <div class="modal-box modal-box--topup">
              <button type="button" class="modal-close" @click="closeTopUp">✕</button>

              <div class="topup-header">
                <span class="page-badge">{{ t('shop.topup.badge') }}</span>
                <h3 class="modal-title">{{ t('shop.topup.title') }}</h3>
                <p class="modal-meta">{{ t('shop.topup.subtitle') }}</p>
              </div>

              <div class="packs-grid">
                <button
                  v-for="pack in TOPUP_PACKS"
                  :key="pack.id"
                  type="button"
                  :class="[
                    'pack-card',
                    pack.popular ? 'pack-card--popular' : '',
                    selectedPack?.id === pack.id ? 'pack-card--selected' : '',
                  ]"
                  :disabled="topupProcessing"
                  @click="selectedPack = pack"
                >
                  <span v-if="pack.popular" class="pack-popular"
                    >⭐ {{ t('shop.topup.bestValue') }}</span
                  >
                  <div class="pack-hard">
                    {{ (pack.hard + pack.bonus).toLocaleString(locale) }} ⬢
                  </div>
                  <div v-if="pack.bonus > 0" class="pack-bonus">
                    +{{ pack.bonus }} {{ t('shop.topup.bonus') }}
                  </div>
                  <div class="pack-eur">{{ pack.price.toFixed(2).replace('.', ',') }} €</div>
                  <div class="pack-label">{{ pack.label }}</div>
                </button>
              </div>

              <div
                v-if="topupFeedback"
                :class="['feedback-banner', `feedback-banner--${topupFeedback.type}`]"
              >
                {{ topupFeedback.message }}
              </div>

              <button
                type="button"
                class="btn btn--primary btn--full"
                :disabled="!selectedPack || topupProcessing"
                @click="doTopUp"
              >
                <span v-if="topupProcessing" class="spinning">⟳</span>
                {{ topupProcessing ? t('shop.topup.processing') : t('shop.topup.simulate') }}
              </button>

              <p class="topup-disclaimer">{{ t('shop.topup.disclaimer') }}</p>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { type ShopItem, TOPUP_PACKS, type TopUpPack, useShopStore, wait } from '@/stores/shopStore'

const store = useShopStore()
const { t, locale } = useI18n({ useScope: 'global' })

// --- Filters ---------------------------------------------------------------
const search = ref('')
const selectedCategory = ref<string>('all')
const selectedCurrency = ref<string>('all')

const CATEGORIES = computed(() => [
  { value: 'all', label: t('shop.categories.all') },
  { value: 'cosmetic', label: t('shop.categories.cosmetic') },
  { value: 'pack', label: t('shop.categories.pack') },
  { value: 'pass', label: t('shop.categories.pass') },
  { value: 'boost', label: t('shop.categories.boost') },
])

const CURRENCIES = computed(() => [
  { value: 'all', label: t('shop.currencies.all') },
  { value: 'soft', label: t('shop.currencies.soft') },
  { value: 'hard', label: t('shop.currencies.hard') },
])

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.availableItems.filter((item) => {
    const matchQ = !q || item.name.toLowerCase().includes(q)
    const matchCat = selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchCur = selectedCurrency.value === 'all' || item.currency === selectedCurrency.value
    return matchQ && matchCat && matchCur
  })
})

function canAfford(item: ShopItem) {
  const bal = item.currency === 'soft' ? store.wallet.soft : store.wallet.hard
  return bal >= item.price
}

// --- Purchase modal --------------------------------------------------------
const purchaseItem = ref<ShopItem | null>(null)
const purchasing = ref(false)
const purchaseFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function openPurchase(item: ShopItem) {
  if (store.isOwned(item.id)) return
  purchaseItem.value = item
  purchaseFeedback.value = null
}

function closePurchase() {
  purchaseItem.value = null
  purchaseFeedback.value = null
}

async function confirmPurchase() {
  if (!purchaseItem.value) return
  purchasing.value = true
  await wait(300)
  const result = store.purchase(purchaseItem.value.id)
  purchaseFeedback.value = result.success
    ? { type: 'success', message: t('shop.purchase.success') }
    : result.reason === 'insufficient_funds'
      ? { type: 'error', message: t('shop.purchase.insufficientFunds') }
      : { type: 'error', message: t('shop.purchase.error') }
  purchasing.value = false
}

// --- Top-up modal ----------------------------------------------------------
const showTopUp = ref(false)
const selectedPack = ref<TopUpPack | null>(null)
const topupProcessing = ref(false)
const topupFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function closeTopUp() {
  showTopUp.value = false
  selectedPack.value = null
  topupFeedback.value = null
}

async function doTopUp() {
  if (!selectedPack.value) return
  topupProcessing.value = true
  topupFeedback.value = null
  const result = await store.simulatePayment(selectedPack.value.id)
  topupFeedback.value = result.success
    ? {
        type: 'success',
        message: t('shop.topup.success', {
          amount: (selectedPack.value.hard + selectedPack.value.bonus).toLocaleString(locale.value),
        }),
      }
    : { type: 'error', message: t('shop.topup.fail') }
  topupProcessing.value = false
  selectedPack.value = null
}
</script>

<style scoped>
/* ─── Page shell ─────────────────────────────────────────────────────────── */
.shop-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
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
    radial-gradient(circle at 10% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 90% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
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

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.btn,
.btn-inline {
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn {
  min-height: 42px;
  padding: 0.85rem 1.1rem;
  font-size: 0.9rem;
}

.btn-inline {
  min-height: 36px;
  padding: 0.5rem 0.9rem;
  font-size: 0.82rem;
}

.btn-inline--small {
  min-height: 30px;
  padding: 0.38rem 0.7rem;
  font-size: 0.76rem;
}

.btn:hover:not(:disabled),
.btn-inline:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-inline:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn--primary,
.btn-inline--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.btn-inline--primary:hover:not(:disabled) {
  filter: brightness(1.04);
}

.btn--ghost,
.btn-inline--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.btn-inline--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.btn--full {
  width: 100%;
}

.btn-inline--owned {
  background: rgba(61, 191, 125, 0.14);
  color: #7ee0ad;
  border-color: rgba(61, 191, 125, 0.28);
  cursor: default;
}

.btn-inline--broke {
  background: rgba(225, 91, 91, 0.14);
  color: #ffb3b3;
  border-color: rgba(225, 91, 91, 0.28);
  cursor: not-allowed;
}

/* ─── Hero side ──────────────────────────────────────────────────────────── */
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

.hero-side__wallets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
}

.wallet-row--soft {
  border-color: rgba(242, 139, 91, 0.26);
  background: rgba(242, 139, 91, 0.1);
}
.wallet-row--hard {
  border-color: rgba(80, 120, 238, 0.26);
  background: rgba(80, 120, 238, 0.1);
}

.wallet-row__icon {
  font-size: 1.2rem;
}

.wallet-row__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(252, 239, 225, 0.58);
}

.wallet-row__val {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--color-cream);
  line-height: 1;
}

/* ─── Currency cards (featured) ──────────────────────────────────────────── */
.currency-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.currency-card {
  padding: 1.15rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.9)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  display: flex;
  gap: 0.85rem;
  align-items: center;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.currency-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.currency-card--legendary {
  border-color: rgba(242, 139, 91, 0.28);
}
.currency-card--epic {
  border-color: rgba(93, 44, 168, 0.24);
}
.currency-card--rare {
  border-color: rgba(49, 89, 140, 0.24);
}

.currency-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  flex-shrink: 0;
  background: rgba(242, 139, 91, 0.14);
  border: 1px solid rgba(242, 139, 91, 0.24);
}

.currency-card__body {
  flex: 1;
  min-width: 0;
}

.currency-card__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
}

.currency-card__caption {
  display: block;
  margin-top: 0.25rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.78rem;
}

.featured-price {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.featured-price strong {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-cream);
}

/* ─── Rarity pills & dots ────────────────────────────────────────────────── */
.rarity-pill {
  display: inline-flex;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rarity-pill--common {
  background: rgba(252, 239, 225, 0.1);
  color: rgba(252, 239, 225, 0.7);
  border: 1px solid rgba(252, 239, 225, 0.12);
}
.rarity-pill--rare {
  background: rgba(49, 89, 140, 0.28);
  color: #9ab8ff;
  border: 1px solid rgba(49, 89, 140, 0.36);
}
.rarity-pill--epic {
  background: rgba(93, 44, 168, 0.28);
  color: #c8a0ff;
  border: 1px solid rgba(93, 44, 168, 0.36);
}
.rarity-pill--legendary {
  background: rgba(242, 139, 91, 0.18);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.32);
}

.rarity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.rarity-dot--common {
  background: rgba(252, 239, 225, 0.3);
}
.rarity-dot--rare {
  background: #9ab8ff;
}
.rarity-dot--epic {
  background: #c8a0ff;
}
.rarity-dot--legendary {
  background: var(--color-primary-strong);
}

/* ─── Currency badges ────────────────────────────────────────────────────── */
.currency-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  border: 1px solid rgba(252, 239, 225, 0.1);
}
.currency-badge--soft {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.26);
}
.currency-badge--hard {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.26);
}

/* ─── Meta items ─────────────────────────────────────────────────────────── */
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

.meta-item--owned {
  background: rgba(61, 191, 125, 0.14);
  color: #7ee0ad;
  border-color: rgba(61, 191, 125, 0.28);
}

/* ─── Surface ────────────────────────────────────────────────────────────── */
.surface {
  margin-top: 1.5rem;
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

.surface-header__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

/* ─── Toolbar ────────────────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1.25rem;
}

.cat-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.input,
.select {
  min-height: 40px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.6rem 0.9rem;
  font: inherit;
  font-weight: 800;
  font-size: 0.84rem;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.input::placeholder {
  color: rgba(252, 239, 225, 0.34);
}

.input:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.62);
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12);
  transform: translateY(-1px);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}
.input--toolbar {
  flex: 1;
  min-width: 180px;
}

/* ─── Items grid ─────────────────────────────────────────────────────────── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.85rem;
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.item-card:hover:not(.item-card--owned) {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.3);
  background: rgba(242, 139, 91, 0.06);
}

.item-card--owned {
  opacity: 0.65;
  cursor: default;
}

.item-card--rare:hover:not(.item-card--owned) {
  border-color: rgba(49, 89, 140, 0.45);
  background: rgba(49, 89, 140, 0.08);
}
.item-card--epic:hover:not(.item-card--owned) {
  border-color: rgba(93, 44, 168, 0.45);
  background: rgba(93, 44, 168, 0.08);
}
.item-card--legendary:hover:not(.item-card--owned) {
  border-color: rgba(242, 139, 91, 0.45);
  background: rgba(242, 139, 91, 0.08);
}

.item-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-badge {
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  padding: 0.16rem 0.48rem;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
}

.item-card__icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: rgba(18, 24, 38, 0.42);
  border: 1px solid rgba(252, 239, 225, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.9rem;
  margin: 0 auto;
}

.item-card__body {
  text-align: center;
}

.item-card__name {
  display: block;
  color: var(--color-cream);
  font-size: 0.88rem;
  font-weight: 900;
}

.item-card__meta {
  display: block;
  font-size: 0.74rem;
  color: rgba(252, 239, 225, 0.5);
  margin-top: 0.18rem;
}

.item-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(252, 239, 225, 0.07);
}

.item-price {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.item-price__val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.92rem;
  font-weight: 900;
  color: var(--color-cream);
}

/* ─── Feedback ───────────────────────────────────────────────────────────── */
.feedback-banner {
  margin: 0.75rem 0;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-weight: 900;
  line-height: 1.45;
  font-size: 0.88rem;
}

.feedback-banner--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
}

.feedback-banner--error {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.35);
}

/* ─── Empty ──────────────────────────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
}

.empty-state__text {
  margin: 0.5rem 0 0;
  color: rgba(252, 239, 225, 0.58);
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(14, 18, 30, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(160deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 40px 90px -30px rgba(0, 0, 0, 0.7);
  text-align: center;
}

.modal-box--legendary {
  border-color: rgba(242, 139, 91, 0.36);
}
.modal-box--epic {
  border-color: rgba(93, 44, 168, 0.36);
}
.modal-box--rare {
  border-color: rgba(49, 89, 140, 0.36);
}
.modal-box--topup {
  max-width: 580px;
  text-align: left;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  border-radius: 50%;
  background: rgba(18, 24, 38, 0.4);
  color: rgba(252, 239, 225, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s;
}
.modal-close:hover {
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-cream);
  border-color: rgba(242, 139, 91, 0.3);
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(18, 24, 38, 0.42);
  border: 1px solid rgba(252, 239, 225, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  margin: 0 auto 1rem;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0.65rem 0 0.25rem;
}

.modal-meta {
  font-size: 0.85rem;
  color: rgba(252, 239, 225, 0.58);
  margin: 0 0 1.25rem;
}

.modal-price-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 14px;
  background: rgba(18, 24, 38, 0.42);
  border: 1px solid rgba(252, 239, 225, 0.1);
  margin-bottom: 1.25rem;
}

.modal-price-val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-cream);
}

.modal-balance {
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.45);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

/* ─── Top-up modal ───────────────────────────────────────────────────────── */
.topup-header {
  margin-bottom: 1.5rem;
}

.packs-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.pack-card {
  position: relative;
  padding: 0.85rem 0.45rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.22rem;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.pack-card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background: rgba(242, 139, 91, 0.1);
}

.pack-card--popular {
  border-color: rgba(242, 139, 91, 0.32);
  background: rgba(242, 139, 91, 0.08);
}
.pack-card--selected {
  border-color: rgba(242, 139, 91, 0.65);
  background: rgba(242, 139, 91, 0.16);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.22);
}

.pack-popular {
  position: absolute;
  top: -9px;
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  padding: 0.12rem 0.45rem;
  border-radius: 6px;
  white-space: nowrap;
}

.pack-hard {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--color-primary-strong);
  margin-top: 0.4rem;
}

.pack-bonus {
  font-size: 0.64rem;
  font-weight: 900;
  color: #7ee0ad;
}

.pack-eur {
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--color-cream);
}

.pack-label {
  font-size: 0.66rem;
  color: rgba(252, 239, 225, 0.45);
  font-weight: 700;
}

.topup-disclaimer {
  font-size: 0.72rem;
  color: rgba(252, 239, 225, 0.32);
  margin: 0.75rem 0 0;
  text-align: center;
}

.spinning {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Modal transition ───────────────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition:
    transform 0.22s ease,
    opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.94) translateY(16px);
  opacity: 0;
}

/* ─── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .currency-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
  .packs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .shop-page {
    padding: 1rem;
  }
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .packs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .cat-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .input--toolbar {
    min-width: unset;
  }
  .currency-grid {
    grid-template-columns: 1fr;
  }
}
</style>
