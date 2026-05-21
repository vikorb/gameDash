<template>
  <section class="backoffice-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('backoffice.economy.badge') }}</span>
            <h1 class="page-title">{{ t('backoffice.economy.title') }}</h1>
            <p class="page-subtitle">{{ t('backoffice.economy.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToBackoffice">
              {{ t('backoffice.common.actions.backToBackoffice') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetAll">
              {{ t('backoffice.economy.actions.resetAll') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('backoffice.economy.side.label') }}</div>
            <div class="hero-side__title">{{ t('backoffice.economy.side.title') }}</div>
            <p class="hero-side__text">{{ t('backoffice.economy.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('backoffice.economy.side.chips.prices') }}</span>
            <span>{{ t('backoffice.economy.side.chips.rewards') }}</span>
            <span>{{ t('backoffice.economy.side.chips.audit') }}</span>
          </div>
        </aside>
      </header>

      <div v-if="feedback" :class="['feedback-banner', `feedback-banner--${feedback.type}`]">
        {{ feedback.message }}
      </div>

      <section class="currency-grid">
        <article class="currency-card currency-card--soft">
          <div class="currency-card__icon">⬣</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{ t('backoffice.economy.currencies.soft') }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.softCurrencyEarned.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.softCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--hard">
          <div class="currency-card__icon">⬢</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{ t('backoffice.economy.currencies.hard') }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.hardCurrencySold.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.hardCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--revenue">
          <div class="currency-card__icon">€</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{
              t('backoffice.economy.currencies.revenue')
            }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.virtualRevenue.toLocaleString(locale) }} €
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.revenueCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--transactions">
          <div class="currency-card__icon">📈</div>
          <div class="currency-card__body">
            <span class="currency-card__label">
              {{ t('backoffice.economy.currencies.transactions') }}
            </span>
            <strong class="currency-card__value">
              {{ economySnapshot.transactionsLast7d.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.transactionsCaption') }}
            </span>
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.rewards.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.rewards.subtitle') }}</p>
          </div>

          <span v-if="rewardsDirty" class="meta-item meta-item--warning">
            {{ t('backoffice.economy.unsavedChanges') }}
          </span>
        </div>

        <div class="rewards-grid">
          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.xpWin') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.xpWin"
                type="number"
                min="0"
                max="2000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">XP</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.xpWinHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.xpLoss') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.xpLoss"
                type="number"
                min="0"
                max="1000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">XP</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.xpLossHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.softWin') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.softWin"
                type="number"
                min="0"
                max="1000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.softWinHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.softLoss') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.softLoss"
                type="number"
                min="0"
                max="500"
                step="5"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.softLossHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.dailyQuest') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.dailyQuestSoft"
                type="number"
                min="0"
                max="2000"
                step="10"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{
              t('backoffice.economy.rewards.dailyQuestHint')
            }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.levelUp') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.levelUpHard"
                type="number"
                min="0"
                max="200"
                step="1"
                class="input"
              />
              <span class="form-field__unit">⬢</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.levelUpHint') }}</span>
          </label>
        </div>

        <div class="form-actions">
          <span class="meta-item meta-item--audit">
            {{
              t('backoffice.economy.lastUpdated', {
                actor: rewardsLastUpdatedBy,
                date: formatDate(rewardsLastUpdatedAt),
              })
            }}
          </span>

          <div class="form-actions__buttons">
            <button
              type="button"
              class="btn-inline btn-inline--ghost"
              :disabled="!rewardsDirty || rewardsSaving"
              @click="resetRewards"
            >
              {{ t('backoffice.economy.actions.cancel') }}
            </button>

            <button
              type="button"
              class="btn-inline btn-inline--primary"
              :disabled="!rewardsDirty || rewardsSaving"
              @click="saveRewards"
            >
              {{
                rewardsSaving
                  ? t('backoffice.economy.actions.saving')
                  : t('backoffice.economy.actions.saveRewards')
              }}
            </button>
          </div>
        </div>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.shop.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.shop.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span class="meta-item">
              {{ items.length }} {{ t('backoffice.economy.shop.itemsCount') }}
            </span>
            <span v-if="dirtyItems.size > 0" class="meta-item meta-item--warning">
              {{ t('backoffice.economy.shop.itemsDirty', { count: dirtyItems.size }) }}
            </span>
          </div>
        </div>

        <div class="toolbar">
          <input
            v-model="search"
            class="input input--toolbar"
            :placeholder="t('backoffice.economy.shop.searchPlaceholder')"
          />

          <select v-model="selectedCategory" class="select">
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <select v-model="selectedCurrency" class="select">
            <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="filteredItems.length" class="items-table-wrap">
          <table class="items-table">
            <thead>
              <tr>
                <th>{{ t('backoffice.economy.shop.columns.item') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.category') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.price') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.sales') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.status') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.actions') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                :class="dirtyItems.has(item.id) ? 'is-dirty' : ''"
              >
                <td>
                  <div class="item-cell">
                    <span class="item-cell__icon">{{ item.icon }}</span>
                    <div>
                      <strong class="item-cell__name">{{ item.name }}</strong>
                      <span class="item-cell__meta">#{{ item.id }}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="meta-item">{{ getCategoryLabel(item.category) }}</span>
                </td>

                <td>
                  <div class="price-edit">
                    <input
                      v-model.number="pendingPrices[item.id]"
                      type="number"
                      min="0"
                      step="10"
                      class="input input--narrow"
                    />
                    <span :class="['currency-badge', `currency-badge--${item.currency}`]">
                      {{ item.currency === 'soft' ? '⬣' : '⬢' }}
                    </span>
                  </div>
                </td>

                <td>
                  <strong>{{ item.sales7d.toLocaleString(locale) }}</strong>
                  <span class="sales-caption">{{ t('backoffice.economy.shop.last7d') }}</span>
                </td>

                <td>
                  <button
                    type="button"
                    :class="['toggle-mini', item.available ? 'toggle-mini--on' : '']"
                    @click="toggleAvailable(item.id)"
                  >
                    {{
                      item.available
                        ? t('backoffice.economy.shop.statuses.available')
                        : t('backoffice.economy.shop.statuses.hidden')
                    }}
                  </button>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="btn-inline btn-inline--ghost btn-inline--small"
                      :disabled="!dirtyItems.has(item.id) || savingItemId === item.id"
                      @click="resetItem(item.id)"
                    >
                      {{ t('backoffice.economy.actions.cancel') }}
                    </button>

                    <button
                      type="button"
                      class="btn-inline btn-inline--primary btn-inline--small"
                      :disabled="!dirtyItems.has(item.id) || savingItemId === item.id"
                      @click="saveItem(item.id)"
                    >
                      {{
                        savingItemId === item.id
                          ? t('backoffice.economy.actions.saving')
                          : t('backoffice.economy.actions.save')
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('backoffice.economy.shop.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('backoffice.economy.shop.emptyText') }}</p>
        </div>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.history.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.history.subtitle') }}</p>
          </div>
          <span class="meta-item">
            {{ auditTrail.length }} {{ t('backoffice.economy.history.entries') }}
          </span>
        </div>

        <div v-if="auditTrail.length" class="history-list">
          <article v-for="entry in auditTrail.slice(0, 10)" :key="entry.id" class="history-item">
            <div class="history-item__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="entry.kind === 'price' ? mdiCartOutline : mdiTrophyOutline" />
              </svg>
            </div>

            <div class="history-item__body">
              <strong class="history-item__title">{{ entry.summary }}</strong>
              <span class="history-item__meta">{{ entry.actor }}</span>
            </div>

            <span class="meta-item">{{ formatDate(entry.timestamp) }}</span>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('backoffice.economy.history.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('backoffice.economy.history.emptyText') }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { mdiCartOutline, mdiTrophyOutline } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

type ItemCategory = 'cosmetic' | 'pack' | 'pass' | 'boost'
type ItemCurrency = 'soft' | 'hard'
type FeedbackType = 'success' | 'warning' | 'error'

type ShopItem = {
  id: number
  name: string
  icon: string
  category: ItemCategory
  currency: ItemCurrency
  price: number
  sales7d: number
  available: boolean
}

type RewardsConfig = {
  xpWin: number
  xpLoss: number
  softWin: number
  softLoss: number
  dailyQuestSoft: number
  levelUpHard: number
}

type AuditEntry = {
  id: number
  kind: 'price' | 'rewards' | 'availability'
  summary: string
  actor: string
  timestamp: string
}

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })

const feedback = ref<{ type: FeedbackType; message: string } | null>(null)
const savingItemId = ref<number | null>(null)
const rewardsSaving = ref(false)

const search = ref('')
const selectedCategory = ref<'all' | ItemCategory>('all')
const selectedCurrency = ref<'all' | ItemCurrency>('all')

const economySnapshot = ref({
  softCurrencyEarned: 1280450,
  hardCurrencySold: 48230,
  virtualRevenue: 18430,
  transactionsLast7d: 2884,
})

const items = ref<ShopItem[]>([
  {
    id: 1,
    name: 'Neon Visor',
    icon: '🕶️',
    category: 'cosmetic',
    currency: 'hard',
    price: 80,
    sales7d: 412,
    available: true,
  },
  {
    id: 2,
    name: 'Aurora Skin',
    icon: '✨',
    category: 'cosmetic',
    currency: 'hard',
    price: 150,
    sales7d: 286,
    available: true,
  },
  {
    id: 3,
    name: 'Starter Pack',
    icon: '📦',
    category: 'pack',
    currency: 'hard',
    price: 50,
    sales7d: 540,
    available: true,
  },
  {
    id: 4,
    name: 'Premium Pack',
    icon: '🎁',
    category: 'pack',
    currency: 'hard',
    price: 200,
    sales7d: 178,
    available: true,
  },
  {
    id: 5,
    name: 'Season 4 Pass',
    icon: '🎫',
    category: 'pass',
    currency: 'hard',
    price: 120,
    sales7d: 920,
    available: true,
  },
  {
    id: 6,
    name: 'XP Booster 1h',
    icon: '⚡',
    category: 'boost',
    currency: 'soft',
    price: 200,
    sales7d: 845,
    available: true,
  },
  {
    id: 7,
    name: 'XP Booster 24h',
    icon: '🔥',
    category: 'boost',
    currency: 'hard',
    price: 35,
    sales7d: 320,
    available: true,
  },
  {
    id: 8,
    name: 'Soft Pack 1000',
    icon: '💰',
    category: 'pack',
    currency: 'hard',
    price: 25,
    sales7d: 612,
    available: true,
  },
  {
    id: 9,
    name: 'Soft Pack 5000',
    icon: '💎',
    category: 'pack',
    currency: 'hard',
    price: 100,
    sales7d: 245,
    available: true,
  },
  {
    id: 10,
    name: 'Emote Pack',
    icon: '😄',
    category: 'cosmetic',
    currency: 'soft',
    price: 500,
    sales7d: 1240,
    available: true,
  },
  {
    id: 11,
    name: 'Legacy Frame',
    icon: '🖼️',
    category: 'cosmetic',
    currency: 'soft',
    price: 1200,
    sales7d: 156,
    available: false,
  },
  {
    id: 12,
    name: 'Battle Cry',
    icon: '🗯️',
    category: 'cosmetic',
    currency: 'hard',
    price: 65,
    sales7d: 89,
    available: true,
  },
])

const pendingPrices = reactive<Record<number, number>>({})
const pendingAvailability = reactive<Record<number, boolean>>({})

items.value.forEach((item) => {
  pendingPrices[item.id] = item.price
  pendingAvailability[item.id] = item.available
})

const baseRewards: RewardsConfig = {
  xpWin: 150,
  xpLoss: 50,
  softWin: 100,
  softLoss: 25,
  dailyQuestSoft: 250,
  levelUpHard: 5,
}

const currentRewards = ref<RewardsConfig>({ ...baseRewards })
const pendingRewards = reactive<RewardsConfig>({ ...baseRewards })

const rewardsLastUpdatedAt = ref(hoursAgo(48))
const rewardsLastUpdatedBy = ref('enzo')

const auditTrail = ref<AuditEntry[]>([
  {
    id: 1,
    kind: 'price',
    summary: 'Season 4 Pass: 100 → 120 ⬢',
    actor: 'enzo',
    timestamp: hoursAgo(12),
  },
  {
    id: 2,
    kind: 'rewards',
    summary: 'XP Win: 120 → 150',
    actor: 'enzo',
    timestamp: hoursAgo(48),
  },
  {
    id: 3,
    kind: 'availability',
    summary: 'Legacy Frame: hidden',
    actor: 'alice',
    timestamp: hoursAgo(96),
  },
])

const categoryOptions = computed(() => [
  { value: 'all' as const, label: t('backoffice.economy.shop.filters.allCategories') },
  { value: 'cosmetic' as const, label: t('backoffice.economy.shop.categories.cosmetic') },
  { value: 'pack' as const, label: t('backoffice.economy.shop.categories.pack') },
  { value: 'pass' as const, label: t('backoffice.economy.shop.categories.pass') },
  { value: 'boost' as const, label: t('backoffice.economy.shop.categories.boost') },
])

const currencyOptions = computed(() => [
  { value: 'all' as const, label: t('backoffice.economy.shop.filters.allCurrencies') },
  { value: 'soft' as const, label: t('backoffice.economy.currencies.soft') },
  { value: 'hard' as const, label: t('backoffice.economy.currencies.hard') },
])

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesQuery =
      query === '' || item.name.toLowerCase().includes(query) || String(item.id).includes(query)

    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesCurrency =
      selectedCurrency.value === 'all' || item.currency === selectedCurrency.value

    return matchesQuery && matchesCategory && matchesCurrency
  })
})

const dirtyItems = computed(() => {
  const dirty = new Set<number>()

  items.value.forEach((item) => {
    if (pendingPrices[item.id] !== item.price || pendingAvailability[item.id] !== item.available) {
      dirty.add(item.id)
    }
  })

  return dirty
})

const rewardsDirty = computed(() => {
  return (
    pendingRewards.xpWin !== currentRewards.value.xpWin ||
    pendingRewards.xpLoss !== currentRewards.value.xpLoss ||
    pendingRewards.softWin !== currentRewards.value.softWin ||
    pendingRewards.softLoss !== currentRewards.value.softLoss ||
    pendingRewards.dailyQuestSoft !== currentRewards.value.dailyQuestSoft ||
    pendingRewards.levelUpHard !== currentRewards.value.levelUpHard
  )
})

// --- Actions ---------------------------------------------------------------

function goBackToBackoffice() {
  router.push('/backoffice')
}

function resetItem(itemId: number) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return

  pendingPrices[itemId] = item.price
  pendingAvailability[itemId] = item.available
}

function resetRewards() {
  Object.assign(pendingRewards, currentRewards.value)
}

function resetAll() {
  items.value.forEach((item) => resetItem(item.id))
  resetRewards()
  feedback.value = null
}

function toggleAvailable(itemId: number) {
  pendingAvailability[itemId] = !pendingAvailability[itemId]
}

async function saveItem(itemId: number) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return

  savingItemId.value = itemId

  const changes: string[] = []
  if (pendingPrices[itemId] !== item.price) {
    changes.push(
      `${item.name}: ${item.price} → ${pendingPrices[itemId]} ${item.currency === 'soft' ? '⬣' : '⬢'}`,
    )
  }
  if (pendingAvailability[itemId] !== item.available) {
    changes.push(
      `${item.name}: ${pendingAvailability[itemId] ? t('backoffice.economy.shop.statuses.available') : t('backoffice.economy.shop.statuses.hidden')}`,
    )
  }

  await wait(250)

  const actor = profile.value?.username || profile.value?.email || 'POC Admin'
  const now = new Date().toISOString()

  items.value = items.value.map((it) =>
    it.id === itemId
      ? {
          ...it,
          price: pendingPrices[itemId] ?? it.price,
          available: pendingAvailability[itemId] ?? it.available,
        }
      : it,
  )

  changes.forEach((change, idx) => {
    auditTrail.value.unshift({
      id: Date.now() + idx,
      kind: pendingPrices[itemId] !== item.price ? 'price' : 'availability',
      summary: change,
      actor,
      timestamp: now,
    })
  })

  feedback.value = {
    type: 'success',
    message: t('backoffice.economy.feedback.itemSaved', { name: item.name }),
  }

  savingItemId.value = null
}

async function saveRewards() {
  rewardsSaving.value = true

  const changes: string[] = []
  const rewardKeys: Array<keyof RewardsConfig> = [
    'xpWin',
    'xpLoss',
    'softWin',
    'softLoss',
    'dailyQuestSoft',
    'levelUpHard',
  ]

  const rewardLabels: Record<keyof RewardsConfig, string> = {
    xpWin: 'XP Win',
    xpLoss: 'XP Loss',
    softWin: 'Soft Win',
    softLoss: 'Soft Loss',
    dailyQuestSoft: 'Daily Quest',
    levelUpHard: 'Level Up',
  }

  rewardKeys.forEach((key) => {
    if (pendingRewards[key] !== currentRewards.value[key]) {
      changes.push(`${rewardLabels[key]}: ${currentRewards.value[key]} → ${pendingRewards[key]}`)
    }
  })

  await wait(280)

  const actor = profile.value?.username || profile.value?.email || 'POC Admin'
  const now = new Date().toISOString()

  currentRewards.value = { ...pendingRewards }
  rewardsLastUpdatedAt.value = now
  rewardsLastUpdatedBy.value = actor

  changes.forEach((change, idx) => {
    auditTrail.value.unshift({
      id: Date.now() + idx,
      kind: 'rewards',
      summary: change,
      actor,
      timestamp: now,
    })
  })

  feedback.value = {
    type: 'success',
    message: t('backoffice.economy.feedback.rewardsSaved'),
  }

  rewardsSaving.value = false
}

// --- Helpers ---------------------------------------------------------------

function getCategoryLabel(category: ItemCategory) {
  return t(`backoffice.economy.shop.categories.${category}`)
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})
</script>

<style scoped>
.backoffice-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: var(--shadow-md);
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
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}

.page-title {
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  color: var(--color-ink);
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 720px;
  color: var(--color-text-muted);
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
}

.btn--ghost {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

.hero-side {
  padding: 1.25rem;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(46, 50, 68, 0.97), rgba(81, 96, 121, 0.95));
  color: var(--color-cream);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-side__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.78;
}

.hero-side__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.hero-side__text {
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.92rem;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.hero-side__chips span {
  display: inline-flex;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  background: rgba(252, 239, 225, 0.14);
  color: var(--color-cream);
}

.feedback-banner {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-ink);
  font-weight: 600;
}

.feedback-banner--success {
  border-color: rgba(61, 191, 125, 0.4);
}

.feedback-banner--warning {
  border-color: rgba(242, 139, 91, 0.4);
}

.feedback-banner--error {
  border-color: rgba(225, 91, 91, 0.4);
}

/* Currency cards */
.currency-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.currency-card {
  padding: 1.25rem;
  border-radius: 22px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.currency-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
}

.currency-card--soft .currency-card__icon {
  background: rgba(61, 191, 125, 0.16);
  color: #146c43;
}

.currency-card--hard .currency-card__icon {
  background: rgba(242, 139, 91, 0.18);
  color: #8a5c1d;
}

.currency-card--revenue .currency-card__icon {
  background: rgba(49, 89, 140, 0.14);
  color: #31598c;
}

.currency-card--transactions .currency-card__icon {
  background: rgba(93, 44, 168, 0.12);
  color: #5d2ca8;
}

.currency-card__label {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.currency-card__value {
  display: block;
  margin-top: 0.3rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.65rem;
  color: var(--color-ink);
}

.currency-card__caption {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* Surface */
.surface {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
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
  color: var(--color-ink);
}

.surface-subtitle {
  margin: 0.3rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

/* Rewards grid */
.rewards-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-ink);
}

.form-field__control {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.form-field__unit {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  font-weight: 700;
  min-width: 24px;
}

.form-field__hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.input,
.select {
  width: 100%;
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0.5rem 0.75rem;
  color: var(--color-ink);
  font: inherit;
  outline: none;
}

.input:focus,
.select:focus {
  border-color: var(--color-primary);
}

.input--narrow {
  max-width: 110px;
}

.input--toolbar {
  flex: 1;
  min-width: 200px;
}

.form-actions {
  margin-top: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px dashed rgba(81, 96, 121, 0.15);
}

.form-actions__buttons {
  display: flex;
  gap: 0.6rem;
}

.btn-inline {
  border: none;
  border-radius: 12px;
  padding: 0.65rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.btn-inline:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-inline:not(:disabled):hover {
  transform: translateY(-1px);
}

.btn-inline--small {
  padding: 0.5rem 0.75rem;
  font-size: 0.78rem;
}

.btn-inline--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
}

.btn-inline--ghost {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.select {
  min-width: 180px;
  width: auto;
}

/* Items table */
.items-table-wrap {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(81, 96, 121, 0.1);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.items-table thead th {
  text-align: left;
  padding: 0.85rem 1rem;
  background: rgba(81, 96, 121, 0.06);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  border-bottom: 1px solid rgba(81, 96, 121, 0.1);
}

.items-table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(81, 96, 121, 0.06);
  vertical-align: middle;
  color: var(--color-ink);
}

.items-table tbody tr.is-dirty {
  background: rgba(242, 139, 91, 0.06);
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-cell__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(81, 96, 121, 0.08);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-cell__name {
  display: block;
  color: var(--color-ink);
}

.item-cell__meta {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.price-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.currency-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
}

.currency-badge--soft {
  background: rgba(61, 191, 125, 0.16);
  color: #146c43;
}

.currency-badge--hard {
  background: rgba(242, 139, 91, 0.18);
  color: #8a5c1d;
}

.sales-caption {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.toggle-mini {
  border: none;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  background: rgba(81, 96, 121, 0.12);
  color: var(--color-text-muted);
  transition: background 0.18s ease;
}

.toggle-mini--on {
  background: rgba(61, 191, 125, 0.18);
  color: #146c43;
}

.row-actions {
  display: flex;
  gap: 0.4rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: rgba(81, 96, 121, 0.08);
  white-space: nowrap;
}

.meta-item--audit {
  background: rgba(49, 89, 140, 0.1);
  color: #31598c;
}

.meta-item--warning {
  background: rgba(242, 139, 91, 0.18);
  color: #8a5c1d;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 16px;
  background: rgba(81, 96, 121, 0.05);
}

.history-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: #8a5c1d;
  flex-shrink: 0;
}

.history-item__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.history-item__body {
  flex: 1;
  min-width: 0;
}

.history-item__title {
  display: block;
  color: var(--color-ink);
  font-size: 0.92rem;
}

.history-item__meta {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.empty-state {
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state__title {
  margin: 0;
  color: var(--color-ink);
  font-family: 'Space Grotesk', sans-serif;
}

.empty-state__text {
  margin: 0.5rem 0 0;
  color: var(--color-text-muted);
}

@media (max-width: 1100px) {
  .currency-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rewards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .backoffice-page {
    padding: 1rem;
  }

  .currency-grid,
  .rewards-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
  }

  .select,
  .input--toolbar {
    width: 100%;
  }
}
</style>
