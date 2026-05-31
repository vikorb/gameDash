import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProgressView from '@/views/ProgressView.vue'

vi.mock('@/services/gameMode', () => ({
  fetchGameModes: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
      { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' },
    ]),
  ),
}))

vi.mock('@/services/matches', () => ({
  fetchMatchHistory: vi.fn(() =>
    Promise.resolve({
      matches: [],
      total: 0,
      limit: 20,
      offset: 0,
    }),
  ),
}))

vi.mock('@/stores/mmrStore', () => ({
  useMMRStore: () => ({
    mmrData: {
      mmr: 1200,
      rank: 'Gold',
      history: [],
    },
    loading: false,
    error: null,
    fetchMMR: vi.fn(),
  }),
}))

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    profile: {
      id: 1,
      pocketbase_user_id: 'u1',
      role: 'player',
    },
    loading: false,
    error: null,
    hydrateFromSession: vi.fn(),
    syncOrFetchProfile: vi.fn(),
    fetchByPocketBaseId: vi.fn(),
    clearProfile: vi.fn(),
  }),
}))

vi.mock('@/stores/rankStore', () => ({
  useRankStore: () => ({
    rankData: null,
    loading: false,
    error: null,
    fetchRank: vi.fn(),
  }),
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

function mountProgressView() {
  return mount(ProgressView, {
    global: {
      stubs: {
        CardMMR: {
          name: 'CardMMR',
          template: '<div class="card-mmr-mock" />',
        },
        CardRank: {
          name: 'CardRank',
          template: '<div class="card-rank-mock" />',
        },
        ModeSelector: {
          name: 'ModeSelector',
          template: '<div class="mode-selector-mock" />',
        },
        RateCard: {
          name: 'RateCard',
          template: '<div class="rate-card-mock" />',
        },
        ProgressStatsGrid: {
          name: 'ProgressStatsGrid',
          template: '<div class="progress-stats-grid-mock" />',
        },
        InsightsPieCharts: {
          name: 'InsightsPieCharts',
          template: '<div class="insights-pie-charts-mock" />',
        },
        DateFilter: {
          name: 'DateFilter',
          template: '<div class="date-filter-mock" />',
        },
        DateRangePicker: {
          name: 'DateRangePicker',
          template: '<div class="date-range-picker-mock" />',
        },
      },
    },
  })
}

describe('ProgressView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders the progress view', async () => {
    const wrapper = mountProgressView()

    await flushPromises()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toContain('card-mmr-mock')
  })

  it('affiche la card MMR', async () => {
    const wrapper = mountProgressView()

    await flushPromises()

    expect(wrapper.find('.card-mmr-mock').exists()).toBe(true)
  })
})
