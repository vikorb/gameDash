import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRankStore } from '../../../src/stores/rankStore'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
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
      })
    ),
  },
}))

describe('Rank Progression Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches and updates rank for user and mode', async () => {
    const rankStore = useRankStore()
    await rankStore.fetchRank(1, 1)
    expect(rankStore.rankData?.rank).toBe('Gold')
    expect(rankStore.rankData?.division).toBe('I')
    expect(rankStore.rankData?.xp).toBe(1800)
  })

  it('fetches rank without modeId', async () => {
    const rankStore = useRankStore()
    await rankStore.fetchRank(1)
    expect(rankStore.rankData).not.toBeNull()
    expect(rankStore.rankData?.rank).toBe('Gold')
  })

  it('sets loading to false after fetch', async () => {
    const rankStore = useRankStore()
    await rankStore.fetchRank(1, 1)
    expect(rankStore.loading).toBe(false)
  })

  it('resets rankData between store instances', async () => {
    const store1 = useRankStore()
    await store1.fetchRank(1, 1)
    expect(store1.rankData?.rank).toBe('Gold')

    setActivePinia(createPinia())
    const store2 = useRankStore()
    expect(store2.rankData).toBeNull()
  })
})
