import { Router, type Request, type Response } from 'express';

import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { authenticateUser } from '@/middlewares/authenticateUser';
import { badRequest } from '@/utils/httpError';
import { ensureAdmin } from '@/utils/users';
import type { ShopItemRow } from '@/types/shop';

type MetricKey = 'play_matches' | 'win_matches' | 'total_kills' | 'total_xp';

type TaskRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  metric_key: MetricKey;
  target_value: number;
  is_daily: boolean;
  is_active: boolean;
  display_order: number;
  start_at: string | null;
  end_at: string | null;
};

type RewardRow = {
  task_id: number;
  reward_id: number;
  reward_code: string;
  reward_name: string;
  reward_type: string;
  reward_amount: number;
  reward_metadata: unknown;
  quantity: number;
};

type RewardItemDTO = {
  id: number;
  name: string;
  category: string;
  rarity: string;
  slot: string | null;
  imageSeed: string;
};

type TaskProgressRow = {
  task_id: number;
  progress_value: number;
  completed_at: string | null;
  day_date: string;
};

type MetricsRow = {
  played_matches: string | number | null;
  won_matches: string | number | null;
  total_kills: string | number | null;
  total_xp: string | number | null;
};

type HistoryRow = {
  day_date: string;
  task_id: number;
  code: string;
  title: string;
  description: string | null;
  metric_key: MetricKey;
  target_value: number;
  display_order: number;
  progress_value: number;
  completed_at: string | null;
  reward_id: number | null;
  reward_code: string | null;
  reward_name: string | null;
  reward_type: string | null;
  reward_amount: number | null;
  reward_quantity: number | null;
};

type RewardAdminRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  reward_type: string;
  amount: number;
  is_active: boolean;
};

type TaskAdminRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  metric_key: MetricKey;
  target_value: number;
  is_daily: boolean;
  is_active: boolean;
  display_order: number;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
  reward_id: number | null;
  reward_code: string | null;
  reward_name: string | null;
  reward_type: string | null;
  reward_amount: number | null;
  reward_quantity: number | null;
};

type TaskRewardDTO = {
  id: number;
  code: string;
  name: string;
  type: string;
  amount: number;
  quantity: number;
  item: RewardItemDTO | null;
};

type TaskResponseDTO = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  metricKey: MetricKey;
  target: number;
  progress: number;
  completed: boolean;
  completedAt: string | null;
  dayDate: string;
  rewards: TaskRewardDTO[];
};

type HistoryDayDTO = {
  dayDate: string;
  tasks: TaskResponseDTO[];
};

type TaskAdminDTO = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  metricKey: MetricKey;
  targetValue: number;
  isDaily: boolean;
  isActive: boolean;
  displayOrder: number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
  rewards: TaskRewardDTO[];
};

const METRIC_KEYS: MetricKey[] = [
  'play_matches',
  'win_matches',
  'total_kills',
  'total_xp',
];

function parseUserId(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest('Missing or invalid userId', 'VALIDATION_ERROR', { field: 'userId' });
  }
  return parsed;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return undefined;
}

function parseMetricKey(value: unknown): MetricKey | undefined {
  if (typeof value !== 'string') return undefined;
  if (!METRIC_KEYS.includes(value as MetricKey)) return undefined;
  return value as MetricKey;
}

function parseIsoDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function todayDateUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function asNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metricValue(metricKey: MetricKey, metrics: Record<MetricKey, number>): number {
  return metrics[metricKey] ?? 0;
}

function parseRewardMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toRewardItemDTO(item: ShopItemRow): RewardItemDTO {
  return {
    id: Number(item.id),
    name: item.name,
    category: item.category,
    rarity: item.rarity,
    slot: item.slot,
    imageSeed: item.image_seed,
  };
}

async function loadRewardItems(rewardRows: RewardRow[]): Promise<Map<number, RewardItemDTO>> {
  const itemIds = rewardRows
    .map((row) => {
      const metadata = parseRewardMetadata(row.reward_metadata);
      const itemId = metadata?.itemId;
      const parsed = typeof itemId === 'number' ? itemId : Number(itemId);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    })
    .filter((value): value is number => value !== null);

  if (itemIds.length === 0) return new Map();

  const uniqueIds = [...new Set(itemIds)];
  const items = await db<ShopItemRow>('shop_items').whereIn('id', uniqueIds);
  return new Map(items.map((item) => [Number(item.id), toRewardItemDTO(item)]));
}

