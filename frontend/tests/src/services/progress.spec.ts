import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import CardMMR from '@/views/progress/CardMMR.vue'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(() => Promise.resolve({ data: { mmr: 1200, rank: 'Gold', history: [] } })),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}))

vi.mock('@/api', () => ({
  default: apiMock,
}))

vi.mock('../../../src/api', () => ({
  default: apiMock,
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => apiMock),
    isAxiosError: vi.fn(() => false),
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

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  registerables: [],
}))

vi.mock('vue-chartjs', () => ({
  Line: {
    name: 'LineChart',
    props: ['data', 'options'],
    template: '<div class="line-chart-stub" />',
  },
}))

const modes = [
  { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
  { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' },
]

const history = [
  { date: '2024-01-01', mmr: 1200 },
  { date: '2024-01-02', mmr: 1250 },
]

describe('CardMMR', () => {
  it('affiche le MMR', () => {
    const wrapper = mount(CardMMR, {
      props: {
        mmr: 1200,
        history,
        modes,
        selectedModeId: 1,
      },
    })

    expect(wrapper.text()).toContain('MMR')
    expect(wrapper.text()).toContain('1200')
  })

  it('affiche la mediane calculee depuis l historique', () => {
    const wrapper = mount(CardMMR, {
      props: {
        mmr: 1200,
        history,
        modes,
        selectedModeId: 1,
      },
    })

    const chart = wrapper.findComponent({ name: 'LineChart' })
    const datasets = chart.props('data').datasets
    const medianDataset = datasets.find((dataset: { label?: string }) => dataset.label === 'Mediane')

    expect(medianDataset).toBeTruthy()
    expect(medianDataset.data).toEqual([1225, 1225])
  })

  it('émet update:selectedModeId quand le mode change', async () => {
    const wrapper = mount(CardMMR, {
      props: {
        mmr: 1200,
        history,
        modes,
        selectedModeId: 1,
      },
    })

    await wrapper.vm.$emit('update:selectedModeId', 2)

    expect(wrapper.emitted()['update:selectedModeId']).toBeTruthy()
    expect(wrapper.emitted()['update:selectedModeId'][0]).toEqual([2])
  })
})
