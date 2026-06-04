import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock déclaré AVANT tout import — vi.hoisted garantit l'exécution avant les imports
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

vi.mock('@/services/pocketbase', () => ({
  pb: { authStore: { token: '' } },
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' }),
  },
}))

// On mock le module entier @/api pour retourner notre instance contrôlée
vi.mock('@/api', () => ({ default: apiMock }))

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

describe('Rank Progression Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    apiMock.get.mockResolvedValue({ data: rankedData })
  })

  it('fetches and updates rank for user and mode', async () => {
    const { useRankStore } = await import('@/stores/rankStore')
    const rankStore = useRankStore()

    await rankStore.fetchRank(1, 1)

    expect(apiMock.get).toHaveBeenCalledWith('/ranks/1/rank?modeId=1')
    expect(rankStore.rankData?.rank).toBe('Gold')
    expect(rankStore.rankData?.division).toBe('I')
    expect(rankStore.rankData?.xp).toBe(1800)
  })

  it('fetches rank without modeId', async () => {
    const { useRankStore } = await import('@/stores/rankStore')
    const rankStore = useRankStore()

    await rankStore.fetchRank(1)

    expect(apiMock.get).toHaveBeenCalledWith('/ranks/1/rank')
    expect(rankStore.rankData).not.toBeNull()
    expect(rankStore.rankData?.rank).toBe('Gold')
  })

  it('sets loading to false after fetch', async () => {
    const { useRankStore } = await import('@/stores/rankStore')
    const rankStore = useRankStore()

    await rankStore.fetchRank(1, 1)

    expect(rankStore.loading).toBe(false)
  })

  it('resets rankData between store instances', async () => {
    const { useRankStore } = await import('@/stores/rankStore')
    const store1 = useRankStore()

    await store1.fetchRank(1, 1)
    expect(store1.rankData?.rank).toBe('Gold')

    setActivePinia(createPinia())

    const store2 = useRankStore()
    expect(store2.rankData).toBeNull()
  })
})
