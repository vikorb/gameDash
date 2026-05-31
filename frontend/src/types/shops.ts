export const ITEM_CATEGORIES = ['cosmetic', 'pack', 'pass', 'boost'] as const
export const ITEM_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
export const ITEM_SLOTS = ['avatar', 'banner', 'frame', 'emote', 'trail', 'spray'] as const
export const CURRENCIES = ['soft', 'hard'] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]
export type ItemRarity = (typeof ITEM_RARITIES)[number]
export type ItemSlot = (typeof ITEM_SLOTS)[number]
export type Currency = (typeof CURRENCIES)[number]

export type Wallet = {
  soft: number
  hard: number
}

export type EquippedMap = Record<string, number | null>

export type ShopItem = {
  id: number
  name: string
  category: ItemCategory
  rarity: ItemRarity
  slot: ItemSlot | null
  currency: Currency
  price: number
  imageSeed: string
  isFeatured: boolean
  isNew: boolean
  available: boolean
  sales7d: number
}

export type Bundle = {
  id: number
  name: string
  description: string | null
  currency: Currency
  originalPrice: number
  bundlePrice: number
  imageSeed: string
  badge: string | null
  expiresAt: string | null
  isFeatured: boolean
  itemIds: number[]
  available: boolean
  gradient: string | null
}

export type InventoryEntry = {
  itemId: number
  ownedAt: string
}

export type ShopState = {
  items: ShopItem[]
  bundles: Bundle[]
  wallet: Wallet
  inventory: InventoryEntry[]
  equipped: EquippedMap
}

export type Transaction = {
  id: number
  playerName: string
  itemName: string | null
  type: 'purchase' | 'payment_sim' | 'reward'
  amount: number
  currency: Currency | 'eur'
  status: 'success' | 'fail'
  createdAt: string
}

export type RewardsConfig = {
  xpWin: number
  xpLoss: number
  softWin: number
  softLoss: number
  dailyQuestSoft: number
  levelUpHard: number
}

export type EconomySnapshot = {
  softCurrencyEarned: number
  hardCurrencySold: number
  virtualRevenue: number
  transactionsLast7d: number
}

export type AuditEntry = {
  id: number
  kind: 'price' | 'rewards' | 'availability'
  summary: string
  actor: string
  timestamp: string
}

export type ShopBackofficeState = {
  items: ShopItem[]
  bundles: Bundle[]
  transactions: Transaction[]
  rewards: RewardsConfig
  rewardsLastUpdatedAt: string | null
  rewardsLastUpdatedBy: string | null
  economySnapshot: EconomySnapshot
  auditTrail: AuditEntry[]
}

export type ShopItemPayload = {
  name: string
  category: ItemCategory
  rarity: ItemRarity
  slot: ItemSlot | null
  currency: Currency
  price: number
  imageSeed: string
  isFeatured: boolean
  isNew: boolean
  available: boolean
}

export type ShopItemPatch = Partial<ShopItemPayload>

export type BundlePayload = {
  name: string
  description: string | null
  currency: Currency
  originalPrice?: number
  bundlePrice: number
  imageSeed: string
  badge: string | null
  expiresAt: string | null
  isFeatured?: boolean
  itemIds: number[]
  available: boolean
  gradient?: string | null
}

export type BundlePatch = Partial<BundlePayload>

export type PurchaseResult = {
  success: boolean
  reason?: 'insufficient_funds' | 'already_owned' | 'not_found' | 'error'
}

export type TopUpResult = {
  success: boolean
  credited?: number
}

export type EquipResult = {
  success: boolean
}

export type TopUpPack = {
  id: string
  labelKey: string
  hard: number
  bonus: number
  price: number
}

export const TOPUP_PACKS: TopUpPack[] = [
  { id: 'starter', labelKey: 'shop.topup.packs.starter', hard: 200, bonus: 0, price: 1.99 },
  { id: 'basic', labelKey: 'shop.topup.packs.basic', hard: 550, bonus: 0, price: 4.99 },
  { id: 'standard', labelKey: 'shop.topup.packs.standard', hard: 1250, bonus: 0, price: 9.99 },
  { id: 'popular', labelKey: 'shop.topup.packs.popular', hard: 2500, bonus: 300, price: 19.99 },
  { id: 'premium', labelKey: 'shop.topup.packs.premium', hard: 7000, bonus: 1000, price: 49.99 },
]

export const GRADIENT_PRESETS = [
  { label: 'Sunset', value: 'linear-gradient(135deg, #f28b5b, #f7a784)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #3f7cff, #33d1c6)' },
  { label: 'Violet', value: 'linear-gradient(135deg, #7c3aed, #f472b6)' },
  { label: 'Emerald', value: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
]
