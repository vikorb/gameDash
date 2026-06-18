import type { Knex } from 'knex';

type UserRow = { id: number };
type TaskRow = { id: number; target_value: number };

const TARGET_EMAIL = 'test@test.com';
const DAY_OFFSETS = [1, 2, 3];

function dayDateUtcDaysAgo(daysAgo: number): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo));
  return date.toISOString().slice(0, 10);
}

function completedAtIso(dayDate: string, hourUTC: number): string {
  return new Date(`${dayDate}T${String(hourUTC).padStart(2, '0')}:30:00.000Z`).toISOString();
}

export async function seed(knex: Knex): Promise<void> {
  const user = await knex<UserRow>('users').where('email', TARGET_EMAIL).first('id');

  if (!user) {
    console.warn(`[seed:task_history_completed] Target user not found: ${TARGET_EMAIL}`);
    return;
  }

  const tasks = await knex<TaskRow>('tasks')
    .where('is_active', true)
    .andWhere('is_daily', true)
    .orderBy('display_order', 'asc')
    .orderBy('id', 'asc')
    .select('id', 'target_value');

  if (tasks.length === 0) {
    console.warn('[seed:task_history_completed] No active daily tasks found.');
    return;
  }

  for (const [index, daysAgo] of DAY_OFFSETS.entries()) {
    const dayDate = dayDateUtcDaysAgo(daysAgo);

    for (const task of tasks) {
      await knex('user_task_progress')
        .insert({
          user_id: user.id,
          task_id: task.id,
          day_date: dayDate,
          progress_value: task.target_value,
          completed_at: completedAtIso(dayDate, 12 + index),
          claimed_at: null,
        })
        .onConflict(['user_id', 'task_id', 'day_date'])
        .merge({
          progress_value: task.target_value,
          completed_at: completedAtIso(dayDate, 12 + index),
          claimed_at: null,
          updated_at: knex.fn.now(),
        });
    }
  }

  console.log(
    `[seed:task_history_completed] Inserted completed mission history for ${TARGET_EMAIL} on previous days.`,
  );
}
