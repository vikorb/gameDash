import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { apiRequest } from '../apiClient'
import { useModerationAuditStore } from './audit'
import type {
  ModerationReport,
  ModerationReportActivity,
  ModerationReportAttachment,
  ModerationReportStatus,
} from './types'

type ReportsListResponse = {
  data: Array<Partial<ModerationReport> & { id: string | number }>
}

type ReportResponse = {
  data: Partial<ModerationReport> & { id: string | number }
}

function normalizeReport(report: Partial<ModerationReport> & { id: string | number }) {
  return {
    id: String(report.id),
    subject: report.subject ?? 'Signalement',
    targetName: report.targetName ?? '—',
    targetType: report.targetType ?? 'user',
    reporterName: report.reporterName ?? '—',
    reason: report.reason ?? '—',
    summary: report.summary ?? '',
    createdAt: report.createdAt ?? new Date().toISOString(),
    updatedAt: report.updatedAt ?? report.createdAt ?? new Date().toISOString(),
    status: report.status ?? 'new',
    severity: report.severity ?? 'medium',
    assignedTo: report.assignedTo ?? null,
    evidence: Array.isArray(report.evidence) ? report.evidence : [],
    replies: Array.isArray(report.replies) ? report.replies : [],
    internalNotes: Array.isArray(report.internalNotes) ? report.internalNotes : [],
    activity: Array.isArray(report.activity) ? report.activity : [],
    attachments: Array.isArray(report.attachments) ? report.attachments : [],
  } satisfies ModerationReport
}

export const useModerationReportsStore = defineStore('moderation-reports', () => {
  const auditStore = useModerationAuditStore()
  const reports = ref<ModerationReport[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function replaceReport(report: ModerationReport) {
    const index = reports.value.findIndex((item) => item.id === report.id)

    if (index === -1) {
      reports.value.unshift(report)
      return
    }

    reports.value[index] = report
  }

  async function fetchReports() {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<ReportsListResponse>('/moderation/reports')
      reports.value = response.data.map(normalizeReport)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les signalements.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshAudit() {
    try {
      await auditStore.fetchAuditEntries()
    } catch {
      // Le journal ne doit pas bloquer l'action principale.
    }
  }

  function getReportById(reportId: string | number) {
    return reports.value.find((report) => String(report.id) === String(reportId)) ?? null
  }

  async function assignReport(reportId: string | number, actorName = 'Administration') {
    const assignedTo = actorName.trim()
    if (!assignedTo) return

    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo, actor: assignedTo }),
    })

    replaceReport(normalizeReport(response.data))
    await refreshAudit()
  }

  async function setReportStatus(
    reportId: string | number,
    status: ModerationReportStatus,
    actorName = 'Administration',
    note?: string,
  ) {
    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actor: actorName, note }),
    })

    replaceReport(normalizeReport(response.data))
    await refreshAudit()
  }

  async function resolveReport(reportId: string | number, actorName = 'Administration', note?: string) {
    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName, note }),
    })

    replaceReport(normalizeReport(response.data))
    await refreshAudit()
  }

  async function dismissReport(reportId: string | number, actorName = 'Administration', note?: string) {
    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ actor: actorName, note }),
    })

    replaceReport(normalizeReport(response.data))
    await refreshAudit()
  }

  async function addReportInternalNote(
    reportId: string | number,
    message: string,
    author = 'Administration',
  ) {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ message: trimmedMessage, actor: author }),
    })

    replaceReport(normalizeReport(response.data))
  }

  async function replyToReport(reportId: string | number, message: string, author = 'Administration') {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ message: trimmedMessage, actor: author }),
    })

    replaceReport(normalizeReport(response.data))
  }

  async function addReportAttachment(
    reportId: string | number,
    payload: Omit<ModerationReportAttachment, 'id' | 'addedAt' | 'addedBy'>,
    actorName = 'Administration',
  ) {
    const response = await apiRequest<ReportResponse>(`/moderation/reports/${reportId}/attachments`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, actor: actorName }),
    })

    replaceReport(normalizeReport(response.data))
  }

  async function removeReportAttachment(
    reportId: string | number,
    attachmentId: string,
    actorName = 'Administration',
  ) {
    const response = await apiRequest<ReportResponse>(
      `/moderation/reports/${reportId}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ actor: actorName }),
      },
    )

    replaceReport(normalizeReport(response.data))
  }

  function pushReportActivity(
    report: ModerationReport,
    entry: Omit<ModerationReportActivity, 'id' | 'createdAt'>,
  ) {
    report.activity.unshift({
      id: `local-activity-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...entry,
    })
  }

  const reportSummary = computed(() => ({
    total: reports.value.length,
    newCount: reports.value.filter((item) => item.status === 'new').length,
    investigatingCount: reports.value.filter((item) => item.status === 'investigating').length,
    resolvedCount: reports.value.filter((item) => item.status === 'resolved').length,
    dismissedCount: reports.value.filter((item) => item.status === 'dismissed').length,
  }))

  return {
    reports,
    loading,
    error,
    reportSummary,
    fetchReports,
    getReportById,
    assignReport,
    setReportStatus,
    resolveReport,
    dismissReport,
    addReportInternalNote,
    replyToReport,
    addReportAttachment,
    removeReportAttachment,
    pushReportActivity,
  }
})
