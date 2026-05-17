import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ---------------------------------------------------------------------------
// Seeded PRNG — stable across reloads for video recording
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
function daysFromNow(d: number) {
  return new Date(Date.now() + d * 86_400_000).toISOString()
}
export function wait(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms))
}

/** Stable picsum image URL from a string seed */
export function picsumUrl(seed: string, w: number, h: number): string {
  // Convert string to a numeric seed deterministically
  let n = 0
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0
  return `https://picsum.photos/seed/${n % 1000}/${w}/${h}`
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
  imageSeed: string
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

export interface Bundle {
  id: number
  name: string
  description: string
  imageSeed: string
  itemIds: number[]
  originalPrice: number
  bundlePrice: number
  currency: CurrencyType
  expiresAt: string | null
  badge: string | null
  gradient: string
  available: boolean
}

export interface InventoryItem {
  itemId: number
  ownedAt: string
  quantity: number
}

export interface Transaction {
  id: number
  type: 'purchase' | 'payment_sim' | 'reward'
  playerName: string
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
// Templates
// ---------------------------------------------------------------------------
type SlotType = Exclude<ItemSlot, null>
const COSMETIC_TEMPLATES: { name: string; slot: SlotType; rarity: Rarity }[] = [
  { name: 'Neon Visor', slot: 'avatar', rarity: 'rare' },
  { name: 'Aurora Skin', slot: 'avatar', rarity: 'epic' },
  { name: 'Battle Cry', slot: 'emote', rarity: 'common' },
  { name: 'Legacy Frame', slot: 'frame', rarity: 'legendary' },
  { name: 'Shadow Emote', slot: 'emote', rarity: 'common' },
  { name: 'Shadow Trail', slot: 'trail', rarity: 'rare' },
  { name: 'Galaxy Banner', slot: 'banner', rarity: 'epic' },
  { name: 'Flame Spray', slot: 'spray', rarity: 'rare' },
  { name: 'Ice Crown', slot: 'avatar', rarity: 'legendary' },
  { name: 'Pixel Frame', slot: 'frame', rarity: 'common' },
  { name: 'Victory Dance', slot: 'emote', rarity: 'rare' },
  { name: 'Thunder Trail', slot: 'trail', rarity: 'epic' },
  { name: 'Ocean Banner', slot: 'banner', rarity: 'common' },
  { name: 'Graffiti Spray', slot: 'spray', rarity: 'rare' },
  { name: 'Cyber Mask', slot: 'avatar', rarity: 'epic' },
  { name: 'Dark Matter Skin', slot: 'avatar', rarity: 'legendary' },
  { name: 'Rainbow Trail', slot: 'trail', rarity: 'rare' },
  { name: 'Champion Frame', slot: 'frame', rarity: 'epic' },
  { name: 'Ninja Badge', slot: 'avatar', rarity: 'common' },
  { name: 'Confetti Spray', slot: 'spray', rarity: 'common' },
  { name: 'Dragon Emote', slot: 'emote', rarity: 'legendary' },
  { name: 'Cosmic Banner', slot: 'banner', rarity: 'epic' },
  { name: 'Ghost Trail', slot: 'trail', rarity: 'rare' },
  { name: 'Diamond Frame', slot: 'frame', rarity: 'legendary' },
  { name: 'Glitch Skin', slot: 'avatar', rarity: 'epic' },
  { name: 'Star Spray', slot: 'spray', rarity: 'common' },
  { name: 'Phoenix Emote', slot: 'emote', rarity: 'epic' },
  { name: 'Nebula Banner', slot: 'banner', rarity: 'legendary' },
  { name: 'Lava Trail', slot: 'trail', rarity: 'rare' },
  { name: 'Pixel Frame v2', slot: 'frame', rarity: 'common' },
]

const PACK_TEMPLATES: Omit<
  ShopItem,
  'id' | 'sales7d' | 'available' | 'isNew' | 'isFeatured' | 'imageSeed'
>[] = [
  {
    name: 'Starter Pack',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 50,
    rarity: 'common',
  },
  {
    name: 'Premium Pack',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 200,
    rarity: 'rare',
  },
  { name: 'Mega Pack', category: 'pack', slot: null, currency: 'hard', price: 400, rarity: 'epic' },
  {
    name: 'Soft Pack 1k',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 25,
    rarity: 'common',
  },
  {
    name: 'Soft Pack 5k',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 100,
    rarity: 'rare',
  },
  {
    name: 'Soft Pack 15k',
    category: 'pack',
    slot: null,
    currency: 'hard',
    price: 250,
    rarity: 'epic',
  },
  {
    name: 'Season 4 Pass',
    category: 'pass',
    slot: null,
    currency: 'hard',
    price: 120,
    rarity: 'epic',
  },
  {
    name: 'XP Booster 1h',
    category: 'boost',
    slot: null,
    currency: 'soft',
    price: 200,
    rarity: 'common',
  },
  {
    name: 'XP Booster 24h',
    category: 'boost',
    slot: null,
    currency: 'hard',
    price: 35,
    rarity: 'rare',
  },
  {
    name: 'Double Soft 7j',
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

export const GRADIENT_PRESETS: { label: string; value: string }[] = [
  { label: 'Bleu Nuit', value: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f50 50%, #0f3460 100%)' },
  { label: 'Solaire', value: 'linear-gradient(135deg, #1a0a00 0%, #3d2200 50%, #5c3300 100%)' },
  { label: 'Inferno', value: 'linear-gradient(135deg, #2d0000 0%, #5c1000 50%, #2d0000 100%)' },
  { label: 'Cosmos', value: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #0d1a40 100%)' },
  { label: 'Forêt', value: 'linear-gradient(135deg, #001a0a 0%, #0a3d20 50%, #001208 100%)' },
  { label: 'Titane', value: 'linear-gradient(135deg, #0a0a0a 0%, #282828 50%, #101010 100%)' },
]

export const BUNDLE_BADGES = ['Limité', 'Nouveau', 'Populaire', 'Exclusif'] as const

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
      imageSeed: `item-${i + 1}-${tpl.slot}`,
      category: 'cosmetic',
      slot: tpl.slot,
      currency: isHard ? 'hard' : 'soft',
      price,
      sales7d: randInt(50, 1200),
      available: randBool(0.92),
      rarity: tpl.rarity,
      isNew: randBool(0.12),
      isFeatured: tpl.rarity === 'legendary' && randBool(0.6),
    })
  })

  PACK_TEMPLATES.forEach((tpl, i) => {
    items.push({
      id: 31 + i,
      imageSeed: `pack-${31 + i}`,
      ...tpl,
      sales7d: randInt(100, 900),
      available: true,
      isNew: false,
      isFeatured: tpl.category === 'pass',
    })
  })

  return items
}

const BUNDLE_DEFS: {
  name: string
  description: string
  itemIds: number[]
  discountPct: number
  expiresAt: string | null
  badge: string | null
  imageSeed: string
  gradient: string
}[] = [
  {
    name: 'Cyber Elite',
    description: "Équipement high-tech pour les guerriers de l'arène.",
    itemIds: [2, 12, 15, 22],
    discountPct: 0.32,
    expiresAt: daysFromNow(3),
    badge: 'Limité',
    imageSeed: 'bundle-cyber',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f50 50%, #0f3460 100%)',
  },
  {
    name: 'Pack Légendaire',
    description: "Les cosmétiques les plus rares pour les joueurs d'élite.",
    itemIds: [4, 9, 21, 24],
    discountPct: 0.28,
    expiresAt: daysFromNow(5),
    badge: 'Populaire',
    imageSeed: 'bundle-legend',
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d2200 50%, #5c3300 100%)',
  },
  {
    name: 'Inferno',
    description: 'Brûlez vos adversaires avec ce pack enflammé.',
    itemIds: [8, 16, 29],
    discountPct: 0.25,
    expiresAt: null,
    badge: 'Nouveau',
    imageSeed: 'bundle-inferno',
    gradient: 'linear-gradient(135deg, #2d0000 0%, #5c1000 50%, #2d0000 100%)',
  },
  {
    name: 'Starter Kit',
    description: 'Démarrez votre aventure avec style dès le premier match.',
    itemIds: [1, 5, 10, 14],
    discountPct: 0.2,
    expiresAt: null,
    badge: null,
    imageSeed: 'bundle-starter',
    gradient: 'linear-gradient(135deg, #0a1628 0%, #1c3050 50%, #0d2040 100%)',
  },
  {
    name: 'Pack Cosmique',
    description: "Un voyage interstellaire à travers les étoiles de l'arène.",
    itemIds: [7, 17, 27],
    discountPct: 0.3,
    expiresAt: daysFromNow(7),
    badge: null,
    imageSeed: 'bundle-cosmic',
    gradient: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #0d1a40 100%)',
  },
]

function generateBundles(items: ShopItem[]): Bundle[] {
  const getItem = (id: number) => items.find((i) => i.id === id)
  return BUNDLE_DEFS.map((def, i) => {
    const bundleItems = def.itemIds.map(getItem).filter(Boolean) as ShopItem[]
    const originalPrice = bundleItems.reduce((s, it) => s + it.price, 0)
    const bundlePrice = Math.max(10, Math.round((originalPrice * (1 - def.discountPct)) / 5) * 5)
    return {
      id: i + 1,
      name: def.name,
      description: def.description,
      imageSeed: def.imageSeed,
      itemIds: def.itemIds,
      originalPrice,
      bundlePrice,
      currency: 'hard' as const,
      expiresAt: def.expiresAt,
      badge: def.badge,
      gradient: def.gradient,
      available: true,
    }
  })
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
  const PLAYERS = [
    'ShadowX',
    'NebulaStar',
    'Viper99',
    'CryptoKing',
    'ArcLight',
    'ZeroGhost',
    'NeonBlade',
    'IceQueen',
    'PhoenixRise',
    'DarkWolf',
    'StarDust',
    'TurboAce',
    'GlitchHunter',
    'SilverFox',
    'BlazeMaster',
  ] as const

  for (let i = 0; i < 40; i++) {
    const type: Transaction['type'] = TX_TYPES[Math.floor(rng3() * TX_TYPES.length)]!
    const isHard = rng3() > 0.5
    const status: 'success' | 'fail' = rng3() > 0.1 ? 'success' : 'fail'
    const itemIdx = Math.floor(rng3() * COSMETIC_TEMPLATES.length)
    const simIdx = Math.floor(rng3() * 3)
    const playerIdx = Math.floor(rng3() * PLAYERS.length)
    txs.push({
      id: 1000 + i,
      type,
      playerName: PLAYERS[playerIdx]!,
      itemName:
        type === 'purchase'
          ? COSMETIC_TEMPLATES[itemIdx]!.name
          : type === 'payment_sim'
            ? `${SIM_HARD[simIdx]!} gemmes`
            : 'Récompense niveau',
      currency: type === 'payment_sim' ? 'eur' : isHard ? 'hard' : 'soft',
      amount: type === 'payment_sim' ? SIM_EUR[simIdx]! : randInt(50, 500),
      status,
      createdAt: hoursAgo(Math.floor(rng3() * 480 + 1)),
    })
  }
  return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useShopStore = defineStore('shop', () => {
  const shopItems = ref<ShopItem[]>(generateItems())
  const bundles = ref<Bundle[]>(generateBundles(shopItems.value))
  const wallet = ref({ soft: 3_200, hard: 185 })
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

  const ownedIds = computed(() => new Set(inventory.value.map((i) => i.itemId)))
  const availableItems = computed(() => shopItems.value.filter((i) => i.available))
  const availableBundles = computed(() => bundles.value.filter((b) => b.available))
  const featuredBundle = computed(
    () => bundles.value.find((b) => b.available && b.expiresAt) ?? bundles.value[0] ?? null,
  )

  function isOwned(id: number) {
    return ownedIds.value.has(id)
  }
  function isEquipped(id: number) {
    return Object.values(equipped.value).includes(id)
  }
  function getItemById(id: number) {
    return shopItems.value.find((i) => i.id === id) ?? null
  }

  function purchase(itemId: number): { success: boolean; reason?: string } {
    const item = getItemById(itemId)
    if (!item) return { success: false, reason: 'not_found' }
    if (isOwned(itemId)) return { success: false, reason: 'already_owned' }
    const bal = item.currency === 'soft' ? wallet.value.soft : wallet.value.hard
    if (bal < item.price) return { success: false, reason: 'insufficient_funds' }
    if (item.currency === 'soft') wallet.value.soft -= item.price
    else wallet.value.hard -= item.price
    inventory.value.push({ itemId, ownedAt: new Date().toISOString(), quantity: 1 })
    transactions.value.unshift({
      id: Date.now(),
      type: 'purchase',
      playerName: 'Moi',
      itemId,
      itemName: item.name,
      currency: item.currency,
      amount: item.price,
      status: 'success',
      createdAt: new Date().toISOString(),
    })
    return { success: true }
  }

  function purchaseBundle(bundleId: number): { success: boolean; reason?: string } {
    const bundle = bundles.value.find((b) => b.id === bundleId)
    if (!bundle || !bundle.available) return { success: false, reason: 'not_found' }
    const bal = bundle.currency === 'soft' ? wallet.value.soft : wallet.value.hard
    if (bal < bundle.bundlePrice) return { success: false, reason: 'insufficient_funds' }
    if (bundle.currency === 'soft') wallet.value.soft -= bundle.bundlePrice
    else wallet.value.hard -= bundle.bundlePrice
    bundle.itemIds
      .filter((id) => !isOwned(id))
      .forEach((itemId) => {
        inventory.value.push({ itemId, ownedAt: new Date().toISOString(), quantity: 1 })
      })
    transactions.value.unshift({
      id: Date.now(),
      type: 'purchase',
      playerName: 'Moi',
      itemName: bundle.name,
      currency: bundle.currency,
      amount: bundle.bundlePrice,
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
    const success = (packId * 137 + Date.now()) % 10 !== 0
    if (success) wallet.value.hard += pack.hard + pack.bonus
    transactions.value.unshift({
      id: Date.now(),
      type: 'payment_sim',
      playerName: 'Moi',
      itemName: `${pack.hard + pack.bonus} gemmes (${pack.label})`,
      currency: 'eur',
      amount: pack.price,
      status: success ? 'success' : 'fail',
      createdAt: new Date().toISOString(),
    })
    return { success }
  }

  // --- Backoffice bundle CRUD ---
  function _recalcOriginalPrice(bundle: Bundle): void {
    const items = bundle.itemIds.map(getItemById).filter(Boolean) as ShopItem[]
    bundle.originalPrice = items.reduce((s, i) => s + i.price, 0)
  }

  function addBundle(data: Omit<Bundle, 'id' | 'originalPrice'>): void {
    const id = Math.max(0, ...bundles.value.map((b) => b.id)) + 1
    const newBundle: Bundle = { id, ...data, originalPrice: 0 }
    _recalcOriginalPrice(newBundle)
    bundles.value.unshift(newBundle)
  }

  function updateBundle(id: number, data: Partial<Omit<Bundle, 'id'>>): void {
    const idx = bundles.value.findIndex((b) => b.id === id)
    if (idx === -1) return
    const updated = { ...bundles.value[idx]!, ...data }
    _recalcOriginalPrice(updated)
    bundles.value[idx] = updated
  }

  function deleteBundle(id: number): void {
    bundles.value = bundles.value.filter((b) => b.id !== id)
  }

  // --- Backoffice item CRUD ---
  function addShopItem(data: Omit<ShopItem, 'id' | 'sales7d'>): void {
    const id = Math.max(0, ...shopItems.value.map((i) => i.id)) + 1
    shopItems.value.unshift({ id, sales7d: 0, ...data })
  }

  function updateShopItem(id: number, data: Partial<Omit<ShopItem, 'id'>>): void {
    const idx = shopItems.value.findIndex((i) => i.id === id)
    if (idx === -1) return
    shopItems.value[idx] = { ...shopItems.value[idx]!, ...data }
  }

  function deleteShopItem(id: number): void {
    shopItems.value = shopItems.value.filter((i) => i.id !== id)
    // Also clean up inventory and bundles that reference this item
    inventory.value = inventory.value.filter((inv) => inv.itemId !== id)
    bundles.value = bundles.value.map((b) => ({
      ...b,
      itemIds: b.itemIds.filter((iid) => iid !== id),
    }))
    // Remove from equipped slots
    Object.keys(equipped.value).forEach((slot) => {
      if (equipped.value[slot] === id) equipped.value[slot] = null
    })
  }

  return {
    shopItems,
    bundles,
    wallet,
    inventory,
    equipped,
    transactions,
    ownedIds,
    availableItems,
    availableBundles,
    featuredBundle,
    isOwned,
    isEquipped,
    getItemById,
    picsumUrl,
    purchase,
    purchaseBundle,
    equip,
    unequip,
    simulatePayment,
    addBundle,
    updateBundle,
    deleteBundle,
    addShopItem,
    updateShopItem,
    deleteShopItem,
  }
})
