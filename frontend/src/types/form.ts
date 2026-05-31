import type { MapItem, MapStatus, ModerationStatus } from '@/types/maps'

export type MapFormData = {
  id?: MapItem['id']
  creator_id: MapItem['creator']['id']
  title: MapItem['title']
  description: MapItem['description']
  status?: MapStatus
  moderation_status?: ModerationStatus
  original?: {
    id: MapItem['id']
    creator_id: MapItem['creator']['id']
    title: MapItem['title']
    description: MapItem['description']
    status: MapItem['status']
    moderation_status: MapItem['moderation_status']
  } | null
}
