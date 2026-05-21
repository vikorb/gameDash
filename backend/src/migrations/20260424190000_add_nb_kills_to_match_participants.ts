import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('match_participants', (table) => {
    table.integer('nb_kills').notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('match_participants', (table) => {
    table.dropColumn('nb_kills');
  });
}