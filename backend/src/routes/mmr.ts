
import express, { Request, Response } from "express";
import db from "../database";
import type { MMRResult, MMRHistory } from "../types/mmr";

import { getAverageMMRHistory, getCurrentMMR, getMMRHistory } from "../services/mmr";
const router = express.Router();

router.get("/average-history", async (req: Request, res: Response) => {
  const modeId = typeof req.query.modeId === "string" ? Number(req.query.modeId) : null;
  const dateFrom = typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;

  if (typeof modeId === "number" && Number.isNaN(modeId)) {
    return res.status(400).json({ error: "Invalid modeId" });
  }

  if (dateFrom && Number.isNaN(new Date(dateFrom).getTime())) {
    return res.status(400).json({ error: "Invalid dateFrom" });
  }

  if (dateTo && Number.isNaN(new Date(dateTo).getTime())) {
    return res.status(400).json({ error: "Invalid dateTo" });
  }

  try {
    const toIso = dateTo ? new Date(`${dateTo}T23:59:59.999Z`).toISOString() : undefined;
    const history = await getAverageMMRHistory({
      modeId: modeId && modeId > 0 ? modeId : null,
      dateFrom,
      dateTo: toIso,
    });

    res.json({ history });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const pocketbaseUserId = req.query.pocketbaseUserId as string;
  const modeId = req.query.modeId as string;
  if (!pocketbaseUserId || !modeId) {
    return res.status(400).json({ error: "Missing pocketbaseUserId or modeId" });
  }

  try {
    const user = await db("users")
      .where({ pocketbase_user_id: pocketbaseUserId })
      .first<{ id: number }>();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const mmr: MMRResult = await getCurrentMMR(user.id, Number(modeId));
    const history: MMRHistory[] = await getMMRHistory(user.id, Number(modeId));

    res.json({
      postgresUserId: user.id,
      mmr: mmr.mmr,
      rank: mmr.rank,
      history,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
