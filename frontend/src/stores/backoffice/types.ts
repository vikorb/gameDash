export type BackofficePeriodValue = '7d' | '30d' | '90d'
export type BackofficeRankKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'
export type BackofficeActivityType = 'match' | 'transaction' | 'map' | 'sanction'

export type BackofficePeriodSnapshot = {
  activeUsers: number
  matchesPerDay: number
  transactionsPerDay: number
  mapsPublished: number
  virtualRevenue: number
  pendingReports: number
}

export type BackofficeTrend = {
  value: string
  direction: 'up' | 'down'
}

export type BackofficeDashboardData = {
  period: BackofficePeriodValue
  snapshot: BackofficePeriodSnapshot
  trends: Record<keyof BackofficePeriodSnapshot, BackofficeTrend>
  rankDistribution: Array<{ key: BackofficeRankKey; count: number; percentage: number }>
  topMaps: Array<{ id: number; title: string; author: string; tests: number; rating: number }>
  topCreators: Array<{ id: number; name: string; mapsPublished: number; totalTests: number }>
  recentActivity: Array<{ id: number; type: BackofficeActivityType; actor: string; target?: string | null; timestamp: string }>
}

export type BackofficeMatchmakingModeKey = 'ranked' | 'casual' | 'fun'

export type BackofficeMatchmakingMode = {
  id: number
  key: BackofficeMatchmakingModeKey
  enabled: boolean
  maxWaitTimeSec: number
  mmrWindow: number
  teamSize: number
  playersInQueue: number
  matchesLastHour: number
  lastUpdatedAt: string
  lastUpdatedBy: string
}

export type BackofficeMatchmakingAuditEntry = {
  id: number
  modeKey: BackofficeMatchmakingModeKey
  actor: string
  changes: string[]
  timestamp: string
}

export type BackofficeMatchmakingSummary = {
  totalInQueue: number
  avgWaitSeconds: number
  lastUpdateAt: string
  lastUpdateActor: string
}

export type BackofficeRankDivision = {
  id: number
  name: string
  order: number
  minXp: number
  maxXp: number
}

export type BackofficeRankWithDivisions = {
  id: number
  name: string
  minXp: number
  maxXp: number
  divisionCount: number
  divisions: BackofficeRankDivision[]
}
