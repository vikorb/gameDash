import { Router, type Request, type Response, type NextFunction } from "express";
import type { Knex } from "knex";

import { isDemoModeActive, setDemoModeActive } from "../utils/demoMode";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  void handler(req, res, next).catch(next);
};

function parseJsonArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObject<T extends Record<string, unknown> = Record<string, unknown>>(value: unknown): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : ({} as T);
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

function asIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function actorFrom(req: Request) {
  return String(req.body?.actor || req.query?.actor || "POC Admin");
}

function jsonb(db: Knex, value: unknown) {
  return db.raw("?::jsonb", [JSON.stringify(value)]);
}

function mapMode(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    key: row.key,
    enabled: Boolean(row.enabled),
    maxWaitTimeSec: Number(row.max_wait_time_sec ?? 0),
    mmrWindow: Number(row.mmr_window ?? 0),
    teamSize: Number(row.team_size ?? 0),
    playersInQueue: Number(row.players_in_queue ?? 0),
    matchesLastHour: Number(row.matches_last_hour ?? 0),
    lastUpdatedAt: asIso(row.last_updated_at),
    lastUpdatedBy: row.last_updated_by,
  };
}

function mapAudit(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    modeKey: row.mode_key,
    actor: row.actor,
    changes: parseJsonArray<string>(row.changes),
    timestamp: asIso(row.timestamp),
  };
}

