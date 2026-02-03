export type MapStatus = 'draft' | 'beta' | 'stable';
export type ModerationStatus = 'visible' | 'featured' | 'hidden' | 'removed';

export interface GameMap {
  id: number;
  creator_id: number;
  title: string;
  description: string | null;
  status: MapStatus;
  moderation_status: ModerationStatus;
  current_version_id: number | null;
  last_published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
