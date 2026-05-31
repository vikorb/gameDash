import { defineStore } from 'pinia'

import api from '@/api'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'
import type { MapItem } from '@/types/maps'
import { replaceAll, upsertById } from '@/utils/upsert'

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    maps: [] as MapItem[],
    loading: false,
    error: null as AsyncState['error'],
  }),

  actions: {
    async fetchMaps() {
      return run(this, async () => {
        const { data } = await api.get<MapItem[]>('/maps')
        replaceAll(this.maps, data)
        return data
      })
    },

    async saveMap(mapData: Partial<MapItem>) {
      return run(this, async () => {
        const { data } = await api.post<MapItem>('/maps', mapData)
        upsertById(this.maps, data)
        return data
      })
    },

    async fetchMapById(id: number) {
      return run(this, async () => {
        const { data } = await api.get<MapItem>(`/maps/${id}`)
        upsertById(this.maps, data)
        return data
      })
    },
  },
})
