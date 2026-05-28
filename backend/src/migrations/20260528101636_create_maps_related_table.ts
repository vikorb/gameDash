import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // ── Tags (bibliothèque globale) ─────────────────────────────────────────
  await knex.schema.createTable("map_tags", (table) => {
    table.increments("id").primary();
    table.string("slug", 64).notNullable().unique();
    table.string("label_fr", 64).notNullable();
    table.string("label_en", 64).notNullable();
    table.timestamps(true, true);
  });

  // ── Pivot map ↔ tag ─────────────────────────────────────────────────────
  await knex.schema.createTable("map_map_tags", (table) => {
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.integer("tag_id").notNullable().references("id").inTable("map_tags").onDelete("CASCADE");
    table.primary(["map_id", "tag_id"]);
  });

  // ── Versions ────────────────────────────────────────────────────────────
  await knex.schema.createTable("map_versions", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.integer("version_number").notNullable();
    table.text("release_notes").nullable();
    table.timestamps(true, true);

    table.unique(["map_id", "version_number"]);
    table.index(["map_id", "version_number"]);
  });

  // ── Screenshots (URLs stockées dans PocketBase, on ne garde que l'URL) ──
  await knex.schema.createTable("map_screenshots", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.string("url", 512).notNullable();
    table.integer("position").notNullable().defaultTo(0);
    table.timestamps(true, true);

    table.index(["map_id", "position"]);
  });

  // ── Votes (like / dislike, un seul vote actif par user par map) ─────────
  await knex.schema.createTable("map_votes", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.bigInteger("user_id").notNullable();
    table.string("vote", 16).notNullable(); // 'like' | 'dislike'
    table.timestamps(true, true);

    table.unique(["map_id", "user_id"]);
    table.index(["map_id", "vote"]);
  });

  // ── Favoris (un par user par map) ───────────────────────────────────────
  await knex.schema.createTable("map_favorites", (table) => {
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.bigInteger("user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.primary(["map_id", "user_id"]);
    table.index("user_id");
  });

  // ── Tests (chaque déclenchement du bouton "Tester" est enregistré) ──────
  await knex.schema.createTable("map_tests", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.bigInteger("user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["map_id", "user_id"]);
    table.index(["map_id", "created_at"]);
  });

  // ── Commentaires ────────────────────────────────────────────────────────
  await knex.schema.createTable("map_comments", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("map_id").notNullable().references("id").inTable("maps").onDelete("CASCADE");
    table.bigInteger("user_id").notNullable();
    table.text("content").notNullable();
    table.timestamp("deleted_at").nullable();
    table.timestamps(true, true);

    table.index(["map_id", "created_at"]);
  });

  // ── Likes de commentaires ───────────────────────────────────────────────
  await knex.schema.createTable("map_comment_likes", (table) => {
    table
      .bigInteger("comment_id")
      .notNullable()
      .references("id")
      .inTable("map_comments")
      .onDelete("CASCADE");
    table.bigInteger("user_id").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.primary(["comment_id", "user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("map_comment_likes");
  await knex.schema.dropTableIfExists("map_comments");
  await knex.schema.dropTableIfExists("map_tests");
  await knex.schema.dropTableIfExists("map_favorites");
  await knex.schema.dropTableIfExists("map_votes");
  await knex.schema.dropTableIfExists("map_screenshots");
  await knex.schema.dropTableIfExists("map_versions");
  await knex.schema.dropTableIfExists("map_map_tags");
  await knex.schema.dropTableIfExists("map_tags");
}