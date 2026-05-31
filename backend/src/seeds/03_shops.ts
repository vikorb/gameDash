// ─────────────────────────────────────────────────────────────────────────────
// seeds/02_shop.ts  –  Données de démonstration pour le module Boutique
//
// Génération déterministe via mulberry32 (seed 20251228)
// Images : picsum.photos avec seeds stables (pas d'upload PocketBase en seed)
// ─────────────────────────────────────────────────────────────────────────────

import type { Knex } from "knex";

// ── PRNG déterministe ─────────────────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20251228);
const rand = (): number => rng();
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const [item] = copy.splice(Math.floor(rand() * copy.length), 1);
    if (item !== undefined) result.push(item);
  }
  return result;
};

// ── Types locaux ─────────────────────────────────────────────────────────────
type Rarity = "common" | "rare" | "epic" | "legendary";
type Category = "cosmetic" | "pack" | "pass" | "boost";
type Slot = "avatar" | "banner" | "frame" | "emote" | "trail" | "spray";
type Currency = "soft" | "hard";

interface ItemDef {
  name: string;
  category: Category;
  rarity: Rarity;
  slot: Slot | null;
  currency: Currency;
  price: number;
  image_seed: string;
  is_featured: boolean;
  is_new: boolean;
}

// ── Définitions des 30 articles ───────────────────────────────────────────────
const ITEMS: ItemDef[] = [
  // ── Avatars (cosmetic, slot: avatar) ─────────────────────────────────────
  {
    name: "Neon Spectre",
    category: "cosmetic",
    rarity: "legendary",
    slot: "avatar",
    currency: "hard",
    price: 1200,
    image_seed: "shop-avatar-01",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Cyber Phantom",
    category: "cosmetic",
    rarity: "epic",
    slot: "avatar",
    currency: "hard",
    price: 800,
    image_seed: "shop-avatar-02",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Iron Sentinel",
    category: "cosmetic",
    rarity: "rare",
    slot: "avatar",
    currency: "soft",
    price: 1800,
    image_seed: "shop-avatar-03",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Shadow Walker",
    category: "cosmetic",
    rarity: "common",
    slot: "avatar",
    currency: "soft",
    price: 600,
    image_seed: "shop-avatar-04",
    is_featured: false,
    is_new: false,
  },

  // ── Banners (cosmetic, slot: banner) ──────────────────────────────────────
  {
    name: "Volcanic Horizon",
    category: "cosmetic",
    rarity: "legendary",
    slot: "banner",
    currency: "hard",
    price: 1000,
    image_seed: "shop-banner-01",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Arctic Pulse",
    category: "cosmetic",
    rarity: "epic",
    slot: "banner",
    currency: "hard",
    price: 650,
    image_seed: "shop-banner-02",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Dusk Gradient",
    category: "cosmetic",
    rarity: "rare",
    slot: "banner",
    currency: "soft",
    price: 1400,
    image_seed: "shop-banner-03",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Urban Grid",
    category: "cosmetic",
    rarity: "common",
    slot: "banner",
    currency: "soft",
    price: 400,
    image_seed: "shop-banner-04",
    is_featured: false,
    is_new: false,
  },

  // ── Frames (cosmetic, slot: frame) ────────────────────────────────────────
  {
    name: "Golden Circuit",
    category: "cosmetic",
    rarity: "legendary",
    slot: "frame",
    currency: "hard",
    price: 1400,
    image_seed: "shop-frame-01",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Plasma Ring",
    category: "cosmetic",
    rarity: "epic",
    slot: "frame",
    currency: "hard",
    price: 750,
    image_seed: "shop-frame-02",
    is_featured: true,
    is_new: true,
  },
  {
    name: "Hex Matrix",
    category: "cosmetic",
    rarity: "rare",
    slot: "frame",
    currency: "soft",
    price: 1600,
    image_seed: "shop-frame-03",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Steel Border",
    category: "cosmetic",
    rarity: "common",
    slot: "frame",
    currency: "soft",
    price: 500,
    image_seed: "shop-frame-04",
    is_featured: false,
    is_new: false,
  },

  // ── Emotes (cosmetic, slot: emote) ────────────────────────────────────────
  {
    name: "Quantum Taunt",
    category: "cosmetic",
    rarity: "epic",
    slot: "emote",
    currency: "hard",
    price: 600,
    image_seed: "shop-emote-01",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Victory Loop",
    category: "cosmetic",
    rarity: "rare",
    slot: "emote",
    currency: "soft",
    price: 1200,
    image_seed: "shop-emote-02",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Quick Flex",
    category: "cosmetic",
    rarity: "common",
    slot: "emote",
    currency: "soft",
    price: 350,
    image_seed: "shop-emote-03",
    is_featured: false,
    is_new: false,
  },

  // ── Trails (cosmetic, slot: trail) ────────────────────────────────────────
  {
    name: "Inferno Streak",
    category: "cosmetic",
    rarity: "legendary",
    slot: "trail",
    currency: "hard",
    price: 1600,
    image_seed: "shop-trail-01",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Aurora Ribbon",
    category: "cosmetic",
    rarity: "epic",
    slot: "trail",
    currency: "hard",
    price: 900,
    image_seed: "shop-trail-02",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Static Flow",
    category: "cosmetic",
    rarity: "rare",
    slot: "trail",
    currency: "soft",
    price: 1500,
    image_seed: "shop-trail-03",
    is_featured: false,
    is_new: true,
  },

  // ── Sprays (cosmetic, slot: spray) ────────────────────────────────────────
  {
    name: "Glitch Tag",
    category: "cosmetic",
    rarity: "epic",
    slot: "spray",
    currency: "hard",
    price: 500,
    image_seed: "shop-spray-01",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Logo Stamp",
    category: "cosmetic",
    rarity: "rare",
    slot: "spray",
    currency: "soft",
    price: 900,
    image_seed: "shop-spray-02",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Pixel Drop",
    category: "cosmetic",
    rarity: "common",
    slot: "spray",
    currency: "soft",
    price: 300,
    image_seed: "shop-spray-03",
    is_featured: false,
    is_new: false,
  },

  // ── Packs (category: pack, no slot) ──────────────────────────────────────
  {
    name: "Starter Bundle",
    category: "pack",
    rarity: "common",
    slot: null,
    currency: "soft",
    price: 2400,
    image_seed: "shop-pack-01",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Pro Kit",
    category: "pack",
    rarity: "rare",
    slot: null,
    currency: "hard",
    price: 2000,
    image_seed: "shop-pack-02",
    is_featured: false,
    is_new: false,
  },

  // ── Season Passes (category: pass, no slot) ───────────────────────────────
  {
    name: "Season Pass S1",
    category: "pass",
    rarity: "rare",
    slot: null,
    currency: "hard",
    price: 1000,
    image_seed: "shop-pass-01",
    is_featured: true,
    is_new: false,
  },
  {
    name: "Elite Pass",
    category: "pass",
    rarity: "epic",
    slot: null,
    currency: "hard",
    price: 2500,
    image_seed: "shop-pass-02",
    is_featured: false,
    is_new: true,
  },

  // ── Boosts (category: boost, no slot) ─────────────────────────────────────
  {
    name: "XP Boost x2",
    category: "boost",
    rarity: "common",
    slot: null,
    currency: "soft",
    price: 800,
    image_seed: "shop-boost-01",
    is_featured: false,
    is_new: false,
  },
  {
    name: "XP Boost x3",
    category: "boost",
    rarity: "rare",
    slot: null,
    currency: "soft",
    price: 1500,
    image_seed: "shop-boost-02",
    is_featured: false,
    is_new: false,
  },
  {
    name: "Soft Multiplier",
    category: "boost",
    rarity: "rare",
    slot: null,
    currency: "hard",
    price: 400,
    image_seed: "shop-boost-03",
    is_featured: false,
    is_new: true,
  },
  {
    name: "Ranked Accelerator",
    category: "boost",
    rarity: "epic",
    slot: null,
    currency: "hard",
    price: 800,
    image_seed: "shop-boost-04",
    is_featured: false,
    is_new: false,
  },

  // ── Extra legendary cosmetics ────────────────────────────────────────────
  {
    name: "Eclipse Emote",
    category: "cosmetic",
    rarity: "legendary",
    slot: "emote",
    currency: "hard",
    price: 1800,
    image_seed: "shop-emote-04",
    is_featured: true,
    is_new: true,
  },
  {
    name: "Nova Spray",
    category: "cosmetic",
    rarity: "legendary",
    slot: "spray",
    currency: "hard",
    price: 2000,
    image_seed: "shop-spray-04",
    is_featured: false,
    is_new: false,
  },
];

