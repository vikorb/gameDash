import { flushPromises, mount } from '@vue/test-utils'
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

// Un seul mock, via l'alias @/ uniquement
vi.mock('@/api', () => ({
  default: apiMock,
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

async function mountCardRank() {
  const { default: CardRank } = await import('@/views/progress/CardRank.vue')

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
    apiMock.get.mockResolvedValueOnce({ data: rankedData })

    const wrapper = await mountCardRank()

    await flushPromises()

    expect(wrapper.text()).toContain('Rang actuel')
  })

  it('affiche le rang et la division après chargement', async () => {
    apiMock.get.mockResolvedValueOnce({ data: rankedData })

    const wrapper = await mountCardRank()

    await flushPromises()

    expect(apiMock.get).toHaveBeenCalledWith('/ranks/1/rank?modeId=1')
    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('I')
  })

  it("affiche l'état Unranked si le rang est Unranked", async () => {
    apiMock.get.mockResolvedValueOnce({ data: unrankedData })

    const wrapper = await mountCardRank()

    await flushPromises()

    expect(wrapper.text()).toContain('Unranked')
  })
})
