import { Router, type Request, type Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { Knex } from "knex";

const DEFAULT_USER_ID = 66;

const MAP_STATUSES = ["draft", "beta", "stable"] as const;
const MODERATION_STATUSES = ["visible", "hidden", "removed"] as const;
const VOTE_VALUES = ["like", "dislike"] as const;

type MapStatus = (typeof MAP_STATUSES)[number];
type ModerationStatus = (typeof MODERATION_STATUSES)[number];
type VoteValue = (typeof VOTE_VALUES)[number];
type BlockType = "empty" | "wall" | "floor" | "spawn" | "objective";

interface GridBlock {
  x: number;
  y: number;
  type: Exclude<BlockType, "empty">;
  rotation: number;
}

interface GridData {
  blocks: GridBlock[];
  grid_size: number;
  version: number;
}

interface MapRow {
  id: number | string;
  title: string;
  description: string | null;
  creator_id: number | string;
  status: MapStatus;
  moderation_status: ModerationStatus | null;
  featured: boolean | number | string | null;
  grid_data: GridData | string | null;
  current_version_number: number | string | null;
  current_version_id: number | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  last_published_at?: Date | string | null;

  creator_username: string | null;
  creator_region: string | null;
  creator_maps_count: number | string | null;
  creator_total_tests: number | string | null;
  creator_total_likes: number | string | null;

  likes_count: number | string | null;
  dislikes_count: number | string | null;
  favorites_count: number | string | null;
  tests_count: number | string | null;
  comments_count: number | string | null;
  last_activity_at: Date | string | null;
  user_vote: VoteValue | null;
  user_favorite: boolean | number | string | null;
  user_tested: boolean | number | string | null;
  versions_count: number | string | null;
}

interface TagRow {
  id: number | string;
  map_id?: number | string;
  slug: string;
  label_fr: string;
  label_en: string;
}

interface ScreenshotRow {
  id: number | string;
  map_id: number | string;
  url: string;
  position: number | string;
}

interface VersionRow {
  id: number | string;
  map_id: number | string;
  version_number: number | string;
  release_notes: string | null;
  created_at: Date | string;
}

interface CommentRow {
  id: number | string;
  map_id: number | string;
  user_id: number | string;
  username: string | null;
  content: string;
  created_at: Date | string;
  likes_count: number | string | null;
  user_liked: boolean | number | string | null;
}

interface TopCreatorRow {
  id: number | string;
  username: string | null;
  region: string | null;
  total_tests: number | string | null;
  total_likes: number | string | null;
  maps_count: number | string | null;
}

interface SaveMapBody {
  title?: unknown;
  description?: unknown;
  status?: unknown;
  moderation_status?: unknown;
  tags?: unknown;
  screenshots?: unknown;
  gridData?: unknown;
  grid_data?: unknown;
  releaseNotes?: unknown;
  release_notes?: unknown;
}

interface VoteBody {
  vote?: unknown;
}

interface CommentBody {
  content?: unknown;
}

interface FormattedComment {
  id: number;
  mapId: number;
  author: {
    id: number;
    username: string;
  };
  content: string;
  likes_count: number;
  user_liked: boolean;
  created_at: string;
}

interface FormattedMap {
  id: number;
  title: string;
  description: string;
  status: MapStatus;
  moderation_status: ModerationStatus;
  featured: boolean;
  creator: {
    id: number;
    username: string;
    region: string;
    maps_count: number;
    total_tests: number;
    total_likes: number;
  };
  tags: Array<{
    id: number;
    slug: string;
    label_fr: string;
    label_en: string;
  }>;
  screenshots: Array<{
    id: number;
    url: string;
    position: number;
  }>;
  grid_data: GridData | null;
  current_version_number: number;
  current_version_id: number | null;
  versions_count: number;
  versions: Array<{
    id: number;
    version_number: number;
    release_notes: string;
    created_at: string;
  }>;
  comments: FormattedComment[];
  stats: {
    likes_count: number;
    dislikes_count: number;
    favorites_count: number;
    tests_count: number;
    comments_count: number;
    score: number;
    retention: number;
    last_activity_at: string;
  };
  user_vote: VoteValue | null;
  user_favorite: boolean;
  user_tested: boolean;
  created_at: string;
  updated_at: string;
}

type RequestUserContext = {
  header(name: string): string | undefined;
  query: unknown;
};

type RequestParamsContext = {
  params: unknown;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "t" ||
      normalized === "yes"
    );
  }

  return false;
}

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function isMapStatus(value: unknown): value is MapStatus {
  return typeof value === "string" && MAP_STATUSES.includes(value as MapStatus);
}

