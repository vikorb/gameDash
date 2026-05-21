import { Router } from 'express';

import db from '@/database';
import { authenticateUser } from '@/middlewares/authenticateUser';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { parsePositiveInt, parseString } from '@/utils/validators';
import { ensureAdmin, parsePaginationNumber } from '@/utils/users';

const router = Router();

router.get(
  '/season-resets',
  authenticateUser,
  asyncHandler(async (req, res) => {
    ensureAdmin(req);

    const page = parsePaginationNumber(req.query.page, 'page', 1, 1, 100000);
    const limit = parsePaginationNumber(req.query.limit, 'limit', 20, 1, 100);
    const modeIdRaw = req.query.mode_id ?? req.query.modeId;
    const actorUserIdRaw = req.query.actor_user_id ?? req.query.actorUserId;
    const resetId = parseString(req.query.reset_id ?? req.query.resetId, 'reset_id', {
      min: 1,
      max: 128,
      optional: true,
    });

    const modeId = modeIdRaw !== undefined ? parsePositiveInt(modeIdRaw, 'mode_id') : undefined;
    const actorUserId =
      actorUserIdRaw !== undefined ? parsePositiveInt(actorUserIdRaw, 'actor_user_id') : undefined;

    const offset = (page - 1) * limit;

    const baseQuery = db('audit_logs').where({ action: 'SEASON_RESET' });

    if (modeId !== undefined) {
      baseQuery.andWhereRaw("(payload->>'mode_id')::int = ?", [modeId]);
    }

    if (actorUserId !== undefined) {
      baseQuery.andWhere('actor_user_id', actorUserId);
    }

    if (resetId) {
      baseQuery.andWhereRaw("payload->>'reset_id' = ?", [resetId]);
    }

    const totalRow = await baseQuery
      .clone()
      .count<{ count: string }>({ count: '*' })
      .first();

    const total = Number(totalRow?.count ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const logs = await baseQuery
      .clone()
      .select('id', 'action', 'actor_user_id', 'payload', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        modeId: modeId ?? null,
        actorUserId: actorUserId ?? null,
        resetId: resetId ?? null,
      },
    });
  }),
);

export default router;
