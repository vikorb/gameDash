import type {
  ModerationAppeal,
  ModerationAppealStatus,
  ModerationAuditEntry,
  ModerationContentItem,
  ModerationContentOrigin,
  ModerationContentStatus,
  ModerationContentType,
  ModerationReport,
  ModerationReportAttachment,
  ModerationReportAttachmentType,
  ModerationReportStatus,
  ModerationReportTargetType,
  ModerationResourceType,
  ModerationSanction,
  ModerationSanctionScope,
  ModerationSanctionStatus,
  ModerationSanctionType,
  ModerationSeverity,
} from './types'

export const MODERATION_MOCK_COUNTS = {
  reports: 24,
  contentItems: 24,
  sanctions: 18,
  appeals: 16,
  auditEntries: 40,
} as const

function createSeededRandom(seed: number) {
  let current = seed

  return () => {
    current = Math.trunc(current)
    current = Math.trunc(current + 0x6d2b79f5)
    let t = Math.imul(current ^ (current >>> 15), 1 | current)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = createSeededRandom(20260408)

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!
}

function pickIndex(max: number): number {
  return Math.floor(random() * max)
}

function pickManyUnique<T>(items: readonly T[], min: number, max: number): T[] {
  if (!items.length) {
    return []
  }

  const upper = Math.max(min, max)
  const count = Math.min(items.length, Math.floor(random() * (upper - min + 1)) + min)
  const results: T[] = []

  while (results.length < count) {
    const candidate = pickOne(items)

    if (!results.includes(candidate)) {
      results.push(candidate)
    }
  }

  return results
}

function pad(value: number): string {
  return String(value).padStart(4, '0')
}

export function createModerationId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function nowIso() {
  return new Date().toISOString()
}

function isoRelative(params: { days?: number; hours?: number; minutes?: number } = {}) {
  const date = new Date()

  if (params.days) {
    date.setDate(date.getDate() + params.days)
  }

  if (params.hours) {
    date.setHours(date.getHours() + params.hours)
  }

  if (params.minutes) {
    date.setMinutes(date.getMinutes() + params.minutes)
  }

  return date.toISOString()
}

function randomRecentIso() {
  return isoRelative({
    days: -pickIndex(8),
    hours: -pickIndex(24),
    minutes: -pickIndex(60),
  })
}

function randomFutureIso() {
  return isoRelative({
    days: pickIndex(7) + 1,
    hours: pickIndex(24),
    minutes: pickIndex(60),
  })
}

function isoBetween(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return endIso
  }

  return new Date(start + Math.floor(random() * (end - start))).toISOString()
}

const playerNames = [
  'ShadowWolf',
  'Luma',
  'NovaQuest',
  'Keiji',
  'Milo',
  'DrakoZen',
  'NightPulse',
  'PixelNova',
]

const moderatorNames = ['Alicia', 'Nora', 'Leo', 'Maya', 'Ethan']

const mapNames = ['Ancient Harbor', 'Crystal Vault', 'Skyline District', 'Frozen Gate']
const huntNames = ['Temple Run #14', 'Metro Echo', 'Lost Relay', 'North Beacon']
const assetNames = ['winter_header_v3.png', 'shadow_banner_alt.png', 'promo_card_gold.png']
const commentTitles = [
  'Message dans le salon global',
  'Commentaire sous une carte',
  'Annonce communautaire',
]

const reportSubjects = [
  'Harcèlement répété en chat public',
  'Carte suspecte en zone publique',
  'Exploit sur une chasse communautaire',
  'Upload d’asset hors charte',
  'Spam publicitaire en commentaires',
]

const reportReasons = [
  'Insultes répétées',
  'Texte jugé inapproprié',
  'Contournement de mécanique',
  'Visuel potentiellement non conforme',
  'Signalement multiple par la communauté',
]

const reportSummaries = [
  'Le contenu a été remonté par plusieurs utilisateurs et nécessite une vérification prioritaire.',
  'Une revue est nécessaire pour confirmer la conformité avec les règles de publication.',
  'Le signalement contient suffisamment de contexte pour justifier une analyse manuelle.',
]

const contentCategories = ['Exploration', 'Puzzle', 'Urbain', 'Aventure', 'Communauté']