function rewardCurrencyLabel(type: string, amount: number): string {
  if (type === 'xp') return `+${amount} XP`;
  if (type === 'stars' || type === 'hard_currency') return `+${amount} étoiles`;
  if (type === 'soft_currency') return `+${amount} étoiles`;
  return `+${amount}`;
}

async function fetchDailyTasks(userId: number, dayDate: string): Promise<TaskResponseDTO[]> {
  const tasks = await db<TaskRow>('tasks')
    .where({ is_active: true, is_daily: true })
    .andWhere((query) => {
      query.whereNull('start_at').orWhere('start_at', '<=', db.fn.now());
    })
    .andWhere((query) => {
      query.whereNull('end_at').orWhere('end_at', '>=', db.fn.now());
    })
    .orderBy('display_order', 'asc')
    .orderBy('id', 'asc');

  if (tasks.length === 0) return [];

  const taskIds = tasks.map((task) => task.id);

  const taskRewardRows = await db('task_rewards as tr')
    .join('rewards as r', 'r.id', 'tr.reward_id')
    .whereIn('tr.task_id', taskIds)
    .select<RewardRow[]>(
      'tr.task_id as task_id',
      'r.id as reward_id',
      'r.code as reward_code',
      'r.name as reward_name',
      'r.reward_type as reward_type',
      'r.amount as reward_amount',
      'r.metadata as reward_metadata',
      'tr.quantity as quantity',
    );

  const rewardItems = await loadRewardItems(taskRewardRows);

  const rewardsByTaskId = new Map<number, TaskRewardDTO[]>();
  for (const row of taskRewardRows) {
    const list = rewardsByTaskId.get(row.task_id) ?? [];
    list.push({
      id: row.reward_id,
      code: row.reward_code,
      name: row.reward_name,
      type: row.reward_type,
      amount: row.reward_amount,
      quantity: row.quantity,
      item: rewardItems.get(row.reward_id) ?? null,
    });
    rewardsByTaskId.set(row.task_id, list);
  }

  const existingProgressRows = await db<TaskProgressRow>('user_task_progress')
    .where('user_id', userId)
    .where('day_date', dayDate)
    .whereIn('task_id', taskIds)
    .select('task_id', 'progress_value', 'completed_at', 'day_date');

  const progressByTask = new Map(existingProgressRows.map((row) => [row.task_id, row]));

  const metricsRow = await db('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .where('mp.user_id', userId)
    .whereRaw('DATE(m.played_at) = ?', [dayDate])
    .select<MetricsRow>(
      db.raw('COUNT(mp.id)::int as played_matches'),
      db.raw("SUM(CASE WHEN mp.result = 'win' THEN 1 ELSE 0 END)::int as won_matches"),
      db.raw('COALESCE(SUM(mp.nb_kills), 0)::int as total_kills'),
      db.raw('COALESCE(SUM(mp.xp_gained), 0)::int as total_xp'),
    )
    .first();

  const metrics: Record<MetricKey, number> = {
    play_matches: asNumber(metricsRow?.played_matches),
    win_matches: asNumber(metricsRow?.won_matches),
    total_kills: asNumber(metricsRow?.total_kills),
    total_xp: asNumber(metricsRow?.total_xp),
  };

  const nowIso = new Date().toISOString();
  const responses: TaskResponseDTO[] = [];

  for (const task of tasks) {
    const computedProgress = metricValue(task.metric_key, metrics);
    const existing = progressByTask.get(task.id);
    const progressValue = Math.max(existing?.progress_value ?? 0, computedProgress);
    const completed = progressValue >= task.target_value;
    const completedAt = completed ? existing?.completed_at ?? nowIso : null;

    await db('user_task_progress')
      .insert({
        user_id: userId,
        task_id: task.id,
        day_date: dayDate,
        progress_value: progressValue,
        completed_at: completedAt,
      })
      .onConflict(['user_id', 'task_id', 'day_date'])
      .merge({
        progress_value: progressValue,
        completed_at: completedAt,
        updated_at: nowIso,
      });

    responses.push({
      id: task.id,
      code: task.code,
      title: task.title,
      description: task.description,
      metricKey: task.metric_key,
      target: task.target_value,
      progress: progressValue,
      completed,
      completedAt,
      dayDate,
      rewards: rewardsByTaskId.get(task.id) ?? [],
    });
  }

  return responses;
}

function mapTaskAdminRows(rows: TaskAdminRow[]): TaskAdminDTO[] {
  const taskMap = new Map<number, TaskAdminDTO>();

  for (const row of rows) {
    const existing = taskMap.get(row.id);
    if (!existing) {
      taskMap.set(row.id, {
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description,
        metricKey: row.metric_key,
        targetValue: row.target_value,
        isDaily: row.is_daily,
        isActive: row.is_active,
        displayOrder: row.display_order,
        startAt: row.start_at,
        endAt: row.end_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        rewards: [],
      });
    }

    if (row.reward_id) {
      const target = taskMap.get(row.id)!;
      target.rewards.push({
        id: row.reward_id,
        code: row.reward_code ?? '',
        name: row.reward_name ?? '',
        type: row.reward_type ?? '',
        amount: row.reward_amount ?? 0,
        quantity: row.reward_quantity ?? 1,
        item: null,
      });
    }
  }

  return Array.from(taskMap.values());
}

const router = Router();

router.get(
  '/daily',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseUserId(req.query.userId);
    const dayDate = todayDateUTC();
    const tasks = await fetchDailyTasks(userId, dayDate);

    return res.status(200).json({
      dayDate,
      tasks,
    });
  }),
);

