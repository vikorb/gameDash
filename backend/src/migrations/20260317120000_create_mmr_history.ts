import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("mmr_history", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("mode_id").unsigned().notNullable().references("id").inTable("game_modes").onDelete("CASCADE");
    table.integer("mmr").notNullable();
    table.timestamp("date").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("mmr_history");
}
