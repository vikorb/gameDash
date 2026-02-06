import { Router, type Request } from 'express';
import { randomUUID } from 'crypto';
import db from '@/database';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { badRequest } from '@/utils/httpError';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

const router = Router();

router.post(
  '/users',
  asyncHandler(async (req: Request<unknown, unknown, unknown>, res) => {
    const expectedSecret = process.env.POCKETBASE_WEBHOOK_SECRET;
    if (expectedSecret) {
      const provided = req.header('x-webhook-secret');
      if (!provided || provided !== expectedSecret) {
        throw badRequest('Invalid webhook secret', 'WEBHOOK_FORBIDDEN');
      }
    }

    const body = req.body;
    const payload = isRecord(body) ? body : {};
    const action = typeof payload.action === 'string' ? payload.action : undefined;
    const recordRaw = isRecord(payload.record) ? payload.record : undefined;

    if (action !== 'create' || !recordRaw) {
      return res.status(200).json({ status: 'ignored' });
    }

    const record = {
      email: typeof recordRaw.email === 'string' ? recordRaw.email : undefined,
      username: typeof recordRaw.username === 'string' ? recordRaw.username : undefined,
      role: typeof recordRaw.role === 'string' ? recordRaw.role : undefined,
      status: typeof recordRaw.status === 'string' ? recordRaw.status : undefined,
      is_banned: typeof recordRaw.is_banned === 'boolean' ? recordRaw.is_banned : undefined,
      avatar_url: typeof recordRaw.avatar_url === 'string' ? recordRaw.avatar_url : null,
      region: typeof recordRaw.region === 'string' ? recordRaw.region : null,
      bio: typeof recordRaw.bio === 'string' ? recordRaw.bio : null,
      language: typeof recordRaw.language === 'string' ? recordRaw.language : null,
      matchmaking_pref: recordRaw.matchmaking_pref ?? null,
    };

    if (!record.email || !record.username) {
      throw badRequest('Missing required fields', 'WEBHOOK_VALIDATION_ERROR');
    }

    const existing = await db<{ id: number }>('users')
      .where('email', record.email)
      .orWhere('username', record.username)
      .first();

    if (existing) {
      return res.status(200).json({ status: 'already_exists' });
    }

    const createdRows = (await db<UserRow>('users')
      .insert({
        email: record.email,
        username: record.username,
        role: record.role ?? 'player',
        status: record.status ?? 'online',
        is_banned: record.is_banned ?? false,
        avatar_url: record.avatar_url ?? null,
        region: record.region ?? null,
        bio: record.bio ?? null,
        language: record.language ?? null,
        matchmaking_pref: record.matchmaking_pref ?? null,
        password_hash: `pb:${randomUUID()}`,
      })
      .returning('*')) as UserRow[];

    const created = createdRows[0];

    return res.status(201).json({ status: 'created', user: created });
  })
);

export default router;
