import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useModerationAuditStore } from './audit'
import { createModerationId, generateReports, MODERATION_MOCK_COUNTS, nowIso } from './mock'
import type {
  ModerationReport,
  ModerationReportActivity,
  ModerationReportAttachment,
  ModerationReportStatus,
} from './types'

function ensureReportCollections(report: ModerationReport) {
  if (!report.evidence) {
    report.evidence = []
  }

  if (!report.replies) {
    report.replies = []
  }

  if (!report.internalNotes) {
    report.internalNotes = []
  }

  if (!report.activity) {
    report.activity = []
  }

  if (!report.attachments) {
    report.attachments = []
  }
}

export const useModerationReportsStore = defineStore('moderation-reports', () => {
  const auditStore = useModerationAuditStore()
  const reports = ref<ModerationReport[]>(generateReports(MODERATION_MOCK_COUNTS.reports))

  function pushReportActivity(
    report: ModerationReport,
    entry: Omit<ModerationReportActivity, 'id' | 'createdAt'>,
  ) {
    ensureReportCollections(report)

    report.activity.unshift({
      id: createModerationId('activity'),
      createdAt: nowIso(),
      ...entry,
    })

    report.updatedAt = nowIso()
  }

  function getReportById(reportId: string | number) {
    return reports.value.find((report) => String(report.id) === String(reportId)) ?? null
  }

  function assignReport(reportId: string | number, actorName = 'Administration') {
    const report = getReportById(reportId)

    if (!report) {
      return
    }

    const trimmedActor = actorName.trim()
    if (!trimmedActor) {
      return
    }

    const previousAssignee = report.assignedTo
    const sameAssignee = previousAssignee === trimmedActor

    if (sameAssignee && report.status !== 'new') {
      return
    }

    report.assignedTo = trimmedActor
    report.updatedAt = nowIso()

    if (report.status === 'new') {
      report.status = 'investigating'
    }

    pushReportActivity(report, {
      actor: trimmedActor,
      message:
        previousAssignee && previousAssignee !== trimmedActor
          ? `Assignment changed from ${previousAssignee} to ${trimmedActor}`
          : `Report assigned to ${trimmedActor}`,
    })

    auditStore.pushAudit({
      actorName: trimmedActor,
      actionKey: 'report_assigned',
      resourceType: 'report',
      resourceLabel: report.subject,
      metadata: [report.id, trimmedActor],
    })
  }

  function setReportStatus(
    reportId: string | number,
    status: ModerationReportStatus,
    actorName = 'Administration',
    note?: string,
  ) {
    const report = getReportById(reportId)

    if (!report) {
      return
    }

    const trimmedActor = actorName.trim()
    const trimmedNote = note?.trim() ?? ''
    const sameStatus = report.status === status

    if (sameStatus && !trimmedNote) {
      return
    }

    report.status = status
    report.updatedAt = nowIso()

    if (!report.assignedTo && trimmedActor) {
      report.assignedTo = trimmedActor
    }

    pushReportActivity(report, {
      actor: trimmedActor || 'Administration',
      message: trimmedNote
        ? `Status changed to ${status}: ${trimmedNote}`
        : `Status changed to ${status}`,
    })
  }

  function resolveReport(reportId: string | number, actorName = 'Administration', note?: string) {
    const report = getReportById(reportId)

    if (!report) {
      return
    }

    setReportStatus(reportId, 'resolved', actorName, note)

    auditStore.pushAudit({
      actorName,
      actionKey: 'report_resolved',
      resourceType: 'report',
      resourceLabel: report.subject,
      metadata: [report.id, 'resolved'],
    })
  }

  function dismissReport(reportId: string | number, actorName = 'Administration', note?: string) {
    setReportStatus(reportId, 'dismissed', actorName, note)
  }

  function addReportInternalNote(
    reportId: string | number,
    message: string,
    author = 'Administration',
  ) {
    const report = getReportById(reportId)
    const trimmedMessage = message.trim()

    if (!report || !trimmedMessage) {
      return
    }

    ensureReportCollections(report)

    report.internalNotes.unshift({
      id: createModerationId('note'),
      author,
      message: trimmedMessage,
      createdAt: nowIso(),
    })

    pushReportActivity(report, {
      actor: author,
      message: 'Internal note added',
    })
  }

  function replyToReport(reportId: string | number, message: string, author = 'Administration') {
    const report = getReportById(reportId)
    const trimmedMessage = message.trim()

    if (!report || !trimmedMessage) {
      return
    }

    ensureReportCollections(report)

    report.replies.unshift({
      id: createModerationId('reply'),
      author,
      message: trimmedMessage,
      createdAt: nowIso(),
    })

    pushReportActivity(report, {
      actor: author,
      message: 'Reply sent on report thread',
    })
  }

  function addReportAttachment(
    reportId: string | number,
    payload: Omit<ModerationReportAttachment, 'id' | 'addedAt' | 'addedBy'>,
    actorName = 'Administration',
  ) {
    const report = getReportById(reportId)

    if (!report) {
      return
    }

    ensureReportCollections(report)

    report.attachments.unshift({
      id: createModerationId('attachment'),
      addedAt: nowIso(),
      addedBy: actorName,
      ...payload,
    })

    pushReportActivity(report, {
      actor: actorName,
      message: `Attachment added: ${payload.name}`,
    })
  }

  function removeReportAttachment(
    reportId: string | number,
    attachmentId: string,
    actorName = 'Administration',
  ) {
    const report = getReportById(reportId)

    if (!report) {
      return
    }

    const attachment = report.attachments.find((item) => item.id === attachmentId)
    if (!attachment) {
      return
    }

    report.attachments = report.attachments.filter((item) => item.id !== attachmentId)
    report.updatedAt = nowIso()

    pushReportActivity(report, {
      actor: actorName,
      message: `Attachment removed: ${attachment.name}`,
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
    reportSummary,
    getReportById,
    assignReport,
    setReportStatus,
    resolveReport,
    dismissReport,
    addReportInternalNote,
    replyToReport,
    addReportAttachment,
    removeReportAttachment,
  }
})
