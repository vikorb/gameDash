import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — stable across reloads for video recording
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(42)
const rand = () => rng()
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const randBool = (prob = 0.5) => rand() < prob

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString()
}
export function wait(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms))
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ItemCategory = 'cosmetic' | 'pack' | 'pass' | 'boost'
export type ItemSlot = 'avatar' | 'banner' | 'frame' | 'emote' | 'trail' | 'spray' | null
export type CurrencyType = 'soft' | 'hard'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface ShopItem {
  id: number
  name: string
  icon: string
  category: ItemCategory
  slot: ItemSlot
  currency: CurrencyType
  price: number
  sales7d: number
  available: boolean
  rarity: Rarity
  isNew: boolean
  isFeatured: boolean
}

export interface InventoryItem {
  itemId: number
  ownedAt: string
  quantity: number
}

export interface Transaction {
  id: number
  type: 'purchase' | 'payment_sim' | 'reward'
  itemId?: number
  itemName?: string
  currency: CurrencyType | 'eur'
  amount: number
  status: 'success' | 'fail'
  createdAt: string
}

export interface TopUpPack {
  id: number
  hard: number
  bonus: number
  price: number
  label: string
  popular?: boolean
}

// ---------------------------------------------------------------------------
// Static templates
// ---------------------------------------------------------------------------
type SlotType = Exclude<ItemSlot, null>
const COSMETIC_TEMPLATES: Array<{ name: string; icon: string; slot: SlotType; rarity: Rarity }> = [
  { name: 'Neon Visor', icon: '🕶️', slot: 'avatar', rarity: 'rare' },
  { name: 'Aurora Skin', icon: '✨', slot: 'avatar', rarity: 'epic' },
  { name: 'Battle Cry', icon: '🗯️', slot: 'emote', rarity: 'common' },
  { name: 'Legacy Frame', icon: '🖼️', slot: 'frame', rarity: 'legendary' },
  { name: 'Emote Pack', icon: '😄', slot: 'emote', rarity: 'common' },
  { name: 'Shadow Trail', icon: '💨', slot: 'trail', rarity: 'rare' },
  { name: 'Galaxy Banner', icon: '🌌', slot: 'banner', rarity: 'epic' },
  { name: 'Flame Spray', icon: '🔥', slot: 'spray', rarity: 'rare' },
  { name: 'Ice Crown', icon: '👑', slot: 'avatar', rarity: 'legendary' },
  { name: 'Pixel Frame', icon: '🎮', slot: 'frame', rarity: 'common' },
  { name: 'Victory Dance', icon: '🕺', slot: 'emote', rarity: 'rare' },
  { name: 'Thunder Trail', icon: '⚡', slot: 'trail', rarity: 'epic' },
  { name: 'Ocean Banner', icon: '🌊', slot: 'banner', rarity: 'common' },
  { name: 'Graffiti Spray', icon: '🎨', slot: 'spray', rarity: 'rare' },
  { name: 'Cyber Mask', icon: '🤖', slot: 'avatar', rarity: 'epic' },
  { name: 'Dark Matter Skin', icon: '🌑', slot: 'avatar', rarity: 'legendary' },
  { name: 'Rainbow Trail', icon: '🌈', slot: 'trail', rarity: 'rare' },
  { name: 'Champion Frame', icon: '🏆', slot: 'frame', rarity: 'epic' },
  { name: 'Ninja Badge', icon: '🥷', slot: 'avatar', rarity: 'common' },
  { name: 'Confetti Spray', icon: '🎉', slot: 'spray', rarity: 'common' },
  { name: 'Dragon Emote', icon: '🐉', slot: 'emote', rarity: 'legendary' },
  { name: 'Cosmic Banner', icon: '🚀', slot: 'banner', rarity: 'epic' },
  { name: 'Ghost Trail', icon: '👻', slot: 'trail', rarity: 'rare' },
  { name: 'Diamond Frame', icon: '💎', slot: 'frame', rarity: 'legendary' },
  { name: 'Glitch Skin', icon: '⚙️', slot: 'avatar', rarity: 'epic' },
  { name: 'Star Spray', icon: '⭐', slot: 'spray', rarity: 'common' },
  { name: 'Phoenix Emote', icon: '🦅', slot: 'emote', rarity: 'epic' },
  { name: 'Nebula Banner', icon: '🌠', slot: 'banner', rarity: 'legendary' },
  { name: 'Lava Trail', icon: '🌋', slot: 'trail', rarity: 'rare' },
  { name: 'Pixel Frame v2', icon: '🖼️', slot: 'frame', rarity: 'common' },
]

