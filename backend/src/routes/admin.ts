import { Router } from "express";
import type { Knex } from "knex";

import db from "@/database";
import { authenticateUser } from "@/middlewares/authenticateUser";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { runSeasonReset } from "@/services/seasonReset";
import { badRequest } from "@/utils/httpError";
import { ensureAdmin, isRecord } from "@/utils/users";
import { parsePositiveInt } from "@/utils/validators";

const router = Router();

type ExportEntity = "users" | "matches" | "maps" | "transactions";

type ExportQueryFilters = {
  startDate?: Date;
  endDate?: Date;
};

const allowedEntities: ExportEntity[] = ["users", "matches", "maps", "transactions"];

const toCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let raw = "";

  if (value instanceof Date) {
    raw = value.toISOString();
  } else if (typeof value === "string") {
    raw = value;
  } else if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    raw = `${value}`;
  } else if (typeof value === "object") {
    raw = JSON.stringify(value) ?? "";
  }

  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
};

const toCsv = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.map((header) => toCsvValue(header)).join(",");
  const csvRows = rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(","));

  return [csvHeaders, ...csvRows].join("\n");
};

const parsePeriodFilters = (query: Record<string, unknown>): ExportQueryFilters => {
  const startRaw = query.start ?? query.date_from ?? query.dateFrom;
  const endRaw = query.end ?? query.date_to ?? query.dateTo;

  const filters: ExportQueryFilters = {};

  if (typeof startRaw === "string" && startRaw.trim()) {
    const parsedStart = new Date(startRaw);
    if (Number.isNaN(parsedStart.getTime())) {
      throw badRequest("Parametre start invalide", "VALIDATION_ERROR", { field: "start" });
    }
    filters.startDate = parsedStart;
  }

  if (typeof endRaw === "string" && endRaw.trim()) {
    const parsedEnd = new Date(endRaw);
    if (Number.isNaN(parsedEnd.getTime())) {
      throw badRequest("Parametre end invalide", "VALIDATION_ERROR", { field: "end" });
    }
    filters.endDate = parsedEnd;
  }

  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    throw badRequest("La date de debut doit etre inferieure a la date de fin", "VALIDATION_ERROR", {
      start: filters.startDate.toISOString(),
      end: filters.endDate.toISOString(),
    });
  }

  return filters;
};

const applyDateFilter = (
  query: Knex.QueryBuilder,
  dateColumn: string,
  filters: ExportQueryFilters,
) => {
  if (filters.startDate) {
    query.andWhere(dateColumn, ">=", filters.startDate);
  }

  if (filters.endDate) {
    query.andWhere(dateColumn, "<=", filters.endDate);
  }

  return query;
};

const loadUsersExport = async (filters: ExportQueryFilters): Promise<Record<string, unknown>[]> => {
  const query = db("users")
    .select(
      "id",
      "pocketbase_user_id",
      "username",
      "email",
      "role",
      "status",
      "region",
      "language",
      "created_at",
      "updated_at",
      "deleted_at",
    )
    .orderBy("id", "asc");

  applyDateFilter(query, "created_at", filters);

  return (await query) as Record<string, unknown>[];
};

const loadMatchesExport = async (filters: ExportQueryFilters): Promise<Record<string, unknown>[]> => {
  const query = db("matches as m")
    .leftJoin("game_modes as gm", "gm.id", "m.game_mode_id")
    .leftJoin("match_participants as mp", "mp.match_id", "m.id")
    .select(
      "m.id",
      "m.game_mode_id",
      "gm.name as game_mode_name",
      "m.status",
      "m.winner_team_id",
      "m.played_at",
      "m.created_at",
      "m.updated_at",
    )
    .count("mp.id as participants_count")
    .groupBy("m.id", "gm.name")
    .orderBy("m.played_at", "desc");

  applyDateFilter(query, "m.played_at", filters);

  return (await query) as unknown as Record<string, unknown>[];
};

const loadMapsExport = async (filters: ExportQueryFilters): Promise<Record<string, unknown>[]> => {
  const hasMapStats = await db.schema.hasTable("map_stats");

  const query = db("maps as m")
    .leftJoin("users as u", "u.id", "m.creator_id")
    .select(
      "m.id",
      "m.creator_id",
      "u.username as creator_username",
      "m.title",
      "m.description",
      "m.status",
      "m.moderation_status",
      "m.current_version_id",
      "m.last_published_at",
      "m.created_at",
      "m.updated_at",
      "m.deleted_at",
    )
    .orderBy("m.id", "asc");

  applyDateFilter(query, "m.created_at", filters);

  if (hasMapStats) {
    query
      .leftJoin("map_stats as ms", "ms.map_id", "m.id")
      .select(
        db.raw("COALESCE(CAST(ms.play_count AS TEXT), '') as map_play_count"),
        db.raw("COALESCE(CAST(ms.like_count AS TEXT), '') as map_like_count"),
      );
  }

  return (await query) as Record<string, unknown>[];
};

const loadTransactionsExport = async (
  filters: ExportQueryFilters,
): Promise<Record<string, unknown>[]> => {
  const hasTransactions = await db.schema.hasTable("transactions");

  if (!hasTransactions) {
    return [];
  }

  const query = db("transactions").select("*").orderBy("id", "desc");

  // Prefer created_at when present on standard transaction schemas.
  applyDateFilter(query, "created_at", filters);

  return (await query) as Record<string, unknown>[];
};

const loadExportRows = async (
  entity: ExportEntity,
  filters: ExportQueryFilters,
): Promise<Record<string, unknown>[]> => {
  if (entity === "users") return loadUsersExport(filters);
  if (entity === "matches") return loadMatchesExport(filters);
  if (entity === "maps") return loadMapsExport(filters);
  return loadTransactionsExport(filters);
};

router.post(
  "/mmr/season-reset",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const admin = ensureAdmin(req);
    const modeIdRaw = req.query.mode_id ?? req.query.modeId;
    const body: unknown = req.body;
    const baseFromBody = isRecord(body) ? body.base : undefined;
    const baseRaw = req.query.base ?? baseFromBody ?? 1000;

    const modeId = parsePositiveInt(modeIdRaw, 'mode_id');
    const baseMmr = parsePositiveInt(baseRaw, 'base');

    const result = await runSeasonReset({
      modeId,
      baseMmr,
      actorUserId: admin.id,
    });

    return res.status(200).json({
      status: "ok",
      ...result,
    });
  }),
);

router.get(
  "/export/:entity",
  authenticateUser,
  asyncHandler(async (req, res) => {
    ensureAdmin(req);

    const entity = String(req.params.entity) as ExportEntity;
    if (!allowedEntities.includes(entity)) {
      throw badRequest("Type d'export invalide", "VALIDATION_ERROR", {
        allowed: allowedEntities,
      });
    }

    const query = (req.query as Record<string, unknown>) ?? {};
    const filters = parsePeriodFilters(query);
    const rows = await loadExportRows(entity, filters);
    const csvPayload = toCsv(rows);

    const startTag = filters.startDate?.toISOString().slice(0, 10) ?? "all";
    const endTag = filters.endDate?.toISOString().slice(0, 10) ?? "all";
    const filename = `${entity}_${startTag}_${endTag}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csvPayload);
  }),
);

export default router;
