import { Router, type Request, type Response } from "express";
import type { Knex } from "knex";
import {
  CURRENCIES,
  ITEM_CATEGORIES,
  ITEM_RARITIES,
  ITEM_SLOTS,
  type AuditKind,
  type Currency,
  type EquippedDTO,
  type InventoryEntryDTO,
  type RewardsConfigDTO,
  type ShopAdminAuditLogRow,
  type ShopBackofficeStateDTO,
  type ShopBundlePatchDTO,
  type ShopBundlePayloadDTO,
  type ShopBundleRow,
  type ShopEconomyRewardsRow,
  type ShopEquippedRow,
  type ShopInventoryRow,
  type ShopItemPatchDTO,
  type ShopItemPayloadDTO,
  type ShopItemRow,
  type ShopStateDTO,
  type ShopTransactionRow,
  type ShopWalletRow,
  type ShopBundleItemRow,
  toAdminTransactionDTO,
  toAuditEntryDTO,
  toBundleDTO,
  toItemDTO,
  toRewardsConfigDTO,
  toTransactionDTO,
} from "../types/shop";

const DEFAULT_USER_ID = 66;
const INITIAL_SOFT = 3200;
const INITIAL_HARD = 150;
const DEFAULT_GRADIENT = "linear-gradient(135deg, #f28b5b, #f7a784)";

const DEFAULT_REWARDS: RewardsConfigDTO = {
  xpWin: 150,
  xpLoss: 50,
  softWin: 100,
  softLoss: 25,
  dailyQuestSoft: 250,
  levelUpHard: 5,
};

const TOPUP_PACKS: Record<
  string,
  { hard: number; bonus: number; eur: number }
> = {
  starter: { hard: 200, bonus: 0, eur: 1.99 },
  basic: { hard: 550, bonus: 0, eur: 4.99 },
  standard: { hard: 1250, bonus: 0, eur: 9.99 },
  popular: { hard: 2500, bonus: 300, eur: 19.99 },
  premium: { hard: 7000, bonus: 1000, eur: 49.99 },
};

type RequestUser = {
  id?: unknown;
  username?: unknown;
  email?: unknown;
  role?: unknown;
};

type KnexOrTrx = Knex | Knex.Transaction;

function asUser(req: Request): RequestUser | undefined {
  return (req as Request & { user?: RequestUser }).user;
}

function getUserId(req: Request): number {
  const fromJwt = asUser(req)?.id;
  if (typeof fromJwt === "number") return fromJwt;
  if (typeof fromJwt === "string" && /^\d+$/.test(fromJwt))
    return Number(fromJwt);

  const header = req.headers["x-user-id"];
  if (typeof header === "string" && /^\d+$/.test(header)) return Number(header);

  return DEFAULT_USER_ID;
}

function getActor(req: Request): string {
  const header = req.headers["x-admin-name"];
  if (typeof header === "string" && header.trim()) return header.trim();

  const user = asUser(req);
  if (typeof user?.username === "string" && user.username.trim())
    return user.username.trim();
  if (typeof user?.email === "string" && user.email.trim())
    return user.email.trim();

  return "Admin";
}

