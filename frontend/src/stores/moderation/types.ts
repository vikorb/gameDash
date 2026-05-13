import type { Ref } from 'vue'

export type ModerationContentStatus = 'visible' | 'hidden' | 'review' | 'restricted'
export type ModerationContentType = 'map' | 'hunt' | 'comment' | 'asset'
export type ModerationSanctionType = 'warning' | 'temporaryBan' | 'permanentBan' | 'mute'
export type ModerationSanctionStatus = 'draft' | 'active' | 'expired' | 'revoked'
export type ModerationAppealStatus = 'pending' | 'accepted' | 'rejected' | 'needsInfo'
export type ModerationResourceType = 'report' | 'content' | 'sanction' | 'appeal' | 'user'

export type ModerationUserRole = 'player' | 'admin' | 'moderator'
export type ModerationUserStatus = 0 | 1 | 2 | 3

export type ModerationSelectedUser = {
  id: number
  pocketbase_user_id: string | null
  username: string | null
  email: string | null
  role: ModerationUserRole
  status: ModerationUserStatus
  region: string | null
  bio: string | null
  language: string | null
  matchmaking_pref: unknown
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type ModerationReportStatus = 'new' | 'investigating' | 'resolved' | 'dismissed'
export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ModerationReportTargetType = 'user' | 'map' | 'hunt' | 'asset'

export type ModerationReportEvidence = {
  id: string
  label: string
  value: string
}

export type ModerationReportReply = {
  id: string
  author: string
  message: string
  createdAt: string
}

export type ModerationReportInternalNote = {
  id: string
  author: string
  message: string
  createdAt: string
}

export type ModerationReportActivity = {
  id: string
  actor: string
  message: string
  createdAt: string
}

export type ModerationReportAttachmentType = 'image' | 'file'

export type ModerationReportAttachment = {
  id: string
  name: string
  type: ModerationReportAttachmentType
  url: string
  mimeType: string
  description: string
  source: 'mock' | 'upload'
  addedBy: string
  addedAt: string
}

export type ModerationReport = {
  id: string
  subject: string
  targetName: string
  targetType: ModerationReportTargetType
  reporterName: string
  reason: string
  summary: string
  createdAt: string
  updatedAt: string
  status: ModerationReportStatus
  severity: ModerationSeverity
  assignedTo: string | null
  evidence: ModerationReportEvidence[]
  replies: ModerationReportReply[]
  internalNotes: ModerationReportInternalNote[]
  activity: ModerationReportActivity[]
  attachments: ModerationReportAttachment[]
}

export type ModerationContentOrigin = 'community' | 'automated' | 'internal'

export type ModerationContentItem = {
  id: string
  title: string
  authorName: string
  type: ModerationContentType
  status: ModerationContentStatus
  category: string
  flagCount: number
  reportsCount: number
  severity: ModerationSeverity
  origin: ModerationContentOrigin
  createdAt: string
  updatedAt: string
  preview: string
  tags: string[]
  lastActionAt: string | null
  lastActionBy: string | null
  moderationNote: string
}

export type ModerationSanctionScope = 'account' | 'chat' | 'ugc' | 'profile' | 'matchmaking'

export type ModerationSanctionEvidence = {
  id: string
  label: string
  value: string
}

export type ModerationSanctionActivity = {
  id: string
  actor: string
  message: string
  createdAt: string
}

export type ModerationSanction = {
  id: string
  targetName: string
  targetEmail: string | null
  type: ModerationSanctionType
  status: ModerationSanctionStatus
  severity: ModerationSeverity
  scope: ModerationSanctionScope
  reason: string
  summary: string
  createdBy: string
  assignedTo: string | null
  createdAt: string
  startAt: string
  endAt: string
  lastUpdatedAt: string
  note: string
  policyLabel: string
  appealCount: number
  relatedReportIds: string[]
  evidence: ModerationSanctionEvidence[]
  activity: ModerationSanctionActivity[]
}

export type ModerationAppeal = {
  id: string
  targetName: string
  sanctionType: ModerationSanctionType
  status: ModerationAppealStatus
  submittedAt: string
  message: string
  decisionNote: string
}

export type ModerationAuditEntry = {
  id: string
  actorName: string
  actionKey:
    | 'report_assigned'
    | 'report_resolved'
    | 'content_hidden'
    | 'content_restored'
    | 'content_review_requested'
    | 'sanction_activated'
    | 'sanction_revoked'
    | 'appeal_accepted'
    | 'appeal_rejected'
    | 'appeal_info_requested'
  resourceType: ModerationResourceType
  resourceLabel: string
  createdAt: string
  metadata: string[]
}

export type ModerationSummaryRef<T> = Ref<T>