const PACK_TEMPLATES: Omit<ShopItem, 'id' | 'sales7d' | 'available' | 'isNew' | 'isFeatured'>[] = [
  {
    name: 'Starter Pack',
    icon: '📦',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 50,
    rarity: 'common',
  },
  {
    name: 'Premium Pack',
    icon: '🎁',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 200,
    rarity: 'rare',
  },
  {
    name: 'Mega Pack',
    icon: '🎯',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 400,
    rarity: 'epic',
  },
  {
    name: 'Soft Pack 1 000',
    icon: '💰',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 25,
    rarity: 'common',
  },
  {
    name: 'Soft Pack 5 000',
    icon: '💸',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 100,
    rarity: 'rare',
  },
  {
    name: 'Soft Pack 15 000',
    icon: '🏦',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 250,
    rarity: 'epic',
  },
  {
    name: 'Season 4 Pass',
    icon: '🎫',
    category: 'pass',
    slot: null,
    currency: 'hard',
    price: 120,
    rarity: 'epic',
  },
  {
    name: 'XP Booster 1h',
    icon: '⚡',
    category: 'boost',
    slot: null,
    currency: 'soft',
    price: 200,
    rarity: 'common',
  },
  {
    name: 'XP Booster 24h',
    icon: '🔋',
    category: 'boost',
    slot: null,
    currency: 'hard',
    price: 35,
    rarity: 'rare',
  },
  {
    name: 'Double Soft 7j',
    icon: '✖️',
    category: 'boost',
    slot: null,
    currency: 'hard',
    price: 80,
    rarity: 'epic',
  },
]

const PRICE_TABLE: Record<Rarity, { soft: [number, number]; hard: [number, number] }> = {
  common: { soft: [300, 800], hard: [30, 60] },
  rare: { soft: [800, 1500], hard: [60, 120] },
  epic: { soft: [1500, 2500], hard: [100, 200] },
  legendary: { soft: [2500, 4000], hard: [200, 400] },
}

export const TOPUP_PACKS: TopUpPack[] = [
  { id: 1, hard: 100, bonus: 0, price: 0.99, label: 'Starter' },
  { id: 2, hard: 500, bonus: 0, price: 4.99, label: 'Populaire', popular: true },
  { id: 3, hard: 1200, bonus: 200, price: 9.99, label: 'Bon plan' },
  { id: 4, hard: 2500, bonus: 500, price: 19.99, label: 'Pro' },
  { id: 5, hard: 6500, bonus: 1500, price: 49.99, label: 'Élite' },
]

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------
function generateItems(): ShopItem[] {
  const items: ShopItem[] = []

  COSMETIC_TEMPLATES.forEach((tpl, i) => {
    const forceHard = tpl.rarity === 'epic' || tpl.rarity === 'legendary'
    const isHard = forceHard || randBool(0.4)
    const range = PRICE_TABLE[tpl.rarity][isHard ? 'hard' : 'soft']
    const raw = randInt(range[0], range[1])
    const price = Math.round(raw / (isHard ? 5 : 50)) * (isHard ? 5 : 50)

    items.push({
      id: i + 1,
      name: tpl.name,
      icon: tpl.icon,
      category: 'cosmetic',
      slot: tpl.slot,
      currency: isHard ? 'hard' : 'soft',
      price,
      sales7d: randInt(50, 1200),
      available: randBool(0.92),
      rarity: tpl.rarity,
      isNew: randBool(0.12),
      isFeatured: tpl.rarity === 'legendary' && randBool(0.5),
    })
  })

  PACK_TEMPLATES.forEach((tpl, i) => {
    items.push({
      id: 31 + i,
      ...tpl,
      sales7d: randInt(100, 900),
      available: true,
      isNew: false,
      isFeatured: tpl.category === 'pass',
    })
  })

  return items
}

function generateInventory(): InventoryItem[] {
  const rng2 = mulberry32(66)
  return [1, 6, 10, 14, 20, 35, 38].map((itemId) => ({
    itemId,
    ownedAt: hoursAgo(Math.floor(rng2() * 300 + 12)),
    quantity: 1,
  }))
}