// ── Définitions des 6 bundles ─────────────────────────────────────────────────
interface BundleDef {
  name: string;
  description: string;
  currency: Currency;
  original_price: number;
  bundle_price: number;
  image_seed: string;
  badge: string | null;
  expires_days: number | null; // jours à partir de now, null = sans expiration
  is_featured: boolean;
  item_names: string[]; // noms des articles inclus
}

const BUNDLES: BundleDef[] = [
  {
    name: "Neon Striker Pack",
    description: "L'ensemble ultime pour dominer l'arène avec style néon.",
    currency: "hard",
    original_price: 3600,
    bundle_price: 2400,
    image_seed: "shop-bundle-01",
    badge: "EXCLUSIF",
    expires_days: 7,
    is_featured: true,
    item_names: [
      "Neon Spectre",
      "Inferno Streak",
      "Plasma Ring",
      "Quantum Taunt",
    ],
  },
  {
    name: "Shadow Ops Kit",
    description: "Infiltre chaque partie avec une identité visuelle sombre.",
    currency: "hard",
    original_price: 2800,
    bundle_price: 1800,
    image_seed: "shop-bundle-02",
    badge: "POPULAIRE",
    expires_days: 14,
    is_featured: false,
    item_names: ["Shadow Walker", "Urban Grid", "Steel Border", "Glitch Tag"],
  },
  {
    name: "Arctic Warrior Bundle",
    description:
      "Équipement polaire haut de gamme pour les joueurs compétitifs.",
    currency: "hard",
    original_price: 2200,
    bundle_price: 1400,
    image_seed: "shop-bundle-03",
    badge: "NOUVEAU",
    expires_days: null,
    is_featured: false,
    item_names: ["Arctic Pulse", "Iron Sentinel", "Hex Matrix", "Static Flow"],
  },
  {
    name: "Volcanic Prestige Set",
    description: "Affiche ta domination avec ce pack de prestige légendaire.",
    currency: "hard",
    original_price: 4200,
    bundle_price: 2800,
    image_seed: "shop-bundle-04",
    badge: null,
    expires_days: 30,
    is_featured: false,
    item_names: [
      "Volcanic Horizon",
      "Golden Circuit",
      "Eclipse Emote",
      "Nova Spray",
    ],
  },
  {
    name: "Ranked Starter",
    description: "Tout ce qu'il faut pour bien démarrer la saison classée.",
    currency: "soft",
    original_price: 4800,
    bundle_price: 3200,
    image_seed: "shop-bundle-05",
    badge: "PROMO",
    expires_days: null,
    is_featured: false,
    item_names: ["Season Pass S1", "XP Boost x2", "Logo Stamp", "Quick Flex"],
  },
  {
    name: "Elite Combo",
    description: "Le meilleur rapport qualité/prix pour les joueurs sérieux.",
    currency: "hard",
    original_price: 5500,
    bundle_price: 3500,
    image_seed: "shop-bundle-06",
    badge: "VALEUR",
    expires_days: null,
    is_featured: false,
    item_names: [
      "Elite Pass",
      "Ranked Accelerator",
      "Cyber Phantom",
      "Aurora Ribbon",
      "Dusk Gradient",
    ],
  },
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #f28b5b, #f7a784)",
  "linear-gradient(135deg, #3f7cff, #33d1c6)",
  "linear-gradient(135deg, #7c3aed, #f472b6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #06b6d4, #6366f1)",
];

