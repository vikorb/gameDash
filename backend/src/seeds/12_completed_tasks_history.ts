import type { Knex } from 'knex';

type UserRow = { id: number; email: string };

type TaskRow = {
  id: number;
  metric_key: 'play_matches' | 'win_matches' | 'total_kills' | 'total_xp';
  target_value: number;
};

const HISTORY_DAYS = 3;

function dayDateUtc(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function completionTimestamp(dayDate: string): string {
  return new Date(`${dayDate}T12:00:00.000Z`).toISOString();
}

function progressForTask(task: TaskRow): number {
  if (task.metric_key === 'play_matches') return Math.max(task.target_value, 3) + 1;
  if (task.metric_key === 'win_matches') return Math.max(task.target_value, 2) + 1;
  if (task.metric_key === 'total_kills') return Math.max(task.target_value, 20) + 3;
  if (task.metric_key === 'total_xp') return Math.max(task.target_value, 600) + 50;
  return task.target_value;
}

export async function seed(knex: Knex): Promise<void> {
  const playerUsers = await knex<UserRow>('users')
    .where('role', 'player')
    .select('id', 'email')
    .orderBy('id', 'asc');

  if (playerUsers.length === 0) {
    console.warn('[seed:completed_tasks_history] No player user found.');
    return;
  }

  const tasks = await knex<TaskRow>('tasks')
    .where('is_active', true)
    .andWhere('is_daily', true)
    .select('id', 'metric_key', 'target_value')
    .orderBy('display_order', 'asc')
    .orderBy('id', 'asc');

  if (tasks.length === 0) {
    console.warn('[seed:completed_tasks_history] No active daily tasks found.');
    return;
  }

  for (const player of playerUsers) {
    for (let daysAgo = 1; daysAgo <= HISTORY_DAYS; daysAgo += 1) {
      const dayDate = dayDateUtc(daysAgo);
      const completedAt = completionTimestamp(dayDate);

      const rows = tasks.map((task) => ({
        user_id: player.id,
        task_id: task.id,
        day_date: dayDate,
        progress_value: progressForTask(task),
        completed_at: completedAt,
        claimed_at: null,
        updated_at: knex.fn.now(),
      }));

      await knex('user_task_progress')
        .insert(rows)
        .onConflict(['user_id', 'task_id', 'day_date'])
        .merge({
          progress_value: knex.ref('excluded.progress_value'),
          completed_at: knex.ref('excluded.completed_at'),
          claimed_at: knex.ref('excluded.claimed_at'),
          updated_at: knex.fn.now(),
        });
    }
  }

  console.log(
    `[seed:completed_tasks_history] Inserted completed daily tasks for ${playerUsers.length} players on last ${HISTORY_DAYS} days.`,
  );
}
