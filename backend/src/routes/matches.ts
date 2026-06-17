import express, { Request, Response } from 'express';

import { asyncHandler } from '@/middlewares/asyncHandler';
import { getMatchHistory } from '@/services/matchHistory';
import { badRequest } from '@/utils/httpError';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    const modeId = req.query.modeId ? Number(req.query.modeId) : undefined;
    const result = req.query.result as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    if (!userId || isNaN(userId)) throw badRequest('Missing or invalid userId', 'VALIDATION_ERROR');

    const data = await getMatchHistory({ userId, modeId, result, dateFrom, dateTo, limit, offset });
    return res.json(data);
  }),
);

export default router;
