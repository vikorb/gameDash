import express from "express";
import cors from "cors";

import mapsRoutes from "@/routes/maps";
import usersRoutes from "@/routes/users";
import { createShopRouter } from "@/routes/shops";

import { asyncHandler } from "@/middlewares/asyncHandler";
import { notFound } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";
import db from "@/database";
import { createModerationRouter } from "@/routes/moderation";
import { createBackofficeRouter } from "@/routes/backoffice";
import type { Router } from "express";

import mmrRoutes from "@/routes/mmr";
import ranksRoutes from "@/routes/ranks";
import gameModesRoutes from "@/routes/game-modes";
import matchesRoutes from "@/routes/matches";
import adminRoutes from "@/routes/admin";
import auditRoutes from "@/routes/audit";

export const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ?? "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost",
  "http://localhost:80",
  "http://82.66.61.8",
  "http://82.66.61.8:80",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Id", "x-user-id"],
  }),
);

app.use(express.json({ limit: "10mb" }));

app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/ping", (_req, res) => {
  console.log("[API] ping ok");
  res.status(200).json({ ok: true });
});

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    console.log("[API] health start");
    await db.raw("SELECT 1");
    console.log("[API] health db ok");
    res.status(200).json({ status: "ok", database: "connected" });
  }),
);

app.use("/api/maps", mapsRoutes(db));
app.use("/api/users", usersRoutes);
app.use("/api/shop", createShopRouter(db));
app.use("/api/shops", createShopRouter(db));
app.use("/api/moderation", createModerationRouter(db));
app.use("/api/backoffice", createBackofficeRouter(db));
app.use("/api/maps", mapsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/mmr", mmrRoutes);
app.use("/api/game-modes", gameModesRoutes);
app.use("/api/ranks", ranksRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit", auditRoutes as Router);

app.use(notFound);
app.use(errorHandler);
