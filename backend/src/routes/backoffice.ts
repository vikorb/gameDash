import { Router, type Request, type Response, type NextFunction } from "express";
import type { Knex } from "knex";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type JsonRecord = Record<string, unknown>;

type MatchmakingModeRow = {
  id: unknown;
  key: unknown;
  enabled: unknown;
  max_wait_time_sec: unknown;
  mmr_window: unknown;
  team_size: unknown;
  players_in_queue: unknown;
  matches_last_hour: unknown;
  last_updated_at: unknown;
  last_updated_by: unknown;
  updated_at: unknown;
};

type MatchmakingAuditRow = {
  id: unknown;
  mode_key: unknown;
  actor: unknown;
  changes: unknown;
  timestamp: unknown;
};

type RankModeRow = { id: unknown; name: unknown };
type DashboardSnapshotRow = {
  active_users: unknown;
  matches_per_day: unknown;
  transactions_per_day: unknown;
  maps_published: unknown;
  virtual_revenue: unknown;
  pending_reports: unknown;
  trends: unknown;
};
type RankDistributionRow = { rank_key: unknown; count: unknown };
type TopMapRow = { id: unknown; title: unknown; author: unknown; tests: unknown; rating: unknown };
type TopCreatorRow = { id: unknown; name: unknown; maps_published: unknown; total_tests: unknown };
type ActivityRow = { id: unknown; type: unknown; actor: unknown; target: unknown; timestamp: unknown };
type FallbackActivityRow = {
  type: "match" | "transaction" | "map" | "sanction";
  actor: string;
  target: string | null;
  timestamp: string;
};
type RankRow = { id: unknown; name: unknown; min_xp: unknown; max_xp: unknown; division_count: unknown };
type DivisionRow = { id: unknown; rank_id: unknown; name: unknown; min_xp: unknown; max_xp: unknown; order: unknown };

const asyncRoute = (handler: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  void handler(req, res, next).catch(next);
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseJsonArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as unknown[]).map((item) => item as T) : [];
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
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : ({} as T);
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

function asIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }
  return null;
}

function actorFrom(req: Request) {
  const body = isRecord(req.body) ? req.body : {};
  if (typeof body.actor === "string" && body.actor.trim() !== "") return body.actor;
  if (typeof req.query.actor === "string" && req.query.actor.trim() !== "") return req.query.actor;
  return "POC Admin";
}

function jsonb(db: Knex, value: unknown) {
  return db.raw("?::jsonb", [JSON.stringify(value)]);
}

function mapMode(row: MatchmakingModeRow) {
  return {
    id: Number(row.id),
    key: asString(row.key),
    enabled: Boolean(row.enabled),
    maxWaitTimeSec: Number(row.max_wait_time_sec ?? 0),
    mmrWindow: Number(row.mmr_window ?? 0),
    teamSize: Number(row.team_size ?? 0),
    playersInQueue: Number(row.players_in_queue ?? 0),
    matchesLastHour: Number(row.matches_last_hour ?? 0),
    lastUpdatedAt: asIso(row.last_updated_at),
    lastUpdatedBy: asString(row.last_updated_by),
  };
}

function mapAudit(row: MatchmakingAuditRow) {
  return {
    id: Number(row.id),
    modeKey: asString(row.mode_key),
    actor: asString(row.actor),
    changes: parseJsonArray<string>(row.changes),
    timestamp: asIso(row.timestamp),
  };
}

function normalizeRankKey(value: unknown) {
  const name = asString(value).toLowerCase();
  if (name.includes("bronze")) return "bronze";
  if (name.includes("silver")) return "silver";
  if (name.includes("gold")) return "gold";
  if (name.includes("platinum")) return "platinum";
  if (name.includes("diamond")) return "diamond";
  if (name.includes("master")) return "master";
  return "master";
}

function periodToDays(period: string): number {
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return 7;
}

