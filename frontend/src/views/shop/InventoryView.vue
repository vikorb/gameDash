<template>
  <section class="inv-page">
    <div class="page-shell">
      <!-- ─── Hero ──────────────────────────────────────────────── -->
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('inventory.badge') }}</span>
            <h1 class="page-title">{{ t('inventory.title') }}</h1>
            <p class="page-subtitle">{{ t('inventory.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <router-link to="/shop" class="btn btn--ghost">
              🛒 {{ t('inventory.goToShop') }}
            </router-link>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('inventory.side.label') }}</div>
            <div class="hero-side__title">{{ t('inventory.side.title') }}</div>
            <p class="hero-side__text">{{ t('inventory.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <div class="hero-stat">
              <span class="hero-stat__val">{{ store.inventory.length }}</span>
              <span class="hero-stat__label">{{ t('inventory.itemsCount') }}</span>
            </div>
            <div class="hero-stat hero-stat--accent">
              <span class="hero-stat__val">{{ equippedCount }}</span>
              <span class="hero-stat__label">{{ t('inventory.equippedCount') }}</span>
            </div>
          </div>
        </aside>
      </header>

      <!-- ─── Equip slots ───────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('inventory.slots.title') }}</h2>
            <p class="surface-subtitle">{{ t('inventory.slots.subtitle') }}</p>
          </div>
          <span class="meta-item meta-item--accent">
            {{ equippedCount }} / {{ SLOTS.length }} {{ t('inventory.slots.filled') }}
          </span>
        </div>

        <div class="slots-grid">
          <div
            v-for="slot in SLOTS"
            :key="slot.key"
            :class="['slot-card', store.equipped[slot.key] ? 'slot-card--filled' : '']"
          >
            <span class="slot-card__label">{{ t(`inventory.slots.${slot.key}`) }}</span>

            <div class="slot-card__preview">
              <template v-if="store.equipped[slot.key]">
                <span class="slot-card__icon">
                  {{ store.getItemById(store.equipped[slot.key]!)?.icon ?? '?' }}
                </span>
                <strong class="slot-card__name">
                  {{ store.getItemById(store.equipped[slot.key]!)?.name ?? '—' }}
                </strong>
              </template>
              <span v-else class="slot-card__empty">{{ slot.emoji }}</span>
            </div>

            <button
              v-if="store.equipped[slot.key]"
              type="button"
              class="slot-unequip"
              @click="store.unequip(slot.key)"
            >
              {{ t('inventory.unequip') }}
            </button>
            <span v-else class="slot-empty-hint">{{ t('inventory.slotEmpty') }}</span>
          </div>
        </div>
      </section>

      <!-- ─── Inventory ─────────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('inventory.items.title') }}</h2>
            <p class="surface-subtitle">{{ t('inventory.items.subtitle') }}</p>
          </div>
          <div class="surface-header__meta">
            <span class="meta-item"
              >{{ store.inventory.length }} {{ t('inventory.itemsCount') }}</span
            >
          </div>
        </div>

        <!-- Filter bar -->
        <div class="toolbar">
          <div class="cat-tabs">
            <button
              v-for="f in FILTERS"
              :key="f.value"
              type="button"
              :class="[
                'btn-inline',
                selectedFilter === f.value ? 'btn-inline--primary' : 'btn-inline--ghost',
              ]"
              @click="selectedFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>

          <input
            v-model="search"
            type="text"
            class="input input--toolbar"
            :placeholder="t('inventory.search')"
          />
        </div>

        <div v-if="filteredInventory.length" class="inv-grid">
          <article
            v-for="inv in filteredInventory"
            :key="inv.itemId"
            :class="['inv-card', `inv-card--${getItem(inv.itemId)?.rarity}`]"
          >
            <div class="inv-card__top">
              <span :class="['rarity-dot', `rarity-dot--${getItem(inv.itemId)?.rarity}`]"></span>
              <span v-if="store.isEquipped(inv.itemId)" class="equipped-chip">
                ✓ {{ t('inventory.equippedLabel') }}
              </span>
            </div>

            <div class="inv-card__icon">{{ getItem(inv.itemId)?.icon }}</div>

            <div class="inv-card__body">
              <strong class="inv-card__name">{{ getItem(inv.itemId)?.name }}</strong>
              <span class="inv-card__meta">
                {{
                  getItem(inv.itemId)?.slot
                    ? t(`shop.slots.${getItem(inv.itemId)?.slot}`)
                    : t(`shop.categories.${getItem(inv.itemId)?.category}`)
                }}
              </span>
              <span :class="['rarity-pill', `rarity-pill--${getItem(inv.itemId)?.rarity}`]">
                {{ t(`shop.rarity.${getItem(inv.itemId)?.rarity}`) }}
              </span>
            </div>

            <div class="inv-card__footer">
              <span class="inv-card__date">{{ formatDate(inv.ownedAt) }}</span>

              <template v-if="getItem(inv.itemId)?.slot">
                <button
                  v-if="!store.isEquipped(inv.itemId)"
                  type="button"
                  class="btn-inline btn-inline--primary btn-inline--small"
                  @click="doEquip(inv.itemId)"
                >
                  {{ t('inventory.equip') }}
                </button>
                <button
                  v-else
                  type="button"
                  class="btn-inline btn-inline--danger btn-inline--small"
                  @click="store.unequip(getItem(inv.itemId)!.slot!)"
                >
                  {{ t('inventory.unequip') }}
                </button>
              </template>
              <span v-else class="meta-item" style="font-size: 0.7rem">{{
                t('inventory.noSlot')
              }}</span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('inventory.empty.title') }}</h3>
          <p class="empty-state__text">{{ t('inventory.empty.text') }}</p>
          <router-link
            to="/shop"
            class="btn btn--primary"
            style="margin-top: 1.25rem; display: inline-flex"
          >
            🛒 {{ t('inventory.goToShop') }}
          </router-link>
        </div>
      </section>
    </div>

    <!-- ─── Toast ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" :class="['equip-toast', `equip-toast--${toast.type}`]">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useShopStore } from '@/stores/shopStore'

