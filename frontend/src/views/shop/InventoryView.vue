<template>
  <main class="inv-page">
    <div class="page-shell">
      <!-- ─── Loading ────────────────────────────────────────────────────── -->
      <div v-if="store.loading" class="loading-state">
        <svg viewBox="0 0 24 24" class="loading-icon spinning" aria-hidden="true">
          <path :d="mdiLoading" />
        </svg>
        {{ t('inventory.loading') }}
      </div>

      <template v-else>
        <!-- ─── Hero ──────────────────────────────────────────────────────── -->
        <header class="page-hero">
          <div>
            <span class="page-badge">{{ t('inventory.badge') }}</span>
            <h1 class="page-title">{{ t('inventory.title') }}</h1>
            <p class="page-subtitle">{{ t('inventory.subtitle') }}</p>

            <div class="hero-actions">
              <router-link to="/shop" class="btn btn--primary">
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiStorefrontOutline" />
                </svg>
                {{ t('inventory.goToShop') }}
              </router-link>
            </div>
          </div>

          <aside class="hero-side">
            <div>
              <div class="hero-side__label">{{ t('inventory.hero.label') }}</div>
              <div class="hero-side__title">{{ t('inventory.hero.title') }}</div>
              <p class="hero-side__text">{{ t('inventory.hero.text') }}</p>
            </div>
            <div class="hero-side__chips">
              <span>{{ store.inventory.length }} {{ t('inventory.itemsCount') }}</span>
              <span
                >{{ equippedCount }} / {{ SLOTS.length }} {{ t('inventory.equippedCount') }}</span
              >
            </div>
          </aside>
        </header>

        <!-- ─── KPIs ──────────────────────────────────────────────────────── -->
        <section class="stat-grid inv-stat-grid">
          <article class="stat-card">
            <span class="stat-card__label">{{ t('inventory.stats.total') }}</span>
            <span class="stat-card__value">{{ store.inventory.length }}</span>
            <span class="stat-card__caption">{{ t('inventory.stats.totalCaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('inventory.stats.equipped') }}</span>
            <span class="stat-card__value">{{ equippedCount }}</span>
            <span class="stat-card__caption">{{ t('inventory.stats.equippedCaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('inventory.stats.legendaries') }}</span>
            <span class="stat-card__value">{{ legendaryCount }}</span>
            <span class="stat-card__caption">{{ t('inventory.stats.legendarycaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('inventory.stats.slots') }}</span>
            <span class="stat-card__value">{{ SLOTS.length - equippedCount }}</span>
            <span class="stat-card__caption">{{ t('inventory.stats.slotsCaption') }}</span>
          </article>
        </section>

        <!-- ─── Equipment slots ───────────────────────────────────────────── -->
        <section class="surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('inventory.slots.title') }}</h2>
              <p class="surface-subtitle">
                {{ t('inventory.slots.subtitle', { filled: equippedCount, total: SLOTS.length }) }}
              </p>
            </div>
          </div>

          <div class="equip-grid">
            <div
              v-for="slot in SLOTS"
              :key="slot.key"
              :class="[
                'equip-slot',
                equippedItem(slot.key)
                  ? `equip-slot--${equippedItem(slot.key)?.rarity}`
                  : 'equip-slot--empty',
              ]"
            >
              <div
                v-if="equippedItem(slot.key)"
                :class="['equip-slot__rarity-bar', `rarity-bar--${equippedItem(slot.key)?.rarity}`]"
              ></div>

              <div class="equip-slot__label">
                <svg viewBox="0 0 24 24" class="equip-slot__label-icon" aria-hidden="true">
                  <path :d="slot.icon" />
                </svg>
                {{ t(`inventory.slots.${slot.key}`) }}
              </div>

              <div class="equip-slot__visual">
                <template v-if="equippedItem(slot.key)">
                  <img
                    :src="picsumUrl(equippedItem(slot.key)!.imageSeed, 120, 120)"
                    :alt="equippedItem(slot.key)!.name"
                    class="equip-slot__img"
                  />
                </template>
                <div v-else class="equip-slot__placeholder">
                  <svg viewBox="0 0 24 24" class="equip-slot__placeholder-icon" aria-hidden="true">
                    <path :d="slot.icon" />
                  </svg>
                </div>
              </div>

              <div class="equip-slot__footer">
                <template v-if="equippedItem(slot.key)">
                  <strong class="equip-slot__name">{{ equippedItem(slot.key)!.name }}</strong>
                  <span :class="['rarity-pill', `rarity-pill--${equippedItem(slot.key)?.rarity}`]">
                    {{ t(`shop.rarity.${equippedItem(slot.key)?.rarity}`) }}
                  </span>
                  <button type="button" class="btn-unequip" @click="store.unequip(slot.key)">
                    <svg viewBox="0 0 24 24" class="btn-unequip__icon" aria-hidden="true">
                      <path :d="mdiClose" />
                    </svg>
                    {{ t('inventory.unequip') }}
                  </button>
                </template>
                <span v-else class="equip-slot__empty-label">{{ t('inventory.slotEmpty') }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── Inventory items ───────────────────────────────────────────── -->
        <section class="surface">
          <div class="surface-header">
            <div>
              <h2 class="surface-title">{{ t('inventory.items.title') }}</h2>
              <p class="surface-subtitle">
                {{ filteredInventory.length }} {{ t('inventory.itemsCount') }}
              </p>
            </div>
            <Transition name="fade-btn">
              <button
                v-if="hasActiveFilters"
                type="button"
                class="btn btn--ghost"
                @click="resetFilters"
              >
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiFilterRemove" />
                </svg>
                {{ t('shop.filters.reset') }}
              </button>
            </Transition>
          </div>

          <div class="toolbar inv-toolbar">
            <div class="search-field">
              <svg viewBox="0 0 24 24" class="search-field__icon" aria-hidden="true">
                <path :d="mdiMagnify" />
              </svg>
              <input
                v-model="search"
                type="search"
                class="field"
                :placeholder="t('inventory.search')"
              />
            </div>
            <select v-model="selectedFilter" class="select">
              <option v-for="f in FILTERS" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
            <select v-model="selectedRarity" class="select">
              <option v-for="r in RARITIES" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>

          <div v-if="filteredInventory.length" class="inv-grid">
            <article
              v-for="inv in filteredInventory"
              :key="inv.itemId"
              :class="[
                'inv-card',
                `rarity--${getItem(inv.itemId)?.rarity}`,
                store.isEquipped(inv.itemId) && 'inv-card--equipped',
              ]"
            >
              <div
                :class="['inv-card__rarity-bar', `rarity-bar--${getItem(inv.itemId)?.rarity}`]"
              ></div>

              <div class="inv-card__img-wrap">
                <img
                  :src="picsumUrl(getItem(inv.itemId)?.imageSeed ?? 'x', 180, 180)"
                  :alt="getItem(inv.itemId)?.name"
                  class="inv-card__img"
                />
                <span v-if="store.isEquipped(inv.itemId)" class="equipped-badge-abs">
                  <svg viewBox="0 0 24 24" class="equipped-badge-abs__icon" aria-hidden="true">
                    <path :d="mdiCheck" />
                  </svg>
                  {{ t('inventory.equippedLabel') }}
                </span>
              </div>

              <div class="inv-card__body">
                <div class="inv-card__info">
                  <strong class="inv-card__name">{{ getItem(inv.itemId)?.name }}</strong>
                  <div class="inv-card__meta-row">
                    <span :class="['rarity-pill', `rarity-pill--${getItem(inv.itemId)?.rarity}`]">
                      {{ t(`shop.rarity.${getItem(inv.itemId)?.rarity}`) }}
                    </span>
                    <span class="inv-card__slot-label">
                      {{
                        getItem(inv.itemId)?.slot
                          ? t(`inventory.slots.${getItem(inv.itemId)?.slot}`)
                          : t(`shop.categories.${getItem(inv.itemId)?.category}`)
                      }}
                    </span>
                  </div>
                </div>

                <div class="inv-card__footer">
                  <span class="inv-card__date">{{ formatDate(inv.ownedAt) }}</span>
                  <template v-if="getItem(inv.itemId)?.slot">
                    <button
                      v-if="!store.isEquipped(inv.itemId)"
                      type="button"
                      class="btn-equip"
                      @click="doEquip(inv.itemId)"
                    >
                      <svg viewBox="0 0 24 24" class="btn-equip__icon" aria-hidden="true">
                        <path :d="mdiArrowUpCircleOutline" />
                      </svg>
                      {{ t('inventory.equip') }}
                    </button>
                    <button
                      v-else
                      type="button"
                      class="btn-unequip"
                      @click="store.unequip(getItem(inv.itemId)!.slot!)"
                    >
                      <svg viewBox="0 0 24 24" class="btn-unequip__icon" aria-hidden="true">
                        <path :d="mdiClose" />
                      </svg>
                      {{ t('inventory.unequip') }}
                    </button>
                  </template>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <h3 class="empty-state__title">{{ t('inventory.empty.title') }}</h3>
            <p class="empty-state__text">{{ t('inventory.empty.text') }}</p>
          </div>
        </section>
      </template>
    </div>

    <!-- ─── Toast ─────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" :class="['equip-toast', `equip-toast--${toast.type}`]">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import {
  mdiAccountCircleOutline,
  mdiArrowUpCircleOutline,
  mdiCheck,
  mdiClose,
  mdiEmoticonHappyOutline,
  mdiFilterRemove,
  mdiImageFilterHdr,
  mdiImageFrame,
  mdiLoading,
  mdiMagnify,
  mdiMotionPlayOutline,
  mdiSpray,
  mdiStorefrontOutline,
} from '@mdi/js'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useShopStore } from '@/stores/shopStore'
import { picsumUrl } from '@/stores/shopUtils'

const store = useShopStore()
const { t, locale } = useI18n({ useScope: 'global' })

// ── Chargement initial (évite un double fetch si ShopView déjà chargé) ─────
onMounted(() => {
  if (!store.items.length) store.fetchShopState()
})

const SLOTS = [
  { key: 'avatar', icon: mdiAccountCircleOutline },
  { key: 'banner', icon: mdiImageFilterHdr },
  { key: 'frame', icon: mdiImageFrame },
  { key: 'emote', icon: mdiEmoticonHappyOutline },
  { key: 'trail', icon: mdiMotionPlayOutline },
  { key: 'spray', icon: mdiSpray },
]

function equippedItem(slot: string) {
  const id = store.equipped[slot]
  return id != null ? store.getItemById(id) : null
}

const equippedCount = computed(() => Object.values(store.equipped).filter((v) => v !== null).length)
const legendaryCount = computed(
  () =>
    store.inventory.filter((inv) => store.getItemById(inv.itemId)?.rarity === 'legendary').length,
)

// ── Filtres ────────────────────────────────────────────────────────────────
const search = ref('')
const selectedFilter = ref('all')
const selectedRarity = ref('all')

const FILTERS = computed(() => [
  { value: 'all', label: t('inventory.filters.all') },
  { value: 'equipped', label: t('inventory.filters.equipped') },
  { value: 'cosmetic', label: t('shop.categories.cosmetic') },
  { value: 'pack', label: t('shop.categories.pack') },
  { value: 'boost', label: t('shop.categories.boost') },
])

const RARITIES = computed(() => [
  { value: 'all', label: t('shop.rarities.all') },
  { value: 'common', label: t('shop.rarity.common') },
  { value: 'rare', label: t('shop.rarity.rare') },
  { value: 'epic', label: t('shop.rarity.epic') },
  { value: 'legendary', label: t('shop.rarity.legendary') },
])

const hasActiveFilters = computed(
  () => !!search.value || selectedFilter.value !== 'all' || selectedRarity.value !== 'all',
)
function resetFilters() {
  search.value = ''
  selectedFilter.value = 'all'
  selectedRarity.value = 'all'
}

const filteredInventory = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.inventory.filter((inv) => {
    const item = store.getItemById(inv.itemId)
    if (!item) return false
    const matchQ = !q || item.name.toLowerCase().includes(q)
    const matchF =
      selectedFilter.value === 'all'
        ? true
        : selectedFilter.value === 'equipped'
          ? store.isEquipped(inv.itemId)
          : item.category === selectedFilter.value
    const matchR = selectedRarity.value === 'all' || item.rarity === selectedRarity.value
    return matchQ && matchF && matchR
  })
})

function getItem(id: number) {
  return store.getItemById(id)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(iso))
}

// ── Equip + toast ──────────────────────────────────────────────────────────
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout>

function doEquip(itemId: number) {
  const result = store.equip(itemId)
  clearTimeout(toastTimer)
  const item = store.getItemById(itemId)
  toast.value = result.success
    ? { type: 'success', message: `${item?.name} ${t('inventory.equipped')}` }
    : { type: 'error', message: t('inventory.errors.generic') }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 2500)
}
</script>

<style scoped>
/* ─── Loading ────────────────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: rgba(252, 239, 225, 0.55);
  font-weight: 700;
  font-size: 0.95rem;
}
.loading-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */
.inv-page {
  min-height: 100vh;
  padding-bottom: 3rem;
  color: var(--color-cream);
}

.page-shell {
  width: min(1440px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.25rem;
  align-items: stretch;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.24), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
  border-radius: inherit;
}

.page-hero > * {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: 0.75rem;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3.3rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.85rem 0 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 1rem;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.hero-side {
  padding: 1.15rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.22), transparent 38%),
    rgba(18, 24, 38, 0.38);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hero-side__title {
  margin-top: 0.4rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}
.hero-side__text {
  margin: 0.45rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.88rem;
  line-height: 1.5;
}
.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.hero-side__chips span {
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.74rem;
  font-weight: 800;
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.btn {
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.7rem 1.1rem;
  font-weight: 900;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  transition:
    transform 0.16s ease,
    filter 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}
.btn--primary:hover {
  filter: brightness(1.04);
}
.btn--ghost {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border-color: rgba(252, 239, 225, 0.12);
}
.btn--ghost:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}
.btn-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ─── Stat grid ──────────────────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  gap: 1rem;
}
.inv-stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.stat-card {
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.88)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
}
.stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  line-height: 1;
}
.stat-card__caption {
  display: block;
  margin-top: 0.45rem;
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.8rem;
}

