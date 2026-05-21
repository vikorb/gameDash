import { defineStore } from 'pinia'

import { fetchMatchHistory } from '@/services/matches'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export const useWinrateStore = defineStore('winrate', {
  state: () => ({
    wins: 0,
    total: 0,
    loading: false,
    error: null as AsyncState['error'],
  }),

  getters: {
    winrate: (state): number | null => {
      if (state.total === 0) return null
      return Math.round((state.wins / state.total) * 100)
    },
  },

  actions: {
    async fetch(userId: number, modeId?: number) {
      return run(this, async () => {
        const [allMatches, winMatches] = await Promise.all([
          fetchMatchHistory(userId, modeId, undefined, undefined, undefined, 1, 0),
          fetchMatchHistory(userId, modeId, 'win', undefined, undefined, 1, 0),
        ])
        this.total = allMatches.total
        this.wins = winMatches.total
      })
    },

    reset() {
      this.wins = 0
      this.total = 0
      this.error = null
    },
  },
})