const contentPreviews = [
  'Contenu actuellement surveillé à la suite de plusieurs retours utilisateurs.',
  'Publication visible publiquement et faisant l’objet d’un suivi de conformité.',
  'Élément récemment partagé avec plusieurs signaux remontés par la communauté.',
]

const contentTags = [
  'toxicity',
  'spam',
  'nudity',
  'exploit',
  'copyright',
  'off-topic',
  'impersonation',
  'unsafe-link',
  'hate-speech',
]

const contentModerationNotes = [
  'À surveiller après plusieurs remontées sur une courte période.',
  'Contenu à revoir avec le contexte de publication avant décision finale.',
  'Masquage préventif recommandé en attente d’une validation humaine.',
  'Peut être restauré si le contexte confirme la conformité.',
]

const sanctionReasons = [
  'Comportement toxique répété',
  'Commentaires provocateurs',
  'Flood dans le chat global',
  'Pseudo trompeur',
]

const sanctionNotes = [
  'Mesure appliquée après vérification des signalements disponibles.',
  'Action préparée dans l’attente d’une validation complémentaire.',
  'Décision historisée pour conserver une trace claire du dossier.',
]

const appealMessages = [
  'Je souhaite une réévaluation complète de la décision prise à mon encontre.',
  'Je reconnais une partie des faits mais conteste la sévérité de la mesure.',
  'Je peux apporter du contexte complémentaire pour éclairer la décision.',
]

const appealDecisionNotes = [
  'La demande a été acceptée après réexamen du dossier.',
  'La décision initiale a été maintenue après analyse.',
  'Des informations complémentaires ont été demandées avant décision finale.',
]

const auditActions: ModerationAuditEntry['actionKey'][] = [
  'report_assigned',
  'report_resolved',
  'content_hidden',
  'content_restored',
  'content_review_requested',
  'sanction_activated',
  'sanction_revoked',
  'appeal_accepted',
  'appeal_rejected',
  'appeal_info_requested',
]

function generateTarget(type: ModerationReportTargetType) {
  switch (type) {
    case 'user':
      return pickOne(playerNames)
    case 'map':
      return pickOne(mapNames)
    case 'hunt':
      return pickOne(huntNames)
    case 'asset':
      return pickOne(assetNames)
  }
}

function buildContentSeverity(
  flagCount: number,
  status: ModerationContentStatus,
): ModerationSeverity {
  if (status === 'hidden' || status === 'restricted') {
    return pickOne(['high', 'critical'])
  }

  if (flagCount >= 7) {
    return pickOne(['high', 'critical'])
  }

  if (flagCount >= 4) {
    return pickOne(['medium', 'high'])
  }

  return pickOne(['low', 'medium'])
}

export function generateReports(count: number): ModerationReport[] {
  const targetTypes: ModerationReportTargetType[] = ['user', 'map', 'hunt', 'asset']
  const severities: ModerationSeverity[] = ['low', 'medium', 'high', 'critical']
  const statuses: ModerationReportStatus[] = ['new', 'investigating', 'resolved', 'dismissed']

  return Array.from({ length: count }, (_, index) => {
    const createdAt = randomRecentIso()
    const status = pickOne(statuses)
    const targetType = pickOne(targetTypes)
    const assignedTo = status === 'new' ? null : pickOne(moderatorNames)
    const attachments = buildMockReportAttachments(index)

    return {
      id: `rep-${pad(index + 1)}`,
      subject: pickOne(reportSubjects),
      targetName: generateTarget(targetType),
      targetType,
      reporterName: pickOne(playerNames),
      reason: pickOne(reportReasons),
      severity: pickOne(severities),
      status,
      createdAt,
      updatedAt: createdAt,
      assignedTo,
      summary: pickOne(reportSummaries),
      evidence: [
        { id: createModerationId('evidence'), label: 'Reference', value: `REP-${pad(index + 1)}` },
        {
          id: createModerationId('evidence'),
          label: 'Channel',
          value: pickOne(['Chat', 'Map', 'Hunt', 'Asset']),
        },
      ],
      replies: [],
      internalNotes: [],
      activity: buildInitialReportActivity({ createdAt, assignedTo, status }),
      attachments,
    }
  })
}