function isModerationStatus(value: unknown): value is ModerationStatus {
  return (
    typeof value === "string" &&
    MODERATION_STATUSES.includes(value as ModerationStatus)
  );
}

function isVoteValue(value: unknown): value is VoteValue {
  return typeof value === "string" && VOTE_VALUES.includes(value as VoteValue);
}

function parseGridData(value: MapRow["grid_data"]): GridData | null {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return extractGridData(JSON.parse(value));
  } catch {
    return null;
  }
}

function getUserId(req: RequestUserContext): number {
  const query = req.query as { userId?: unknown; user_id?: unknown };
  const headerUserId = req.header("x-user-id");

  return toNumber(
    headerUserId ?? query.userId ?? query.user_id,
    DEFAULT_USER_ID,
  );
}

function normalizeMapId(req: RequestParamsContext): number {
  const params = req.params as { id?: unknown };
  const id = toNumber(params.id);

  if (!id) throw new Error("Invalid map id");

  return id;
}

function sanitizeStatus(value: unknown): MapStatus {
  return isMapStatus(value) ? value : "draft";
}

function sanitizeModerationStatus(value: unknown): ModerationStatus {
  return isModerationStatus(value) ? value : "visible";
}

function extractTagIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const ids = value
    .map((item) => {
      if (typeof item === "number" || typeof item === "string")
        return toNumber(item);

      if (typeof item === "object" && item !== null && "id" in item) {
        return toNumber((item as { id?: unknown }).id);
      }

      return 0;
    })
    .filter((id) => id > 0);

  return Array.from(new Set(ids));
}

function extractScreenshots(
  value: unknown,
): { url: string; position: number }[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return { url: item.trim(), position: index };
      }

      if (typeof item !== "object" || item === null) return null;

      const raw = item as { url?: unknown; position?: unknown };
      if (typeof raw.url !== "string" || !raw.url.trim()) return null;

      return {
        url: raw.url.trim(),
        position: toNumber(raw.position, index),
      };
    })
    .filter((item): item is { url: string; position: number } => item !== null);
}

function extractGridData(value: unknown): GridData | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<GridData>;
  if (!Array.isArray(candidate.blocks)) return null;

  return {
    blocks: candidate.blocks.filter((block): block is GridBlock => {
      if (typeof block !== "object" || block === null) return false;

      const item = block as Partial<GridBlock>;

      return (
        typeof item.x === "number" &&
        typeof item.y === "number" &&
        typeof item.rotation === "number" &&
        (item.type === "wall" ||
          item.type === "floor" ||
          item.type === "spawn" ||
          item.type === "objective")
      );
    }),
    grid_size: toNumber(candidate.grid_size, 14),
    version: toNumber(candidate.version, 1),
  };
}

function getReleaseNotes(body: SaveMapBody): string {
  const value = body.releaseNotes ?? body.release_notes;

  return typeof value === "string" && value.trim()
    ? value.trim()
    : "Version initiale.";
}

async function getTags(db: Knex): Promise<TagRow[]> {
  return (await db("map_tags")
    .select("id", "slug", "label_fr", "label_en")
    .orderBy("label_fr", "asc")) as TagRow[];
}

