import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('user_task_progress', 'target_value_snapshot');
  if (!hasColumn) {
    await knex.schema.alterTable('user_task_progress', (table) => {
      table.integer('target_value_snapshot').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('user_task_progress', 'target_value_snapshot');
  if (hasColumn) {
    await knex.schema.alterTable('user_task_progress', (table) => {
      table.dropColumn('target_value_snapshot');
    });
  }
}
