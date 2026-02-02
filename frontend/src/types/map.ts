export type MapStatus = 'draft' | 'beta' | 'stable';
export type ModerationStatus = 'visible' | 'featured' | 'hidden' | 'removed';

export interface GameMap {
  id: number; // BigInt côté DB arrive souvent en number ou string via JSON
  creator_id: number;
  title: string;
  description: string | null;
  status: MapStatus;
  moderation_status: ModerationStatus;
  current_version_id: number | null;
  last_published_at: string | null; // Les dates arrivent en ISO string via l'API
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
