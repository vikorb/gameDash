import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiFetch } from '@/stores/shopUtils'
import type {
  AuditEntry,
  Bundle,
  BundlePatch,
  BundlePayload,
  EconomySnapshot,
  EquippedMap,
  EquipResult,
  InventoryEntry,
  PurchaseResult,
  RewardsConfig,
  ShopBackofficeState,
  ShopItem,
  ShopItemPatch,
  ShopItemPayload,
  ShopState,
  TopUpResult,
  Transaction,
  Wallet,
} from '@/types/shops'

export { picsumUrl, wait } from '@/stores/shopUtils'
export type {
  AuditEntry,
  Bundle,
  BundlePatch,
  BundlePayload,
  EconomySnapshot,
  RewardsConfig,
  ShopItem,
  ShopItemPatch,
  ShopItemPayload,
  TopUpPack,
  Transaction,
} from '@/types/shops'
export { GRADIENT_PRESETS, TOPUP_PACKS } from '@/types/shops'

const EMPTY_REWARDS: RewardsConfig = {
  xpWin: 150,
  xpLoss: 50,
  softWin: 100,
  softLoss: 25,
  dailyQuestSoft: 250,
  levelUpHard: 5,
}

const EMPTY_SNAPSHOT: EconomySnapshot = {
  softCurrencyEarned: 0,
  hardCurrencySold: 0,
  virtualRevenue: 0,
  transactionsLast7d: 0,
}

const SHOP_API_BASE = '/shop'
const SHOP_API_FALLBACK_BASE = '/shops'

function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status?: number }).status === 404
  )
}

async function shopFetch<T>(path = '', init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  try {
    return await apiFetch<T>(
      `${SHOP_API_BASE}${normalizedPath === '/' ? '' : normalizedPath}`,
      init,
    )
  } catch (err) {
    if (!isNotFoundError(err)) throw err
    return await apiFetch<T>(
      `${SHOP_API_FALLBACK_BASE}${normalizedPath === '/' ? '' : normalizedPath}`,
      init,
    )
  }
}

function normalizeItem(item: ShopItem): ShopItem {
  return {
    ...item,
    available: item.available ?? true,
    sales7d: item.sales7d ?? 0,
  }
}

function normalizeBundle(bundle: Bundle): Bundle {
  return {
    ...bundle,
    description: bundle.description ?? '',
    badge: bundle.badge ?? null,
    expiresAt: bundle.expiresAt ?? null,
    available: bundle.available ?? true,
    gradient: bundle.gradient ?? null,
  }
}

