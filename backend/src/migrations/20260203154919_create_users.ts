import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("username").notNullable().unique();
    table.string("role").notNullable().defaultTo("player");
    table.string("avatar_url");
    table.string("region");
    table.text("bio");
    table.string("language");
    table.json("matchmaking_pref");
    table.string("status").notNullable().defaultTo("online");
    table.boolean("is_banned").notNullable().defaultTo(false);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
