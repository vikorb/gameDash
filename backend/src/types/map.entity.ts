export type MapEntity = {
  id: number
  title: string
  description: string | null
  status: 'draft' | 'published' | 'archived'

  // infos internes
  creatorId: number
  moderationStatus: 'visible' | 'hidden'
  score: number

  createdAt: Date
  updatedAt: Date
}
