import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('match_participants', (table) => {
    table.integer('mmr_before').nullable();
    table.integer('mmr_after').nullable();
    table.integer('mmr_delta').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('match_participants', (table) => {
    table.dropColumn('mmr_before');
    table.dropColumn('mmr_after');
    table.dropColumn('mmr_delta');
  });
}