async function getMapRows(
  db: Knex,
  userId: number,
  mapIds?: number[],
  creatorId?: number,
): Promise<MapRow[]> {
  const query = db("maps as m")
    .leftJoin("users as u", "u.id", "m.creator_id")
    .where("m.moderation_status", "<>", "removed")
    .select([
      "m.id",
      "m.title",
      "m.description",
      "m.creator_id",
      "m.status",
      "m.moderation_status",
      "m.featured",
      "m.grid_data",
      "m.current_version_number",
      "m.current_version_id",
      "m.created_at",
      "m.updated_at",
      "m.last_published_at",
      db.raw("u.username as creator_username"),
      db.raw("u.region as creator_region"),
      db.raw(
        "(select count(*) from maps cm where cm.creator_id = m.creator_id and cm.moderation_status <> ?) as creator_maps_count",
        ["removed"],
      ),
      db.raw(
        "(select count(*) from map_tests ct join maps cm on cm.id = ct.map_id where cm.creator_id = m.creator_id) as creator_total_tests",
      ),
      db.raw(
        "(select count(*) from map_votes cv join maps cm on cm.id = cv.map_id where cm.creator_id = m.creator_id and cv.vote = 'like') as creator_total_likes",
      ),
      db.raw(
        "(select count(*) from map_votes v where v.map_id = m.id and v.vote = 'like') as likes_count",
      ),
      db.raw(
        "(select count(*) from map_votes v where v.map_id = m.id and v.vote = 'dislike') as dislikes_count",
      ),
      db.raw(
        "(select count(*) from map_favorites f where f.map_id = m.id) as favorites_count",
      ),
      db.raw(
        "(select count(*) from map_tests t where t.map_id = m.id) as tests_count",
      ),
      db.raw(
        "(select count(*) from map_comments c where c.map_id = m.id) as comments_count",
      ),
      db.raw(
        "(select max(t.created_at) from map_tests t where t.map_id = m.id) as last_activity_at",
      ),
      db.raw(
        "(select vote from map_votes uv where uv.map_id = m.id and uv.user_id = ? limit 1) as user_vote",
        [userId],
      ),
      db.raw(
        "exists(select 1 from map_favorites uf where uf.map_id = m.id and uf.user_id = ?) as user_favorite",
        [userId],
      ),
      db.raw(
        "exists(select 1 from map_tests ut where ut.map_id = m.id and ut.user_id = ?) as user_tested",
        [userId],
      ),
      db.raw(
        "(select count(*) from map_versions mv where mv.map_id = m.id) as versions_count",
      ),
    ])
    .orderBy("m.featured", "desc")
    .orderBy("m.updated_at", "desc");

  if (mapIds?.length) query.whereIn("m.id", mapIds);
  if (creatorId) query.where("m.creator_id", creatorId);

  return (await query) as MapRow[];
}

async function loadTagsByMap(
  db: Knex,
  mapIds: number[],
): Promise<Record<number, TagRow[]>> {
  if (!mapIds.length) return {};

  const rows = (await db("map_map_tags as mt")
    .join("map_tags as t", "t.id", "mt.tag_id")
    .select("mt.map_id", "t.id", "t.slug", "t.label_fr", "t.label_en")
    .whereIn("mt.map_id", mapIds)) as TagRow[];

  return rows.reduce<Record<number, TagRow[]>>((acc, row) => {
    const mapId = toNumber(row.map_id);
    acc[mapId] ??= [];
    acc[mapId].push({
      id: row.id,
      slug: row.slug,
      label_fr: row.label_fr,
      label_en: row.label_en,
    });

    return acc;
  }, {});
}

async function loadScreenshotsByMap(
  db: Knex,
  mapIds: number[],
): Promise<Record<number, ScreenshotRow[]>> {
  if (!mapIds.length) return {};

  const rows = (await db("map_screenshots")
    .select("id", "map_id", "url", "position")
    .whereIn("map_id", mapIds)
    .orderBy("position", "asc")) as ScreenshotRow[];

  return rows.reduce<Record<number, ScreenshotRow[]>>((acc, row) => {
    const mapId = toNumber(row.map_id);
    acc[mapId] ??= [];
    acc[mapId].push(row);

    return acc;
  }, {});
}

async function loadVersionsByMap(
  db: Knex,
  mapIds: number[],
): Promise<Record<number, VersionRow[]>> {
  if (!mapIds.length) return {};

  const rows = (await db("map_versions")
    .select("id", "map_id", "version_number", "release_notes", "created_at")
    .whereIn("map_id", mapIds)
    .orderBy("version_number", "desc")) as VersionRow[];

  return rows.reduce<Record<number, VersionRow[]>>((acc, row) => {
    const mapId = toNumber(row.map_id);
    acc[mapId] ??= [];
    acc[mapId].push(row);

    return acc;
  }, {});
}