export const useShopStore = defineStore('shop', () => {
  const items = ref<ShopItem[]>([])
  const bundles = ref<Bundle[]>([])
  const wallet = ref<Wallet>({ soft: 0, hard: 0 })
  const inventory = ref<InventoryEntry[]>([])
  const equipped = ref<EquippedMap>({})
  const transactions = ref<Transaction[]>([])
  const rewards = ref<RewardsConfig>({ ...EMPTY_REWARDS })
  const rewardsLastUpdatedAt = ref<string | null>(null)
  const rewardsLastUpdatedBy = ref<string | null>(null)
  const economySnapshot = ref<EconomySnapshot>({ ...EMPTY_SNAPSHOT })
  const auditTrail = ref<AuditEntry[]>([])
  const loading = ref(false)
  const backofficeLoading = ref(false)
  const error = ref<string | null>(null)

  const shopItems = computed(() => items.value)
  const availableItems = computed(() =>
    items.value.filter((item) => item.available && !isOwned(item.id)),
  )
  const availableBundles = computed(() => bundles.value.filter((bundle) => bundle.available))
  const featuredBundle = computed(
    () => bundles.value.find((bundle) => bundle.available && bundle.isFeatured) ?? null,
  )

  function getItemById(id: number): ShopItem | undefined {
    return items.value.find((item) => item.id === id)
  }

  function isOwned(itemId: number): boolean {
    return inventory.value.some((entry) => entry.itemId === itemId)
  }

  function isEquipped(itemId: number): boolean {
    return Object.values(equipped.value).includes(itemId)
  }

  function applyShopState(state: ShopState): void {
    items.value = state.items.map(normalizeItem)
    bundles.value = state.bundles.map(normalizeBundle)
    wallet.value = state.wallet
    inventory.value = state.inventory
    equipped.value = state.equipped
  }

  function applyBackofficeState(state: ShopBackofficeState): void {
    items.value = state.items.map(normalizeItem)
    bundles.value = state.bundles.map(normalizeBundle)
    transactions.value = state.transactions
    rewards.value = { ...state.rewards }
    rewardsLastUpdatedAt.value = state.rewardsLastUpdatedAt
    rewardsLastUpdatedBy.value = state.rewardsLastUpdatedBy
    economySnapshot.value = state.economySnapshot
    auditTrail.value = state.auditTrail
  }

  async function fetchShopState(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      applyShopState(await shopFetch<ShopState>())
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchBackofficeState(): Promise<void> {
    backofficeLoading.value = true
    error.value = null
    try {
      applyBackofficeState(await shopFetch<ShopBackofficeState>('/backoffice'))
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      backofficeLoading.value = false
    }
  }

  async function refreshTransactions(): Promise<void> {
    const rows = await shopFetch<Transaction[]>('/backoffice/transactions')
    transactions.value = rows
  }

  async function purchase(itemId: number): Promise<PurchaseResult> {
    try {
      const res = await shopFetch<{ success: boolean; wallet: Wallet }>('/purchase/item', {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      })
      wallet.value = res.wallet
      inventory.value.unshift({ itemId, ownedAt: new Date().toISOString() })
      return { success: true }
    } catch (err) {
      const status = (err as Error & { status?: number }).status
      if (status === 402) return { success: false, reason: 'insufficient_funds' }
      if (status === 409) return { success: false, reason: 'already_owned' }
      if (status === 404) return { success: false, reason: 'not_found' }
      return { success: false, reason: 'error' }
    }
  }

  async function purchaseBundle(bundleId: number): Promise<PurchaseResult> {
    try {
      const res = await shopFetch<{ success: boolean; newItems: number[]; wallet: Wallet }>(
        '/purchase/bundle',
        {
          method: 'POST',
          body: JSON.stringify({ bundleId }),
        },
      )
      wallet.value = res.wallet
      const now = new Date().toISOString()
      for (const itemId of res.newItems) {
        if (!isOwned(itemId)) inventory.value.unshift({ itemId, ownedAt: now })
      }
      return { success: true }
    } catch (err) {
      const status = (err as Error & { status?: number }).status
      if (status === 402) return { success: false, reason: 'insufficient_funds' }
      if (status === 404) return { success: false, reason: 'not_found' }
      return { success: false, reason: 'error' }
    }
  }

  async function simulatePayment(packId: string): Promise<TopUpResult> {
    try {
      const res = await shopFetch<{ success: boolean; credited: number; wallet: Wallet }>(
        '/topup',
        {
          method: 'POST',
          body: JSON.stringify({ packId }),
        },
      )
      wallet.value = res.wallet
      return { success: true, credited: res.credited }
    } catch {
      return { success: false }
    }
  }

  function equip(itemId: number): EquipResult {
    const item = getItemById(itemId)
    if (!item?.slot || !isOwned(itemId)) return { success: false }

    const previous = { ...equipped.value }
    equipped.value = { ...equipped.value, [item.slot]: itemId }

    void shopFetch('/equip', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }).catch(() => {
      equipped.value = previous
    })

    return { success: true }
  }

  function unequip(slot: string): void {
    const previous = { ...equipped.value }
    equipped.value = { ...equipped.value, [slot]: null }

    void shopFetch('/unequip', {
      method: 'POST',
      body: JSON.stringify({ slot }),
    }).catch(() => {
      equipped.value = previous
    })
  }

  async function addShopItem(payload: ShopItemPayload): Promise<ShopItem> {
    const item = normalizeItem(
      await shopFetch<ShopItem>('/backoffice/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
    items.value.unshift(item)
    await fetchBackofficeState()
    return item
  }

  async function updateShopItem(id: number, patch: ShopItemPatch): Promise<ShopItem> {
    const item = normalizeItem(
      await shopFetch<ShopItem>(`/backoffice/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    )
    items.value = items.value.map((current) => (current.id === id ? item : current))
    await fetchBackofficeState()
    return item
  }

  async function deleteShopItem(id: number): Promise<void> {
    await shopFetch(`/backoffice/items/${id}`, { method: 'DELETE' })
    items.value = items.value.map((item) => (item.id === id ? { ...item, available: false } : item))
    await fetchBackofficeState()
  }

  async function addBundle(payload: BundlePayload): Promise<Bundle> {
    const bundle = normalizeBundle(
      await shopFetch<Bundle>('/backoffice/bundles', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
    bundles.value.unshift(bundle)
    await fetchBackofficeState()
    return bundle
  }

  async function updateBundle(id: number, patch: BundlePatch): Promise<Bundle> {
    const bundle = normalizeBundle(
      await shopFetch<Bundle>(`/backoffice/bundles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
    )
    bundles.value = bundles.value.map((current) => (current.id === id ? bundle : current))
    await fetchBackofficeState()
    return bundle
  }

  async function deleteBundle(id: number): Promise<void> {
    await shopFetch(`/backoffice/bundles/${id}`, { method: 'DELETE' })
    bundles.value = bundles.value.map((bundle) =>
      bundle.id === id ? { ...bundle, available: false } : bundle,
    )
    await fetchBackofficeState()
  }

  async function updateRewards(payload: RewardsConfig): Promise<RewardsConfig> {
    const res = await shopFetch<{
      rewards: RewardsConfig
      rewardsLastUpdatedAt: string | null
      rewardsLastUpdatedBy: string | null
      auditTrail: AuditEntry[]
    }>('/backoffice/rewards', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    rewards.value = { ...res.rewards }
    rewardsLastUpdatedAt.value = res.rewardsLastUpdatedAt
    rewardsLastUpdatedBy.value = res.rewardsLastUpdatedBy
    auditTrail.value = res.auditTrail
    return rewards.value
  }

  return {
    items,
    shopItems,
    bundles,
    wallet,
    inventory,
    equipped,
    transactions,
    rewards,
    rewardsLastUpdatedAt,
    rewardsLastUpdatedBy,
    economySnapshot,
    auditTrail,
    loading,
    backofficeLoading,
    error,
    availableItems,
    availableBundles,
    featuredBundle,
    getItemById,
    isOwned,
    isEquipped,
    fetchShopState,
    fetchBackofficeState,
    refreshTransactions,
    purchase,
    purchaseBundle,
    simulatePayment,
    equip,
    unequip,
    addShopItem,
    updateShopItem,
    deleteShopItem,
    addBundle,
    updateBundle,
    deleteBundle,
    updateRewards,
  }
})
