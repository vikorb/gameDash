import express from "express";
import db from "../database";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const modes = await db("game_mode").select("id", "name", "is_active", "description", "created_at", "updated_at");
    res.json(modes);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
