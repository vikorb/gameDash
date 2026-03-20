import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import CardMMR from '../../../src/views/progress/CardMMR.vue'

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { mmr: 1200, rank: 'Gold', history: [] } }))
  }
}))

vi.mock('@/services/pocketbase', () => ({
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' })
  }
}))

vi.mock('../../../src/views/progress/ModeSelector.vue', () => ({
  default: { template: '<div class="mode-selector-mock" />' }
}))

const modes = [
  { id: 1, name: 'Classé' },
  { id: 2, name: 'Normal' }
]
const history = [
  { date: '2024-01-01', mmr: 1200 },
  { date: '2024-01-02', mmr: 1250 }
]

describe('CardMMR', () => {
  it('affiche le MMR et le ModeSelector', () => {
    const wrapper = mount(CardMMR, {
      props: {
        mmr: 1200,
        history,
        modes,
        selectedModeId: 1
      },
      global: {
        stubs: ['LineChart', 'ModeSelector']
      }
    })
    expect(wrapper.text()).toContain('MMR')
    expect(wrapper.text()).toContain('1200')
    expect(wrapper.findComponent({ name: 'ModeSelector' }).exists()).toBe(true)
  })

  it('émet update:selectedModeId quand le mode change', async () => {
    const wrapper = mount(CardMMR, {
      props: {
        mmr: 1200,
        history,
        modes,
        selectedModeId: 1
      },
      global: {
        stubs: ['LineChart', 'ModeSelector']
      }
    })
    await wrapper.vm.$emit('update:selectedModeId', 2)
    expect(wrapper.emitted()['update:selectedModeId']).toBeTruthy()
    expect(wrapper.emitted()['update:selectedModeId'][0]).toEqual([2])
  })
})