router.get(
  '/history',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = parseUserId(req.query.userId);
    const limitDays = Number(req.query.limitDays ?? 15);
    const safeLimitDays = Number.isInteger(limitDays) && limitDays > 0 && limitDays <= 90 ? limitDays : 15;

    const rows = await db('user_task_progress as utp')
      .join('tasks as t', 't.id', 'utp.task_id')
      .leftJoin('task_rewards as tr', 'tr.task_id', 't.id')
      .leftJoin('rewards as r', 'r.id', 'tr.reward_id')
      .where('utp.user_id', userId)
      .select<HistoryRow[]>(
        'utp.day_date',
        'utp.task_id',
        't.code',
        't.title',
        't.description',
        't.metric_key',
        't.target_value',
        't.display_order',
        'utp.progress_value',
        'utp.completed_at',
        'r.id as reward_id',
        'r.code as reward_code',
        'r.name as reward_name',
        'r.reward_type as reward_type',
        'r.amount as reward_amount',
        'r.metadata as reward_metadata',
        'tr.quantity as reward_quantity',
      )
        .whereRaw('utp.day_date < CURRENT_DATE')
      .orderBy('utp.day_date', 'desc')
      .orderBy('t.display_order', 'asc')
      .orderBy('utp.task_id', 'asc');

      const rewardItems = await loadRewardItems(rows as unknown as RewardRow[]);

    const dayMap = new Map<string, Map<number, TaskResponseDTO>>();

    for (const row of rows) {
      const taskKey = row.task_id;
      const dayKey = row.day_date;
      const dayTasks = dayMap.get(dayKey) ?? new Map<number, TaskResponseDTO>();
      const existing = dayTasks.get(taskKey);

      if (!existing) {
        dayTasks.set(taskKey, {
          id: row.task_id,
          code: row.code,
          title: row.title,
          description: row.description,
          metricKey: row.metric_key,
          target: row.target_value,
          progress: row.progress_value,
          completed: row.progress_value >= row.target_value,
          completedAt: row.completed_at,
          dayDate: dayKey,
          rewards: [],
        });
      }

      if (row.reward_id) {
        const task = dayTasks.get(taskKey)!;
        task.rewards.push({
          id: row.reward_id,
          code: row.reward_code ?? '',
          name: row.reward_name ?? '',
          type: row.reward_type ?? '',
          amount: row.reward_amount ?? 0,
          quantity: row.reward_quantity ?? 1,
          item: rewardItems.get(row.reward_id) ?? null,
        });
      }

      dayMap.set(dayKey, dayTasks);
    }

    const history: HistoryDayDTO[] = Array.from(dayMap.entries())
      .map(([dayDate, tasksMap]) => ({
        dayDate,
        tasks: Array.from(tasksMap.values()),
      }))
      .slice(0, safeLimitDays);

    return res.status(200).json({ history });
  }),
);

router.get(
  '/admin/rewards',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    ensureAdmin(req);

    const rewards = await db<RewardAdminRow>('rewards')
      .select('id', 'code', 'name', 'description', 'reward_type', 'amount', 'is_active')
      .orderBy('id', 'asc');

    return res.status(200).json({ rewards });
  }),
);

