import api from '@/api'

export type MatchTeamPlayer = {
  id: number
  username: string
}

export type MatchTeam = {
  id: number
  name: string
  result: string
  players: MatchTeamPlayer[]
}

export type MatchEntry = {
  match_id: number
  played_at: string
  status: string
  game_mode: { id: number; name: string }
  my_team: { id: number; name: string }
  result: 'win' | 'loss' | 'draw' | 'pending'
  xp_gained: number
  mmr_gained: number
  nb_kills: number
  mmr_before: number | null
  mmr_after: number | null
  mmr_delta: number
  teams: MatchTeam[]
}

export type MatchHistoryResponse = {
  matches: MatchEntry[]
  total: number
  limit: number
  offset: number
}

export async function fetchMatchHistory(
  userId: number,
  modeId?: number,
  result?: string,
  dateFrom?: string,
  dateTo?: string,
  limit = 20,
  offset = 0,
): Promise<MatchHistoryResponse> {
  const params: Record<string, string | number> = { userId, limit, offset }
  if (modeId) params.modeId = modeId
  if (result) params.result = result
  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo
  const { data } = await api.get<MatchHistoryResponse>('/matches', { params })
  return data
}
