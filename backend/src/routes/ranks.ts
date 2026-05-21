
import { Router, Request, Response } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { parseParamId } from "@/utils/validators";
import { getUserRankById } from "@/services/rank";

const router = Router();



router.get(
  "/:id/rank",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseParamId(req.params.id);
    const modeId = req.query.modeId ? Number(req.query.modeId) : undefined;
    if (!modeId) return res.status(400).json({ error: 'modeId requis' });
    const result = await getUserRankById(id, modeId);
    res.json(result);
  })
);

export default router;