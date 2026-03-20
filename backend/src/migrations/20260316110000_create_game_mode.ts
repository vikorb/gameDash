import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("game_mode", (table) => {
    table.increments("id").primary();
    table.string("name", 64).notNullable().unique();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.text("description");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("game_mode");
}