function isEnumValue<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return (
    typeof value === "string" && (values as readonly string[]).includes(value)
  );
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : undefined;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toDbTimestamp(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function sevenDaysAgo(): Date {
  return new Date(Date.now() - 7 * 86_400_000);
}

async function logAudit(
  knex: KnexOrTrx,
  kind: AuditKind,
  summary: string,
  actor: string,
  metadata: Record<string, unknown> | null = null,
): Promise<void> {
  try {
    await knex("shop_admin_audit_logs").insert({
      kind,
      summary,
      actor,
      metadata,
    });
  } catch (err) {
    // Le backoffice doit rester utilisable même si la migration d’audit n’est pas encore passée.
    console.warn("[shop] audit log skipped", err);
  }
}

async function getOrCreateWallet(
  knex: KnexOrTrx,
  userId: number,
): Promise<ShopWalletRow> {
  let row = await knex<ShopWalletRow>("shop_wallet")
    .where({ user_id: userId })
    .first();

  if (!row) {
    await knex("shop_wallet").insert({
      user_id: userId,
      soft: INITIAL_SOFT,
      hard: INITIAL_HARD,
    });
    row = await knex<ShopWalletRow>("shop_wallet")
      .where({ user_id: userId })
      .first();
  }

  return row!;
}

async function ensureRewards(knex: Knex): Promise<ShopEconomyRewardsRow> {
  let row = await knex<ShopEconomyRewardsRow>("shop_economy_rewards")
    .where({ id: 1 })
    .first();
  if (!row) {
    await knex("shop_economy_rewards").insert({
      id: 1,
      xp_win: DEFAULT_REWARDS.xpWin,
      xp_loss: DEFAULT_REWARDS.xpLoss,
      soft_win: DEFAULT_REWARDS.softWin,
      soft_loss: DEFAULT_REWARDS.softLoss,
      daily_quest_soft: DEFAULT_REWARDS.dailyQuestSoft,
      level_up_hard: DEFAULT_REWARDS.levelUpHard,
      updated_by: "system",
    });
    row = await knex<ShopEconomyRewardsRow>("shop_economy_rewards")
      .where({ id: 1 })
      .first();
  }

  return row!;
}

async function getSalesMap(knex: KnexOrTrx): Promise<Map<number, number>> {
  const rows = await knex("shop_transactions")
    .select("ref_id")
    .count({ count: "id" })
    .where("created_at", ">=", sevenDaysAgo().toISOString())
    .where("type", "purchase_item")
    .whereNotNull("ref_id")
    .groupBy("ref_id");

  const sales = new Map<number, number>();
  for (const row of rows as Array<{ ref_id: number; count: string | number }>) {
    sales.set(Number(row.ref_id), Number(row.count));
  }
  return sales;
}

async function getBundleItemMap(
  knex: KnexOrTrx,
  bundleIds: number[],
): Promise<Record<number, number[]>> {
  if (!bundleIds.length) return {};

  const links = await knex<
    ShopBundleRow & { bundle_id: number; item_id: number }
  >("shop_bundle_items")
    .whereIn("bundle_id", bundleIds)
    .orderBy("id");

  const map: Record<number, number[]> = {};
  for (const link of links) {
    if (!map[link.bundle_id]) map[link.bundle_id] = [];
    map[link.bundle_id].push(link.item_id);
  }
  return map;
}

async function listItems(
  knex: KnexOrTrx,
  includeInactive: boolean,
): Promise<ReturnType<typeof toItemDTO>[]> {
  const query = knex<ShopItemRow>("shop_items").orderBy("id");
  if (!includeInactive) query.where({ is_active: true });

  const [rows, sales] = await Promise.all([query, getSalesMap(knex)]);
  return rows.map((row) => toItemDTO(row, sales.get(Number(row.id)) ?? 0));
}

async function listBundles(
  knex: KnexOrTrx,
  includeInactive: boolean,
): Promise<ReturnType<typeof toBundleDTO>[]> {
  const query = knex<ShopBundleRow>("shop_bundles").orderBy("id");
  if (!includeInactive) query.where({ is_active: true });

  const rows = await query;
  const itemMap = await getBundleItemMap(
    knex,
    rows.map((bundle) => Number(bundle.id)),
  );

  return rows.map((bundle) =>
    toBundleDTO(bundle, itemMap[Number(bundle.id)] ?? []),
  );
}

async function loadShopState(
  knex: Knex,
  userId: number,
): Promise<ShopStateDTO> {
  const [items, bundles, wallet, inventoryRows, equippedRows] =
    await Promise.all([
      listItems(knex, false),
      listBundles(knex, false),
      getOrCreateWallet(knex, userId),
      knex<ShopInventoryRow>("shop_inventory")
        .where({ user_id: userId })
        .orderBy("owned_at", "desc"),
      knex<ShopEquippedRow>("shop_equipped").where({ user_id: userId }),
    ]);

  const inventory: InventoryEntryDTO[] = inventoryRows.map((row) => ({
    itemId: Number(row.item_id),
    ownedAt: new Date(row.owned_at).toISOString(),
  }));

  const equipped: EquippedDTO = {};
  for (const slot of ITEM_SLOTS) equipped[slot] = null;
  for (const row of equippedRows) equipped[row.slot] = Number(row.item_id);

  return {
    items,
    bundles,
    wallet: { soft: Number(wallet.soft), hard: Number(wallet.hard) },
    inventory,
    equipped,
  };
}

async function listAdminTransactions(
  knex: KnexOrTrx,
): Promise<ReturnType<typeof toAdminTransactionDTO>[]> {
  const rows = await knex<ShopTransactionRow>("shop_transactions")
    .orderBy("created_at", "desc")
    .limit(250);

  return rows.map(toAdminTransactionDTO);
}

async function listAudit(
  knex: KnexOrTrx,
): Promise<ReturnType<typeof toAuditEntryDTO>[]> {
  const hasTable = await (knex as Knex).schema.hasTable(
    "shop_admin_audit_logs",
  );
  if (!hasTable) return [];

  const rows = await knex<ShopAdminAuditLogRow>("shop_admin_audit_logs")
    .orderBy("created_at", "desc")
    .limit(150);

  return rows.map(toAuditEntryDTO);
}

async function getEconomySnapshot(knex: KnexOrTrx) {
  const since = sevenDaysAgo().toISOString();
  const rows = await knex<ShopTransactionRow>("shop_transactions").where(
    "created_at",
    ">=",
    since,
  );

  const softCurrencyEarned = rows
    .filter((row) => row.currency === "soft")
    .reduce((sum, row) => sum + Math.abs(Number(row.amount)), 0);

  const topups = rows.filter((row) => row.type === "topup");
  const hardCurrencySold = topups.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const virtualRevenue = topups.reduce((sum, row) => {
    const pack = row.ref_name ? TOPUP_PACKS[row.ref_name] : undefined;
    return sum + (pack?.eur ?? 0);
  }, 0);

  return {
    softCurrencyEarned,
    hardCurrencySold,
    virtualRevenue,
    transactionsLast7d: rows.length,
  };
}

async function loadBackofficeState(
  knex: Knex,
): Promise<ShopBackofficeStateDTO> {
  const [
    items,
    bundles,
    transactions,
    rewardsRow,
    economySnapshot,
    auditTrail,
  ] = await Promise.all([
    listItems(knex, true),
    listBundles(knex, true),
    listAdminTransactions(knex),
    ensureRewards(knex),
    getEconomySnapshot(knex),
    listAudit(knex),
  ]);

  return {
    items,
    bundles,
    transactions,
    rewards: toRewardsConfigDTO(rewardsRow),
    rewardsLastUpdatedAt: rewardsRow.updated_at
      ? new Date(rewardsRow.updated_at).toISOString()
      : null,
    rewardsLastUpdatedBy: rewardsRow.updated_by,
    economySnapshot,
    auditTrail,
  };
}

function parseItemPayload(
  body: unknown,
  partial = false,
): ShopItemPayloadDTO | ShopItemPatchDTO | null {
  const data = body as Record<string, unknown>;
  const patch: ShopItemPatchDTO = {};

  const name = asString(data.name);
  if (name !== null) patch.name = name;
  else if (!partial) return null;

  if (isEnumValue(ITEM_CATEGORIES, data.category))
    patch.category = data.category;
  else if (!partial) return null;

  if (isEnumValue(ITEM_RARITIES, data.rarity)) patch.rarity = data.rarity;
  else if (!partial) return null;

  if (data.slot === null) patch.slot = null;
  else if (isEnumValue(ITEM_SLOTS, data.slot)) patch.slot = data.slot;
  else if (!partial) return null;

  if (isEnumValue(CURRENCIES, data.currency)) patch.currency = data.currency;
  else if (!partial) return null;

  const price = asNumber(data.price);
  if (price !== null && price >= 0) patch.price = Math.round(price);
  else if (!partial) return null;

  const imageSeed = asString(data.imageSeed);
  if (imageSeed !== null) patch.imageSeed = imageSeed;
  else if (!partial) return null;

  const isFeatured = asBoolean(data.isFeatured);
  if (isFeatured !== undefined) patch.isFeatured = isFeatured;
  else if (!partial) return null;

  const isNew = asBoolean(data.isNew);
  if (isNew !== undefined) patch.isNew = isNew;
  else if (!partial) return null;

  const available = asBoolean(data.available);
  if (available !== undefined) patch.available = available;
  else if (!partial) return null;

  return patch;
}

function itemPayloadToDb(
  payload: ShopItemPayloadDTO | ShopItemPatchDTO,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.name !== undefined) row.name = payload.name;
  if (payload.category !== undefined) row.category = payload.category;
  if (payload.rarity !== undefined) row.rarity = payload.rarity;
  if (payload.slot !== undefined) row.slot = payload.slot;
  if (payload.currency !== undefined) row.currency = payload.currency;
  if (payload.price !== undefined) row.price = payload.price;
  if (payload.imageSeed !== undefined) row.image_seed = payload.imageSeed;
  if (payload.isFeatured !== undefined) row.is_featured = payload.isFeatured;
  if (payload.isNew !== undefined) row.is_new = payload.isNew;
  if (payload.available !== undefined) row.is_active = payload.available;
  return row;
}

