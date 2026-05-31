import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}))

vi.mock('@/api', () => ({
  default: apiMock,
}))

vi.mock('../../../src/api', () => ({
  default: apiMock,
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiMock),
    isAxiosError: vi.fn(() => false),
  },
}))

const rankedData = {
  rank: 'Gold',
  division: 'I',
  xp: 1800,
  xpInDivision: 300,
  xpToNext: 200,
  nextDivision: 'Platinum IV',
  nextDivisionMinXp: 2000,
  nextDivisionMaxXp: 2500,
  divisionMaxXp: 2000,
}

async function useFreshRankStore() {
  const { useRankStore } = await import('@/stores/rankStore')
  return useRankStore()
}

describe('Rank Progression Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    apiMock.get.mockResolvedValue({ data: rankedData })
  })

  it('fetches and updates rank for user and mode', async () => {
    const rankStore = await useFreshRankStore()

    await rankStore.fetchRank(1, 1)

    expect(apiMock.get).toHaveBeenCalledWith('/ranks/1/rank?modeId=1')
    expect(rankStore.rankData?.rank).toBe('Gold')
    expect(rankStore.rankData?.division).toBe('I')
    expect(rankStore.rankData?.xp).toBe(1800)
  })

  it('fetches rank without modeId', async () => {
    const rankStore = await useFreshRankStore()

    await rankStore.fetchRank(1)

    expect(apiMock.get).toHaveBeenCalledWith('/ranks/1/rank')
    expect(rankStore.rankData).not.toBeNull()
    expect(rankStore.rankData?.rank).toBe('Gold')
  })

  it('sets loading to false after fetch', async () => {
    const rankStore = await useFreshRankStore()

    await rankStore.fetchRank(1, 1)

    expect(rankStore.loading).toBe(false)
  })

  it('resets rankData between store instances', async () => {
    const store1 = await useFreshRankStore()

    await store1.fetchRank(1, 1)

    expect(store1.rankData?.rank).toBe('Gold')

    setActivePinia(createPinia())

    const store2 = await useFreshRankStore()

    expect(store2.rankData).toBeNull()
  })
})
