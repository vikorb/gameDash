import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('user_task_progress', 'game_mode_id');

  if (!hasColumn) {
    await knex.schema.alterTable('user_task_progress', (table) => {
      table.integer('game_mode_id').notNullable().defaultTo(0);
    });
  }

  await knex('user_task_progress').whereNull('game_mode_id').update({ game_mode_id: 0 });

  await knex.raw('ALTER TABLE user_task_progress DROP CONSTRAINT IF EXISTS user_task_progress_user_id_task_id_day_date_unique');
  await knex.raw('ALTER TABLE user_task_progress ADD CONSTRAINT user_task_progress_user_game_mode_task_day_unique UNIQUE (user_id, game_mode_id, task_id, day_date)');

  await knex.raw('CREATE INDEX IF NOT EXISTS user_task_progress_user_mode_day_index ON user_task_progress (user_id, game_mode_id, day_date)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS user_task_progress_user_mode_day_index');
  await knex.raw('ALTER TABLE user_task_progress DROP CONSTRAINT IF EXISTS user_task_progress_user_game_mode_task_day_unique');
  await knex.raw('ALTER TABLE user_task_progress ADD CONSTRAINT user_task_progress_user_id_task_id_day_date_unique UNIQUE (user_id, task_id, day_date)');

  const hasColumn = await knex.schema.hasColumn('user_task_progress', 'game_mode_id');
  if (hasColumn) {
    await knex.schema.alterTable('user_task_progress', (table) => {
      table.dropColumn('game_mode_id');
    });
  }
}
