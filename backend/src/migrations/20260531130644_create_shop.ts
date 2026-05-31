import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // ── shop_items : catalogue des articles ─────────────────────────────────
  await knex.schema.createTable("shop_items", (t) => {
    t.increments("id").primary();
    t.string("name", 120).notNullable();
    t.string("category", 32).notNullable(); // cosmetic | pack | pass | boost
    t.string("rarity", 16).notNullable(); // common | rare | epic | legendary
    t.string("slot", 32).nullable(); // avatar | banner | frame | emote | trail | spray
    t.string("currency", 8).notNullable(); // soft | hard
    t.integer("price").unsigned().notNullable();
    t.string("image_seed", 64).notNullable();
    t.boolean("is_featured").notNullable().defaultTo(false);
    t.boolean("is_new").notNullable().defaultTo(false);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ── shop_bundles : packs groupés ─────────────────────────────────────────
  await knex.schema.createTable("shop_bundles", (t) => {
    t.increments("id").primary();
    t.string("name", 120).notNullable();
    t.text("description").nullable();
    t.string("currency", 8).notNullable().defaultTo("hard");
    t.integer("original_price").unsigned().notNullable();
    t.integer("bundle_price").unsigned().notNullable();
    t.string("image_seed", 64).notNullable();
    t.string("badge", 40).nullable();
    t.string("gradient", 255).nullable();
    t.timestamp("expires_at").nullable();
    t.boolean("is_featured").notNullable().defaultTo(false);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ── shop_bundle_items : pivot bundle ↔ item ──────────────────────────────
  await knex.schema.createTable("shop_bundle_items", (t) => {
    t.increments("id").primary();
    t.integer("bundle_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("shop_bundles")
      .onDelete("CASCADE");
    t.integer("item_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("shop_items")
      .onDelete("CASCADE");
    t.unique(["bundle_id", "item_id"]);
  });

  // ── shop_wallet : portefeuille par joueur ────────────────────────────────
  await knex.schema.createTable("shop_wallet", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().notNullable().unique();
    t.integer("soft").unsigned().notNullable().defaultTo(0);
    t.integer("hard").unsigned().notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // ── shop_inventory : articles possédés ──────────────────────────────────
  await knex.schema.createTable("shop_inventory", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().notNullable();
    t.integer("item_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("shop_items")
      .onDelete("CASCADE");
    t.timestamp("owned_at").notNullable().defaultTo(knex.fn.now());
    t.unique(["user_id", "item_id"]);
  });

  // ── shop_equipped : article équipé par slot ──────────────────────────────
  await knex.schema.createTable("shop_equipped", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().notNullable();
    t.string("slot", 32).notNullable();
    t.integer("item_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("shop_items")
      .onDelete("CASCADE");
    t.unique(["user_id", "slot"]);
  });

  // ── shop_transactions : historique ──────────────────────────────────────
  await knex.schema.createTable("shop_transactions", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().notNullable();
    t.string("type", 32).notNullable(); // purchase_item | purchase_bundle | topup | reward
    t.string("currency", 8).notNullable();
    t.integer("amount").notNullable(); // négatif = dépense, positif = crédit
    t.integer("ref_id").unsigned().nullable();
    t.string("ref_name", 120).nullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });

  // ── shop_economy_rewards : paramètres économie administrables ─────────────
  await knex.schema.createTable("shop_economy_rewards", (t) => {
    t.integer("id").primary();
    t.integer("xp_win").unsigned().notNullable().defaultTo(150);
    t.integer("xp_loss").unsigned().notNullable().defaultTo(50);
    t.integer("soft_win").unsigned().notNullable().defaultTo(100);
    t.integer("soft_loss").unsigned().notNullable().defaultTo(25);
    t.integer("daily_quest_soft").unsigned().notNullable().defaultTo(250);
    t.integer("level_up_hard").unsigned().notNullable().defaultTo(5);
    t.string("updated_by", 120).nullable();
    t.timestamps(true, true);
  });

  // ── shop_admin_audit_logs : journal backoffice économie ───────────────────
  await knex.schema.createTable("shop_admin_audit_logs", (t) => {
    t.increments("id").primary();
    t.string("kind", 32).notNullable();
    t.text("summary").notNullable();
    t.string("actor", 120).notNullable();
    t.json("metadata").nullable();
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });

}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("shop_admin_audit_logs");
  await knex.schema.dropTableIfExists("shop_economy_rewards");
  await knex.schema.dropTableIfExists("shop_transactions");
  await knex.schema.dropTableIfExists("shop_equipped");
  await knex.schema.dropTableIfExists("shop_inventory");
  await knex.schema.dropTableIfExists("shop_wallet");
  await knex.schema.dropTableIfExists("shop_bundle_items");
  await knex.schema.dropTableIfExists("shop_bundles");
  await knex.schema.dropTableIfExists("shop_items");
}
