import { defineStore } from 'pinia'

import { mapsApi } from '@/services/mapsApi'
import type {
  IdLike,
  MapComment,
  MapItem,
  MapSavePayload,
  MapStatus,
  MapTag,
  MapUpdatePayload,
  MapVote,
  SortKey,
  TopCreator,
} from '@/types/maps'

const CURRENT_USER_ID = Number(import.meta.env.VITE_DEV_USER_ID ?? 66)

function normalizeId(id: IdLike): number {
  return typeof id === 'number' ? id : Number(id)
}

function upsertMap(list: MapItem[], map: MapItem): MapItem[] {
  const index = list.findIndex((item) => item.id === map.id)

  if (index === -1) {
    return [map, ...list]
  }

  const copy = [...list]
  copy[index] = map
  return copy
}

function uniqueMaps(maps: MapItem[]): MapItem[] {
  return Array.from(new Map(maps.map((map) => [map.id, map])).values())
}

export const useMapsStore = defineStore('maps', {
  state: () => ({
    maps: [] as MapItem[],
    tagLibrary: [] as MapTag[],
    topCreators: [] as TopCreator[],
    myComments: [] as MapComment[],
    search: '',
    selectedTag: '',
    selectedStatus: '' as '' | MapStatus,
    sortKey: 'popular' as SortKey,
    isLoading: false,
    isActivityLoading: false,
    error: null as string | null,
    activityLoaded: false,
  }),

  getters: {
    visibleMaps(state): MapItem[] {
      return state.maps.filter((map) => map.moderation_status !== 'removed')
    },

    filteredMaps(): MapItem[] {
      const search = this.search.trim().toLowerCase()
      let list = this.visibleMaps.filter((map) => map.moderation_status === 'visible')

      if (search) {
        list = list.filter((map) => {
          const haystack = [
            map.title,
            map.description,
            map.creator.username,
            ...map.tags.map((tag) => tag.slug),
            ...map.tags.map((tag) => tag.label_fr),
            ...map.tags.map((tag) => tag.label_en),
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(search)
        })
      }

      if (this.selectedTag) {
        list = list.filter((map) => map.tags.some((tag) => tag.slug === this.selectedTag))
      }

      if (this.selectedStatus) {
        list = list.filter((map) => map.status === this.selectedStatus)
      }

      return [...list].sort((a, b) => {
        if (this.sortKey === 'recent') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        }

        if (this.sortKey === 'top') {
          return b.stats.score - a.stats.score
        }

        if (this.sortKey === 'mostTested') {
          return b.stats.tests_count - a.stats.tests_count
        }

        return b.stats.favorites_count + b.stats.likes_count - (a.stats.favorites_count + a.stats.likes_count)
      })
    },

    featuredMap(): MapItem | null {
      return this.visibleMaps.find((map) => map.featured && map.moderation_status === 'visible') ?? this.filteredMaps[0] ?? null
    },

    totalMaps(): number {
      return this.visibleMaps.filter((map) => map.moderation_status === 'visible').length
    },

    totalCreators(): number {
      return new Set(this.visibleMaps.map((map) => map.creator.id)).size
    },

    totalTestsLast24h(): number {
      return this.visibleMaps.reduce((sum, map) => sum + map.stats.tests_count, 0)
    },

    topScore(): number {
      return Math.max(0, ...this.visibleMaps.map((map) => map.stats.score))
    },

    myMaps(): MapItem[] {
      return this.maps.filter((map) => map.creator.id === CURRENT_USER_ID && map.moderation_status !== 'removed')
    },

    myTotalTests(): number {
      return this.myMaps.reduce((sum, map) => sum + map.stats.tests_count, 0)
    },

    myAvgScore(): number {
      if (!this.myMaps.length) return 0
      return Math.round(this.myMaps.reduce((sum, map) => sum + map.stats.score, 0) / this.myMaps.length)
    },

    myTotalLikes(): number {
      return this.myMaps.reduce((sum, map) => sum + map.stats.likes_count, 0)
    },

    myTopScore(): number {
      return Math.max(0, ...this.myMaps.map((map) => map.stats.score))
    },

    favoriteMaps(): MapItem[] {
      return this.visibleMaps.filter((map) => map.user_favorite)
    },

    likedMaps(): MapItem[] {
      return this.visibleMaps.filter((map) => map.user_vote === 'like')
    },

    dislikedMaps(): MapItem[] {
      return this.visibleMaps.filter((map) => map.user_vote === 'dislike')
    },

    testedMaps(): MapItem[] {
      return this.visibleMaps.filter((map) => map.user_tested)
    },
  },

  actions: {
    isMyMap(id: IdLike): boolean {
      return this.getMap(id)?.creator.id === CURRENT_USER_ID
    },

    getMap(id: IdLike): MapItem | undefined {
      const mapId = normalizeId(id)
      return this.maps.find((map) => map.id === mapId)
    },

    getCommentsForMap(id: IdLike): MapComment[] {
      return this.getMap(id)?.comments ?? []
    },

    replaceMap(map: MapItem): void {
      this.maps = upsertMap(this.maps, map)
    },

    async loadMaps(force = false): Promise<void> {
      if (this.isLoading || (!force && this.maps.length > 0)) return

      this.isLoading = true
      this.error = null

      try {
        const payload = await mapsApi.listMaps()
        this.maps = uniqueMaps(payload.maps)
        this.tagLibrary = payload.tags
        this.topCreators = payload.topCreators
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Impossible de charger les maps.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadMapDetail(id: IdLike): Promise<MapItem> {
      const map = await mapsApi.getMap(id)
      this.replaceMap(map)
      return map
    },

    async loadActivity(force = false): Promise<void> {
      if (this.isActivityLoading || (!force && this.activityLoaded)) return

      this.isActivityLoading = true

      try {
        const payload = await mapsApi.getActivity()
        this.maps = uniqueMaps([
          ...this.maps,
          ...payload.favorites,
          ...payload.liked,
          ...payload.disliked,
          ...payload.tested,
        ])
        this.myComments = payload.comments
        this.activityLoaded = true
      } finally {
        this.isActivityLoading = false
      }
    },

    async createMap(payload: MapSavePayload): Promise<MapItem> {
      const map = await mapsApi.createMap(payload)
      this.replaceMap(map)
      return map
    },

    async updateMap(id: IdLike, payload: MapUpdatePayload): Promise<MapItem> {
      const map = await mapsApi.updateMap(id, payload)
      this.replaceMap(map)
      return map
    },

    async toggleVote(id: IdLike, vote: MapVote): Promise<void> {
      const map = await mapsApi.toggleVote(id, vote)
      this.replaceMap(map)
      await this.loadActivity(true)
    },

    async toggleFavorite(id: IdLike): Promise<void> {
      const map = await mapsApi.toggleFavorite(id)
      this.replaceMap(map)
      await this.loadActivity(true)
    },

    async recordTest(id: IdLike): Promise<void> {
      const map = await mapsApi.recordTest(id)
      this.replaceMap(map)
      await this.loadActivity(true)
    },

    async addComment(id: IdLike, content: string): Promise<void> {
      const comment = await mapsApi.addComment(id, content)
      const map = this.getMap(id)

      if (map) {
        this.replaceMap({
          ...map,
          comments: [comment, ...map.comments],
          stats: {
            ...map.stats,
            comments_count: map.stats.comments_count + 1,
          },
        })
      }

      this.myComments = [comment, ...this.myComments.filter((item) => item.id !== comment.id)]
    },

    async toggleCommentLike(commentId: IdLike): Promise<void> {
      const comment = await mapsApi.toggleCommentLike(commentId)

      this.maps = this.maps.map((map) => ({
        ...map,
        comments: map.comments.map((item) => (item.id === comment.id ? comment : item)),
      }))

      this.myComments = this.myComments.map((item) => (item.id === comment.id ? comment : item))
    },

    async publishVersion(id: IdLike, releaseNotes: string): Promise<MapItem> {
      const map = await mapsApi.publishVersion(id, releaseNotes)
      this.replaceMap(map)
      return map
    },
  },
})