export function generateContentItems(count: number): ModerationContentItem[] {
  const statuses: ModerationContentStatus[] = ['visible', 'hidden', 'review', 'restricted']
  const types: ModerationContentType[] = ['map', 'hunt', 'comment', 'asset']
  const origins: ModerationContentOrigin[] = ['community', 'automated', 'internal']

  return Array.from({ length: count }, (_, index) => {
    const type = pickOne(types)
    const status = pickOne(statuses)
    const flagCount = pickIndex(12)
    const reportsCount = flagCount === 0 ? 0 : Math.min(flagCount, pickIndex(4) + 1)
    const severity = buildContentSeverity(flagCount, status)
    const createdAt = randomRecentIso()
    const updatedAt = isoBetween(createdAt, nowIso())
    const lastActionAt = status === 'visible' && flagCount < 2 ? null : updatedAt
    const lastActionBy = lastActionAt ? pickOne(moderatorNames) : null

    let title = ''

    switch (type) {
      case 'map':
        title = `${pickOne(mapNames)} ${index + 1}`
        break
      case 'hunt':
        title = `${pickOne(huntNames)} ${index + 1}`
        break
      case 'comment':
        title = `${pickOne(commentTitles)} #${index + 1}`
        break
      case 'asset':
        title = `${pickOne(assetNames).replace(/\.(png|webp)$/u, '')}_${index + 1}.png`
        break
    }

    return {
      id: `cnt-${pad(index + 1)}`,
      title,
      authorName: pickOne(playerNames),
      type,
      status,
      category: pickOne(contentCategories),
      flagCount,
      reportsCount,
      severity,
      origin: pickOne(origins),
      createdAt,
      updatedAt,
      preview: pickOne(contentPreviews),
      tags: pickManyUnique(contentTags, 1, 3),
      lastActionAt,
      lastActionBy,
      moderationNote: status === 'visible' && flagCount < 3 ? '' : pickOne(contentModerationNotes),
    }
  })
}

const sanctionScopes: ModerationSanctionScope[] = [
  'account',
  'chat',
  'ugc',
  'profile',
  'matchmaking',
]

export function generateSanctions(count: number): ModerationSanction[] {
  const types: ModerationSanctionType[] = ['warning', 'temporaryBan', 'permanentBan', 'mute']

  return Array.from({ length: count }, (_, index) => {
    const type = pickOne(types)
    const status = pickOne(getAllowedSanctionStatuses(type))
    const targetName = pickOne(playerNames)
    const createdBy = pickOne(moderatorNames)
    const assignedTo = status === 'draft' && pickIndex(10) < 4 ? null : pickOne(moderatorNames)
    const createdAt = randomRecentIso()
    const startAt = status === 'draft' ? randomFutureIso() : isoBetween(createdAt, nowIso())
    const endAt = getSanctionEndAt(type, status)
    const scope = pickOne(sanctionScopes)

    return {
      id: `san-${pad(index + 1)}`,
      targetName,
      targetEmail: `${sanitizeEmailHandle(targetName)}@gamedash.test`,
      type,
      status,
      severity: getSanctionSeverity(type, status),
      scope,
      reason: pickOne(sanctionReasons),
      summary: pickOne(sanctionSummaries),
      createdBy,
      assignedTo,
      createdAt,
      startAt,
      endAt,
      lastUpdatedAt: isoBetween(createdAt, nowIso()),
      note: pickOne(sanctionNotes),
      policyLabel: pickOne(sanctionPolicies),
      appealCount: status === 'revoked' ? pickIndex(2) + 1 : pickIndex(3),
      relatedReportIds: pickManyUnique(reportReferencePool, 1, 3),
      evidence: buildSanctionEvidence(index, scope),
      activity: buildSanctionActivity({
        createdAt,
        createdBy,
        assignedTo,
        status,
        targetName,
      }),
    }
  })
}

export function generateAppeals(count: number): ModerationAppeal[] {
  const statuses: ModerationAppealStatus[] = ['pending', 'accepted', 'rejected', 'needsInfo']
  const sanctionTypes: ModerationSanctionType[] = [
    'warning',
    'temporaryBan',
    'permanentBan',
    'mute',
  ]

  return Array.from({ length: count }, (_, index) => {
    const status = pickOne(statuses)

    return {
      id: `app-${pad(index + 1)}`,
      targetName: pickOne(playerNames),
      sanctionType: pickOne(sanctionTypes),
      status,
      submittedAt: randomRecentIso(),
      message: pickOne(appealMessages),
      decisionNote: status === 'pending' ? '' : pickOne(appealDecisionNotes),
    }
  })
}