function parseBundlePayload(
  body: unknown,
  partial = false,
): ShopBundlePayloadDTO | ShopBundlePatchDTO | null {
  const data = body as Record<string, unknown>;
  const patch: ShopBundlePatchDTO = {};

  const name = asString(data.name);
  if (name !== null) patch.name = name;
  else if (!partial) return null;

  const description = asOptionalString(data.description);
  if (description !== undefined) patch.description = description;
  else if (!partial) return null;

  if (isEnumValue(CURRENCIES, data.currency)) patch.currency = data.currency;
  else if (!partial) patch.currency = "hard" as Currency;

  const originalPrice = asNumber(data.originalPrice);
  if (originalPrice !== null && originalPrice >= 0)
    patch.originalPrice = Math.round(originalPrice);

  const bundlePrice = asNumber(data.bundlePrice);
  if (bundlePrice !== null && bundlePrice >= 0)
    patch.bundlePrice = Math.round(bundlePrice);
  else if (!partial) return null;

  const imageSeed = asString(data.imageSeed);
  if (imageSeed !== null) patch.imageSeed = imageSeed;
  else if (!partial) return null;

  const badge = asOptionalString(data.badge);
  if (badge !== undefined) patch.badge = badge;
  else if (!partial) return null;

  const expiresAt = toDbTimestamp(data.expiresAt as string | null | undefined);
  if (expiresAt !== undefined) patch.expiresAt = expiresAt;
  else if (!partial) patch.expiresAt = null;

  const isFeatured = asBoolean(data.isFeatured);
  if (isFeatured !== undefined) patch.isFeatured = isFeatured;

  const available = asBoolean(data.available);
  if (available !== undefined) patch.available = available;
  else if (!partial) return null;

  const gradient = asOptionalString(data.gradient);
  if (gradient !== undefined) patch.gradient = gradient;

  if (Array.isArray(data.itemIds)) {
    const itemIds = data.itemIds.filter(
      (id): id is number =>
        typeof id === "number" && Number.isInteger(id) && id > 0,
    );
    patch.itemIds = Array.from(new Set(itemIds));
  } else if (!partial) {
    return null;
  }

  return patch;
}

