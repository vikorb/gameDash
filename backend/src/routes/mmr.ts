/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
import express, { Request, Response } from "express";
import db from "../database";
import type { MMRResult, MMRHistory } from "../types/mmr";

const { getCurrentMMR, getMMRHistory }: { getCurrentMMR: (userId: number, modeId: number) => Promise<MMRResult>, getMMRHistory: (userId: number, modeId: number) => Promise<MMRHistory[]> } = require("../services/mmr");
const router = express.Router();

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
