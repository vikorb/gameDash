import { db } from '../db.js'
import { MapEntity } from '../types/map.entity'
import { MapDTO, CreateMapDTO, UpdateMapDTO } from '../../shared/maps.dto'
import { isMapVisible } from '../algorithms/mapVisibility.algorithm'

const toDTO = (map: MapEntity): MapDTO => ({
  id: map.id,
  title: map.title,
  description: map.description ?? undefined,
  status: map.status,
  createdAt: map.createdAt.toISOString(),
})

export const getMaps = async (): Promise<MapDTO[]> => {
  const rows: MapEntity[] = await db('maps').select('*').orderBy('created_at', 'desc')

  return rows.filter(isMapVisible).map(toDTO)
}

export const saveMap = async (payload: CreateMapDTO | UpdateMapDTO): Promise<MapDTO> => {
  // UPDATE
  if ('id' in payload) {
    const [updated] = await db('maps')
      .where({ id: payload.id })
      .update(
        {
          ...(payload.title && { title: payload.title }),
          ...(payload.description && { description: payload.description }),
          updated_at: new Date(),
        },
        '*',
      )

    if (!updated) {
      throw new Error('MAP_NOT_FOUND')
    }

    return toDTO(updated)
  }

  // CREATE
  const [created] = await db('maps')
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      status: 'draft',
      creator_id: 1,
      moderation_status: 'visible',
      score: 0,
    })
    .returning('*')

  return toDTO(created)
}
