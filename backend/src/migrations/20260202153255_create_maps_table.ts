import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("maps", (table) => {
    table.bigIncrements("id").primary();
    
    table.bigInteger("creator_id").notNullable();

    table.string("title").notNullable();
    table.text("description");
    
    table.string("status").notNullable().defaultTo("draft"); 
    table.string("moderation_status").notNullable().defaultTo("visible"); 
    
    table.bigInteger("current_version_id");
    table.timestamp("last_published_at");

    table.timestamps(true, true);
    table.timestamp("deleted_at");

    table.index(["creator_id", "created_at"]);
    table.index(["status", "moderation_status"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("maps");
}