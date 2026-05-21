import { defineStore } from 'pinia'

import { fetchMatchHistory, type MatchEntry } from '@/services/matches'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export const useMatchHistoricStore = defineStore('matchHistoric', {
  state: () => ({
    matches: [] as MatchEntry[],
    total: 0,
    limit: 20,
    offset: 0,
    selectedModeId: undefined as number | undefined,
    selectedResult: undefined as string | undefined,
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
    loading: false,
    error: null as AsyncState['error'],
  }),

  getters: {
    currentPage: (state) => Math.floor(state.offset / state.limit) + 1,
    totalPages: (state) => Math.ceil(state.total / state.limit),
    hasNextPage: (state) => state.offset + state.limit < state.total,
    hasPrevPage: (state) => state.offset > 0,
  },

  actions: {
    async fetch(userId: number) {
      return run(this, async () => {
        const res = await fetchMatchHistory(
          userId,
          this.selectedModeId,
          this.selectedResult,
          this.dateFrom,
          this.dateTo,
          this.limit,
          this.offset,
        )
        this.matches = res.matches
        this.total = res.total
      })
    },

    async setMode(userId: number, modeId: number | undefined) {
      this.selectedModeId = modeId
      this.offset = 0
      await this.fetch(userId)
    },

    async setResult(userId: number, result: string | undefined) {
      this.selectedResult = result
      this.offset = 0
      await this.fetch(userId)
    },

    async setDateRange(userId: number, dateFrom: string | undefined, dateTo: string | undefined) {
      this.dateFrom = dateFrom
      this.dateTo = dateTo
      this.offset = 0
      await this.fetch(userId)
    },

    async nextPage(userId: number) {
      if (!this.hasNextPage) return
      this.offset += this.limit
      await this.fetch(userId)
    },

    async prevPage(userId: number) {
      if (!this.hasPrevPage) return
      this.offset = Math.max(0, this.offset - this.limit)
      await this.fetch(userId)
    },

    async setLimit(userId: number, limit: number) {
      if (!Number.isFinite(limit) || limit <= 0) return
      this.limit = limit
      this.offset = 0
      await this.fetch(userId)
    },

    reset() {
      this.matches = []
      this.total = 0
      this.offset = 0
      this.selectedModeId = undefined
      this.selectedResult = undefined
      this.dateFrom = undefined
      this.dateTo = undefined
      this.error = null
    },
  },
})
