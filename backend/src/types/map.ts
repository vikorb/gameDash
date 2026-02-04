/**
 * Représente la structure exacte de la table 'maps' en base de données
 */
export interface MapRow {
  id: number;
  title: string;
  description: string | null;
  creator_id: number;
  status: string;
  moderation_status: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/**
 * Payload pour la création d'une Map (POST sans ID)
 */
export interface CreateMapDTO {
  title: string;
  creator_id: number;
  description?: string;
  status?: string;
  moderation_status?: string;
}

/**
 * Payload pour la mise à jour d'une Map (POST avec ID / PATCH)
 */
export interface UpdateMapDTO extends Partial<CreateMapDTO> {
  id: number;
}

/**
 * Type utilitaire pour les données brutes reçues de la requête
 * On garde 'unknown' pour forcer la validation
 */
export type MapRequestPayload = {
  [K in keyof (CreateMapDTO & { id?: unknown })]: unknown;
};