function periodStartIso(period: string): string {
  const days = periodToDays(period);
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function getFallbackActivityRows(db: Knex, sinceIso: string): Promise<FallbackActivityRow[]> {
  const [hasMatches, hasMaps, hasShopTransactions, hasSanctions] = await Promise.all([
    db.schema.hasTable("matches"),
    db.schema.hasTable("maps"),
    db.schema.hasTable("shop_transactions"),
    db.schema.hasTable("moderation_sanctions"),
  ]);

  const matchPromise = hasMatches
    ? db<{ id: unknown; played_at: unknown }>("matches")
        .select("id", "played_at")
        .where("played_at", ">=", sinceIso)
        .orderBy("played_at", "desc")
        .limit(400)
    : Promise.resolve([] as Array<{ id: unknown; played_at: unknown }>);

  const mapPromise = hasMaps
    ? db<{ id: unknown; creator_id: unknown; title: unknown; created_at: unknown }>("maps")
        .select("id", "creator_id", "title", "created_at")
        .where("created_at", ">=", sinceIso)
        .orderBy("created_at", "desc")
        .limit(400)
    : Promise.resolve([] as Array<{ id: unknown; creator_id: unknown; title: unknown; created_at: unknown }>);

  const transactionPromise = hasShopTransactions
    ? db<{ id: unknown; user_id: unknown; ref_name: unknown; created_at: unknown }>("shop_transactions")
        .select("id", "user_id", "ref_name", "created_at")
        .where("created_at", ">=", sinceIso)
        .orderBy("created_at", "desc")
        .limit(400)
    : Promise.resolve([] as Array<{ id: unknown; user_id: unknown; ref_name: unknown; created_at: unknown }>);

  const sanctionPromise = hasSanctions
    ? db<{ id: unknown; created_by: unknown; target_name: unknown; created_at: unknown }>("moderation_sanctions")
        .select("id", "created_by", "target_name", "created_at")
        .where("created_at", ">=", sinceIso)
        .orderBy("created_at", "desc")
        .limit(400)
    : Promise.resolve([] as Array<{ id: unknown; created_by: unknown; target_name: unknown; created_at: unknown }>);

  const [matchRows, mapRows, transactionRows, sanctionRows] = await Promise.all([
    matchPromise,
    mapPromise,
    transactionPromise,
    sanctionPromise,
  ]);

  const rows: FallbackActivityRow[] = [
    ...matchRows
      .map((row) => ({
        type: "match" as const,
        actor: "System",
        target: `Match #${Number(row.id)}`,
        timestamp: asIso(row.played_at) ?? "",
      }))
      .filter((row) => row.timestamp),
    ...transactionRows
      .map((row) => ({
        type: "transaction" as const,
        actor: `User #${asString(row.user_id, "?")}`,
        target: asString(row.ref_name) || `Tx #${Number(row.id)}`,
        timestamp: asIso(row.created_at) ?? "",
      }))
      .filter((row) => row.timestamp),
    ...mapRows
      .map((row) => ({
        type: "map" as const,
        actor: `User #${asString(row.creator_id, "?")}`,
        target: asString(row.title) || `Map #${Number(row.id)}`,
        timestamp: asIso(row.created_at) ?? "",
      }))
      .filter((row) => row.timestamp),
    ...sanctionRows
      .map((row) => ({
        type: "sanction" as const,
        actor: asString(row.created_by, "Moderator"),
        target: asString(row.target_name) || `Sanction #${Number(row.id)}`,
        timestamp: asIso(row.created_at) ?? "",
      }))
      .filter((row) => row.timestamp),
  ];

  return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createBackofficeRouter(db: Knex) {
  const router = Router();

  router.get(
    "/dashboard",
    asyncRoute(async (req, res) => {
      const requestedPeriod = typeof req.query.period === "string" ? req.query.period : "7d";
      const period = ["7d", "30d", "90d"].includes(requestedPeriod) ? requestedPeriod : "7d";
      const requestedModeId = asNumber(req.query.modeId, Number.NaN);
      const selectedModeId = Number.isInteger(requestedModeId) && requestedModeId > 0 ? requestedModeId : null;

      const rankModesRows = await db<RankModeRow>("game_modes")
        .select("id", "name")
        .where("is_active", true)
        .orderBy("id", "asc");

      const snapshotRow = await db<DashboardSnapshotRow>("backoffice_dashboard_snapshots").where("period", period).first();
      let rankRows: RankDistributionRow[];
      if (selectedModeId) {
        rankRows = await db("user_ranks as ur")
            .leftJoin("ranks as r", function rankJoin() {
              this.on("r.min_xp", "<=", "ur.xp").andOn("r.max_xp", ">=", "ur.xp");
            })
            .where("ur.game_modes_id", selectedModeId)
            .groupBy("r.name")
            .select("r.name as rank_key")
            .count("ur.user_id as count") as RankDistributionRow[];
      } else {
        rankRows = await db<RankDistributionRow>("backoffice_rank_distribution").where("period", period).orderBy("id", "asc");
      }
      const topMapRows = await db<TopMapRow>("backoffice_top_maps").select("*").orderBy("position", "asc");
      const topCreatorRows = await db<TopCreatorRow>("backoffice_top_creators").select("*").orderBy("position", "asc");
      const periodStart = periodStartIso(period);
      const activityRows = await db<ActivityRow>("backoffice_activity_events")
        .select("*")
        .where("timestamp", ">=", periodStart)
        .whereIn("type", ["match", "transaction", "map", "sanction"])
        .orderBy("timestamp", "desc");

      const fallbackRows = activityRows.length === 0 ? await getFallbackActivityRows(db, periodStart) : [];

      if (!snapshotRow) {
        res.status(404).json({ message: "Dashboard period not found" });
        return;
      }

      const normalizedRankRows = rankRows.map((row) => ({
        rank_key: normalizeRankKey(row.rank_key),
        count: Number(row.count ?? 0),
      }));
      const rankTotal = normalizedRankRows.reduce((sum, row) => sum + row.count, 0);

      res.json({
        period,
        selectedModeId,
        rankModes: rankModesRows.map((mode) => ({ id: Number(mode.id), name: asString(mode.name) })),
        snapshot: {
          activeUsers: Number(snapshotRow.active_users ?? 0),
          matchesPerDay: Number(snapshotRow.matches_per_day ?? 0),
          transactionsPerDay: Number(snapshotRow.transactions_per_day ?? 0),
          mapsPublished: Number(snapshotRow.maps_published ?? 0),
          virtualRevenue: Number(snapshotRow.virtual_revenue ?? 0),
          pendingReports: Number(snapshotRow.pending_reports ?? 0),
        },
        trends: parseJsonObject(snapshotRow.trends),
        rankDistribution: normalizedRankRows.map((row) => ({
          key: row.rank_key,
          count: row.count,
          percentage: rankTotal === 0 ? 0 : (row.count / rankTotal) * 100,
        })),
        topMaps: topMapRows.map((row) => ({
          id: Number(row.id),
          title: asString(row.title),
          author: asString(row.author),
          tests: Number(row.tests ?? 0),
          rating: Number(row.rating ?? 0),
        })),
        topCreators: topCreatorRows.map((row) => ({
          id: Number(row.id),
          name: asString(row.name),
          mapsPublished: Number(row.maps_published ?? 0),
          totalTests: Number(row.total_tests ?? 0),
        })),
        recentActivity:
          activityRows.length > 0
            ? activityRows.map((row) => ({
                id: Number(row.id),
                type: asString(row.type),
                actor: asString(row.actor),
                target: asString(row.target),
                timestamp: asIso(row.timestamp),
              }))
            : fallbackRows.map((row, index) => ({
                id: index + 1,
                type: row.type,
                actor: row.actor,
                target: row.target,
                timestamp: row.timestamp,
              })),
      });
    }),
  );

  router.get(
    "/matchmaking",
    asyncRoute(async (_req, res) => {
      const modeRows = await db<MatchmakingModeRow>("backoffice_matchmaking_modes").select("*").orderBy("id", "asc");
      const auditRows = await db<MatchmakingAuditRow>("backoffice_matchmaking_audit").select("*").orderBy("timestamp", "desc").limit(50);
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

  router.get(
    "/ranks",
    asyncRoute(async (_req, res) => {
      const ranksRows = await db<RankRow>("ranks")
        .select("id", "name", "min_xp", "max_xp", "division_count")
        .orderBy("min_xp", "asc");

      const divisionRows = await db<DivisionRow>("rank_divisions")
        .select("id", "rank_id", "name", "min_xp", "max_xp", "order")
        .orderBy("min_xp", "asc")
        .orderBy("order", "desc");

      const ranks = ranksRows.map((rank) => {
        const rankId = Number(rank.id);
        const rankMinXp = Number(rank.min_xp ?? 0);
        const rankMaxXp = Number(rank.max_xp ?? 0);

        const divisions = divisionRows
          .filter((division) => {
            const divisionRankId = division.rank_id !== null ? Number(division.rank_id) : null;
            if (divisionRankId !== null) {
              return divisionRankId === rankId;
            }

            const divisionMinXp = Number(division.min_xp ?? 0);
            const divisionMaxXp = Number(division.max_xp ?? 0);
            return divisionMinXp >= rankMinXp && divisionMaxXp <= rankMaxXp;
          })
          .map((division) => ({
            id: Number(division.id),
            name: String(division.name),
            order: Number(division.order ?? 0),
            minXp: Number(division.min_xp ?? 0),
            maxXp: Number(division.max_xp ?? 0),
          }));

        return {
          id: rankId,
          name: asString(rank.name),
          minXp: rankMinXp,
          maxXp: rankMaxXp,
          divisionCount: Number(rank.division_count ?? divisions.length),
          divisions,
        };
      });

      res.json({ ranks });
    }),
  );

  router.patch(
    "/matchmaking/:id",
    asyncRoute(async (req, res) => {
      const current = await db<MatchmakingModeRow>("backoffice_matchmaking_modes").where({ id: req.params.id }).first();
      if (!current) {
        res.status(404).json({ message: "Matchmaking mode not found" });
        return;
      }

      const body = isRecord(req.body) ? req.body : {};

      const patch = {
        enabled: typeof body.enabled === "boolean" ? body.enabled : Boolean(current.enabled),
        max_wait_time_sec: Number.isFinite(asNumber(body.maxWaitTimeSec, Number.NaN)) ? Math.max(1, Math.round(asNumber(body.maxWaitTimeSec))) : Number(current.max_wait_time_sec),
        mmr_window: Number.isFinite(asNumber(body.mmrWindow, Number.NaN)) ? Math.max(0, Math.round(asNumber(body.mmrWindow))) : Number(current.mmr_window),
        team_size: Number.isFinite(asNumber(body.teamSize, Number.NaN)) ? Math.max(1, Math.round(asNumber(body.teamSize))) : Number(current.team_size),
      };

      const changes: string[] = [];
      if (patch.enabled !== Boolean(current.enabled)) changes.push(`enabled: ${Boolean(current.enabled)} → ${patch.enabled}`);
      if (patch.max_wait_time_sec !== Number(current.max_wait_time_sec)) changes.push(`maxWaitTimeSec: ${Number(current.max_wait_time_sec)} → ${patch.max_wait_time_sec}`);
      if (patch.mmr_window !== Number(current.mmr_window)) changes.push(`mmrWindow: ${Number(current.mmr_window)} → ${patch.mmr_window}`);
      if (patch.team_size !== Number(current.team_size)) changes.push(`teamSize: ${Number(current.team_size)} → ${patch.team_size}`);

      const actor = actorFrom(req);
      const updatedRows = await db<MatchmakingModeRow>("backoffice_matchmaking_modes")
        .where({ id: req.params.id })
        .update({ ...patch, last_updated_at: db.fn.now(), last_updated_by: actor, updated_at: db.fn.now() })
        .returning("*");
      const updated = updatedRows[0];

      if (!updated) {
        res.status(500).json({ message: "Matchmaking mode update failed" });
        return;
      }

      if (changes.length > 0) {
        await db<MatchmakingAuditRow>("backoffice_matchmaking_audit").insert({
          mode_key: asString(current.key),
          actor,
          changes: jsonb(db, changes),
          timestamp: db.fn.now(),
        });
      }

      const auditRows = await db<MatchmakingAuditRow>("backoffice_matchmaking_audit").select("*").orderBy("timestamp", "desc").limit(50);

      res.json({
        data: mapMode(updated),
        auditTrail: auditRows.map(mapAudit),
      });
    }),
  );

  return router;
}
