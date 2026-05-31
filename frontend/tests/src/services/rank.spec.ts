import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '@/api'
import CardRank from '@/views/progress/CardRank.vue'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('@/services/pocketbase', () => ({
  pb: {
    authStore: {
      token: '',
    },
  },
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' }),
  },
}))

const modes = [
  { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
  { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' },
]

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

const unrankedData = {
  rank: 'Unranked',
  division: null,
  xp: 0,
  xpInDivision: null,
  xpToNext: null,
  nextDivision: null,
  nextDivisionMinXp: null,
  nextDivisionMaxXp: null,
  divisionMaxXp: null,
}

function mockRankResponse(data: typeof rankedData | typeof unrankedData) {
  vi.mocked(api.get).mockResolvedValueOnce({
    data,
  })
}

function mountCardRank() {
  return mount(CardRank, {
    props: {
      userId: 1,
      selectedModeId: 1,
      modes,
    },
  })
}

describe('CardRank', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('affiche le titre "Rang actuel"', async () => {
    mockRankResponse(rankedData)

    const wrapper = mountCardRank()

    await flushPromises()

    expect(wrapper.text()).toContain('Rang actuel')
  })

  it('affiche le rang et la division après chargement', async () => {
    mockRankResponse(rankedData)

    const wrapper = mountCardRank()

    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/ranks/1/rank?modeId=1')
    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('I')
  })

  it("affiche l'état Unranked si le rang est Unranked", async () => {
    mockRankResponse(unrankedData)

    const wrapper = mountCardRank()

    await flushPromises()

    expect(wrapper.text()).toContain('Unranked')
  })
})
