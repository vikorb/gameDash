import { Router, type Request } from 'express';
import { randomUUID } from 'crypto';
import Ajv from 'ajv';
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
  status: number;
  avatar_url: string | null;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
  password_hash: string;
};

type WebhookUserRecord = {
  email: string;
  username: string;
  role?: string;
  status?: number | string;
  avatar_url?: string;
  region?: string;
  bio?: string;
  language?: string;
  matchmaking_pref?: unknown;
};

const ajv = new Ajv({ allErrors: true });

const validateWebhookUserRecord = ajv.compile<WebhookUserRecord>({
  type: 'object',
  properties: {
    email: { type: 'string', minLength: 1 },
    username: { type: 'string', minLength: 1 },
    role: { type: 'string' },
    status: {
      anyOf: [
        { type: 'integer', enum: [1, 2, 3] },
        { type: 'string', enum: ['1', '2', '3', 'online', 'offline', 'banni', 'banned'] },
      ],
    },
    avatar_url: { type: 'string' },
    region: { type: 'string' },
    bio: { type: 'string' },
    language: { type: 'string' },
    matchmaking_pref: {},
  },
  required: ['email', 'username'],
  additionalProperties: true,
});

const parseUserStatus = (value: unknown): 1 | 2 | 3 | undefined => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === 'number' && Number.isInteger(value) && (value === 1 || value === 2 || value === 3)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();

    if (trimmed === '1' || trimmed === 'online') return 1;
    if (trimmed === '2' || trimmed === 'offline') return 2;
    if (trimmed === '3' || trimmed === 'banni' || trimmed === 'banned') return 3;
  }

  return undefined;
};

const router = Router();

router.post(
  '/users',
  asyncHandler(async (req: Request<unknown, unknown, unknown>, res) => {
    const body = req.body;
    const payload = isRecord(body) ? body : {};
    const recordRaw = isRecord(payload.record) ? payload.record : undefined;

    if (!recordRaw) {
      return res.status(200).json({ status: 'ignored' });
    }

    if (!validateWebhookUserRecord(recordRaw)) {
      throw badRequest('Invalid webhook payload', 'WEBHOOK_VALIDATION_ERROR', {
        errors: validateWebhookUserRecord.errors,
      });
    }

    const validatedRecord = recordRaw;

    const record = {
      email: validatedRecord.email,
      username: validatedRecord.username,
      role: validatedRecord.role,
      status: parseUserStatus(validatedRecord.status),
      avatar_url: validatedRecord.avatar_url ?? null,
      region: validatedRecord.region ?? null,
      bio: validatedRecord.bio ?? null,
      language: validatedRecord.language ?? null,
      matchmaking_pref: validatedRecord.matchmaking_pref ?? null,
    };

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
        status: record.status ?? 1,
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
