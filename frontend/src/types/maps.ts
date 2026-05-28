export type IdLike = string | number

export type MapStatus = 'draft' | 'beta' | 'stable'
export type ModerationStatus = 'visible' | 'hidden' | 'removed'
export type MapVote = 'like' | 'dislike'
export type SortKey = 'popular' | 'recent' | 'top' | 'mostTested'
export type BlockType = 'empty' | 'wall' | 'floor' | 'spawn' | 'objective'

export interface MapTag {
  id: number
  slug: string
  label_fr: string
  label_en: string
}

export type MapTagDTO = MapTag

export interface MapScreenshot {
  id: number | string
  url: string
  position: number
}

export interface GridBlock {
  x: number
  y: number
  type: Exclude<BlockType, 'empty'>
  rotation: number
}

export interface GridData {
  blocks: GridBlock[]
  grid_size: number
  version: number
}

export interface MapCreator {
  id: number
  username: string
  region: string
  maps_count: number
  total_tests: number
  total_likes: number
}

export interface MapStats {
  likes_count: number
  dislikes_count: number
  favorites_count: number
  tests_count: number
  comments_count: number
  score: number
  retention: number
  last_activity_at: string
}

export interface MapVersion {
  id: number
  version_number: number
  release_notes: string
  created_at: string
}

export interface MapCommentAuthor {
  id: number | string
  username: string
}

export interface MapComment {
  id: number
  mapId: number
  author: MapCommentAuthor
  content: string
  likes_count: number
  user_liked: boolean
  created_at: string
}

export interface MapItem {
  id: number
  title: string
  description: string
  status: MapStatus
  moderation_status: ModerationStatus
  featured: boolean
  creator: MapCreator
  tags: MapTag[]
  screenshots: MapScreenshot[]
  grid_data: GridData | null
  current_version_number: number
  current_version_id: number | null
  versions_count: number
  versions: MapVersion[]
  comments: MapComment[]
  stats: MapStats
  user_vote: MapVote | null
  user_favorite: boolean
  user_tested: boolean
  created_at: string
  updated_at: string
}

export interface TopCreator {
  id: number
  username: string
  region: string
  maps: Pick<MapItem, 'id' | 'title' | 'status'>[]
  total_tests: number
  total_likes: number
}

export interface MapsListResponse {
  maps: MapItem[]
  tags: MapTag[]
  topCreators: TopCreator[]
}

export interface MapsActivityResponse {
  favorites: MapItem[]
  liked: MapItem[]
  disliked: MapItem[]
  tested: MapItem[]
  comments: MapComment[]
}

export interface MapScreenshotPayload {
  url: string
  position: number
}

export interface MapSavePayload {
  title: string
  description: string
  status: MapStatus
  tags: MapTag[] | number[]
  screenshots: MapScreenshotPayload[]
  gridData?: GridData
  releaseNotes?: string
}

export type MapUpdatePayload = Partial<MapSavePayload>
