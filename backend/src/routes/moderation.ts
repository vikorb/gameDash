import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { Knex } from "knex";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

type AuditActionKey =
  | "report_assigned"
  | "report_resolved"
  | "content_hidden"
  | "content_restored"
  | "content_review_requested"
  | "sanction_activated"
  | "sanction_revoked"
  | "appeal_accepted"
  | "appeal_rejected"
  | "appeal_info_requested";

type ResourceType = "report" | "content" | "sanction" | "appeal" | "user";

const asyncRoute =
  (handler: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
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

function asIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function actorFrom(req: Request) {
  return String(req.body?.actor || req.query?.actor || "POC Admin");
}

function makeAuditId() {
  return `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function jsonb(db: Knex, value: unknown) {
  return db.raw("?::jsonb", [JSON.stringify(value)]);
}

async function addAudit(
  db: Knex,
  input: {
    actionKey: AuditActionKey;
    actorName: string;
    resourceType: ResourceType;
    resourceLabel: string;
    metadata?: string[];
  },
) {
  await db("moderation_audit_logs").insert({
    id: makeAuditId(),
    action_key: input.actionKey,
    actor_name: input.actorName,
    resource_type: input.resourceType,
    resource_label: input.resourceLabel,
    metadata: jsonb(db, input.metadata ?? []),
    created_at: db.fn.now(),
  });
}

function mapReport(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    subject: row.subject,
    targetType: row.target_type,
    targetName: row.target_name,
    reporterName: row.reporter_name,
    reason: row.reason,
    summary: row.summary,
    severity: row.severity,
    status: row.status,
    assignedTo: row.assigned_to,
    evidence: parseJsonArray(row.evidence),
    internalNotes: parseJsonArray(row.internal_notes),
    replies: parseJsonArray(row.replies),
    attachments: parseJsonArray(row.attachments),
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
  };
}

function mapContent(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    type: row.type,
    title: row.title,
    authorName: row.author_name,
    category: row.category,
    preview: row.preview,
    status: row.status,
    severity: row.severity,
    origin: row.origin,
    tags: parseJsonArray<string>(row.tags),
    flagCount: Number(row.flag_count ?? 0),
    reportsCount: Number(row.reports_count ?? 0),
    moderationNote: row.moderation_note ?? "",
    mapId:
      row.map_id === null || row.map_id === undefined
        ? null
        : Number(row.map_id),
    mapTitle: row.map_title,
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
    lastActionAt: asIso(row.last_action_at),
    lastActionBy: row.last_action_by,
  };
}

function mapSanction(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    targetName: row.target_name,
    targetEmail: row.target_email,
    type: row.type,
    scope: row.scope,
    status: row.status,
    severity: row.severity,
    reason: row.reason,
    summary: row.summary,
    policyLabel: row.policy_label,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    note: row.note ?? "",
    evidence: parseJsonArray(row.evidence),
    relatedReportIds: parseJsonArray(row.related_report_ids),
    activity: parseJsonArray(row.activity),
    appealCount: Number(row.appeal_count ?? 0),
    startAt: asIso(row.start_at),
    endAt: asIso(row.end_at),
    lastUpdatedAt: asIso(row.last_updated_at),
  };
}

function mapAppeal(row: Record<string, unknown>) {
  return {
    id: row.id,
    sanctionId:
      row.sanction_id === null || row.sanction_id === undefined
        ? null
        : Number(row.sanction_id),
    targetName: row.target_name,
    sanctionType: row.sanction_type,
    status: row.status,
    message: row.message,
    decisionNote: row.decision_note,
    submittedAt: asIso(row.submitted_at),
    updatedAt: asIso(row.updated_at),
  };
}

function mapAudit(row: Record<string, unknown>) {
  return {
    id: row.id,
    actionKey: row.action_key,
    actorName: row.actor_name,
    resourceType: row.resource_type,
    resourceLabel: row.resource_label,
    metadata: parseJsonArray<string>(row.metadata),
    createdAt: asIso(row.created_at),
  };
}

async function appendJsonArrayItem<T extends Record<string, unknown>>(
  db: Knex,
  table: string,
  id: unknown,
  column: string,
  item: T,
) {
  const normalizedId = Array.isArray(id) ? id[0] : id;

  if (typeof normalizedId !== "string" && typeof normalizedId !== "number") {
    return null;
  }

  const row = await db(table).where({ id: normalizedId }).first(column);
  if (!row) return null;
  const current = parseJsonArray<T>(row[column]);
  const next = [item, ...current];
  await db(table)
    .where({ id: normalizedId })
    .update({ [column]: jsonb(db, next), updated_at: db.fn.now() });
  return next;
}

const severityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function normalizeSeverity(value: unknown) {
  const severity = String(value ?? "medium");
  return severity in severityRank ? severity : "medium";
}

function targetTypeLabel(targetType: string) {
  switch (targetType) {
    case "comment":
      return "commentaire";
    case "user":
      return "utilisateur";
    case "hunt":
      return "chasse";
    case "asset":
      return "contenu";
    default:
      return "map";
  }
}

function normalizeOptionalId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function buildReportEvidence(input: {
  targetId: unknown;
  mapId: unknown;
  mapTitle: unknown;
  authorName: unknown;
  sourceUrl: unknown;
  evidence: unknown;
}) {
  const evidence = parseJsonArray<Record<string, unknown>>(input.evidence);

  const add = (id: string, label: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return;
    evidence.push({ id, label, value: String(value) });
  };

  add("target-id", "ID cible", input.targetId);
  add("map-id", "ID map", input.mapId);
  add("map-title", "Map", input.mapTitle);
  add("author", "Auteur", input.authorName);
  add("url", "URL", input.sourceUrl);

  return evidence;
}

async function syncReportedContent(
  db: Knex,
  input: {
    targetType: string;
    targetName: string;
    authorName: string;
    reason: string;
    summary: string;
    severity: string;
    mapId: number | null;
    mapTitle: string | null;
  },
) {
  const contentType =
    input.targetType === "comment"
      ? "comment"
      : input.targetType === "map"
        ? "map"
        : input.targetType;
  const tags = [input.targetType, input.reason].filter(Boolean);

  const existing =
    input.mapId && contentType === "map"
      ? await db("moderation_content_items")
          .where({ type: "map", map_id: input.mapId })
          .first()
      : await db("moderation_content_items")
          .where({ type: contentType, title: input.targetName })
          .first();

  if (existing) {
    const nextSeverity =
      severityRank[input.severity] >
      severityRank[String(existing.severity ?? "low")]
        ? input.severity
        : String(existing.severity ?? "low");

    await db("moderation_content_items")
      .where({ id: existing.id })
      .update({
        status: "review",
        severity: nextSeverity,
        category: input.reason,
        preview: input.summary,
        tags: jsonb(
          db,
          Array.from(
            new Set([...parseJsonArray<string>(existing.tags), ...tags]),
          ),
        ),
        flag_count: db.raw("flag_count + 1"),
        reports_count: db.raw("reports_count + 1"),
        moderation_note: "Signalement reçu depuis les pages Maps.",
        last_action_at: db.fn.now(),
        last_action_by: "Système",
        updated_at: db.fn.now(),
      });

    return;
  }

  await db("moderation_content_items").insert({
    type: contentType,
    title: input.targetName,
    author_name: input.authorName || "Utilisateur inconnu",
    category: input.reason,
    preview: input.summary,
    status: "review",
    severity: input.severity,
    origin: "community",
    tags: jsonb(db, tags),
    flag_count: 1,
    reports_count: 1,
    moderation_note: "Signalement reçu depuis les pages Maps.",
    map_id: input.mapId,
    map_title: input.mapTitle,
    last_action_at: db.fn.now(),
    last_action_by: "Système",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
}

export function createModerationRouter(db: Knex) {
  const router = Router();

  router.get(
    "/users",
    asyncRoute(async (req, res) => {
      const page = Math.max(Number(req.query.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
      const search = String(req.query.search ?? "")
        .trim()
        .toLowerCase();
      const role = String(req.query.role ?? "all");
      const status = String(req.query.status ?? "all");
      const deleted = String(req.query.deleted ?? "all");
      const sortBy = String(req.query.sortBy ?? "updated_at");
      const sortOrder =
        String(req.query.sortOrder ?? "desc").toLowerCase() === "asc"
          ? "asc"
          : "desc";
      const allowedSort = new Set([
        "updated_at",
        "created_at",
        "username",
        "email",
        "role",
        "status",
      ]);

      const base = db("users");

      if (search) {
        base.where((builder) => {
          builder
            .whereRaw("LOWER(COALESCE(username, '')) LIKE ?", [`%${search}%`])
            .orWhereRaw("LOWER(COALESCE(email, '')) LIKE ?", [`%${search}%`])
            .orWhereRaw("LOWER(COALESCE(region, '')) LIKE ?", [`%${search}%`])
            .orWhereRaw("LOWER(COALESCE(role, '')) LIKE ?", [`%${search}%`])
            .orWhereRaw("LOWER(COALESCE(language, '')) LIKE ?", [
              `%${search}%`,
            ]);
        });
      }

      if (["player", "admin", "moderator"].includes(role))
        base.where("role", role);
      if (["0", "1", "2", "3"].includes(status))
        base.where("status", Number(status));
      if (deleted === "active") base.whereNull("deleted_at");
      if (deleted === "deleted") base.whereNotNull("deleted_at");

      const countRow = await base
        .clone()
        .count<{ count: string }[]>("id as count")
        .first();
      const total = Number(countRow?.count ?? 0);
      const rows = await base
        .clone()
        .select(
          "id",
          "pocketbase_user_id",
          "username",
          "email",
          "role",
          "status",
          "region",
          "bio",
          "language",
          "matchmaking_pref",
          "created_at",
          "updated_at",
          "deleted_at",
        )
        .orderBy(allowedSort.has(sortBy) ? sortBy : "updated_at", sortOrder)
        .limit(limit)
        .offset((page - 1) * limit);

      const summaryRows = await db("users")
        .select("role", "status", "deleted_at")
        .where((builder) => {
          if (deleted === "active") builder.whereNull("deleted_at");
          if (deleted === "deleted") builder.whereNotNull("deleted_at");
        });

      res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
        summary: {
          total,
          bannedCount: summaryRows.filter((u) => Number(u.status) === 3).length,
          deletedCount: summaryRows.filter((u) => !!u.deleted_at).length,
          adminsAndModeratorsCount: summaryRows.filter(
            (u) => u.role === "admin" || u.role === "moderator",
          ).length,
        },
      });
    }),
  );

  router.patch(
    "/users/:id/role",
    asyncRoute(async (req, res) => {
      const role = String(req.body?.role ?? "");
      if (!["player", "admin", "moderator"].includes(role)) {
        res.status(400).json({ message: "Invalid role" });
        return;
      }

      const [row] = await db("users")
        .where({ id: req.params.id })
        .update({ role, updated_at: db.fn.now() })
        .returning([
          "id",
          "pocketbase_user_id",
          "username",
          "email",
          "role",
          "status",
          "region",
          "bio",
          "language",
          "matchmaking_pref",
          "created_at",
          "updated_at",
          "deleted_at",
        ]);

      if (!row) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await addAudit(db, {
        actionKey: "content_review_requested",
        actorName: actorFrom(req),
        resourceType: "user",
        resourceLabel: row.username || row.email || `User #${row.id}`,
        metadata: [`role: ${role}`],
      });

      res.json({ data: row });
    }),
  );

  router.patch(
    "/users/:id/status",
    asyncRoute(async (req, res) => {
      const status = Number(req.body?.status);
      if (![0, 1, 2, 3].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      const [row] = await db("users")
        .where({ id: req.params.id })
        .update({
          status,
          updated_at: db.fn.now(),
          deleted_at: status === 0 ? db.fn.now() : null,
        })
        .returning([
          "id",
          "pocketbase_user_id",
          "username",
          "email",
          "role",
          "status",
          "region",
          "bio",
          "language",
          "matchmaking_pref",
          "created_at",
          "updated_at",
          "deleted_at",
        ]);

      if (!row) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await addAudit(db, {
        actionKey: status === 3 ? "sanction_activated" : "sanction_revoked",
        actorName: actorFrom(req),
        resourceType: "user",
        resourceLabel: row.username || row.email || `User #${row.id}`,
        metadata: [`status: ${status}`],
      });

      res.json({ data: row });
    }),
  );

  router.get(
    "/reports",
    asyncRoute(async (_req, res) => {
      const rows = await db("moderation_reports")
        .select("*")
        .orderBy("updated_at", "desc");
      const reports = rows.map(mapReport);
      res.json({
        data: reports,
        summary: {
          total: reports.length,
          newCount: reports.filter((r) => r.status === "new").length,
          investigatingCount: reports.filter(
            (r) => r.status === "investigating",
          ).length,
          resolvedCount: reports.filter((r) => r.status === "resolved").length,
        },
      });
    }),
  );

  router.post(
    "/reports",
    asyncRoute(async (req, res) => {
      const targetType = String(req.body?.targetType ?? "map").trim() || "map";
      const targetName = String(req.body?.targetName ?? "").trim();
      const reporterName =
        String(req.body?.reporterName ?? "Utilisateur GameDash").trim() ||
        "Utilisateur GameDash";
      const reason = String(req.body?.reason ?? "").trim();
      const summary = String(req.body?.summary ?? "").trim();
      const severity = normalizeSeverity(req.body?.severity);
      const targetId = req.body?.targetId ?? null;
      const mapId = normalizeOptionalId(
        req.body?.mapId ?? (targetType === "map" ? targetId : null),
      );
      const mapTitle =
        req.body?.mapTitle === null ||
        req.body?.mapTitle === undefined ||
        req.body?.mapTitle === ""
          ? targetType === "map"
            ? targetName
            : null
          : String(req.body.mapTitle);
      const authorName = String(req.body?.authorName ?? "").trim();
      const sourceUrl = String(req.body?.sourceUrl ?? "").trim();

      if (!targetName) {
        res.status(400).json({ message: "targetName is required" });
        return;
      }

      if (!reason) {
        res.status(400).json({ message: "reason is required" });
        return;
      }

      if (summary.length < 8) {
        res
          .status(400)
          .json({ message: "summary must contain at least 8 characters" });
        return;
      }

      const subject = String(
        req.body?.subject ??
          `Signalement ${targetTypeLabel(targetType)} : ${targetName}`,
      ).slice(0, 180);

      const evidence = buildReportEvidence({
        targetId,
        mapId,
        mapTitle,
        authorName,
        sourceUrl,
        evidence: req.body?.evidence,
      });

      const [row] = await db("moderation_reports")
        .insert({
          subject,
          target_type: targetType,
          target_name: targetName,
          reporter_name: reporterName,
          reason,
          summary,
          severity,
          status: "new",
          evidence: jsonb(db, evidence),
          internal_notes: jsonb(db, []),
          replies: jsonb(db, []),
          attachments: jsonb(db, []),
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning("*");

      await syncReportedContent(db, {
        targetType,
        targetName,
        authorName,
        reason,
        summary,
        severity,
        mapId,
        mapTitle,
      });

      if (targetType === "map" && mapId) {
        await db("maps").where({ id: mapId }).update({
          moderation_status: "review",
          updated_at: db.fn.now(),
        });
      }

      await addAudit(db, {
        actionKey: "content_review_requested",
        actorName: reporterName,
        resourceType: "report",
        resourceLabel: subject,
        metadata: [
          `target: ${targetName}`,
          `reason: ${reason}`,
          `severity: ${severity}`,
        ],
      });

      res.status(201).json({ data: mapReport(row) });
    }),
  );

  router.patch(
    "/reports/:id/status",
    asyncRoute(async (req, res) => {
      const status = String(req.body?.status ?? "");
      if (!["new", "investigating", "resolved", "dismissed"].includes(status)) {
        res.status(400).json({ message: "Invalid report status" });
        return;
      }

      const actor = actorFrom(req);
      const [row] = await db("moderation_reports")
        .where({ id: req.params.id })
        .update({ status, updated_at: db.fn.now() })
        .returning("*");

      if (!row) {
        res.status(404).json({ message: "Report not found" });
        return;
      }

      await addAudit(db, {
        actionKey:
          status === "resolved" ? "report_resolved" : "report_assigned",
        actorName: actor,
        resourceType: "report",
        resourceLabel: row.subject,
        metadata: [`status: ${status}`],
      });

      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/resolve",
    asyncRoute(async (req, res) => {
      req.body.status = "resolved";
      const [row] = await db("moderation_reports")
        .where({ id: req.params.id })
        .update({ status: "resolved", updated_at: db.fn.now() })
        .returning("*");
      if (!row)
        return void res.status(404).json({ message: "Report not found" });
      await addAudit(db, {
        actionKey: "report_resolved",
        actorName: actorFrom(req),
        resourceType: "report",
        resourceLabel: row.subject,
        metadata: ["resolved"],
      });
      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/dismiss",
    asyncRoute(async (req, res) => {
      const [row] = await db("moderation_reports")
        .where({ id: req.params.id })
        .update({ status: "dismissed", updated_at: db.fn.now() })
        .returning("*");
      if (!row)
        return void res.status(404).json({ message: "Report not found" });
      await addAudit(db, {
        actionKey: "report_resolved",
        actorName: actorFrom(req),
        resourceType: "report",
        resourceLabel: row.subject,
        metadata: ["dismissed"],
      });
      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/assign",
    asyncRoute(async (req, res) => {
      const assignedTo = String(req.body?.assignedTo ?? "").trim();
      if (!assignedTo)
        return void res.status(400).json({ message: "assignedTo is required" });
      const [row] = await db("moderation_reports")
        .where({ id: req.params.id })
        .update({ assigned_to: assignedTo, updated_at: db.fn.now() })
        .returning("*");
      if (!row)
        return void res.status(404).json({ message: "Report not found" });
      await addAudit(db, {
        actionKey: "report_assigned",
        actorName: actorFrom(req),
        resourceType: "report",
        resourceLabel: row.subject,
        metadata: [`assignedTo: ${assignedTo}`],
      });
      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/notes",
    asyncRoute(async (req, res) => {
      const message = String(req.body?.message ?? "").trim();
      if (!message)
        return void res.status(400).json({ message: "message is required" });
      const item = {
        id: `note-${Date.now()}`,
        author: actorFrom(req),
        message,
        createdAt: new Date().toISOString(),
      };
      await appendJsonArrayItem(
        db,
        "moderation_reports",
        req.params.id,
        "internal_notes",
        item,
      );
      const row = await db("moderation_reports")
        .where({ id: req.params.id })
        .first();
      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/replies",
    asyncRoute(async (req, res) => {
      const message = String(req.body?.message ?? "").trim();
      if (!message)
        return void res.status(400).json({ message: "message is required" });
      const item = {
        id: `reply-${Date.now()}`,
        author: actorFrom(req),
        message,
        createdAt: new Date().toISOString(),
      };
      await appendJsonArrayItem(
        db,
        "moderation_reports",
        req.params.id,
        "replies",
        item,
      );
      const row = await db("moderation_reports")
        .where({ id: req.params.id })
        .first();
      res.json({ data: mapReport(row) });
    }),
  );

  router.post(
    "/reports/:id/attachments",
    asyncRoute(async (req, res) => {
      const item = {
        id: `att-${Date.now()}`,
        name: String(req.body?.name ?? "attachment"),
        type: req.body?.type === "image" ? "image" : "file",
        url: String(req.body?.url ?? ""),
        mimeType: req.body?.mimeType ? String(req.body.mimeType) : null,
        description: req.body?.description ? String(req.body.description) : "",
        source: req.body?.source ? String(req.body.source) : "upload",
        addedBy: actorFrom(req),
        addedAt: new Date().toISOString(),
      };
      await appendJsonArrayItem(
        db,
        "moderation_reports",
        req.params.id,
        "attachments",
        item,
      );
      const row = await db("moderation_reports")
        .where({ id: req.params.id })
        .first();
      res.json({ data: mapReport(row) });
    }),
  );

  router.delete(
    "/reports/:id/attachments/:attachmentId",
    asyncRoute(async (req, res) => {
      const row = await db("moderation_reports")
        .where({ id: req.params.id })
        .first();
      if (!row)
        return void res.status(404).json({ message: "Report not found" });
      const next = parseJsonArray<Record<string, unknown>>(
        row.attachments,
      ).filter((att) => String(att.id) !== req.params.attachmentId);
      const [updated] = await db("moderation_reports")
        .where({ id: req.params.id })
        .update({ attachments: jsonb(db, next), updated_at: db.fn.now() })
        .returning("*");
      res.json({ data: mapReport(updated) });
    }),
  );

  router.get(
    "/content",
    asyncRoute(async (_req, res) => {
      const rows = await db("moderation_content_items")
        .select("*")
        .orderBy("updated_at", "desc");
      const contentItems = rows.map(mapContent);
      res.json({
        data: contentItems,
        summary: {
          total: contentItems.length,
          actionableCount: contentItems.filter((item) =>
            ["review", "restricted"].includes(String(item.status)),
          ).length,
          reviewCount: contentItems.filter((item) => item.status === "review")
            .length,
          hiddenCount: contentItems.filter((item) => item.status === "hidden")
            .length,
          highPriorityCount: contentItems.filter((item) =>
            ["high", "critical"].includes(String(item.severity)),
          ).length,
        },
      });
    }),
  );

  async function updateContentStatus(
    req: Request,
    res: Response,
    status: "visible" | "hidden" | "review" | "restricted",
    actionKey: AuditActionKey,
  ) {
    const actor = actorFrom(req);
    const [row] = await db("moderation_content_items")
      .where({ id: req.params.id })
      .update({
        status,
        last_action_at: db.fn.now(),
        last_action_by: actor,
        updated_at: db.fn.now(),
      })
      .returning("*");
    if (!row)
      return void res.status(404).json({ message: "Content not found" });
    await addAudit(db, {
      actionKey,
      actorName: actor,
      resourceType: "content",
      resourceLabel: row.title,
      metadata: [`status: ${status}`],
    });
    res.json({ data: mapContent(row) });
  }

  router.post(
    "/content/:id/review",
    asyncRoute(async (req, res) =>
      updateContentStatus(req, res, "review", "content_review_requested"),
    ),
  );
  router.post(
    "/content/:id/hide",
    asyncRoute(async (req, res) =>
      updateContentStatus(req, res, "hidden", "content_hidden"),
    ),
  );
  router.post(
    "/content/:id/restore",
    asyncRoute(async (req, res) =>
      updateContentStatus(req, res, "visible", "content_restored"),
    ),
  );

  router.get(
    "/sanctions",
    asyncRoute(async (_req, res) => {
      const rows = await db("moderation_sanctions")
        .select("*")
        .orderBy("last_updated_at", "desc");
      const sanctions = rows.map(mapSanction);
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      res.json({
        data: sanctions,
        summary: {
          total: sanctions.length,
          activeCount: sanctions.filter((s) => s.status === "active").length,
          draftCount: sanctions.filter((s) => s.status === "draft").length,
          expiringSoonCount: sanctions.filter(
            (s) =>
              s.endAt &&
              new Date(s.endAt).getTime() - now <= sevenDays &&
              new Date(s.endAt).getTime() > now,
          ).length,
        },
      });
    }),
  );

  async function updateSanction(
    req: Request,
    res: Response,
    status: "active" | "revoked",
    actionKey: AuditActionKey,
  ) {
    const actor = actorFrom(req);
    const current = await db("moderation_sanctions")
      .where({ id: req.params.id })
      .first();
    if (!current)
      return void res.status(404).json({ message: "Sanction not found" });
    const activity = [
      {
        id: `act-${Date.now()}`,
        actor,
        message: status === "active" ? "Sanction activée" : "Sanction révoquée",
        createdAt: new Date().toISOString(),
      },
      ...parseJsonArray(current.activity),
    ];
    const [row] = await db("moderation_sanctions")
      .where({ id: req.params.id })
      .update({
        status,
        activity: jsonb(db, activity),
        last_updated_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*");
    await addAudit(db, {
      actionKey,
      actorName: actor,
      resourceType: "sanction",
      resourceLabel: row.target_name,
      metadata: [`status: ${status}`],
    });
    res.json({ data: mapSanction(row) });
  }

  router.post(
    "/sanctions/:id/activate",
    asyncRoute(async (req, res) =>
      updateSanction(req, res, "active", "sanction_activated"),
    ),
  );
  router.post(
    "/sanctions/:id/revoke",
    asyncRoute(async (req, res) =>
      updateSanction(req, res, "revoked", "sanction_revoked"),
    ),
  );

  router.patch(
    "/sanctions/:id/note",
    asyncRoute(async (req, res) => {
      const note = String(req.body?.note ?? "");
      const actor = actorFrom(req);
      const current = await db("moderation_sanctions")
        .where({ id: req.params.id })
        .first();
      if (!current)
        return void res.status(404).json({ message: "Sanction not found" });
      const activity = [
        {
          id: `act-${Date.now()}`,
          actor,
          message: "Note de sanction mise à jour",
          createdAt: new Date().toISOString(),
        },
        ...parseJsonArray(current.activity),
      ];
      const [row] = await db("moderation_sanctions")
        .where({ id: req.params.id })
        .update({
          note,
          activity: jsonb(db, activity),
          last_updated_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning("*");
      res.json({ data: mapSanction(row) });
    }),
  );

  router.get(
    "/appeals",
    asyncRoute(async (_req, res) => {
      const rows = await db("moderation_appeals")
        .select("*")
        .orderBy("submitted_at", "desc");
      const appeals = rows.map(mapAppeal);
      res.json({
        data: appeals,
        summary: {
          total: appeals.length,
          pendingCount: appeals.filter((a) => a.status === "pending").length,
          needsInfoCount: appeals.filter((a) => a.status === "needsInfo")
            .length,
        },
      });
    }),
  );

  async function updateAppeal(
    req: Request,
    res: Response,
    status: "needsInfo" | "accepted" | "rejected",
    actionKey: AuditActionKey,
  ) {
    const actor = actorFrom(req);
    const fallbackNote =
      status === "needsInfo"
        ? "Informations complémentaires demandées."
        : status === "accepted"
          ? "Appel accepté."
          : "Appel rejeté.";
    const decisionNote = String(req.body?.decisionNote ?? fallbackNote);
    const [row] = await db("moderation_appeals")
      .where({ id: req.params.id })
      .update({ status, decision_note: decisionNote, updated_at: db.fn.now() })
      .returning("*");
    if (!row) return void res.status(404).json({ message: "Appeal not found" });
    await addAudit(db, {
      actionKey,
      actorName: actor,
      resourceType: "appeal",
      resourceLabel: String(row.id),
      metadata: [`status: ${status}`, decisionNote],
    });
    res.json({ data: mapAppeal(row) });
  }

  router.post(
    "/appeals/:id/request-info",
    asyncRoute(async (req, res) =>
      updateAppeal(req, res, "needsInfo", "appeal_info_requested"),
    ),
  );
  router.post(
    "/appeals/:id/accept",
    asyncRoute(async (req, res) =>
      updateAppeal(req, res, "accepted", "appeal_accepted"),
    ),
  );
  router.post(
    "/appeals/:id/reject",
    asyncRoute(async (req, res) =>
      updateAppeal(req, res, "rejected", "appeal_rejected"),
    ),
  );

  router.get(
    "/audit",
    asyncRoute(async (_req, res) => {
      const rows = await db("moderation_audit_logs")
        .select("*")
        .orderBy("created_at", "desc")
        .limit(300);
      res.json({ data: rows.map(mapAudit) });
    }),
  );

  return router;
}
