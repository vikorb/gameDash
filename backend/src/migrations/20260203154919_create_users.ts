import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();
    table.string("pocketbase_user_id", 64).notNullable().unique();
    table.string("username", 255);
    table.string("email", 255);
    table.string("role").notNullable().defaultTo("player");
    table.string("region");
    table.text("bio");
    table.string("language");
    table.json("matchmaking_pref");
    table.integer("status").notNullable().defaultTo(1);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("deleted_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