export function generateAuditEntries(count: number): ModerationAuditEntry[] {
  const resourceTypes: ModerationResourceType[] = [
    'report',
    'content',
    'sanction',
    'appeal',
    'user',
  ]

  return Array.from({ length: count }, (_, index) => {
    const resourceType = pickOne(resourceTypes)

    return {
      id: `audit-${pad(index + 1)}`,
      actorName: pickOne(moderatorNames),
      actionKey: pickOne(auditActions),
      resourceType,
      resourceLabel: `${resourceType.toUpperCase()}-${index + 1}`,
      createdAt: randomRecentIso(),
      metadata: [`ref-${index + 1}`, pickOne(['manual', 'review', 'priority', 'escalated'])],
    }
  })
}

export type MockReportAssetCatalogItem = {
  key: string
  name: string
  type: ModerationReportAttachmentType
  url: string
  mimeType: string
}

const assetModules = import.meta.glob('./*.{png,jpg,jpeg,webp,svg,pdf,txt,doc,docx}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getFileName(path: string) {
  return path.split('/').pop() ?? path
}

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function getAttachmentType(ext: string): ModerationReportAttachmentType {
  return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) ? 'image' : 'file'
}

function getMimeType(ext: string) {
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'pdf':
      return 'application/pdf'
    case 'txt':
      return 'text/plain'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    default:
      return 'application/octet-stream'
  }
}