router.put(
  '/admin/rewards/:id',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const admin = ensureAdmin(req);
    const rewardId = Number(req.params.id);
    if (!Number.isInteger(rewardId) || rewardId <= 0) {
      throw badRequest('Invalid reward id', 'VALIDATION_ERROR', { field: 'id' });
    }

    const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
    const updates: Record<string, unknown> = {
      updated_by: `admin:${admin.id}`,
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.description === 'string' || body.description === null) updates.description = body.description;
    if (typeof body.rewardType === 'string' && body.rewardType.trim()) updates.reward_type = body.rewardType.trim();
    if (Number.isFinite(Number(body.amount))) updates.amount = Number(body.amount);

    if ('metadata' in body) updates.metadata = body.metadata ?? null;
    if (Number.isFinite(Number(body.itemId))) {
      updates.metadata = { itemId: Number(body.itemId) };
      updates.reward_type = 'item';
      updates.amount = 1;
    }

    if ('metadata' in body) updates.metadata = body.metadata ?? null;
    if (Number.isFinite(Number(body.itemId))) {
      updates.metadata = { itemId: Number(body.itemId) };
      updates.reward_type = 'item';
      updates.amount = 1;
    }

    const parsedActive = parseBoolean(body.isActive);
    if (parsedActive !== undefined) updates.is_active = parsedActive;

    const updated = await db('rewards')
      .where('id', rewardId)
      .update(updates)
      .returning(['id', 'code', 'name', 'description', 'reward_type', 'amount', 'is_active']);

    if (!updated.length) {
      throw badRequest('Reward not found', 'REWARD_NOT_FOUND', { rewardId });
    }

    return res.status(200).json({ reward: updated[0] });
  }),
);

router.get(
  '/admin/tasks',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    ensureAdmin(req);

    const rows = await db('tasks as t')
      .leftJoin('task_rewards as tr', 'tr.task_id', 't.id')
      .leftJoin('rewards as r', 'r.id', 'tr.reward_id')
      .select<TaskAdminRow[]>(
        't.id',
        't.code',
        't.title',
        't.description',
        't.metric_key',
        't.target_value',
        't.is_daily',
        't.is_active',
        't.display_order',
        't.start_at',
        't.end_at',
        't.created_at',
        't.updated_at',
        'r.id as reward_id',
        'r.code as reward_code',
        'r.name as reward_name',
        'r.reward_type as reward_type',
        'r.amount as reward_amount',
        'tr.quantity as reward_quantity',
      )
      .orderBy('t.display_order', 'asc')
      .orderBy('t.id', 'asc');

    return res.status(200).json({ tasks: mapTaskAdminRows(rows) });
  }),
);

router.put(
  '/admin/tasks/:id',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const admin = ensureAdmin(req);
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw badRequest('Invalid task id', 'VALIDATION_ERROR', { field: 'id' });
    }

    const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};

    const updates: Record<string, unknown> = {
      updated_by: `admin:${admin.id}`,
      updated_at: new Date().toISOString(),
    };

    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.description === 'string' || body.description === null) updates.description = body.description;

    const metricKey = parseMetricKey(body.metricKey);
    if (metricKey) updates.metric_key = metricKey;

    if (Number.isFinite(Number(body.targetValue))) {
      const targetValue = Number(body.targetValue);
      if (targetValue <= 0) {
        throw badRequest('targetValue must be greater than 0', 'VALIDATION_ERROR', { field: 'targetValue' });
      }
      updates.target_value = targetValue;
    }

    if (Number.isFinite(Number(body.displayOrder))) updates.display_order = Number(body.displayOrder);

    const parsedDaily = parseBoolean(body.isDaily);
    if (parsedDaily !== undefined) updates.is_daily = parsedDaily;

    const parsedActive = parseBoolean(body.isActive);
    if (parsedActive !== undefined) updates.is_active = parsedActive;

    const startAt = parseIsoDate(body.startAt);
    if (startAt !== undefined) updates.start_at = startAt;

    const endAt = parseIsoDate(body.endAt);
    if (endAt !== undefined) updates.end_at = endAt;

    const updated = await db('tasks').where('id', taskId).update(updates).returning('*');

    if (!updated.length) {
      throw badRequest('Task not found', 'TASK_NOT_FOUND', { taskId });
    }

    if (Array.isArray(body.rewardIds)) {
      const rewardIds = body.rewardIds
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);

      await db.transaction(async (trx) => {
        await trx('task_rewards').where('task_id', taskId).del();

        if (rewardIds.length > 0) {
          await trx('task_rewards').insert(
            rewardIds.map((rewardId) => ({
              task_id: taskId,
              reward_id: rewardId,
              quantity: 1,
            })),
          );
        }
      });
    }

    return res.status(200).json({ task: updated[0] });
  }),
);

export default router;