const store = useShopStore()
const { t, locale } = useI18n({ useScope: 'global' })

// --- Slots ----------------------------------------------------------------
const SLOTS = [
  { key: 'avatar', emoji: '👤' },
  { key: 'banner', emoji: '🏳️' },
  { key: 'frame', emoji: '🖼️' },
  { key: 'emote', emoji: '🕺' },
  { key: 'trail', emoji: '💫' },
  { key: 'spray', emoji: '🎨' },
]

// --- Filters --------------------------------------------------------------
const search = ref('')
const selectedFilter = ref<string>('all')

const FILTERS = computed(() => [
  { value: 'all', label: t('inventory.filters.all') },
  { value: 'equipped', label: t('inventory.filters.equipped') },
  { value: 'cosmetic', label: t('shop.categories.cosmetic') },
  { value: 'pack', label: t('shop.categories.pack') },
  { value: 'boost', label: t('shop.categories.boost') },
])

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
    return matchQ && matchF
  })
})

// --- Helpers --------------------------------------------------------------
const equippedCount = computed(() => Object.values(store.equipped).filter((v) => v !== null).length)

function getItem(id: number) {
  return store.getItemById(id)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(iso))
}

// --- Equip + toast --------------------------------------------------------
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout>

function doEquip(itemId: number) {
  const result = store.equip(itemId)
  clearTimeout(toastTimer)
  const item = store.getItemById(itemId)
  toast.value = result.success
    ? { type: 'success', message: `${item?.icon} ${item?.name} ${t('inventory.equipped')} !` }
    : { type: 'error', message: t('inventory.errors.generic') }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 2_500)
}
</script>

<style scoped>
/* ─── Page shell ─────────────────────────────────────────────────────────── */
.inv-page {
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

.btn-inline--danger {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.28);
}
.btn-inline--danger:hover:not(:disabled) {
  background: rgba(225, 91, 91, 0.22);
  border-color: rgba(225, 91, 91, 0.42);
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

.hero-side__chips {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.hero-stat {
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.36);
  text-align: center;
}

.hero-stat--accent {
  border-color: rgba(242, 139, 91, 0.28);
  background: rgba(242, 139, 91, 0.1);
}

.hero-stat__val {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--color-cream);
  line-height: 1;
}

