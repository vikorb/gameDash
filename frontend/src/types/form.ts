import type { GameMap, MapStatus, ModerationStatus } from '@/types/map'

export type MapFormData = {
  id?: GameMap['id']
  creator_id: GameMap['creator_id']
  title: GameMap['title']
  description: string
  status?: MapStatus
  moderation_status?: ModerationStatus
  original?: Pick<
    GameMap,
    'id' | 'creator_id' | 'title' | 'description' | 'status' | 'moderation_status'
  > | null
}