type TxEntry = {
  user_id: number;
  type: "purchase_item" | "purchase_bundle" | "topup" | "reward";
  currency: Currency;
  amount: number;
  ref_id: number | null;
  ref_name: string | null;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────────────────────
export async function seed(knex: Knex): Promise<void> {
  const hasRewardsTable = await knex.schema.hasTable("shop_economy_rewards");
  const hasAuditTable = await knex.schema.hasTable("shop_admin_audit_logs");
  const hasBundleGradient = await knex.schema.hasColumn("shop_bundles", "gradient");

  // ── Nettoyage (ordre inverse des FK) ─────────────────────────────────────
  if (hasAuditTable) await knex("shop_admin_audit_logs").del();
  if (hasRewardsTable) await knex("shop_economy_rewards").del();
  await knex("shop_transactions").del();
  await knex("shop_equipped").del();
  await knex("shop_inventory").del();
  await knex("shop_wallet").del();
  await knex("shop_bundle_items").del();
  await knex("shop_bundles").del();
  await knex("shop_items").del();

  // ── Insertion des articles ────────────────────────────────────────────────
  const insertedItems = (await knex("shop_items")
    .insert(ITEMS)
    .returning(["id", "name"])) as Array<{ id: number; name: string }>;

  // Map name → id
  const itemIdByName: Record<string, number> = {};
  for (const row of insertedItems) {
    itemIdByName[row.name] = Number(row.id);
  }

  // ── Insertion des bundles ─────────────────────────────────────────────────
  const now = new Date();
  const bundleRows = BUNDLES.map((b, index) => ({
    name: b.name,
    description: b.description,
    currency: b.currency,
    original_price: b.original_price,
    bundle_price: b.bundle_price,
    image_seed: b.image_seed,
    badge: b.badge,
    ...(hasBundleGradient ? { gradient: GRADIENT_PRESETS[index % GRADIENT_PRESETS.length] } : {}),
    expires_at: b.expires_days
      ? new Date(now.getTime() + b.expires_days * 86400_000).toISOString()
      : null,
    is_featured: b.is_featured,
    is_active: true,
  }));

  const insertedBundles = (await knex("shop_bundles")
    .insert(bundleRows)
    .returning(["id", "name"])) as Array<{ id: number; name: string }>;

  const bundleIdByName: Record<string, number> = {};
  for (const row of insertedBundles) {
    bundleIdByName[row.name] = Number(row.id);
  }

  // ── Pivot bundle_items ────────────────────────────────────────────────────
  const bundleItemLinks: { bundle_id: number; item_id: number }[] = [];
  for (const b of BUNDLES) {
    const bundleId = bundleIdByName[b.name];
    if (!bundleId) continue;
    for (const itemName of b.item_names) {
      const itemId = itemIdByName[itemName];
      if (itemId)
        bundleItemLinks.push({ bundle_id: bundleId, item_id: itemId });
    }
  }
  if (bundleItemLinks.length)
    await knex("shop_bundle_items").insert(bundleItemLinks);

  // ── Wallet user 66 ────────────────────────────────────────────────────────
  await knex("shop_wallet").insert({ user_id: 66, soft: 3200, hard: 150 });

  // ── Inventaire initial user 66 (5 articles cosmétiques variés) ────────────
  const cosmeticIds = insertedItems
    .filter((r) => {
      const def = ITEMS.find((i) => i.name === r.name);
      return def?.category === "cosmetic" && def.slot != null;
    })
    .map((r) => Number(r.id));

  const ownedItems = pickN(cosmeticIds, 5);
  const ownedEntries = ownedItems.map((itemId, idx) => ({
    user_id: 66,
    item_id: itemId,
    owned_at: new Date(now.getTime() - (5 - idx) * 3 * 86400_000).toISOString(),
  }));
  await knex("shop_inventory").insert(ownedEntries);

  // ── Équipements auto : 1 par slot si disponible ───────────────────────────
  const slots = [
    "avatar",
    "banner",
    "frame",
    "emote",
    "trail",
    "spray",
  ] as const;
  const equippedEntries: { user_id: number; slot: string; item_id: number }[] =
    [];

  for (const slot of slots) {
    const candidate = ownedItems.find((id) => {
      const def = ITEMS.find(
        (i) => i.name === insertedItems.find((r) => Number(r.id) === id)?.name,
      );
      return def?.slot === slot;
    });
    if (candidate)
      equippedEntries.push({ user_id: 66, slot, item_id: candidate });
  }
  if (equippedEntries.length)
    await knex("shop_equipped").insert(equippedEntries);

  // ── Transactions historiques ──────────────────────────────────────────────
  const txDays = [12, 8, 5, 3, 1];
  const txEntries: TxEntry[] = ownedItems.slice(0, 4).map((itemId, idx) => {
    const def = ITEMS.find(
      (i) =>
        i.name === insertedItems.find((r) => Number(r.id) === itemId)?.name,
    )!;
    return {
      user_id: 66,
      type: "purchase_item",
      currency: def.currency,
      amount: -def.price,
      ref_id: itemId,
      ref_name: def.name,
      created_at: new Date(
        now.getTime() - (txDays[idx] ?? 1) * 86400_000,
      ).toISOString(),
    };
  });

  // Topup initial simulé
  txEntries.push({
    user_id: 66,
    type: "topup",
    currency: "hard",
    amount: 550,
    ref_id: null,
    ref_name: "basic",
    created_at: new Date(now.getTime() - 20 * 86400_000).toISOString(),
  });

  // Quelques transactions multi-utilisateurs pour rendre le backoffice plus vivant
  const sellableIds = insertedItems.map((row) => Number(row.id));
  for (let idx = 0; idx < 42; idx++) {
    const itemId = sellableIds[Math.floor(rand() * sellableIds.length)];
    const itemName = insertedItems.find((row) => Number(row.id) === itemId)?.name ?? null;
    const def = ITEMS.find((item) => item.name === itemName);
    if (!def) continue;

    txEntries.push({
      user_id: 60 + Math.floor(rand() * 18),
      type: "purchase_item",
      currency: def.currency,
      amount: -def.price,
      ref_id: itemId,
      ref_name: def.name,
      created_at: new Date(now.getTime() - Math.floor(rand() * 10) * 86400_000).toISOString(),
    });
  }

  for (const pack of ["starter", "basic", "popular", "premium"]) {
    const hard = pack === "starter" ? 200 : pack === "basic" ? 550 : pack === "popular" ? 2800 : 8000;
    txEntries.push({
      user_id: 60 + Math.floor(rand() * 18),
      type: "topup",
      currency: "hard",
      amount: hard,
      ref_id: null,
      ref_name: pack,
      created_at: new Date(now.getTime() - Math.floor(rand() * 7) * 86400_000).toISOString(),
    });
  }

  await knex("shop_transactions").insert(txEntries);

  if (hasRewardsTable) {
    await knex("shop_economy_rewards").insert({
      id: 1,
      xp_win: 150,
      xp_loss: 50,
      soft_win: 100,
      soft_loss: 25,
      daily_quest_soft: 250,
      level_up_hard: 5,
      updated_by: "seed",
    });
  }

  if (hasAuditTable) {
    await knex("shop_admin_audit_logs").insert([
      {
        kind: "price",
        summary: "Seed économie boutique initialisée",
        actor: "seed",
        metadata: { items: ITEMS.length, bundles: BUNDLES.length },
        created_at: new Date(now.getTime() - 2 * 86400_000).toISOString(),
      },
      {
        kind: "rewards",
        summary: "Récompenses économie initialisées",
        actor: "seed",
        metadata: { xpWin: 150, softWin: 100 },
        created_at: new Date(now.getTime() - 86400_000).toISOString(),
      },
    ]);
  }
}
