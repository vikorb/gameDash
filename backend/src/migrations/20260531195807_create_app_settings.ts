import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("app_settings", (t) => {
    t.string("key", 128).primary();
    t.text("value").notNullable();
    t.timestamps(true, true);
  });

  await knex("app_settings").insert({
    key: "demo_mode",
    value: "false"
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("app_settings");
}
