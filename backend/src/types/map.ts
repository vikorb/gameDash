// ── Statuts ──────────────────────────────────────────────────────────────────

export type MapStatus = "draft" | "beta" | "stable";
export type ModerationStatus = "visible" | "hidden" | "removed" | "review";
export type VoteValue = "like" | "dislike";

// ── Rows bruts (structure exacte des tables) ─────────────────────────────────

export interface MapRow {
  id: number;
  title: string;
  description: string | null;
  creator_id: number;
  status: MapStatus;
  moderation_status: ModerationStatus;
  featured: boolean;
  grid_data: GridData | null;
  current_version_id: number | null;
  current_version_number: number;
  last_published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MapVersionRow {
  id: number;
  map_id: number;
  version_number: number;
  release_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MapScreenshotRow {
  id: number;
  map_id: number;
  url: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface MapTagRow {
  id: number;
  slug: string;
  label_fr: string;
  label_en: string;
}

export interface MapVoteRow {
  id: number;
  map_id: number;
  user_id: number;
  vote: VoteValue;
  created_at: Date;
  updated_at: Date;
}

export interface MapCommentRow {
  id: number;
  map_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// ── Grid data (éditeur 14×14) ─────────────────────────────────────────────────

export type BlockType = "empty" | "wall" | "floor" | "spawn" | "objective";

export interface GridBlock {
  x: number;
  y: number;
  type: BlockType;
  rotation: number;
}

export interface GridData {
  blocks: GridBlock[];
  grid_size: number;
  version: number;
}

// ── DTOs (Create / Update) ────────────────────────────────────────────────────

export interface CreateMapDTO {
  title: string;
  creator_id: number;
  description?: string;
  status?: MapStatus;
  moderation_status?: ModerationStatus;
  grid_data?: GridData;
  tag_ids?: number[];
  screenshots?: Array<{ url: string; position: number }>;
  release_notes?: string; // notes de la v1
}

export interface UpdateMapDTO {
  title?: string;
  description?: string;
  status?: MapStatus;
  grid_data?: GridData;
  tag_ids?: number[];
  screenshots?: Array<{ url: string; position: number }>;
  release_notes?: string; // si fourni → crée une nouvelle version
}

export interface AdminUpdateMapDTO {
  moderation_status?: ModerationStatus;
  featured?: boolean;
}

// ── Payload brut reçu de la requête ──────────────────────────────────────────

export type MapRequestPayload = Record<string, unknown>;

// ── Réponses API enrichies (shape consommée par le frontend) ──────────────────

export interface MapCreatorDTO {
  id: number;
  username: string;
  region: string;
  maps_count: number;
  total_tests: number;
  total_likes: number;
}

export interface MapTagDTO {
  id: number;
  slug: string;
  label_fr: string;
  label_en: string;
}

export interface MapScreenshotDTO {
  id: number;
  url: string;
  position: number;
}

export interface MapVersionDTO {
  id: number;
  version_number: number;
  release_notes: string | null;
  created_at: string;
}

export interface MapStatsDTO {
  score: number;
  likes_count: number;
  dislikes_count: number;
  favorites_count: number;
  tests_count: number;
  tests_last_24h: number;
  retention: number; // ratio favoris / tests, [0,1]
  last_activity_at: string;
}

/** Shape renvoyée pour chaque carte dans les listings */
export interface MapListDTO {
  id: number;
  title: string;
  description: string | null;
  status: MapStatus;
  moderation_status: ModerationStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  creator: MapCreatorDTO;
  current_version_number: number;
  versions_count: number;
  tags: MapTagDTO[];
  screenshots: MapScreenshotDTO[];
  stats: MapStatsDTO;
  user_vote: VoteValue | null;
  is_favorite: boolean;
}

/** Shape renvoyée pour la vue détail (superset de MapListDTO) */
export interface MapDetailDTO extends MapListDTO {
  versions: MapVersionDTO[];
  grid_data: GridData | null;
}

export interface MapCommentDTO {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
  user_liked: boolean;
  author: {
    id: number;
    username: string;
  };
}

/** KPIs globaux – endpoint GET /maps/stats */
export interface MapGlobalStatsDTO {
  total_maps: number;
  total_creators: number;
  tests_last_24h: number;
  top_score: number;
}

/** Créateur enrichi pour le widget Top Créateurs */
export interface TopCreatorDTO {
  id: number;
  username: string;
  region: string;
  total_tests: number;
  total_likes: number;
  maps: Array<{ id: number; title: string }>;
}
