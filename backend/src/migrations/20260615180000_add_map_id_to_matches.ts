import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('matches', (table) => {
    table
      .bigInteger('map_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('maps')
      .onDelete('SET NULL');
    table.index(['map_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('matches', (table) => {
    table.dropIndex(['map_id']);
    table.dropColumn('map_id');
  });
}
