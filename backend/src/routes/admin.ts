import { Router } from 'express';

import { authenticateUser } from '@/middlewares/authenticateUser';
import { asyncHandler } from '@/middlewares/asyncHandler';
import { runSeasonReset } from '@/services/seasonReset';
import { ensureAdmin, isRecord } from '@/utils/users';
import { parsePositiveInt } from '@/utils/validators';

const router = Router();

router.post(
  '/mmr/season-reset',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const admin = ensureAdmin(req);
    const modeIdRaw = req.query.mode_id ?? req.query.modeId;
    const body: unknown = req.body;
    const baseFromBody = isRecord(body) ? body.base : undefined;
    const baseRaw = req.query.base ?? baseFromBody ?? 1000;

    const modeId = parsePositiveInt(modeIdRaw, 'mode_id');
    const baseMmr = parsePositiveInt(baseRaw, 'base');

    const result = await runSeasonReset({
      modeId,
      baseMmr,
      actorUserId: admin.id,
    });

    return res.status(200).json({
      status: 'ok',
      ...result,
    });
  }),
);

export default router;