export function createBackofficeRouter(db: Knex) {
  const router = Router();

  router.get(
    "/dashboard",
    asyncRoute(async (req, res) => {
      const requestedPeriod = String(req.query.period ?? "7d");
      const period = ["7d", "30d", "90d"].includes(requestedPeriod) ? requestedPeriod : "7d";

      const snapshotRow = await db("backoffice_dashboard_snapshots").where({ period }).first();
      const rankRows = await db("backoffice_rank_distribution").where({ period }).orderBy("id", "asc");
      const topMapRows = await db("backoffice_top_maps").select("*").orderBy("position", "asc");
      const topCreatorRows = await db("backoffice_top_creators").select("*").orderBy("position", "asc");
      const activityRows = await db("backoffice_activity_events").select("*").orderBy("timestamp", "desc").limit(20);

      if (!snapshotRow) {
        res.status(404).json({ message: "Dashboard period not found" });
        return;
      }

      const rankTotal = rankRows.reduce((sum, row) => sum + Number(row.count ?? 0), 0);

      res.json({
        period,
        snapshot: {
          activeUsers: Number(snapshotRow.active_users ?? 0),
          matchesPerDay: Number(snapshotRow.matches_per_day ?? 0),
          transactionsPerDay: Number(snapshotRow.transactions_per_day ?? 0),
          mapsPublished: Number(snapshotRow.maps_published ?? 0),
          virtualRevenue: Number(snapshotRow.virtual_revenue ?? 0),
          pendingReports: Number(snapshotRow.pending_reports ?? 0),
        },
        trends: parseJsonObject(snapshotRow.trends),
        rankDistribution: rankRows.map((row) => ({
          key: row.rank_key,
          count: Number(row.count ?? 0),
          percentage: rankTotal === 0 ? 0 : (Number(row.count ?? 0) / rankTotal) * 100,
        })),
        topMaps: topMapRows.map((row) => ({
          id: Number(row.id),
          title: row.title,
          author: row.author,
          tests: Number(row.tests ?? 0),
          rating: Number(row.rating ?? 0),
        })),
        topCreators: topCreatorRows.map((row) => ({
          id: Number(row.id),
          name: row.name,
          mapsPublished: Number(row.maps_published ?? 0),
          totalTests: Number(row.total_tests ?? 0),
        })),
        recentActivity: activityRows.map((row) => ({
          id: Number(row.id),
          type: row.type,
          actor: row.actor,
          target: row.target,
          timestamp: asIso(row.timestamp),
        })),
      });
    }),
  );

  router.get(
    "/matchmaking",
    asyncRoute(async (_req, res) => {
      const modeRows = await db("backoffice_matchmaking_modes").select("*").orderBy("id", "asc");
      const auditRows = await db("backoffice_matchmaking_audit").select("*").orderBy("timestamp", "desc").limit(50);
      const modes = modeRows.map(mapMode);
      const enabledModes = modes.filter((mode) => mode.enabled);
      const totalInQueue = enabledModes.reduce((sum, mode) => sum + mode.playersInQueue, 0);
      const avgWaitSeconds = enabledModes.length === 0 ? 0 : Math.round(enabledModes.reduce((sum, mode) => sum + mode.maxWaitTimeSec, 0) / enabledModes.length);
      const lastUpdated = [...modes].sort((a, b) => new Date(String(b.lastUpdatedAt)).getTime() - new Date(String(a.lastUpdatedAt)).getTime())[0];

      res.json({
        modes,
        auditTrail: auditRows.map(mapAudit),
        summary: {
          totalInQueue,
          avgWaitSeconds,
          lastUpdateAt: lastUpdated?.lastUpdatedAt ?? new Date().toISOString(),
          lastUpdateActor: lastUpdated?.lastUpdatedBy ?? "—",
        },
      });
    }),
  );

  router.patch(
    "/matchmaking/:id",
    asyncRoute(async (req, res) => {
      const current = await db("backoffice_matchmaking_modes").where({ id: req.params.id }).first();
      if (!current) {
        res.status(404).json({ message: "Matchmaking mode not found" });
        return;
      }

      const patch = {
        enabled: typeof req.body?.enabled === "boolean" ? req.body.enabled : Boolean(current.enabled),
        max_wait_time_sec: Number.isFinite(Number(req.body?.maxWaitTimeSec)) ? Math.max(1, Math.round(Number(req.body.maxWaitTimeSec))) : Number(current.max_wait_time_sec),
        mmr_window: Number.isFinite(Number(req.body?.mmrWindow)) ? Math.max(0, Math.round(Number(req.body.mmrWindow))) : Number(current.mmr_window),
        team_size: Number.isFinite(Number(req.body?.teamSize)) ? Math.max(1, Math.round(Number(req.body.teamSize))) : Number(current.team_size),
      };

      const changes: string[] = [];
      if (patch.enabled !== Boolean(current.enabled)) changes.push(`enabled: ${Boolean(current.enabled)} → ${patch.enabled}`);
      if (patch.max_wait_time_sec !== Number(current.max_wait_time_sec)) changes.push(`maxWaitTimeSec: ${current.max_wait_time_sec} → ${patch.max_wait_time_sec}`);
      if (patch.mmr_window !== Number(current.mmr_window)) changes.push(`mmrWindow: ${current.mmr_window} → ${patch.mmr_window}`);
      if (patch.team_size !== Number(current.team_size)) changes.push(`teamSize: ${current.team_size} → ${patch.team_size}`);

      const actor = actorFrom(req);
      const [updated] = await db("backoffice_matchmaking_modes")
        .where({ id: req.params.id })
        .update({ ...patch, last_updated_at: db.fn.now(), last_updated_by: actor, updated_at: db.fn.now() })
        .returning("*");

      if (changes.length > 0) {
        await db("backoffice_matchmaking_audit").insert({
          mode_key: current.key,
          actor,
          changes: jsonb(db, changes),
          timestamp: db.fn.now(),
        });
      }

      const auditRows = await db("backoffice_matchmaking_audit").select("*").orderBy("timestamp", "desc").limit(50);

      res.json({
        data: mapMode(updated),
        auditTrail: auditRows.map(mapAudit),
      });
    }),
  );

  router.get(
    "/matchmaking/demo-mode",
    asyncRoute(async (req, res) => {
      const enabled = await isDemoModeActive();
      res.json({ enabled });
    })
  );

  router.post(
    "/matchmaking/demo-mode",
    asyncRoute(async (req, res) => {
      const { enabled } = req.body || {};
      if (typeof enabled !== "boolean") {
        res.status(400).json({ message: "Missing or invalid enabled flag" });
        return;
      }
      await setDemoModeActive(enabled);
      res.json({ enabled });
    })
  );

  return router;
}
