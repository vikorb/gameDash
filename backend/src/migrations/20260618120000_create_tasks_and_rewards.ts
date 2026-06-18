import type { Knex } from 'knex';

type InsertedRow = {
  id: number;
  code: string;
};

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rewards', (table) => {
    table.bigIncrements('id').primary();
    table.string('code', 64).notNullable().unique();
    table.string('name', 120).notNullable();
    table.text('description').nullable();
    table.string('reward_type', 32).notNullable().defaultTo('soft_currency');
    table.integer('amount').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.jsonb('metadata').nullable();
    table.string('created_by', 128).nullable();
    table.string('updated_by', 128).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('tasks', (table) => {
    table.bigIncrements('id').primary();
    table.string('code', 64).notNullable().unique();
    table.string('title', 160).notNullable();
    table.text('description').nullable();
    table.string('metric_key', 64).notNullable();
    table.integer('target_value').notNullable();
    table.boolean('is_daily').notNullable().defaultTo(true);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.integer('display_order').notNullable().defaultTo(0);
    table.timestamp('start_at').nullable();
    table.timestamp('end_at').nullable();
    table.string('created_by', 128).nullable();
    table.string('updated_by', 128).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('task_rewards', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('task_id').unsigned().notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.bigInteger('reward_id').unsigned().notNullable().references('id').inTable('rewards').onDelete('CASCADE');
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamps(true, true);
    table.unique(['task_id', 'reward_id']);
  });

  await knex.schema.createTable('user_task_progress', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('task_id').unsigned().notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.date('day_date').notNullable();
    table.integer('progress_value').notNullable().defaultTo(0);
    table.timestamp('completed_at').nullable();
    table.timestamp('claimed_at').nullable();
    table.timestamps(true, true);
    table.unique(['user_id', 'task_id', 'day_date']);
    table.index(['user_id', 'day_date']);
  });

  const insertedRewards = (await knex('rewards')
    .insert([
      {
        code: 'soft_250',
        name: 'Soft Currency',
        description: 'Grants soft currency for completing a task.',
        reward_type: 'soft_currency',
        amount: 250,
        created_by: 'system',
        updated_by: 'system',
      },
      {
        code: 'xp_150',
        name: 'Experience',
        description: 'Grants experience points for completing a task.',
        reward_type: 'xp',
        amount: 150,
        created_by: 'system',
        updated_by: 'system',
      },
      {
        code: 'stars_5',
        name: 'Stars',
        description: 'Grants stars for completing a task.',
        reward_type: 'stars',
        amount: 5,
        created_by: 'system',
        updated_by: 'system',
      },
    ])
    .returning(['id', 'code'])) as InsertedRow[];

  const insertedTasks = (await knex('tasks')
    .insert([
      {
        code: 'play_3_matches',
        title: 'Play 3 matches',
        description: 'Complete 3 matches today.',
        metric_key: 'play_matches',
        target_value: 3,
        is_daily: true,
        is_active: true,
        display_order: 1,
        created_by: 'system',
        updated_by: 'system',
      },
      {
        code: 'win_2_matches',
        title: 'Win 2 matches',
        description: 'Win 2 matches today.',
        metric_key: 'win_matches',
        target_value: 2,
        is_daily: true,
        is_active: true,
        display_order: 2,
        created_by: 'system',
        updated_by: 'system',
      },
      {
        code: 'get_20_kills',
        title: 'Get 20 kills',
        description: 'Reach 20 kills today.',
        metric_key: 'total_kills',
        target_value: 20,
        is_daily: true,
        is_active: true,
        display_order: 3,
        created_by: 'system',
        updated_by: 'system',
      },
    ])
    .returning(['id', 'code'])) as InsertedRow[];

  const rewardsByCode = new Map(insertedRewards.map((row) => [row.code, row.id]));
  const tasksByCode = new Map(insertedTasks.map((row) => [row.code, row.id]));

  await knex('task_rewards').insert([
    {
      task_id: tasksByCode.get('play_3_matches')!,
      reward_id: rewardsByCode.get('soft_250')!,
      quantity: 1,
    },
    {
      task_id: tasksByCode.get('win_2_matches')!,
      reward_id: rewardsByCode.get('xp_150')!,
      quantity: 1,
    },
    {
      task_id: tasksByCode.get('get_20_kills')!,
      reward_id: rewardsByCode.get('stars_5')!,
      quantity: 1,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_task_progress');
  await knex.schema.dropTableIfExists('task_rewards');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('rewards');
}
