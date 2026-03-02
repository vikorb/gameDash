import { Router } from 'express';
import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { badRequest } from '@/utils/httpError';
import { parseString } from '@/utils/validators';

const router = Router();

type UserRow = {
  id: number;
  pocketbase_user_id: string | null;
  role: string;
  status: string;
  is_banned: boolean;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest('Invalid payload', 'VALIDATION_ERROR');
    }

    const pocketbase_user_id = parseString(body.pocketbase_user_id, 'pocketbase_user_id', { min: 1, max: 64 })!;

    const role = parseString(body.role, 'role', { min: 1, max: 32, optional: true });
    const status = parseString(body.status, 'status', { min: 1, max: 32, optional: true });
    const region = parseString(body.region, 'region', { min: 1, max: 64, optional: true });
    const bio = parseString(body.bio, 'bio', { min: 0, max: 2000, optional: true });
    const language = parseString(body.language, 'language', { min: 1, max: 8, optional: true });
    const isBannedRaw = body.is_banned;

    if (isBannedRaw !== undefined && typeof isBannedRaw !== 'boolean') {
      throw badRequest('is_banned doit être un booléen', 'VALIDATION_ERROR', { field: 'is_banned' });
    }

    const existing = await db<{ id: number }>('users')
      .where('pocketbase_user_id', pocketbase_user_id)
      .first();

    if (existing) {
      return res.status(200).json({ status: 'already_exists' });
    }

    const createdRows = (await db<UserRow>('users')
      .insert({
        pocketbase_user_id,
        role: role ?? 'player',
        status: status ?? 'online',
        is_banned: isBannedRaw ?? false,
        region: region ?? null,
        bio: bio ?? null,
        language: language ?? null,
        matchmaking_pref: body.matchmaking_pref ?? null,
      })
      .returning('*')) as UserRow[];

    const created = createdRows[0];

    return res.status(201).json({ status: 'created', user: created });
  })
);

export default router;
