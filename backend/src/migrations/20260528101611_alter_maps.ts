import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("maps", (table) => {
    // Mise en avant par l'admin
    table.boolean("featured").notNullable().defaultTo(false);
    // Données JSON du grid editor (14×14 blocs)
    table.jsonb("grid_data").nullable();
    // Snapshot de la version courante (dénormalisé pour éviter une jointure à chaque listing)
    table.integer("current_version_number").notNullable().defaultTo(1);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("maps", (table) => {
    table.dropColumn("featured");
    table.dropColumn("grid_data");
    table.dropColumn("current_version_number");
  });
}