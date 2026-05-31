import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ranks', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 64).notNullable();
    table.integer('min_xp').notNullable();
    table.integer('max_xp').notNullable();
    table.integer('division_count').notNullable().defaultTo(1);
    table.string('icon_url', 255);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('rank_divisions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('rank_id').unsigned().references('id').inTable('ranks').onDelete('CASCADE');
    table.string('name', 16).notNullable();
    table.integer('min_xp').notNullable();
    table.integer('max_xp').notNullable();
    table.integer('order').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rank_divisions');
  await knex.schema.dropTableIfExists('ranks');
}
