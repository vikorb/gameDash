import { MapEntity } from '../types/map.entity'

export const isMapVisible = (map: MapEntity): boolean => {
  if (map.moderationStatus !== 'visible') return false
  if (map.status === 'archived') return false
  return true
}
