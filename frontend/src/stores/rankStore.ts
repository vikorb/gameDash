import { defineStore } from 'pinia'

import api from '@/api'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export type RankData = {
  rank: string
  division: string | null
  xp: number
  xpInDivision: number | null
  xpToNext: number | null
  nextDivision: string | null
  nextDivisionMinXp: number | null
  nextDivisionMaxXp: number | null
  divisionMaxXp: number | null
}

export const useRankStore = defineStore('rankStore', {
  state: () => ({
    rankData: null as RankData | null,
    loading: false,
    error: null as AsyncState['error'],
  }),

  actions: {
    async fetchRank(userId: number, modeId?: number) {
      return run(this, async () => {
        let url = `/ranks/${userId}/rank`
        if (modeId) url += `?modeId=${modeId}`
        const { data } = await api.get<RankData>(url)
        this.rankData = data
        return data
      })
    },
  },
})
