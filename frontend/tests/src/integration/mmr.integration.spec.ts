import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMMRStore } from '../../../src/stores/mmrStore'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          mmr: 1500,
          rank: 'Gold',
          history: [],
          postgresUserId: 'u1',
        }
      })
    ),
  },
}))

describe('MMR Progression Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches and updates MMR for user and mode', async () => {
    const mmrStore = useMMRStore()
    await mmrStore.fetchMMR('u1', 1) 
    expect(mmrStore.mmrData?.mmr).toBe(1500)
  })
})
