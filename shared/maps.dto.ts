export type MapDTO = {
  id: number
  title: string
  description?: string
  status: 'draft' | 'published'
  createdAt: string
}

export type CreateMapDTO = {
  title: string
  description?: string
}

export type UpdateMapDTO = {
  id: number
  title?: string
  description?: string
}
