import api from '@/api'
import type { ShopItem } from '@/types/shops'

export type RewardItem = Pick<ShopItem, 'id' | 'name' | 'category' | 'rarity' | 'slot' | 'imageSeed'>

export type TaskReward = {
  id: number
  code: string
  name: string
  type: string
  amount: number
  quantity: number
  item: RewardItem | null
}

export type DailyTask = {
  id: number
  code: string
  title: string
  description: string | null
  metricKey: 'play_matches' | 'win_matches' | 'total_kills' | 'total_xp'
  target: number
  progress: number
  completed: boolean
  completedAt: string | null
  dayDate: string
  rewards: TaskReward[]
}

export type DailyTasksResponse = {
  dayDate: string
  modeId?: number
  tasks: DailyTask[]
}

export type TaskHistoryDay = {
  dayDate: string
  tasks: DailyTask[]
}

export type TaskHistoryResponse = {
  history: TaskHistoryDay[]
}

export async function fetchDailyTasks(userId: number, modeId?: number): Promise<DailyTasksResponse> {
  const { data } = await api.get<DailyTasksResponse>('/tasks/daily', {
    params: { userId, modeId },
  })
  return data
}

export async function fetchTaskHistory(userId: number, limitDays = 30, modeId?: number): Promise<TaskHistoryResponse> {
  const { data } = await api.get<TaskHistoryResponse>('/tasks/history', {
    params: { userId, limitDays, modeId },
  })
  return data
}
