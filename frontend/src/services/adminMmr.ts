import api from '@/api'

export type AverageMMRPoint = {
  date: string
  averageMMR: number
  sampleSize: number
}

type AverageMMRHistoryResponse = {
  history: AverageMMRPoint[]
}

export async function fetchAverageMMRHistory(params: {
  modeId?: number
  dateFrom?: string
  dateTo?: string
}): Promise<AverageMMRPoint[]> {
  const { data } = await api.get<AverageMMRHistoryResponse>('/mmr/average-history', {
    params,
  })

  return data.history
}
