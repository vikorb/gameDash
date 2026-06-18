import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import type { BackofficeRankWithDivisions } from './types'

type BackofficeRanksPayload = {
  ranks: BackofficeRankWithDivisions[]
}

function normalizeRanks(payload: BackofficeRanksPayload): BackofficeRankWithDivisions[] {
  return Array.isArray(payload?.ranks)
    ? payload.ranks.map((rank) => ({
        ...rank,
        divisions: Array.isArray(rank.divisions) ? rank.divisions : [],
      }))
    : []
}

export const useBackofficeRanksStore = defineStore('backoffice-ranks', () => {
  const ranks = ref<BackofficeRankWithDivisions[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRanks() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<BackofficeRanksPayload>('/backoffice/ranks')
      ranks.value = normalizeRanks(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les rangs.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const totalDivisions = computed(() => ranks.value.reduce((sum, rank) => sum + rank.divisions.length, 0))

  return {
    ranks,
    loading,
    error,
    totalDivisions,
    fetchRanks,
  }
})
