import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RateCard from '../../../src/views/progress/RateCard.vue'

const fetchMock = vi.fn()

vi.mock('@/stores/rateStore', () => ({
  useRateStore: () => ({
    winrate: 75,
    killRate: 3.5,
    fetch: fetchMock,
  }),
}))

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pinia')>()
  return {
    ...actual,
    storeToRefs: () => ({ loading: false }),
  }
})

describe('RateCard', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(undefined)
  })

  it('displays winrate and kill rate values', async () => {
    const wrapper = mount(RateCard, {
      props: { userId: 1, modeId: 2 },
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Winrate')
    expect(wrapper.text()).toContain('75%')
    expect(wrapper.text()).toContain('Kill rate')
    expect(wrapper.text()).toContain('3.5')
  })

  it('fetches rates on mount with props', async () => {
    mount(RateCard, {
      props: { userId: 1, modeId: 2, dateFrom: '2026-01-01', dateTo: '2026-12-31' },
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(fetchMock).toHaveBeenCalledWith(1, 2, '2026-01-01', '2026-12-31')
  })
})
