import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../../../src/api'
import { fetchMatchHistory } from '../../../src/services/matches'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockResponse = {
  matches: [
    {
      match_id: 1,
      played_at: '2026-04-01T10:00:00Z',
      status: 'finished',
      game_mode: { id: 1, name: 'Classé' },
      my_team: { id: 1, name: 'Team A' },
      result: 'win',
      xp_gained: 120,
      mmr_gained: 25,
      mmr_before: 1500,
      mmr_after: 1525,
      mmr_delta: 25,
      teams: [],
    },
  ],
  total: 1,
  limit: 20,
  offset: 0,
}

describe('fetchMatchHistory', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse })
  })

  it('calls /matches with userId, limit and offset', async () => {
    await fetchMatchHistory(1)
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: { userId: 1, limit: 20, offset: 0 },
    })
  })

  it('includes modeId in params when provided', async () => {
    await fetchMatchHistory(1, 2)
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: { userId: 1, limit: 20, offset: 0, modeId: 2 },
    })
  })

  it('includes result in params when provided', async () => {
    await fetchMatchHistory(1, undefined, 'win')
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: { userId: 1, limit: 20, offset: 0, result: 'win' },
    })
  })

  it('includes dateFrom and dateTo when provided', async () => {
    await fetchMatchHistory(1, undefined, undefined, '2026-01-01', '2026-04-30')
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: { userId: 1, limit: 20, offset: 0, dateFrom: '2026-01-01', dateTo: '2026-04-30' },
    })
  })

  it('includes custom limit and offset', async () => {
    await fetchMatchHistory(1, undefined, undefined, undefined, undefined, 10, 30)
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: { userId: 1, limit: 10, offset: 30 },
    })
  })

  it('returns the response data', async () => {
    const result = await fetchMatchHistory(1)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].result).toBe('win')
    expect(result.total).toBe(1)
  })

  it('includes all filters combined', async () => {
    await fetchMatchHistory(1, 2, 'loss', '2026-01-01', '2026-04-30', 5, 10)
    expect(api.get).toHaveBeenCalledWith('/matches', {
      params: {
        userId: 1,
        limit: 5,
        offset: 10,
        modeId: 2,
        result: 'loss',
        dateFrom: '2026-01-01',
        dateTo: '2026-04-30',
      },
    })
  })
})
