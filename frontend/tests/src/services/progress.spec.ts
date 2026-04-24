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

const modes = [
  { id: 1, name: 'Classé' },
  { id: 2, name: 'Normal' }
]
const history = [
  { date: '2024-01-01', mmr: 1200 },
  { date: '2024-01-02', mmr: 1250 }
]

const lineChartStub = {
  name: 'LineChart',
  template: '<div class="line-chart-stub" />',
  props: ['data', 'options']
}

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
        stubs: { LineChart: lineChartStub }
      }
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
        selectedModeId: 1
      },
      global: {
        stubs: { LineChart: lineChartStub }
      }
    })

    const chart = wrapper.findComponent(lineChartStub)
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
        selectedModeId: 1
      },
      global: {
        stubs: { LineChart: lineChartStub }
      }
    })
    await wrapper.vm.$emit('update:selectedModeId', 2)
    expect(wrapper.emitted()['update:selectedModeId']).toBeTruthy()
    expect(wrapper.emitted()['update:selectedModeId'][0]).toEqual([2])
  })
})
