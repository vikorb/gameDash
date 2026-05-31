import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMatchHistory } from '../../../src/services/matches'
import { useRateStore } from '../../../src/stores/rateStore'

vi.mock('@/services/matches', () => ({
  fetchMatchHistory: vi.fn(),
}))

const mockFetchMatchHistory = vi.mocked(fetchMatchHistory)

describe('Rate Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetchMatchHistory.mockReset()
  })

  it('fetches totals, wins and computes winrate + kill rate', async () => {
    mockFetchMatchHistory
      .mockResolvedValueOnce({ matches: [], total: 4, limit: 1, offset: 0 })
      .mockResolvedValueOnce({ matches: [], total: 3, limit: 1, offset: 0 })
      .mockResolvedValueOnce({
        matches: [
          { nb_kills: 2 },
          { nb_kills: 4 },
          { nb_kills: 5 },
          { nb_kills: 3 },
        ] as never,
        total: 4,
        limit: 100,
        offset: 0,
      })

    const store = useRateStore()
    await store.fetch(1, 2, '2026-01-01', '2026-12-31')

    expect(store.total).toBe(4)
    expect(store.wins).toBe(3)
    expect(store.totalKills).toBe(14)
    expect(store.winrate).toBe(75)
    expect(store.killRate).toBe(3.5)

    expect(mockFetchMatchHistory).toHaveBeenNthCalledWith(
      1,
      1,
      2,
      undefined,
      '2026-01-01',
      '2026-12-31',
      1,
      0,
    )
    expect(mockFetchMatchHistory).toHaveBeenNthCalledWith(
      2,
      1,
      2,
      'win',
      '2026-01-01',
      '2026-12-31',
      1,
      0,
    )
  })

  it('returns null rates when there is no match', async () => {
    mockFetchMatchHistory
      .mockResolvedValueOnce({ matches: [], total: 0, limit: 1, offset: 0 })
      .mockResolvedValueOnce({ matches: [], total: 0, limit: 1, offset: 0 })

    const store = useRateStore()
    await store.fetch(1)

    expect(store.total).toBe(0)
    expect(store.wins).toBe(0)
    expect(store.totalKills).toBe(0)
    expect(store.winrate).toBeNull()
    expect(store.killRate).toBeNull()
  })

  it('resets state correctly', () => {
    const store = useRateStore()
    store.total = 10
    store.wins = 7
    store.totalKills = 35

    store.reset()

    expect(store.total).toBe(0)
    expect(store.wins).toBe(0)
    expect(store.totalKills).toBe(0)
    expect(store.error).toBeNull()
  })
})