.hero-stat__label {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(252, 239, 225, 0.52);
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

.meta-item--accent {
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.28);
}

/* ─── Equip slots ────────────────────────────────────────────────────────── */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.slot-card {
  padding: 1rem 0.65rem;
  border-radius: 18px;
  border: 1px dashed rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.22);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 148px;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.slot-card--filled {
  border-style: solid;
  border-color: rgba(242, 139, 91, 0.38);
  background: rgba(242, 139, 91, 0.07);
}

.slot-card__label {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(252, 239, 225, 0.45);
}

.slot-card__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.slot-card__icon {
  font-size: 1.8rem;
}

.slot-card__name {
  display: block;
  font-size: 0.73rem;
  font-weight: 900;
  color: var(--color-cream);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot-card__empty {
  font-size: 1.4rem;
  opacity: 0.15;
}

.slot-unequip {
  border: 1px solid rgba(225, 91, 91, 0.28);
  border-radius: 8px;
  padding: 0.28rem 0.6rem;
  background: rgba(225, 91, 91, 0.1);
  color: #ffb3b3;
  font-size: 0.7rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.slot-unequip:hover {
  background: rgba(225, 91, 91, 0.18);
  border-color: rgba(225, 91, 91, 0.42);
}

.slot-empty-hint {
  font-size: 0.68rem;
  color: rgba(252, 239, 225, 0.2);
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

.input {
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
.input:focus {
  border-color: rgba(242, 139, 91, 0.62);
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12);
  transform: translateY(-1px);
}

.input--toolbar {
  flex: 1;
  min-width: 180px;
}

/* ─── Inventory grid ─────────────────────────────────────────────────────── */
.inv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 0.85rem;
}

.inv-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.inv-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.28);
  background: rgba(242, 139, 91, 0.06);
}

.inv-card--rare:hover {
  border-color: rgba(49, 89, 140, 0.42);
  background: rgba(49, 89, 140, 0.08);
}
.inv-card--epic:hover {
  border-color: rgba(93, 44, 168, 0.42);
  background: rgba(93, 44, 168, 0.08);
}
.inv-card--legendary:hover {
  border-color: rgba(242, 139, 91, 0.45);
  background: rgba(242, 139, 91, 0.08);
}

.inv-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.equipped-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  background: rgba(61, 191, 125, 0.14);
  color: #7ee0ad;
  border: 1px solid rgba(61, 191, 125, 0.28);
}

/* Rarity pills & dots */
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
  flex-shrink: 0;
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

.inv-card__icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: rgba(18, 24, 38, 0.42);
  border: 1px solid rgba(252, 239, 225, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1rem;
  margin: 0 auto;
}

.inv-card__body {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
}

.inv-card__name {
  display: block;
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--color-cream);
}

.inv-card__meta {
  display: block;
  font-size: 0.74rem;
  color: rgba(252, 239, 225, 0.5);
}

.inv-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(252, 239, 225, 0.07);
  margin-top: auto;
}

.inv-card__date {
  font-size: 0.72rem;
  color: rgba(252, 239, 225, 0.38);
  font-weight: 700;
}

/* ─── Empty ──────────────────────────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* ─── Toast ──────────────────────────────────────────────────────────────── */
.equip-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.85rem 1.5rem;
  border-radius: 16px;
  font-weight: 900;
  font-size: 0.88rem;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(8px);
}

.equip-toast--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.18);
  border: 1px solid rgba(61, 191, 125, 0.35);
}

.equip-toast--error {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.18);
  border: 1px solid rgba(225, 91, 91, 0.35);
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

/* ─── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .slots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
  .slots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .inv-page {
    padding: 1rem;
  }
  .slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .inv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .toolbar {
    flex-direction: column;
  }
  .cat-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .input--toolbar {
    min-width: unset;
  }
}
</style>