export const mockReportAssetCatalog: MockReportAssetCatalogItem[] = Object.entries(assetModules)
  .map(([path, url]) => {
    const name = getFileName(path)
    const ext = getExtension(name)

    return {
      key: path,
      name,
      type: getAttachmentType(ext),
      url,
      mimeType: getMimeType(ext),
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export const mockReportImageCatalog = mockReportAssetCatalog.filter((item) => item.type === 'image')
export const mockReportFileCatalog = mockReportAssetCatalog.filter((item) => item.type === 'file')

function buildMockReportAttachments(index: number): ModerationReportAttachment[] {
  if (!mockReportAssetCatalog.length) {
    return []
  }

  if (index % 3 !== 0 && index % 5 !== 0) {
    return []
  }

  const firstAsset = mockReportAssetCatalog[index % mockReportAssetCatalog.length]

  if (!firstAsset) {
    return []
  }

  const secondAsset =
    mockReportAssetCatalog[(index + 1) % mockReportAssetCatalog.length] ?? firstAsset

  const pickedAssets = index % 2 === 0 ? [firstAsset] : [firstAsset, secondAsset]

  return pickedAssets.map((asset, assetIndex) => ({
    id: createModerationId('attachment'),
    name: asset.name,
    type: asset.type,
    url: asset.url,
    mimeType: asset.mimeType,
    description:
      asset.type === 'image'
        ? 'Pièce jointe fournie pour illustrer le signalement.'
        : 'Document ajouté au dossier pour appuyer l’analyse.',
    source: 'mock',
    addedBy: assetIndex === 0 ? 'Reporter' : 'System',
    addedAt: randomRecentIso(),
  }))
}

function buildInitialReportActivity(params: {
  createdAt: string
  assignedTo: string | null
  status: ModerationReportStatus
}): ModerationReport['activity'] {
  const items: ModerationReport['activity'] = [
    {
      id: createModerationId('activity'),
      actor: 'System',
      message: 'Report created',
      createdAt: params.createdAt,
    },
  ]

  if (params.assignedTo) {
    items.push({
      id: createModerationId('activity'),
      actor: params.assignedTo,
      message: `Report assigned to ${params.assignedTo}`,
      createdAt: randomRecentIso(),
    })
  }

  if (params.status === 'resolved') {
    items.push({
      id: createModerationId('activity'),
      actor: params.assignedTo ?? 'Administration',
      message: 'Status changed to resolved',
      createdAt: randomRecentIso(),
    })
  }

  if (params.status === 'dismissed') {
    items.push({
      id: createModerationId('activity'),
      actor: params.assignedTo ?? 'Administration',
      message: 'Status changed to dismissed',
      createdAt: randomRecentIso(),
    })
  }

  return items
}

const sanctionSummaries = [
  'La sanction a été préparée à partir de plusieurs éléments concordants et nécessite un suivi précis.',
  'La mesure s’inscrit dans un cadre de modération progressif avec possibilité de réévaluation.',
  'Le dossier contient des éléments suffisants pour justifier une action et conserver une traçabilité complète.',
]

const sanctionPolicies = [
  'Respect des échanges communautaires',
  'Charte de publication',
  'Protection des utilisateurs',
  'Règles de comportement compétitif',
]

const reportReferencePool = Array.from(
  { length: MODERATION_MOCK_COUNTS.reports },
  (_, index) => `rep-${pad(index + 1)}`,
)

function sanitizeEmailHandle(value: string) {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '.')
    .replace(/^\.+|\.+$/gu, '')

  return sanitized || 'player'
}

function getAllowedSanctionStatuses(type: ModerationSanctionType): ModerationSanctionStatus[] {
  switch (type) {
    case 'temporaryBan':
    case 'mute':
      return ['draft', 'active', 'expired', 'revoked']
    case 'warning':
    case 'permanentBan':
      return ['draft', 'active', 'revoked']
  }
}

function getSanctionSeverity(
  type: ModerationSanctionType,
  status: ModerationSanctionStatus,
): ModerationSeverity {
  if (status === 'revoked') {
    return pickOne(['low', 'medium'])
  }

  switch (type) {
    case 'warning':
      return pickOne(['low', 'medium'])
    case 'mute':
      return pickOne(['medium', 'high'])
    case 'temporaryBan':
      return pickOne(['medium', 'high'])
    case 'permanentBan':
      return pickOne(['high', 'critical'])
  }
}

export function getDefaultSanctionEndAt(type: ModerationSanctionType) {
  switch (type) {
    case 'temporaryBan':
      return isoRelative({ days: 3 + pickIndex(5), hours: pickIndex(12) })
    case 'mute':
      return isoRelative({ hours: 12 + pickIndex(72) })
    default:
      return ''
  }
}

function getSanctionEndAt(type: ModerationSanctionType, status: ModerationSanctionStatus) {
  if (type !== 'temporaryBan' && type !== 'mute') {
    return ''
  }

  switch (status) {
    case 'draft':
    case 'active':
      return getDefaultSanctionEndAt(type)
    case 'expired':
      return isoRelative({ days: -(pickIndex(5) + 1), hours: -pickIndex(18) })
    case 'revoked':
      return isoRelative({ hours: -(pickIndex(24) + 1), minutes: -pickIndex(60) })
  }
}

function buildSanctionEvidence(
  index: number,
  scope: ModerationSanctionScope,
): ModerationSanction['evidence'] {
  return [
    {
      id: createModerationId('sanction-evidence'),
      label: 'Reference',
      value: `SAN-${pad(index + 1)}`,
    },
    {
      id: createModerationId('sanction-evidence'),
      label: 'Scope',
      value: scope,
    },
    {
      id: createModerationId('sanction-evidence'),
      label: 'Reports',
      value: pickOne(reportReferencePool),
    },
  ]
}

function buildSanctionActivity(params: {
  createdAt: string
  createdBy: string
  assignedTo: string | null
  status: ModerationSanctionStatus
  targetName: string
}): ModerationSanction['activity'] {
  const items: ModerationSanction['activity'] = [
    {
      id: createModerationId('sanction-activity'),
      actor: params.createdBy,
      message: `Draft created for ${params.targetName}`,
      createdAt: params.createdAt,
    },
  ]

  if (params.assignedTo) {
    items.push({
      id: createModerationId('sanction-activity'),
      actor: 'System',
      message: `Case assigned to ${params.assignedTo}`,
      createdAt: isoBetween(params.createdAt, nowIso()),
    })
  }

  if (params.status === 'active') {
    items.push({
      id: createModerationId('sanction-activity'),
      actor: params.assignedTo ?? params.createdBy,
      message: 'Sanction activated',
      createdAt: isoBetween(params.createdAt, nowIso()),
    })
  }

  if (params.status === 'expired') {
    items.push({
      id: createModerationId('sanction-activity'),
      actor: 'System',
      message: 'Sanction expired automatically',
      createdAt: isoBetween(params.createdAt, nowIso()),
    })
  }

  if (params.status === 'revoked') {
    items.push({
      id: createModerationId('sanction-activity'),
      actor: params.assignedTo ?? params.createdBy,
      message: 'Sanction revoked',
      createdAt: isoBetween(params.createdAt, nowIso()),
    })
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
