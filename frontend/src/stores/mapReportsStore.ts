import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiRequest } from '@/stores/apiClient'

export type MapReportTargetType = 'map' | 'comment' | 'user' | 'hunt' | 'asset'
export type MapReportSeverity = 'low' | 'medium' | 'high' | 'critical'

export type CreateMapReportPayload = {
  targetType: MapReportTargetType
  targetId?: string | number
  targetName: string
  reporterName?: string
  reason: string
  summary: string
  severity?: MapReportSeverity
  mapId?: string | number
  mapTitle?: string
  authorName?: string
  sourceUrl?: string
}

export type CreatedMapReport = {
  id: string | number
  subject: string
  targetType: MapReportTargetType
  targetName: string
  reporterName: string
  reason: string
  summary: string
  severity: MapReportSeverity
  status: 'new' | 'investigating' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
}

type CreateReportResponse = {
  data: CreatedMapReport
}

export const useMapReportsStore = defineStore('map-reports', () => {
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const lastCreatedReport = ref<CreatedMapReport | null>(null)

  async function createMapReport(payload: CreateMapReportPayload) {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await apiRequest<CreateReportResponse>('/moderation/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      lastCreatedReport.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Impossible d'envoyer le signalement."
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    error,
    lastCreatedReport,
    createMapReport,
  }
})
