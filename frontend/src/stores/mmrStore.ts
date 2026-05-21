import { defineStore } from 'pinia'

import api from '@/api'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export type MMRData = {
  postgresUserId: number | string
  mmr: number
  rank: string
  history: Array<{ date: string; mmr: number }>
}

export const useMMRStore = defineStore('mmrStore', {
  state: () => ({
    mmrData: null as MMRData | null,
    loading: false,
    error: null as AsyncState['error'],
  }),

  actions: {
    async fetchMMR(pocketbaseUserId: string, modeId: number) {
      return run(this, async () => {
        const { data } = await api.get<MMRData>(`/mmr?pocketbaseUserId=${pocketbaseUserId}&modeId=${modeId}`)
        this.mmrData = data
        return data
      })
    },
  },
})
