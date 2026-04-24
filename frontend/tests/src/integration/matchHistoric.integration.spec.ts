import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMatchHistoricStore } from '../../../src/stores/matchHistoricStore'

const mockMatch = {
  match_id: 1,
  played_at: '2026-04-01T10:00:00Z',
  status: 'finished',
  game_mode: { id: 1, name: 'Classé' },
  my_team: { id: 1, name: 'Team A' },
  result: 'win' as const,
  xp_gained: 120,
  mmr_gained: 25,
  mmr_before: 1500,
  mmr_after: 1525,
  mmr_delta: 25,
  teams: [
    { id: 1, name: 'Team A', result: 'win', players: [{ id: 1, username: 'alice' }] },
    { id: 2, name: 'Team B', result: 'loss', players: [{ id: 2, username: 'bob' }] },
  ],
}

vi.mock('@/services/matches', () => ({
  fetchMatchHistory: vi.fn(() =>
    Promise.resolve({
      matches: [mockMatch],
      total: 1,
      limit: 20,
      offset: 0,
    }),
  ),
}))

describe('MatchHistoric Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches and stores match history', async () => {
    const store = useMatchHistoricStore()
    await store.fetch(1)
    expect(store.matches).toHaveLength(1)
    expect(store.matches[0].result).toBe('win')
    expect(store.total).toBe(1)
  })

  it('sets loading to false after fetch', async () => {
    const store = useMatchHistoricStore()
    await store.fetch(1)
    expect(store.loading).toBe(false)
  })

  it('filters by mode via setMode and resets offset', async () => {
    const store = useMatchHistoricStore()
    store.offset = 20
    await store.setMode(1, 1)
    expect(store.selectedModeId).toBe(1)
    expect(store.offset).toBe(0)
    expect(store.matches).toHaveLength(1)
  })

  it('filters by result via setResult and resets offset', async () => {
    const store = useMatchHistoricStore()
    store.offset = 20
    await store.setResult(1, 'win')
    expect(store.selectedResult).toBe('win')
    expect(store.offset).toBe(0)
  })

  it('filters by date range via setDateRange and resets offset', async () => {
    const store = useMatchHistoricStore()
    store.offset = 20
    await store.setDateRange(1, '2026-01-01', '2026-04-30')
    expect(store.dateFrom).toBe('2026-01-01')
    expect(store.dateTo).toBe('2026-04-30')
    expect(store.offset).toBe(0)
  })

  it('navigates to next page', async () => {
    const store = useMatchHistoricStore()
    store.total = 40
    store.limit = 20
    store.offset = 0
    await store.nextPage(1)
    expect(store.offset).toBe(20)
  })

  it('does not go to next page if no next page', async () => {
    const store = useMatchHistoricStore()
    store.total = 10
    store.limit = 20
    store.offset = 0
    await store.nextPage(1)
    expect(store.offset).toBe(0)
  })

  it('navigates to prev page', async () => {
    const store = useMatchHistoricStore()
    store.total = 40
    store.limit = 20
    store.offset = 20
    await store.prevPage(1)
    expect(store.offset).toBe(0)
  })

  it('does not go to prev page if already at first page', async () => {
    const store = useMatchHistoricStore()
    store.offset = 0
    await store.prevPage(1)
    expect(store.offset).toBe(0)
  })

  it('reset clears all state', () => {
    const store = useMatchHistoricStore()
    store.matches = [mockMatch]
    store.total = 1
    store.selectedModeId = 2
    store.selectedResult = 'win'
    store.dateFrom = '2026-01-01'
    store.dateTo = '2026-04-30'
    store.reset()
    expect(store.matches).toHaveLength(0)
    expect(store.total).toBe(0)
    expect(store.selectedModeId).toBeUndefined()
    expect(store.selectedResult).toBeUndefined()
    expect(store.dateFrom).toBeUndefined()
    expect(store.dateTo).toBeUndefined()
  })

  it('resets matchHistoric state between store instances', async () => {
    const store1 = useMatchHistoricStore()
    await store1.fetch(1)
    expect(store1.matches).toHaveLength(1)

    setActivePinia(createPinia())
    const store2 = useMatchHistoricStore()
    expect(store2.matches).toHaveLength(0)
  })

  it('computes currentPage correctly', async () => {
    const store = useMatchHistoricStore()
    store.limit = 20
    store.offset = 40
    expect(store.currentPage).toBe(3)
  })

  it('computes totalPages correctly', async () => {
    const store = useMatchHistoricStore()
    store.total = 45
    store.limit = 20
    expect(store.totalPages).toBe(3)
  })
})