/* ─── Surface ────────────────────────────────────────────────────────────── */
.surface {
  padding: 1.25rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}
.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
}
.surface-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}
.surface-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.9rem;
  line-height: 1.55;
}

/* ─── Equipment slots ────────────────────────────────────────────────────── */
.equip-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.85rem;
}
.equip-slot {
  border-radius: 18px;
  border: 1px dashed rgba(252, 239, 225, 0.12);
  background: linear-gradient(180deg, rgba(50, 60, 82, 0.5), rgba(32, 38, 54, 0.8));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  min-height: 200px;
}
.equip-slot--common {
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.14);
}
.equip-slot--rare {
  border-style: solid;
  border-color: rgba(100, 150, 255, 0.35);
  box-shadow: 0 0 20px rgba(80, 120, 240, 0.12);
}
.equip-slot--epic {
  border-style: solid;
  border-color: rgba(180, 120, 255, 0.38);
  box-shadow: 0 0 20px rgba(150, 80, 240, 0.14);
}
.equip-slot--legendary {
  border-style: solid;
  border-color: rgba(242, 139, 91, 0.45);
  box-shadow: 0 0 22px rgba(242, 139, 91, 0.18);
}
.equip-slot__rarity-bar {
  height: 2px;
  flex-shrink: 0;
}
.rarity-bar--common {
  background: rgba(255, 255, 255, 0.18);
}
.rarity-bar--rare {
  background: linear-gradient(90deg, #3d5aaa, #7aadff);
}
.rarity-bar--epic {
  background: linear-gradient(90deg, #5d2ca8, #c8a0ff);
}
.rarity-bar--legendary {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-strong));
}
.equip-slot__label {
  padding: 0.65rem 0.7rem 0;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(252, 239, 225, 0.4);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.equip-slot__label-icon {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.equip-slot__visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}
.equip-slot__img {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}
.equip-slot__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(18, 24, 38, 0.3);
  border: 1px dashed rgba(252, 239, 225, 0.1);
}
.equip-slot__placeholder-icon {
  width: 24px;
  height: 24px;
  fill: rgba(252, 239, 225, 0.14);
}
.equip-slot__footer {
  padding: 0.65rem 0.8rem 0.8rem;
  border-top: 1px solid rgba(252, 239, 225, 0.06);
  background: rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.equip-slot__name {
  font-size: 0.76rem;
  font-weight: 900;
  color: var(--color-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.equip-slot__empty-label {
  font-size: 0.7rem;
  color: rgba(252, 239, 225, 0.22);
  font-weight: 700;
}

/* ─── Rarity pills ───────────────────────────────────────────────────────── */
.rarity-pill {
  display: inline-flex;
  padding: 0.18rem 0.45rem;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rarity-pill--common {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(252, 239, 225, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.rarity-pill--rare {
  background: rgba(49, 89, 140, 0.22);
  color: #9ab8ff;
  border: 1px solid rgba(49, 89, 140, 0.28);
}
.rarity-pill--epic {
  background: rgba(93, 44, 168, 0.22);
  color: #c8a0ff;
  border: 1px solid rgba(93, 44, 168, 0.28);
}
.rarity-pill--legendary {
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.26);
}

/* ─── Equip / unequip buttons ────────────────────────────────────────────── */
.btn-equip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-navy);
  font-size: 0.68rem;
  font-weight: 900;
  cursor: pointer;
  transition: filter 0.12s;
  align-self: flex-start;
}
.btn-equip:hover {
  filter: brightness(1.06);
}
.btn-equip__icon {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.btn-unequip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(200, 80, 80, 0.28);
  border-radius: 8px;
  background: rgba(200, 80, 80, 0.1);
  color: rgba(255, 160, 160, 0.85);
  font-size: 0.68rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.12s;
  align-self: flex-start;
}
.btn-unequip:hover {
  background: rgba(200, 80, 80, 0.18);
  border-color: rgba(200, 80, 80, 0.42);
}
.btn-unequip__icon {
  width: 13px;
  height: 13px;
  fill: currentColor;
}

/* ─── Toolbar ────────────────────────────────────────────────────────────── */
.toolbar {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}
.inv-toolbar {
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(120px, 0.6fr));
}
.search-field {
  position: relative;
  display: flex;
  align-items: center;
}
.search-field__icon {
  position: absolute;
  left: 0.9rem;
  width: 18px;
  height: 18px;
  fill: rgba(252, 239, 225, 0.45);
  pointer-events: none;
}
.search-field .field {
  padding-left: 2.6rem;
}
.field,
.select {
  width: 100%;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}
.field {
  padding: 0 0.9rem;
}
.select {
  padding: 0 0.85rem;
  cursor: pointer;
}
.field::placeholder {
  color: rgba(252, 239, 225, 0.42);
}
.field:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}
.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

/* ─── Inventory grid ─────────────────────────────────────────────────────── */
.inv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.9rem;
}
.inv-card {
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.09);
  overflow: hidden;
  background: linear-gradient(180deg, rgba(61, 72, 95, 0.65), rgba(36, 40, 58, 0.9));
  display: flex;
  flex-direction: column;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.inv-card:hover {
  transform: translateY(-3px);
}
.inv-card.rarity--rare:hover {
  border-color: rgba(100, 150, 255, 0.38);
  box-shadow: 0 8px 24px rgba(80, 120, 240, 0.16);
}
.inv-card.rarity--epic:hover {
  border-color: rgba(180, 120, 255, 0.38);
  box-shadow: 0 8px 24px rgba(150, 80, 240, 0.16);
}
.inv-card.rarity--legendary:hover {
  border-color: rgba(242, 139, 91, 0.48);
  box-shadow: 0 8px 24px rgba(242, 139, 91, 0.18);
}
.inv-card--equipped {
  border-color: rgba(61, 191, 125, 0.3);
}
.inv-card__rarity-bar {
  height: 2px;
  flex-shrink: 0;
}
.inv-card__img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}
.inv-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.28s ease;
}
.inv-card:hover .inv-card__img {
  transform: scale(1.05);
}
.equipped-badge-abs {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.22rem 0.5rem;
  border-radius: 8px;
  background: rgba(61, 191, 125, 0.2);
  border: 1px solid rgba(61, 191, 125, 0.35);
  color: #7ee0ad;
  font-size: 0.65rem;
  font-weight: 900;
  backdrop-filter: blur(6px);
}
.equipped-badge-abs__icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
.inv-card__body {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}
.inv-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.inv-card__name {
  font-size: 0.85rem;
  font-weight: 900;
  color: var(--color-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-card__meta-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.inv-card__slot-label {
  font-size: 0.7rem;
  color: rgba(252, 239, 225, 0.48);
  font-weight: 700;
}
.inv-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(252, 239, 225, 0.07);
}
.inv-card__date {
  font-size: 0.68rem;
  color: rgba(252, 239, 225, 0.35);
  font-weight: 700;
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1rem;
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.26);
  text-align: center;
}
.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}
.empty-state__text {
  margin: 0.6rem auto 0;
  max-width: 480px;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
.equip-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.85rem 1.5rem;
  border-radius: 14px;
  font-weight: 900;
  font-size: 0.88rem;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(12px);
}
.equip-toast--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.18);
  border: 1px solid rgba(61, 191, 125, 0.32);
}
.equip-toast--error {
  color: #ffb3b3;
  background: rgba(200, 80, 80, 0.18);
  border: 1px solid rgba(200, 80, 80, 0.32);
}
.toast-enter-active {
  transition: all 0.22s ease;
}
.toast-leave-active {
  transition: all 0.28s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
.fade-btn-enter-active,
.fade-btn-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ─── Animations ─────────────────────────────────────────────────────────── */
.spinning {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
  .inv-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .equip-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .inv-toolbar {
    grid-template-columns: 1fr;
  }
  .equip-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .inv-stat-grid {
    grid-template-columns: 1fr;
  }
  .equip-grid {
    grid-template-columns: 1fr;
  }
  .inv-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
