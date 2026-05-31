import api from '@/api'
import type { GameMode } from '@/types/gameMode'

export async function fetchGameModes(): Promise<GameMode[]> {
  const { data } = await api.get<GameMode[]>('/game-modes')
  return data
}