function formatComment(row: CommentRow): FormattedComment {
  return {
    id: toNumber(row.id),
    mapId: toNumber(row.map_id),
    author: {
      id: toNumber(row.user_id),
      username: row.username ?? `User ${row.user_id}`,
    },
    content: row.content,
    likes_count: toNumber(row.likes_count),
    user_liked: toBoolean(row.user_liked),
    created_at: toIso(row.created_at),
  };
}

async function loadCommentsByMap(
  db: Knex,
  mapIds: number[],
  userId: number,
): Promise<Record<number, FormattedComment[]>> {
  if (!mapIds.length) return {};

  const rows = (await db("map_comments as c")
    .leftJoin("users as u", "u.id", "c.user_id")
    .select([
      "c.id",
      "c.map_id",
      "c.user_id",
      "c.content",
      "c.created_at",
      db.raw("u.username as username"),
      db.raw(
        "(select count(*) from map_comment_likes cl where cl.comment_id = c.id) as likes_count",
      ),
      db.raw(
        "exists(select 1 from map_comment_likes ucl where ucl.comment_id = c.id and ucl.user_id = ?) as user_liked",
        [userId],
      ),
    ])
    .whereIn("c.map_id", mapIds)
    .orderBy("c.created_at", "desc")) as CommentRow[];

  return rows.reduce<Record<number, FormattedComment[]>>((acc, row) => {
    const mapId = toNumber(row.map_id);
    acc[mapId] ??= [];
    acc[mapId].push(formatComment(row));

    return acc;
  }, {});
}

async function formatMaps(
  db: Knex,
  rows: MapRow[],
  userId: number,
): Promise<FormattedMap[]> {
  const mapIds = rows.map((row) => toNumber(row.id)).filter((id) => id > 0);
  const [tagsByMap, screenshotsByMap, versionsByMap, commentsByMap] =
    await Promise.all([
      loadTagsByMap(db, mapIds),
      loadScreenshotsByMap(db, mapIds),
      loadVersionsByMap(db, mapIds),
      loadCommentsByMap(db, mapIds, userId),
    ]);

  return rows.map((row) => {
    const id = toNumber(row.id);
    const testsCount = toNumber(row.tests_count);
    const likesCount = toNumber(row.likes_count);
    const dislikesCount = toNumber(row.dislikes_count);
    const favoritesCount = toNumber(row.favorites_count);
    const score =
      likesCount * 10 +
      favoritesCount * 15 +
      testsCount * 2 -
      dislikesCount * 4;

    return {
      id,
      title: row.title,
      description: row.description ?? "",
      status: isMapStatus(row.status) ? row.status : "draft",
      moderation_status: isModerationStatus(row.moderation_status)
        ? row.moderation_status
        : "visible",
      featured: toBoolean(row.featured),
      creator: {
        id: toNumber(row.creator_id),
        username: row.creator_username ?? `User ${row.creator_id}`,
        region: row.creator_region ?? "EU-West",
        maps_count: toNumber(row.creator_maps_count),
        total_tests: toNumber(row.creator_total_tests),
        total_likes: toNumber(row.creator_total_likes),
      },
      tags: (tagsByMap[id] ?? []).map((tag) => ({
        id: toNumber(tag.id),
        slug: tag.slug,
        label_fr: tag.label_fr,
        label_en: tag.label_en,
      })),
      screenshots: (screenshotsByMap[id] ?? []).map((screenshot) => ({
        id: toNumber(screenshot.id),
        url: screenshot.url,
        position: toNumber(screenshot.position),
      })),
      grid_data: parseGridData(row.grid_data),
      current_version_number: toNumber(row.current_version_number, 1),
      current_version_id:
        row.current_version_id === null
          ? null
          : toNumber(row.current_version_id),
      versions_count: toNumber(row.versions_count),
      versions: (versionsByMap[id] ?? []).map((version) => ({
        id: toNumber(version.id),
        version_number: toNumber(version.version_number),
        release_notes: version.release_notes ?? "",
        created_at: toIso(version.created_at),
      })),
      comments: commentsByMap[id] ?? [],
      stats: {
        likes_count: likesCount,
        dislikes_count: dislikesCount,
        favorites_count: favoritesCount,
        tests_count: testsCount,
        comments_count: toNumber(row.comments_count),
        score,
        retention:
          testsCount === 0 ? 0 : Math.min(0.95, favoritesCount / testsCount),
        last_activity_at: toIso(row.last_activity_at ?? row.updated_at),
      },
      user_vote: isVoteValue(row.user_vote) ? row.user_vote : null,
      user_favorite: toBoolean(row.user_favorite),
      user_tested: toBoolean(row.user_tested),
      created_at: toIso(row.created_at),
      updated_at: toIso(row.updated_at),
    };
  });
}