async function computeOriginalPrice(
  knex: KnexOrTrx,
  itemIds: number[],
): Promise<number> {
  if (!itemIds.length) return 0;
  const rows = await knex<ShopItemRow>("shop_items")
    .whereIn("id", itemIds)
    .select("price");
  return rows.reduce((sum, row) => sum + Number(row.price), 0);
}

async function bundlePayloadToDb(
  knex: KnexOrTrx,
  payload: ShopBundlePayloadDTO | ShopBundlePatchDTO,
): Promise<Record<string, unknown>> {
  const row: Record<string, unknown> = {};
  if (payload.name !== undefined) row.name = payload.name;
  if (payload.description !== undefined) row.description = payload.description;
  if (payload.currency !== undefined) row.currency = payload.currency;
  if (payload.originalPrice !== undefined)
    row.original_price = payload.originalPrice;
  if (payload.bundlePrice !== undefined) row.bundle_price = payload.bundlePrice;
  if (payload.imageSeed !== undefined) row.image_seed = payload.imageSeed;
  if (payload.badge !== undefined) row.badge = payload.badge;
  if (payload.expiresAt !== undefined) row.expires_at = payload.expiresAt;
  if (payload.isFeatured !== undefined) row.is_featured = payload.isFeatured;
  if (payload.available !== undefined) row.is_active = payload.available;
  if (payload.gradient !== undefined) row.gradient = payload.gradient;

  if (payload.originalPrice === undefined && payload.itemIds !== undefined) {
    row.original_price = await computeOriginalPrice(knex, payload.itemIds);
  }

  return row;
}

async function sendItemById(
  knex: KnexOrTrx,
  res: Response,
  id: number,
): Promise<void> {
  const row = await knex<ShopItemRow>("shop_items").where({ id }).first();
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const sales = await getSalesMap(knex);
  res.json(toItemDTO(row, sales.get(id) ?? 0));
}

