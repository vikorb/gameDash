import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasGradient = await knex.schema.hasColumn("shop_bundles", "gradient");
  if (!hasGradient) {
    await knex.schema.alterTable("shop_bundles", (t) => {
      t.string("gradient", 255).nullable();
    });
  }

  const hasRewards = await knex.schema.hasTable("shop_economy_rewards");
  if (!hasRewards) {
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
  }

  const hasAudit = await knex.schema.hasTable("shop_admin_audit_logs");
  if (!hasAudit) {
    await knex.schema.createTable("shop_admin_audit_logs", (t) => {
      t.increments("id").primary();
      t.string("kind", 32).notNullable();
      t.text("summary").notNullable();
      t.string("actor", 120).notNullable();
      t.json("metadata").nullable();
      t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  await knex("shop_economy_rewards")
    .insert({
      id: 1,
      xp_win: 150,
      xp_loss: 50,
      soft_win: 100,
      soft_loss: 25,
      daily_quest_soft: 250,
      level_up_hard: 5,
      updated_by: "seed",
    })
    .onConflict("id")
    .ignore();

  await knex.schema.alterTable("shop_items", (t) => {
    t.index(["category"], "shop_items_category_idx");
    t.index(["currency"], "shop_items_currency_idx");
    t.index(["is_active"], "shop_items_is_active_idx");
  });

  await knex.schema.alterTable("shop_bundles", (t) => {
    t.index(["is_active"], "shop_bundles_is_active_idx");
    t.index(["expires_at"], "shop_bundles_expires_at_idx");
  });

  await knex.schema.alterTable("shop_transactions", (t) => {
    t.index(["user_id", "created_at"], "shop_transactions_user_created_idx");
    t.index(["type", "created_at"], "shop_transactions_type_created_idx");
    t.index(["ref_id"], "shop_transactions_ref_id_idx");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("shop_transactions", (t) => {
    t.dropIndex(["user_id", "created_at"], "shop_transactions_user_created_idx");
    t.dropIndex(["type", "created_at"], "shop_transactions_type_created_idx");
    t.dropIndex(["ref_id"], "shop_transactions_ref_id_idx");
  });

  await knex.schema.alterTable("shop_bundles", (t) => {
    t.dropIndex(["is_active"], "shop_bundles_is_active_idx");
    t.dropIndex(["expires_at"], "shop_bundles_expires_at_idx");
  });

  await knex.schema.alterTable("shop_items", (t) => {
    t.dropIndex(["category"], "shop_items_category_idx");
    t.dropIndex(["currency"], "shop_items_currency_idx");
    t.dropIndex(["is_active"], "shop_items_is_active_idx");
  });

  await knex.schema.dropTableIfExists("shop_admin_audit_logs");
  await knex.schema.dropTableIfExists("shop_economy_rewards");

  const hasGradient = await knex.schema.hasColumn("shop_bundles", "gradient");
  if (hasGradient) {
    await knex.schema.alterTable("shop_bundles", (t) => {
      t.dropColumn("gradient");
    });
  }
}