async function getFormattedMap(
  db: Knex,
  mapId: number,
  userId: number,
): Promise<FormattedMap | null> {
  const rows = await getMapRows(db, userId, [mapId]);
  const maps = await formatMaps(db, rows, userId);

  return maps[0] ?? null;
}

async function getTopCreators(
  db: Knex,
  maps: FormattedMap[],
): Promise<
  Array<{
    id: number;
    username: string;
    region: string;
    total_tests: number;
    total_likes: number;
    maps_count: number;
    maps: Array<{ id: number; title: string; status: MapStatus }>;
  }>
> {
  const rows = (await db("users as u")
    .join("maps as m", "m.creator_id", "u.id")
    .where("m.moderation_status", "<>", "removed")
    .groupBy("u.id", "u.username", "u.region")
    .select([
      "u.id",
      "u.username",
      "u.region",
      db.raw("count(distinct m.id) as maps_count"),
      db.raw(
        "(select count(*) from map_tests mt join maps mm on mm.id = mt.map_id where mm.creator_id = u.id) as total_tests",
      ),
      db.raw(
        "(select count(*) from map_votes mv join maps mm on mm.id = mv.map_id where mm.creator_id = u.id and mv.vote = 'like') as total_likes",
      ),
    ])
    .orderBy("total_likes", "desc")
    .limit(8)) as TopCreatorRow[];

  return rows.map((row) => {
    const id = toNumber(row.id);

    return {
      id,
      username: row.username ?? `User ${id}`,
      region: row.region ?? "EU-West",
      total_tests: toNumber(row.total_tests),
      total_likes: toNumber(row.total_likes),
      maps_count: toNumber(row.maps_count),
      maps: maps
        .filter((map) => map.creator.id === id)
        .slice(0, 3)
        .map((map) => ({ id: map.id, title: map.title, status: map.status })),
    };
  });
}

function buildBrowseStats(maps: FormattedMap[]) {
  const creatorIds = new Set(maps.map((map) => map.creator.id));

  return {
    totalMaps: maps.length,
    totalCreators: creatorIds.size,
    totalTestsLast24h: maps.reduce(
      (sum, map) => sum + map.stats.tests_count,
      0,
    ),
    topScore: maps.reduce((max, map) => Math.max(max, map.stats.score), 0),
  };
}

async function replaceMapTags(
  trx: Knex.Transaction,
  mapId: number,
  tagIds: number[],
): Promise<void> {
  await trx("map_map_tags").where("map_id", mapId).del();

  if (tagIds.length) {
    await trx("map_map_tags").insert(
      tagIds.map((tagId) => ({ map_id: mapId, tag_id: tagId })),
    );
  }
}