async function getBundleDTOById(knex: KnexOrTrx, id: number) {
  const row = await knex<ShopBundleRow>("shop_bundles").where({ id }).first();
  if (!row) return null;
  const itemMap = await getBundleItemMap(knex, [id]);
  return toBundleDTO(row, itemMap[id] ?? []);
}

export function createShopRouter(knex: Knex): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      res.json(await loadShopState(knex, getUserId(req)));
    } catch (err) {
      console.error("[shop] GET /shop", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/items", async (_req, res) => {
    try {
      res.json(await listItems(knex, false));
    } catch (err) {
      console.error("[shop] GET /shop/items", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/bundles", async (_req, res) => {
    try {
      res.json(await listBundles(knex, false));
    } catch (err) {
      console.error("[shop] GET /shop/bundles", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/wallet", async (req, res) => {
    try {
      const wallet = await getOrCreateWallet(knex, getUserId(req));
      res.json({ soft: Number(wallet.soft), hard: Number(wallet.hard) });
    } catch (err) {
      console.error("[shop] GET /shop/wallet", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/inventory", async (req, res) => {
    try {
      const rows = await knex<ShopInventoryRow>("shop_inventory")
        .where({ user_id: getUserId(req) })
        .orderBy("owned_at", "desc");
      res.json(
        rows.map(
          (row): InventoryEntryDTO => ({
            itemId: Number(row.item_id),
            ownedAt: new Date(row.owned_at).toISOString(),
          }),
        ),
      );
    } catch (err) {
      console.error("[shop] GET /shop/inventory", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/equipped", async (req, res) => {
    try {
      const rows = await knex<ShopEquippedRow>("shop_equipped").where({
        user_id: getUserId(req),
      });
      const equipped: EquippedDTO = {};
      for (const slot of ITEM_SLOTS) equipped[slot] = null;
      for (const row of rows) equipped[row.slot] = Number(row.item_id);
      res.json(equipped);
    } catch (err) {
      console.error("[shop] GET /shop/equipped", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/transactions", async (req, res) => {
    try {
      const rows = await knex<ShopTransactionRow>("shop_transactions")
        .where({ user_id: getUserId(req) })
        .orderBy("created_at", "desc")
        .limit(100);
      res.json(rows.map(toTransactionDTO));
    } catch (err) {
      console.error("[shop] GET /shop/transactions", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/purchase/item", async (req, res) => {
    const userId = getUserId(req);
    const itemId = asNumber((req.body as { itemId?: unknown }).itemId);
    if (!itemId || !Number.isInteger(itemId)) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }

    try {
      await knex.transaction(async (trx) => {
        const item = await trx<ShopItemRow>("shop_items")
          .where({ id: itemId, is_active: true })
          .first();
        if (!item) {
          res.status(404).json({ error: "not_found" });
          return;
        }

        const already = await trx("shop_inventory")
          .where({ user_id: userId, item_id: itemId })
          .first();
        if (already) {
          res.status(409).json({ error: "already_owned" });
          return;
        }

        const wallet = await getOrCreateWallet(trx, userId);
        const currency = item.currency as Currency;
        const balance =
          currency === "soft" ? Number(wallet.soft) : Number(wallet.hard);
        const price = Number(item.price);
        if (balance < price) {
          res.status(402).json({ error: "insufficient_funds" });
          return;
        }

        await trx("shop_wallet")
          .where({ user_id: userId })
          .update(
            currency === "soft"
              ? { soft: balance - price }
              : { hard: balance - price },
          );

        await trx("shop_inventory").insert({
          user_id: userId,
          item_id: itemId,
          owned_at: new Date().toISOString(),
        });

        await trx("shop_transactions").insert({
          user_id: userId,
          type: "purchase_item",
          currency,
          amount: -price,
          ref_id: itemId,
          ref_name: item.name,
        });

        const updatedWallet = await trx<ShopWalletRow>("shop_wallet")
          .where({ user_id: userId })
          .first();
        res.json({
          success: true,
          wallet: {
            soft: Number(updatedWallet!.soft),
            hard: Number(updatedWallet!.hard),
          },
        });
      });
    } catch (err) {
      console.error("[shop] POST /purchase/item", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/purchase/bundle", async (req, res) => {
    const userId = getUserId(req);
    const bundleId = asNumber((req.body as { bundleId?: unknown }).bundleId);
    if (!bundleId || !Number.isInteger(bundleId)) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }

    try {
      await knex.transaction(async (trx) => {
        const bundle = await trx<ShopBundleRow>("shop_bundles")
          .where({ id: bundleId, is_active: true })
          .first();
        if (!bundle) {
          res.status(404).json({ error: "not_found" });
          return;
        }

        const links = await trx<ShopBundleItemRow>("shop_bundle_items").where(
          "bundle_id",
          bundleId,
        );
        const itemIds = links.map((link) => Number(link.item_id));
        const wallet = await getOrCreateWallet(trx, userId);
        const currency = bundle.currency as Currency;
        const balance =
          currency === "soft" ? Number(wallet.soft) : Number(wallet.hard);
        const price = Number(bundle.bundle_price);
        if (balance < price) {
          res.status(402).json({ error: "insufficient_funds" });
          return;
        }

        await trx("shop_wallet")
          .where({ user_id: userId })
          .update(
            currency === "soft"
              ? { soft: balance - price }
              : { hard: balance - price },
          );

        const existing = itemIds.length
          ? await trx("shop_inventory")
              .where({ user_id: userId })
              .whereIn("item_id", itemIds)
              .select("item_id")
          : [];
        const ownedIds = new Set(
          existing.map((row: { item_id: number }) => Number(row.item_id)),
        );
        const toInsert = itemIds
          .filter((id) => !ownedIds.has(id))
          .map((id) => ({
            user_id: userId,
            item_id: id,
            owned_at: new Date().toISOString(),
          }));

        if (toInsert.length) await trx("shop_inventory").insert(toInsert);

        await trx("shop_transactions").insert({
          user_id: userId,
          type: "purchase_bundle",
          currency,
          amount: -price,
          ref_id: bundleId,
          ref_name: bundle.name,
        });

        const updatedWallet = await trx<ShopWalletRow>("shop_wallet")
          .where({ user_id: userId })
          .first();
        res.json({
          success: true,
          newItems: toInsert.map((row) => row.item_id),
          wallet: {
            soft: Number(updatedWallet!.soft),
            hard: Number(updatedWallet!.hard),
          },
        });
      });
    } catch (err) {
      console.error("[shop] POST /purchase/bundle", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/topup", async (req, res) => {
    const userId = getUserId(req);
    const packId = (req.body as { packId?: unknown }).packId;
    if (typeof packId !== "string" || !TOPUP_PACKS[packId]) {
      res.status(400).json({ error: "invalid_pack" });
      return;
    }

    try {
      const pack = TOPUP_PACKS[packId];
      const credited = pack.hard + pack.bonus;
      await getOrCreateWallet(knex, userId);
      await knex("shop_wallet")
        .where({ user_id: userId })
        .increment("hard", credited);
      await knex("shop_transactions").insert({
        user_id: userId,
        type: "topup",
        currency: "hard",
        amount: credited,
        ref_id: null,
        ref_name: packId,
      });
      const updatedWallet = await knex<ShopWalletRow>("shop_wallet")
        .where({ user_id: userId })
        .first();
      res.json({
        success: true,
        credited,
        wallet: {
          soft: Number(updatedWallet!.soft),
          hard: Number(updatedWallet!.hard),
        },
      });
    } catch (err) {
      console.error("[shop] POST /topup", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/equip", async (req, res) => {
    const userId = getUserId(req);
    const itemId = asNumber((req.body as { itemId?: unknown }).itemId);
    if (!itemId || !Number.isInteger(itemId)) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }

    try {
      const owned = await knex("shop_inventory")
        .where({ user_id: userId, item_id: itemId })
        .first();
      if (!owned) {
        res.status(403).json({ error: "not_owned" });
        return;
      }

      const item = await knex<ShopItemRow>("shop_items")
        .where({ id: itemId, is_active: true })
        .first();
      if (!item?.slot) {
        res.status(400).json({ error: "no_slot" });
        return;
      }

      await knex("shop_equipped")
        .insert({ user_id: userId, slot: item.slot, item_id: itemId })
        .onConflict(["user_id", "slot"])
        .merge({ item_id: itemId });

      res.json({ success: true, slot: item.slot, itemId });
    } catch (err) {
      console.error("[shop] POST /equip", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/unequip", async (req, res) => {
    const userId = getUserId(req);
    const slot = (req.body as { slot?: unknown }).slot;
    if (
      typeof slot !== "string" ||
      !(ITEM_SLOTS as readonly string[]).includes(slot)
    ) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }

    try {
      await knex("shop_equipped").where({ user_id: userId, slot }).delete();
      res.json({ success: true, slot });
    } catch (err) {
      console.error("[shop] POST /unequip", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/backoffice", async (_req, res) => {
    try {
      res.json(await loadBackofficeState(knex));
    } catch (err) {
      console.error("[shop] GET /shop/backoffice", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/backoffice/transactions", async (_req, res) => {
    try {
      res.json(await listAdminTransactions(knex));
    } catch (err) {
      console.error("[shop] GET /shop/backoffice/transactions", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/backoffice/audit", async (_req, res) => {
    try {
      res.json(await listAudit(knex));
    } catch (err) {
      console.error("[shop] GET /shop/backoffice/audit", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/backoffice/items", async (req, res) => {
    const payload = parseItemPayload(
      req.body,
      false,
    ) as ShopItemPayloadDTO | null;
    if (!payload) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }

    const actor = getActor(req);
    try {
      const [row] = await knex<ShopItemRow>("shop_items")
        .insert(itemPayloadToDb(payload))
        .returning("*");
      await logAudit(knex, "price", `Article "${payload.name}" créé`, actor, {
        itemId: row.id,
      });
      await sendItemById(knex, res, Number(row.id));
    } catch (err) {
      console.error("[shop] POST /shop/backoffice/items", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.patch("/backoffice/items/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }

    const payload = parseItemPayload(req.body, true) as ShopItemPatchDTO | null;
    if (!payload || !Object.keys(payload).length) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }

    const actor = getActor(req);
    try {
      const previous = await knex<ShopItemRow>("shop_items")
        .where({ id })
        .first();
      if (!previous) {
        res.status(404).json({ error: "not_found" });
        return;
      }

      await knex<ShopItemRow>("shop_items")
        .where({ id })
        .update({ ...itemPayloadToDb(payload), updated_at: knex.fn.now() });

      const kind: AuditKind =
        payload.available !== undefined && Object.keys(payload).length === 1
          ? "availability"
          : "price";
      const priceChanged =
        payload.price !== undefined &&
        Number(payload.price) !== Number(previous.price);
      const availabilityChanged =
        payload.available !== undefined &&
        Boolean(payload.available) !== Boolean(previous.is_active);
      const summary = priceChanged
        ? `Article "${previous.name}" : ${previous.price} → ${payload.price}`
        : availabilityChanged
          ? `Article "${previous.name}" ${payload.available ? "rendu visible" : "masqué"}`
          : `Article "${previous.name}" mis à jour`;

      await logAudit(knex, kind, summary, actor, {
        itemId: id,
        patch: payload,
      });
      await sendItemById(knex, res, id);
    } catch (err) {
      console.error("[shop] PATCH /shop/backoffice/items/:id", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.delete("/backoffice/items/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }

    const actor = getActor(req);
    try {
      const item = await knex<ShopItemRow>("shop_items").where({ id }).first();
      if (!item) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      await knex("shop_items")
        .where({ id })
        .update({ is_active: false, updated_at: knex.fn.now() });
      await logAudit(
        knex,
        "availability",
        `Article "${item.name}" masqué`,
        actor,
        { itemId: id },
      );
      res.json({ success: true });
    } catch (err) {
      console.error("[shop] DELETE /shop/backoffice/items/:id", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/backoffice/bundles", async (req, res) => {
    const payload = parseBundlePayload(
      req.body,
      false,
    ) as ShopBundlePayloadDTO | null;
    if (!payload) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }

    const actor = getActor(req);
    try {
      await knex.transaction(async (trx) => {
        const dbPayload = await bundlePayloadToDb(trx, {
          ...payload,
          gradient: payload.gradient ?? DEFAULT_GRADIENT,
          isFeatured: payload.isFeatured ?? false,
        });
        const [row] = await trx<ShopBundleRow>("shop_bundles")
          .insert(dbPayload)
          .returning("*");
        if (payload.itemIds.length) {
          await trx("shop_bundle_items").insert(
            payload.itemIds.map((itemId) => ({
              bundle_id: row.id,
              item_id: itemId,
            })),
          );
        }
        await logAudit(trx, "price", `Bundle "${payload.name}" créé`, actor, {
          bundleId: row.id,
        });
        const dto = await getBundleDTOById(trx, Number(row.id));
        res.json(dto);
      });
    } catch (err) {
      console.error("[shop] POST /shop/backoffice/bundles", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.patch("/backoffice/bundles/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }

    const payload = parseBundlePayload(
      req.body,
      true,
    ) as ShopBundlePatchDTO | null;
    if (!payload || !Object.keys(payload).length) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }

    const actor = getActor(req);
    try {
      await knex.transaction(async (trx) => {
        const previous = await trx<ShopBundleRow>("shop_bundles")
          .where({ id })
          .first();
        if (!previous) {
          res.status(404).json({ error: "not_found" });
          return;
        }

        const dbPayload = await bundlePayloadToDb(trx, payload);
        if (Object.keys(dbPayload).length) {
          await trx("shop_bundles")
            .where({ id })
            .update({ ...dbPayload, updated_at: trx.fn.now() });
        }

        if (payload.itemIds) {
          await trx("shop_bundle_items").where("bundle_id", id).delete();
          if (payload.itemIds.length) {
            await trx("shop_bundle_items").insert(
              payload.itemIds.map((itemId) => ({
                bundle_id: id,
                item_id: itemId,
              })),
            );
          }
        }

        const kind: AuditKind =
          payload.available !== undefined && Object.keys(payload).length === 1
            ? "availability"
            : "price";
        const summary =
          payload.available !== undefined && Object.keys(payload).length === 1
            ? `Bundle "${previous.name}" ${payload.available ? "rendu visible" : "masqué"}`
            : `Bundle "${previous.name}" mis à jour`;
        await logAudit(trx, kind, summary, actor, {
          bundleId: id,
          patch: payload,
        });
        const dto = await getBundleDTOById(trx, id);
        res.json(dto);
      });
    } catch (err) {
      console.error("[shop] PATCH /shop/backoffice/bundles/:id", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.delete("/backoffice/bundles/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }

    const actor = getActor(req);
    try {
      const bundle = await knex<ShopBundleRow>("shop_bundles")
        .where({ id })
        .first();
      if (!bundle) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      await knex("shop_bundles")
        .where({ id })
        .update({ is_active: false, updated_at: knex.fn.now() });
      await logAudit(
        knex,
        "availability",
        `Bundle "${bundle.name}" masqué`,
        actor,
        { bundleId: id },
      );
      res.json({ success: true });
    } catch (err) {
      console.error("[shop] DELETE /shop/backoffice/bundles/:id", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.patch("/backoffice/rewards", async (req, res) => {
    const data = req.body as Partial<RewardsConfigDTO>;
    const keys: Array<keyof RewardsConfigDTO> = [
      "xpWin",
      "xpLoss",
      "softWin",
      "softLoss",
      "dailyQuestSoft",
      "levelUpHard",
    ];

    for (const key of keys) {
      if (
        typeof data[key] !== "number" ||
        !Number.isFinite(data[key]) ||
        Number(data[key]) < 0
      ) {
        res.status(400).json({ error: "invalid_payload" });
        return;
      }
    }

    const actor = getActor(req);
    try {
      await ensureRewards(knex);
      await knex("shop_economy_rewards")
        .where({ id: 1 })
        .update({
          xp_win: Math.round(data.xpWin!),
          xp_loss: Math.round(data.xpLoss!),
          soft_win: Math.round(data.softWin!),
          soft_loss: Math.round(data.softLoss!),
          daily_quest_soft: Math.round(data.dailyQuestSoft!),
          level_up_hard: Math.round(data.levelUpHard!),
          updated_by: actor,
          updated_at: knex.fn.now(),
        });
      await logAudit(
        knex,
        "rewards",
        "Récompenses économie mises à jour",
        actor,
        { rewards: data },
      );

      const rewardsRow = await ensureRewards(knex);
      res.json({
        rewards: toRewardsConfigDTO(rewardsRow),
        rewardsLastUpdatedAt: rewardsRow.updated_at
          ? new Date(rewardsRow.updated_at).toISOString()
          : null,
        rewardsLastUpdatedBy: rewardsRow.updated_by,
        auditTrail: await listAudit(knex),
      });
    } catch (err) {
      console.error("[shop] PATCH /shop/backoffice/rewards", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

export default createShopRouter;
