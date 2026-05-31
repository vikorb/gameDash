import express from "express";
import cors from "cors";

import mapsRoutes from "@/routes/maps";
import usersRoutes from "@/routes/users";
import { createShopRouter } from "@/routes/shops";

import { asyncHandler } from "@/middlewares/asyncHandler";
import { notFound } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";
import db from "@/database";

export const app = express();

app.use(cors());
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

app.use(notFound);
app.use(errorHandler);