function generateTransactions(): Transaction[] {
  const rng3 = mulberry32(77)
  const txs: Transaction[] = []

  const TX_TYPES = ['purchase', 'payment_sim', 'reward'] as const
  const SIM_HARD = [100, 500, 1200] as const
  const SIM_EUR = [0.99, 4.99, 9.99] as const

  for (let i = 0; i < 15; i++) {
    const type: Transaction['type'] = TX_TYPES[Math.floor(rng3() * TX_TYPES.length)]!
    const isHard = rng3() > 0.5
    const status: 'success' | 'fail' = rng3() > 0.1 ? 'success' : 'fail'
    const itemIdx = Math.floor(rng3() * COSMETIC_TEMPLATES.length)
    const simIdx = Math.floor(rng3() * 3)
    txs.push({
      id: 1000 + i,
      type,
      itemName:
        type === 'purchase'
          ? COSMETIC_TEMPLATES[itemIdx]!.name
          : type === 'payment_sim'
            ? `${SIM_HARD[simIdx]!} ⬢`
            : 'Récompense niveau',
      currency: type === 'payment_sim' ? 'eur' : isHard ? 'hard' : 'soft',
      amount: type === 'payment_sim' ? SIM_EUR[simIdx]! : randInt(50, 500),
      status,
      createdAt: hoursAgo(Math.floor(rng3() * 240 + 1)),
    })
  }

  return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ---------------------------------------------------------------------------
// Store definition
// ---------------------------------------------------------------------------
export const useShopStore = defineStore('shop', () => {
  const wallet = ref({ soft: 3_200, hard: 185 })
  const shopItems = ref<ShopItem[]>(generateItems())
  const inventory = ref<InventoryItem[]>(generateInventory())
  const equipped = ref<Record<string, number | null>>({
    avatar: 1,
    banner: null,
    frame: 10,
    emote: null,
    trail: 6,
    spray: null,
  })
  const transactions = ref<Transaction[]>(generateTransactions())

  // --- Computed ------------------------------------------------------------
  const ownedIds = computed(() => new Set(inventory.value.map((i) => i.itemId)))
  const featuredItems = computed(() =>
    shopItems.value.filter((i) => i.isFeatured && i.available).slice(0, 3),
  )
  const availableItems = computed(() => shopItems.value.filter((i) => i.available))

  // --- Helpers -------------------------------------------------------------
  function isOwned(itemId: number) {
    return ownedIds.value.has(itemId)
  }
  function isEquipped(itemId: number) {
    return Object.values(equipped.value).includes(itemId)
  }
  function getItemById(id: number) {
    return shopItems.value.find((i) => i.id === id) ?? null
  }

  // --- Actions -------------------------------------------------------------
  function purchase(itemId: number): { success: boolean; reason?: string } {
    const item = getItemById(itemId)
    if (!item) return { success: false, reason: 'not_found' }
    if (isOwned(itemId)) return { success: false, reason: 'already_owned' }

    const balance = item.currency === 'soft' ? wallet.value.soft : wallet.value.hard
    if (balance < item.price) return { success: false, reason: 'insufficient_funds' }

    if (item.currency === 'soft') wallet.value.soft -= item.price
    else wallet.value.hard -= item.price

    inventory.value.push({ itemId, ownedAt: new Date().toISOString(), quantity: 1 })
    transactions.value.unshift({
      id: Date.now(),
      type: 'purchase',
      itemId,
      itemName: item.name,
      currency: item.currency,
      amount: item.price,
      status: 'success',
      createdAt: new Date().toISOString(),
    })

    return { success: true }
  }

  function equip(itemId: number): { success: boolean; reason?: string } {
    if (!isOwned(itemId)) return { success: false, reason: 'not_owned' }
    const item = getItemById(itemId)
    if (!item || !item.slot) return { success: false, reason: 'no_slot' }
    equipped.value[item.slot] = itemId
    return { success: true }
  }

  function unequip(slot: string): void {
    equipped.value[slot] = null
  }

  async function simulatePayment(packId: number): Promise<{ success: boolean }> {
    const pack = TOPUP_PACKS.find((p) => p.id === packId)
    if (!pack) return { success: false }

    await wait(1_400)
    // deterministic-ish: 90% success
    const success = (packId * 137 + Date.now()) % 10 !== 0

    if (success) {
      wallet.value.hard += pack.hard + pack.bonus
      transactions.value.unshift({
        id: Date.now(),
        type: 'payment_sim',
        itemName: `${pack.hard + pack.bonus} ⬢ (${pack.label})`,
        currency: 'eur',
        amount: pack.price,
        status: 'success',
        createdAt: new Date().toISOString(),
      })
    } else {
      transactions.value.unshift({
        id: Date.now(),
        type: 'payment_sim',
        itemName: `${pack.hard + pack.bonus} ⬢ (${pack.label})`,
        currency: 'eur',
        amount: pack.price,
        status: 'fail',
        createdAt: new Date().toISOString(),
      })
    }

    return { success }
  }

  return {
    wallet,
    shopItems,
    availableItems,
    featuredItems,
    inventory,
    equipped,
    transactions,
    ownedIds,
    isOwned,
    isEquipped,
    getItemById,
    purchase,
    equip,
    unequip,
    simulatePayment,
  }
})
