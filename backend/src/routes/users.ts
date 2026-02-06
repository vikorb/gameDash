import { Router } from 'express';
import { randomUUID } from 'crypto';
import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { badRequest } from '@/utils/httpError';
import { parseString } from '@/utils/validators';

const router = Router();

type UserRow = {
  id: number;
  email: string;
  username: string;
  role: string;
  status: string;
  is_banned: boolean;
  avatar_url: string | null;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
  password_hash: string;
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

    const email = parseString(body.email, 'email', { min: 3, max: 255 })!;
    const usernameInput = parseString(body.username, 'username', { min: 3, max: 50, optional: true });
    const username = usernameInput ?? email.split('@')[0];

    const role = parseString(body.role, 'role', { min: 1, max: 32, optional: true });
    const status = parseString(body.status, 'status', { min: 1, max: 32, optional: true });
    const avatar_url = parseString(body.avatar_url, 'avatar_url', { min: 1, max: 255, optional: true });
    const region = parseString(body.region, 'region', { min: 1, max: 64, optional: true });
    const bio = parseString(body.bio, 'bio', { min: 0, max: 2000, optional: true });
    const language = parseString(body.language, 'language', { min: 1, max: 8, optional: true });

    const existing = await db<{ id: number }>('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existing) {
      return res.status(200).json({ status: 'already_exists' });
    }

    const createdRows = (await db<UserRow>('users')
      .insert({
        email,
        username,
        role: role ?? 'player',
        status: status ?? 'online',
        is_banned: false,
        avatar_url: avatar_url ?? null,
        region: region ?? null,
        bio: bio ?? null,
        language: language ?? null,
        matchmaking_pref: body.matchmaking_pref ?? null,
        password_hash: `pb:${randomUUID()}`,
      })
      .returning('*')) as UserRow[];

    const created = createdRows[0];

    return res.status(201).json({ status: 'created', user: created });
  })
);

export default router;
