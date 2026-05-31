import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../../../src/api'
import CardRank from '../../../src/views/progress/CardRank.vue'

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

vi.mock('@/services/pocketbase', () => ({
  pb: {
    authStore: {
      token: '',
    },
  },
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' })
  }
}))

const modes = [
  { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
  { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' }
]

describe('CardRank', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche le titre "Rang actuel"', () => {
    const wrapper = mount(CardRank, {
      props: { userId: 1, selectedModeId: 1, modes }
    })
    expect(wrapper.text()).toContain('Rang actuel')
  })

  it('affiche le rang et la division après chargement', async () => {
    const wrapper = mount(CardRank, {
      props: { userId: 1, selectedModeId: 1, modes }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('I')
  })

  it('affiche l\'état Unranked si le rang est Unranked', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
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
    } as never)

    const wrapper = mount(CardRank, {
      props: { userId: 1, selectedModeId: 1, modes }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Unranked')
  })
})
