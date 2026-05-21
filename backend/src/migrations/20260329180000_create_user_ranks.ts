import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_ranks', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('game_modes_id').unsigned().notNullable().references('id').inTable('game_modes').onDelete('CASCADE');
    table.integer('xp').notNullable().defaultTo(0);
    table.unique(['user_id', 'game_modes_id']);
    table.timestamps(true, true);
  });

  const hasXp = await knex.schema.hasColumn('users', 'xp');
  if (hasXp) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('xp');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.integer('xp').notNullable().defaultTo(0);
  });
  await knex.schema.dropTableIfExists('user_ranks');
}
