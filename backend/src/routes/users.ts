import { Router } from 'express';
import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { badRequest, notFound } from '@/utils/httpError';
import { parseString } from '@/utils/validators';

const router = Router();

type UserRow = {
  id: number;
  pocketbase_user_id: string | null;
  username: string | null;
  email: string | null;
  role: string;
  status: number;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseUserStatus = (value: unknown): 1 | 2 | 3 | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(parsed) || (parsed !== 1 && parsed !== 2 && parsed !== 3)) {
    throw badRequest('status doit être 1 (online), 2 (offline) ou 3 (banni)', 'VALIDATION_ERROR', { field: 'status' });
  }

  return parsed;
};

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest('Invalid payload', 'VALIDATION_ERROR');
    }

    const pocketbase_user_id = parseString(body.pocketbase_user_id, 'pocketbase_user_id', { min: 1, max: 64 })!;
    const username = parseString(body.username, 'username', { min: 1, max: 255, optional: true });
    const email = parseString(body.email, 'email', { min: 3, max: 255, optional: true });

    const role = parseString(body.role, 'role', { min: 1, max: 32, optional: true });
    const status = parseUserStatus(body.status);
    const region = parseString(body.region, 'region', { min: 1, max: 64, optional: true });
    const bio = parseString(body.bio, 'bio', { min: 0, max: 2000, optional: true });
    const language = parseString(body.language, 'language', { min: 1, max: 8, optional: true });

    const existing = await db<UserRow>('users')
      .where('pocketbase_user_id', pocketbase_user_id)
      .first();

    if (existing) {
      const updates: Partial<Pick<UserRow, 'username' | 'email'>> = {};

      if (username !== undefined) {
        updates.username = username;
      }

      if (email !== undefined) {
        updates.email = email;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(200).json({ status: 'already_exists', user: existing });
      }

      const updatedRows = (await db<UserRow>('users')
        .where('id', existing.id)
        .update(updates)
        .returning('*')) as UserRow[];

      return res.status(200).json({ status: 'already_exists', user: updatedRows[0] });
    }

    const createdRows = (await db<UserRow>('users')
      .insert({
        pocketbase_user_id,
        username: username ?? null,
        email: email ?? null,
        role: role ?? 'player',
        status: status ?? 1,
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

router.get(
  '/by-pocketbase/:pocketbaseUserId',
  asyncHandler(async (req, res) => {
    const pocketbaseUserId = parseString(req.params.pocketbaseUserId, 'pocketbaseUserId', { min: 1, max: 64 })!;

    const user = await db<UserRow>('users')
      .where('pocketbase_user_id', pocketbaseUserId)
      .first();

    if (!user) {
      throw notFound('Utilisateur introuvable', 'USER_NOT_FOUND', { pocketbaseUserId });
    }

    return res.status(200).json({ user });
  })
);

export default router;
