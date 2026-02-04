import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, reactive, nextTick } from 'vue'

type GameMap = { id: number }
type I18nParams = { count?: number }
type UseI18nReturn = { t: (key: string, params?: I18nParams) => string }

vi.mock('vue-i18n', () => ({
  useI18n: (): UseI18nReturn => ({
    t: (key: string, params?: I18nParams): string => {
      const dict: Record<string, string> = {
        'home.hero.title': 'Home title',
        'home.hero.subtitle': 'Home subtitle',
        'home.stats.title': 'Stats',
        'home.quick_actions.title': 'Quick actions',
        'home.quick_actions.create_map': 'Create map',
        'home.quick_actions.view_list': 'View list',
        'home.quick_actions.create_map_hover': 'Create a map',
        'home.quick_actions.create_map_aria': 'Create map',
        'home.quick_actions.view_list_hover': 'View maps',
        'home.quick_actions.view_list_aria': 'View list',
      }

      if (key === 'home.stats.maps_created') {
        return `${params?.count ?? 0} maps created`
      }

      return dict[key] ?? key
    },
  }),
}))

const fakeStore = reactive<{ maps: GameMap[] }>({ maps: [] })

vi.mock('@/stores/mapStore', () => ({
  useMapStore: (): { maps: GameMap[] } => fakeStore,
}))

vi.mock('@/components/ui/BaseButton.vue', () => ({
  default: defineComponent({
    name: 'BaseButton',
    props: {
      to: { type: String, default: '' },
    },
    template: `<a class="base-button" :data-to="to"><slot /></a>`,
  }),
}))

vi.mock('@/components/ui/BaseCard.vue', () => ({
  default: defineComponent({
    name: 'BaseCard',
    template: `<section class="base-card"><slot /></section>`,
  }),
}))

import TestHomeView from '@/views/TestHomeView.vue'

const mountView = () => mount(TestHomeView)

beforeEach(() => {
  fakeStore.maps.splice(0)
})

describe('TestHomeView - unit', () => {
  it('affiche le hero title/subtitle', () => {
    const wrapper = mountView()
    expect(wrapper.find('.hero-title').text()).toBe('Home title')
    expect(wrapper.find('.hero-subtitle').text()).toBe('Home subtitle')
  })

  it('affiche le nombre de maps depuis le store', () => {
    fakeStore.maps.push({ id: 1 }, { id: 2 })
    const wrapper = mountView()
    expect(wrapper.find('.big-number').text()).toBe('2')
    expect(wrapper.text()).toContain('2 maps created')
  })
})

describe('TestHomeView - integration (simple)', () => {
  it('contient les 2 actions avec les bonnes routes', () => {
    const wrapper = mountView()
    const tos = wrapper
      .findAll('.base-button')
      .map((el) => el.attributes('data-to'))
      .filter((v): v is string => typeof v === 'string')

    expect(tos).toContain('/test/maps/new')
    expect(tos).toContain('/test/maps')
  })

  it('se met à jour quand store.maps change', async () => {
    const wrapper = mountView()
    expect(wrapper.find('.big-number').text()).toBe('0')

    fakeStore.maps.push({ id: 1 })
    await nextTick()

    expect(wrapper.find('.big-number').text()).toBe('1')
  })
})