async function replaceScreenshots(
  trx: Knex.Transaction,
  mapId: number,
  screenshots: { url: string; position: number }[],
): Promise<void> {
  await trx("map_screenshots").where("map_id", mapId).del();

  if (screenshots.length) {
    await trx("map_screenshots").insert(
      screenshots.map((screenshot, index) => ({
        map_id: mapId,
        url: screenshot.url,
        position: screenshot.position ?? index,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );
  }
}

async function createVersion(
  trx: Knex.Transaction,
  mapId: number,
  nextVersion: number,
  releaseNotes: string,
): Promise<number> {
  const rows = (await trx("map_versions")
    .insert({
      map_id: mapId,
      version_number: nextVersion,
      release_notes: releaseNotes,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(["id"]));

  const row = rows[0];
  if (!row) throw new Error("Version creation failed");

  return toNumber(row.id);
}

export function createMapsRouter(db: Knex): Router {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const rows = await getMapRows(db, userId);
    const maps = await formatMaps(db, rows, userId);
    const [tags, topCreators] = await Promise.all([
      getTags(db),
      getTopCreators(db, maps),
    ]);
    const stats = buildBrowseStats(maps);

    res.json({
      maps,
      items: maps,
      data: maps,
      tags: tags.map((tag) => ({
        id: toNumber(tag.id),
        slug: tag.slug,
        label_fr: tag.label_fr,
        label_en: tag.label_en,
      })),
      topCreators,
      stats,
      totalMaps: stats.totalMaps,
      totalCreators: stats.totalCreators,
      totalTestsLast24h: stats.totalTestsLast24h,
      topScore: stats.topScore,
    });
  });

  router.get("/tags", async (_req: Request, res: Response) => {
    const tags = await getTags(db);

    res.json(
      tags.map((tag) => ({
        id: toNumber(tag.id),
        slug: tag.slug,
        label_fr: tag.label_fr,
        label_en: tag.label_en,
      })),
    );
  });

  router.get("/mine", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const rows = await getMapRows(db, userId, undefined, userId);
    const maps = await formatMaps(db, rows, userId);

    res.json({ maps, items: maps, data: maps });
  });

  router.get("/activity", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const rows = await getMapRows(db, userId);
    const maps = await formatMaps(db, rows, userId);
    const commentsRows = (await db("map_comments as c")
      .leftJoin("users as u", "u.id", "c.user_id")
      .select([
        "c.id",
        "c.map_id",
        "c.user_id",
        "c.content",
        "c.created_at",
        db.raw("u.username as username"),
        db.raw(
          "(select count(*) from map_comment_likes cl where cl.comment_id = c.id) as likes_count",
        ),
        db.raw(
          "exists(select 1 from map_comment_likes ucl where ucl.comment_id = c.id and ucl.user_id = ?) as user_liked",
          [userId],
        ),
      ])
      .where("c.user_id", userId)
      .orderBy("c.created_at", "desc")) as CommentRow[];

    res.json({
      favorites: maps.filter((map) => map.user_favorite),
      liked: maps.filter((map) => map.user_vote === "like"),
      disliked: maps.filter((map) => map.user_vote === "dislike"),
      tested: maps.filter((map) => map.user_tested),
      comments: commentsRows.map(formatComment),
    });
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const map = await getFormattedMap(db, normalizeMapId(req), userId);

    if (!map) {
      res.status(404).json({ message: "Map not found" });
      return;
    }

    res.json(map);
  });

  router.post(
    "/",
    async (
      req: Request<ParamsDictionary, unknown, SaveMapBody>,
      res: Response,
    ) => {
      const userId = getUserId(req);
      const title =
        typeof req.body.title === "string" ? req.body.title.trim() : "";

      if (!title) {
        res.status(400).json({ message: "Le titre est obligatoire." });
        return;
      }

      const description =
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "";
      const status = sanitizeStatus(req.body.status);
      const moderationStatus = sanitizeModerationStatus(
        req.body.moderation_status,
      );
      const tagIds = extractTagIds(req.body.tags);
      const screenshots = extractScreenshots(req.body.screenshots);
      const gridData = extractGridData(req.body.gridData ?? req.body.grid_data);
      const releaseNotes = getReleaseNotes(req.body);

      const mapId = await db.transaction(async (trx) => {
        const mapRows = (await trx("maps")
          .insert({
            title,
            description,
            creator_id: userId,
            status,
            moderation_status: moderationStatus,
            featured: false,
            grid_data: gridData,
            current_version_number: 1,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning(["id"]));

        const mapRow = mapRows[0];
        if (!mapRow) throw new Error("Map creation failed");

        const newMapId = toNumber(mapRow.id);
        const versionId = await createVersion(trx, newMapId, 1, releaseNotes);

        await trx("maps")
          .where("id", newMapId)
          .update({ current_version_id: versionId });
        await replaceMapTags(trx, newMapId, tagIds);
        await replaceScreenshots(trx, newMapId, screenshots);

        return newMapId;
      });

      const map = await getFormattedMap(db, mapId, userId);
      res.status(201).json(map);
    },
  );

  router.put(
    "/:id",
    async (
      req: Request<{ id: string }, unknown, SaveMapBody>,
      res: Response,
    ) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);
      const existing = await getFormattedMap(db, mapId, userId);

      if (!existing) {
        res.status(404).json({ message: "Map not found" });
        return;
      }

      const patch: Record<string, unknown> = { updated_at: new Date() };

      if (typeof req.body.title === "string")
        patch.title = req.body.title.trim();
      if (typeof req.body.description === "string")
        patch.description = req.body.description.trim();
      if (req.body.status !== undefined)
        patch.status = sanitizeStatus(req.body.status);
      if (req.body.moderation_status !== undefined)
        patch.moderation_status = sanitizeModerationStatus(
          req.body.moderation_status,
        );

      const gridData = extractGridData(req.body.gridData ?? req.body.grid_data);
      if (gridData) patch.grid_data = gridData;

      await db.transaction(async (trx) => {
        const releaseNotes = getReleaseNotes(req.body);
        const shouldCreateVersion = Boolean(
          req.body.releaseNotes ?? req.body.release_notes,
        );

        if (shouldCreateVersion) {
          const nextVersion = existing.current_version_number + 1;
          const versionId = await createVersion(
            trx,
            mapId,
            nextVersion,
            releaseNotes,
          );
          patch.current_version_number = nextVersion;
          patch.current_version_id = versionId;
          patch.last_published_at = new Date();
        }

        await trx("maps").where("id", mapId).update(patch);

        if (req.body.tags !== undefined) {
          await replaceMapTags(trx, mapId, extractTagIds(req.body.tags));
        }

        if (req.body.screenshots !== undefined) {
          await replaceScreenshots(
            trx,
            mapId,
            extractScreenshots(req.body.screenshots),
          );
        }
      });

      const map = await getFormattedMap(db, mapId, userId);
      res.json(map);
    },
  );

  router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
    const userId = getUserId(req);
    const mapId = normalizeMapId(req);
    const existing = await getFormattedMap(db, mapId, userId);

    if (!existing) {
      res.status(404).json({ message: "Map not found" });
      return;
    }

    await db("maps")
      .where("id", mapId)
      .update({ moderation_status: "removed", updated_at: new Date() });
    res.status(204).send();
  });

  router.post(
    "/:id/versions",
    async (
      req: Request<
        { id: string },
        unknown,
        { releaseNotes?: unknown; release_notes?: unknown }
      >,
      res: Response,
    ) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);
      const existing = await getFormattedMap(db, mapId, userId);

      if (!existing) {
        res.status(404).json({ message: "Map not found" });
        return;
      }

      const rawReleaseNotes = req.body.releaseNotes ?? req.body.release_notes;
      const releaseNotes =
        typeof rawReleaseNotes === "string" ? rawReleaseNotes.trim() : "";

      if (!releaseNotes) {
        res
          .status(400)
          .json({ message: "Les notes de version sont obligatoires." });
        return;
      }

      await db.transaction(async (trx) => {
        const nextVersion = existing.current_version_number + 1;
        const versionId = await createVersion(
          trx,
          mapId,
          nextVersion,
          releaseNotes,
        );

        await trx("maps").where("id", mapId).update({
          current_version_number: nextVersion,
          current_version_id: versionId,
          last_published_at: new Date(),
          updated_at: new Date(),
        });
      });

      const map = await getFormattedMap(db, mapId, userId);
      res.json(map);
    },
  );

  router.post(
    "/:id/vote",
    async (req: Request<{ id: string }, unknown, VoteBody>, res: Response) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);
      const vote = req.body.vote;

      if (!isVoteValue(vote)) {
        res.status(400).json({ message: "Vote invalide." });
        return;
      }

      const existing = (await db("map_votes")
        .where({ map_id: mapId, user_id: userId })
        .first()) as { vote: VoteValue } | undefined;

      if (existing?.vote === vote) {
        await db("map_votes").where({ map_id: mapId, user_id: userId }).del();
      } else {
        await db("map_votes")
          .insert({
            map_id: mapId,
            user_id: userId,
            vote,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .onConflict(["map_id", "user_id"])
          .merge({ vote, updated_at: new Date() });
      }

      const map = await getFormattedMap(db, mapId, userId);
      res.json(map);
    },
  );

  router.post(
    "/:id/favorite",
    async (req: Request<{ id: string }>, res: Response) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);
      const existing = (await db("map_favorites")
        .where({ map_id: mapId, user_id: userId })
        .first()) as { map_id: number } | undefined;

      if (existing) {
        await db("map_favorites")
          .where({ map_id: mapId, user_id: userId })
          .del();
      } else {
        await db("map_favorites")
          .insert({ map_id: mapId, user_id: userId, created_at: new Date() })
          .onConflict(["map_id", "user_id"])
          .ignore();
      }

      const map = await getFormattedMap(db, mapId, userId);
      res.json(map);
    },
  );

  router.post(
    "/:id/tests",
    async (req: Request<{ id: string }>, res: Response) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);

      await db("map_tests").insert({
        map_id: mapId,
        user_id: userId,
        created_at: new Date(),
      });

      const map = await getFormattedMap(db, mapId, userId);
      res.json(map);
    },
  );

  router.post(
    "/:id/comments",
    async (
      req: Request<{ id: string }, unknown, CommentBody>,
      res: Response,
    ) => {
      const userId = getUserId(req);
      const mapId = normalizeMapId(req);
      const content =
        typeof req.body.content === "string" ? req.body.content.trim() : "";

      if (!content) {
        res.status(400).json({ message: "Le commentaire est vide." });
        return;
      }

      const commentRows = (await db("map_comments")
        .insert({
          map_id: mapId,
          user_id: userId,
          content,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(["id"]));

      const commentRow = commentRows[0];
      if (!commentRow) throw new Error("Comment creation failed");

      const rows = (await db("map_comments as c")
        .leftJoin("users as u", "u.id", "c.user_id")
        .select([
          "c.id",
          "c.map_id",
          "c.user_id",
          "c.content",
          "c.created_at",
          db.raw("u.username as username"),
          db.raw("0 as likes_count"),
          db.raw("false as user_liked"),
        ])
        .where("c.id", toNumber(commentRow.id))) as CommentRow[];

      const row = rows[0];
      if (!row) throw new Error("Comment not found after creation");

      res.status(201).json(formatComment(row));
    },
  );

  router.post(
    "/comments/:commentId/like",
    async (req: Request<{ commentId: string }>, res: Response) => {
      const userId = getUserId(req);
      const commentId = toNumber(req.params.commentId);

      if (!commentId) {
        res.status(400).json({ message: "Comment id invalide." });
        return;
      }

      const existing = (await db("map_comment_likes")
        .where({ comment_id: commentId, user_id: userId })
        .first()) as { comment_id: number } | undefined;

      if (existing) {
        await db("map_comment_likes")
          .where({ comment_id: commentId, user_id: userId })
          .del();
      } else {
        await db("map_comment_likes")
          .insert({
            comment_id: commentId,
            user_id: userId,
            created_at: new Date(),
          })
          .onConflict(["comment_id", "user_id"])
          .ignore();
      }

      const rows = (await db("map_comments as c")
        .leftJoin("users as u", "u.id", "c.user_id")
        .select([
          "c.id",
          "c.map_id",
          "c.user_id",
          "c.content",
          "c.created_at",
          db.raw("u.username as username"),
          db.raw(
            "(select count(*) from map_comment_likes cl where cl.comment_id = c.id) as likes_count",
          ),
          db.raw(
            "exists(select 1 from map_comment_likes ucl where ucl.comment_id = c.id and ucl.user_id = ?) as user_liked",
            [userId],
          ),
        ])
        .where("c.id", commentId)) as CommentRow[];

      const row = rows[0];

      if (!row) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      res.json(formatComment(row));
    },
  );

  return router;
}

export default createMapsRouter;
