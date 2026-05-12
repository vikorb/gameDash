export type MapStatus = 'draft' | 'beta' | 'stable'
export type MapVisibility = 'visible' | 'hidden' | 'removed'
export type MapSortKey = 'popular' | 'recent' | 'top' | 'mostTested'
export type MapVote = 'like' | 'dislike' | null

export interface MapCreator {
  id: string
  username: string
  region: string
  avatarSeed: string
  maps_count: number
  total_tests: number
  total_likes: number
}

export interface MapTag {
  id: string
  slug: string
  label_fr: string
  label_en: string
}

export interface MapScreenshot {
  id: string
  url: string
  position: number
}

export interface MapStats {
  tests_count: number
  likes_count: number
  dislikes_count: number
  favorites_count: number
  score: number
  retention: number
  last_activity_at: string
}

export interface MapVersionInfo {
  id: string
  version_number: number
  release_notes: string
  parent_version_id: string | null
  created_at: string
  snapshot_url?: string | null
}

export interface MapItem {
  id: string
  title: string
  description: string
  creator: MapCreator
  tags: MapTag[]
  screenshots: MapScreenshot[]
  status: MapStatus
  visibility: MapVisibility
  featured: boolean
  current_version_number: number
  versions_count: number
  versions: MapVersionInfo[]
  created_at: string
  updated_at: string
  stats: MapStats
  user_vote: MapVote
  is_favorite: boolean
}

export interface MapComment {
  id: string
  mapId: string
  author: { id: string; username: string }
  content: string
  likes_count: number
  user_liked: boolean
  created_at: string
}
