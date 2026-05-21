import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('matches', (table) => {
    table.bigIncrements('id').primary();
    table.integer('game_mode_id').unsigned().notNullable().references('id').inTable('game_modes').onDelete('CASCADE');
    table.string('status', 32).notNullable().defaultTo('completed');
    table.bigInteger('winner_team_id').unsigned().nullable(); 
    table.timestamp('played_at').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });

  await knex.schema.createTable('match_teams', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('match_id').unsigned().notNullable().references('id').inTable('matches').onDelete('CASCADE');
    table.string('name', 32).notNullable(); 
    table.string('result', 16).notNullable().defaultTo('pending'); 
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('matches', (table) => {
    table.foreign('winner_team_id').references('id').inTable('match_teams').onDelete('SET NULL');
  });

  await knex.schema.createTable('match_participants', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('match_id').unsigned().notNullable().references('id').inTable('matches').onDelete('CASCADE');
    table.bigInteger('team_id').unsigned().notNullable().references('id').inTable('match_teams').onDelete('CASCADE');
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('result', 16).notNullable().defaultTo('pending');
    table.integer('xp_gained').notNullable().defaultTo(0);
    table.integer('mmr_gained').notNullable().defaultTo(0);
    table.timestamps(true, true);
    table.unique(['match_id', 'user_id']);
    table.index(['user_id', 'match_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('match_participants');
  await knex.schema.alterTable('matches', (table) => {
    table.dropForeign(['winner_team_id']);
  });
  await knex.schema.dropTableIfExists('match_teams');
  await knex.schema.dropTableIfExists('matches');
}
