export const ITEM_CATEGORIES = ["cosmetic", "pack", "pass", "boost"] as const;
export const ITEM_RARITIES = ["common", "rare", "epic", "legendary"] as const;
export const ITEM_SLOTS = [
  "avatar",
  "banner",
  "frame",
  "emote",
  "trail",
  "spray",
] as const;
export const CURRENCIES = ["soft", "hard"] as const;
export const TRANSACTION_TYPES = [
  "purchase_item",
  "purchase_bundle",
  "topup",
  "reward",
] as const;
export const AUDIT_KINDS = ["price", "rewards", "availability"] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
export type ItemRarity = (typeof ITEM_RARITIES)[number];
export type ItemSlot = (typeof ITEM_SLOTS)[number];
export type Currency = (typeof CURRENCIES)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type AuditKind = (typeof AUDIT_KINDS)[number];

export interface ShopItemRow {
  id: number;
  name: string;
  category: string;
  rarity: string;
  slot: string | null;
  currency: string;
  price: number;
  image_seed: string;
  is_featured: boolean | number;
  is_new: boolean | number;
  is_active: boolean | number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ShopBundleRow {
  id: number;
  name: string;
  description: string | null;
  currency: string;
  original_price: number;
  bundle_price: number;
  image_seed: string;
  badge: string | null;
  gradient?: string | null;
  expires_at: Date | string | null;
  is_featured: boolean | number;
  is_active: boolean | number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ShopBundleItemRow {
  id: number;
  bundle_id: number;
  item_id: number;
}

export interface ShopWalletRow {
  id: number;
  user_id: number;
  soft: number;
  hard: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ShopInventoryRow {
  id: number;
  user_id: number;
  item_id: number;
  owned_at: Date | string;
}

export interface ShopEquippedRow {
  id: number;
  user_id: number;
  slot: string;
  item_id: number;
}

export interface ShopTransactionRow {
  id: number;
  user_id: number;
  type: string;
  currency: string;
  amount: number;
  ref_id: number | null;
  ref_name: string | null;
  created_at: Date | string;
}

export interface ShopEconomyRewardsRow {
  id: number;
  xp_win: number;
  xp_loss: number;
  soft_win: number;
  soft_loss: number;
  daily_quest_soft: number;
  level_up_hard: number;
  updated_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ShopAdminAuditLogRow {
  id: number;
  kind: string;
  summary: string;
  actor: string;
  metadata: unknown | null;
  created_at: Date | string;
}

export interface ShopItemDTO {
  id: number;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  slot: ItemSlot | null;
  currency: Currency;
  price: number;
  imageSeed: string;
  isFeatured: boolean;
  isNew: boolean;
  available: boolean;
  sales7d: number;
}

export interface ShopBundleDTO {
  id: number;
  name: string;
  description: string | null;
  currency: Currency;
  originalPrice: number;
  bundlePrice: number;
  imageSeed: string;
  badge: string | null;
  expiresAt: string | null;
  isFeatured: boolean;
  itemIds: number[];
  available: boolean;
  gradient: string | null;
}

export interface WalletDTO {
  soft: number;
  hard: number;
}

export interface InventoryEntryDTO {
  itemId: number;
  ownedAt: string;
}

export interface EquippedDTO {
  [slot: string]: number | null;
}

export interface TransactionDTO {
  id: number;
  type: TransactionType;
  currency: Currency;
  amount: number;
  refId: number | null;
  refName: string | null;
  createdAt: string;
}

export interface AdminTransactionDTO {
  id: number;
  playerName: string;
  itemName: string | null;
  type: "purchase" | "payment_sim" | "reward";
  amount: number;
  currency: Currency | "eur";
  status: "success" | "fail";
  createdAt: string;
}

export interface RewardsConfigDTO {
  xpWin: number;
  xpLoss: number;
  softWin: number;
  softLoss: number;
  dailyQuestSoft: number;
  levelUpHard: number;
}

export interface EconomySnapshotDTO {
  softCurrencyEarned: number;
  hardCurrencySold: number;
  virtualRevenue: number;
  transactionsLast7d: number;
}

export interface AuditEntryDTO {
  id: number;
  kind: AuditKind;
  summary: string;
  actor: string;
  timestamp: string;
}

export interface ShopStateDTO {
  items: ShopItemDTO[];
  bundles: ShopBundleDTO[];
  wallet: WalletDTO;
  inventory: InventoryEntryDTO[];
  equipped: EquippedDTO;
}

export interface ShopBackofficeStateDTO {
  items: ShopItemDTO[];
  bundles: ShopBundleDTO[];
  transactions: AdminTransactionDTO[];
  rewards: RewardsConfigDTO;
  rewardsLastUpdatedAt: string | null;
  rewardsLastUpdatedBy: string | null;
  economySnapshot: EconomySnapshotDTO;
  auditTrail: AuditEntryDTO[];
}

export interface ShopItemPayloadDTO {
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  slot: ItemSlot | null;
  currency: Currency;
  price: number;
  imageSeed: string;
  isFeatured: boolean;
  isNew: boolean;
  available: boolean;
}

export type ShopItemPatchDTO = Partial<ShopItemPayloadDTO>;

export interface ShopBundlePayloadDTO {
  name: string;
  description: string | null;
  currency: Currency;
  originalPrice?: number;
  bundlePrice: number;
  imageSeed: string;
  badge: string | null;
  expiresAt: string | null;
  isFeatured?: boolean;
  itemIds: number[];
  available: boolean;
  gradient?: string | null;
}

export type ShopBundlePatchDTO = Partial<ShopBundlePayloadDTO>;

export function toItemDTO(row: ShopItemRow, sales7d = 0): ShopItemDTO {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category as ItemCategory,
    rarity: row.rarity as ItemRarity,
    slot: row.slot ? (row.slot as ItemSlot) : null,
    currency: row.currency as Currency,
    price: Number(row.price),
    imageSeed: row.image_seed,
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.is_new),
    available: Boolean(row.is_active),
    sales7d,
  };
}

export function toBundleDTO(
  row: ShopBundleRow,
  itemIds: number[],
): ShopBundleDTO {
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    currency: row.currency as Currency,
    originalPrice: Number(row.original_price),
    bundlePrice: Number(row.bundle_price),
    imageSeed: row.image_seed,
    badge: row.badge,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    isFeatured: Boolean(row.is_featured),
    itemIds,
    available: Boolean(row.is_active),
    gradient: row.gradient ?? null,
  };
}

export function toTransactionDTO(row: ShopTransactionRow): TransactionDTO {
  return {
    id: Number(row.id),
    type: row.type as TransactionType,
    currency: row.currency as Currency,
    amount: Number(row.amount),
    refId: row.ref_id == null ? null : Number(row.ref_id),
    refName: row.ref_name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function toAdminTransactionDTO(
  row: ShopTransactionRow,
): AdminTransactionDTO {
  const type =
    row.type === "topup"
      ? "payment_sim"
      : row.type === "reward"
        ? "reward"
        : "purchase";

  return {
    id: Number(row.id),
    playerName: `Joueur #${row.user_id}`,
    itemName: row.ref_name,
    type,
    amount: Math.abs(Number(row.amount)),
    currency: row.currency as Currency,
    status: "success",
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function toRewardsConfigDTO(
  row: ShopEconomyRewardsRow,
): RewardsConfigDTO {
  return {
    xpWin: Number(row.xp_win),
    xpLoss: Number(row.xp_loss),
    softWin: Number(row.soft_win),
    softLoss: Number(row.soft_loss),
    dailyQuestSoft: Number(row.daily_quest_soft),
    levelUpHard: Number(row.level_up_hard),
  };
}

export function toAuditEntryDTO(row: ShopAdminAuditLogRow): AuditEntryDTO {
  return {
    id: Number(row.id),
    kind: row.kind as AuditKind,
    summary: row.summary,
    actor: row.actor,
    timestamp: new Date(row.created_at).toISOString(),
  };
}
