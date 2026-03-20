
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProgressView from '../../../src/views/ProgressView.vue'

vi.mock('../../../src/views/progress/CardMMR.vue', () => ({
  default: { template: '<div class="card-mmr-mock" />' }
}))

vi.mock('../../../src/views/progress/ModeSelector.vue', () => ({
  default: { template: '<div class="mode-selector-mock" />' }
}))

vi.mock('../../../src/services/gameMode', () => ({
  fetchGameModes: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
    { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' }
  ]))
}))

vi.mock('@/stores/mmrStore', () => ({
  useMMRStore: () => ({
    mmrData: { mmr: 1200, rank: 'Gold', history: [] },
    loading: false,
    error: null,
    fetchMMR: vi.fn()
  })
}))

vi.mock('@/services/pocketbase', () => ({
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' })
  }
}))

describe('ProgressView', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    wrapper = mount(ProgressView)
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('renders the progress view', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toContain('card-mmr-mock')
  })

  it('affiche la card MMR', () => {
    expect(wrapper.find('.card-mmr-mock').exists()).toBe(true)
  })
})
