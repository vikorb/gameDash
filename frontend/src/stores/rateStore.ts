import { defineStore } from 'pinia'

import { fetchMatchHistory } from '@/services/matches'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export const useRateStore = defineStore('rate', {
  state: () => ({
    wins: 0,
    total: 0,
    totalKills: 0,
    loading: false,
    error: null as AsyncState['error'],
  }),

  getters: {
    winrate: (state): number | null => {
      if (state.total === 0) return null
      return Math.round((state.wins / state.total) * 100)
    },
    killRate: (state): number | null => {
      if (state.total === 0) return null
      return Math.round((state.totalKills / state.total) * 10) / 10
    },
  },

  actions: {
    async fetch(userId: number, modeId?: number, dateFrom?: string, dateTo?: string) {
      return run(this, async () => {
        const [allMatches, winMatches] = await Promise.all([
          fetchMatchHistory(userId, modeId, undefined, dateFrom, dateTo, 1, 0),
          fetchMatchHistory(userId, modeId, 'win', dateFrom, dateTo, 1, 0),
        ])

        const total = allMatches.total
        let totalKills = 0

        for (let offset = 0; offset < total; offset += 100) {
          const page = await fetchMatchHistory(userId, modeId, undefined, dateFrom, dateTo, 100, offset)
          totalKills += page.matches.reduce((sum, m) => sum + (m.nb_kills ?? 0), 0)
        }

        this.total = total
        this.wins = winMatches.total
        this.totalKills = totalKills
      })
    },

    reset() {
      this.wins = 0
      this.total = 0
      this.totalKills = 0
      this.error = null
    },
  },
})