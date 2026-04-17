import express, { Request, Response } from 'express';

import { asyncHandler } from '@/middlewares/asyncHandler';
import { getMatchHistory } from '@/services/match';
import { badRequest } from '@/utils/httpError';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    const modeId = req.query.modeId ? Number(req.query.modeId) : undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    if (!userId || isNaN(userId)) throw badRequest('Missing or invalid userId', 'VALIDATION_ERROR');

    const result = await getMatchHistory({ userId, modeId, limit, offset });
    return res.json(result);
  }),
);

export default router;
