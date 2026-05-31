import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMapsStore } from '@/stores/mapsStore'
import { useUserStore } from '@/stores/userStore'

import MapsBrowseView from './MapsBrowseView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'fr' },
  }),
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a><slot /></a>',
  },
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('MapsBrowseView integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('passes flattened filtered maps to export button when user is admin', () => {
    const userStore = useUserStore()
    userStore.profile = {
      id: 1,
      pocketbase_user_id: 'pb_1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 1,
      region: 'EU',
      bio: null,
      language: 'fr',
      matchmaking_pref: null,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    }

    const wrapper = mount(MapsBrowseView, {
      global: {
        stubs: {
          MapCard: true,
          Transition: false,
        },
      },
    })

    const mapsStore = useMapsStore()
    const exportButton = wrapper.findComponent({ name: 'ExportButton' })

    expect(exportButton.exists()).toBe(true)

    const rows = exportButton.props('clientRows') as Array<Record<string, unknown>>
    expect(rows.length).toBe(mapsStore.filteredMaps.length)
    expect(Object.keys(rows[0] ?? {})).toContain('score')
    expect(Object.keys(rows[0] ?? {})).toContain('creator_username')
  })

  it('hides export button for non-admin users', () => {
    const userStore = useUserStore()
    userStore.profile = {
      id: 2,
      pocketbase_user_id: 'pb_2',
      username: 'player',
      email: 'player@example.com',
      role: 'player',
      status: 1,
      region: 'EU',
      bio: null,
      language: 'fr',
      matchmaking_pref: null,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    }

    const wrapper = mount(MapsBrowseView, {
      global: {
        stubs: {
          MapCard: true,
          Transition: false,
        },
      },
    })

    expect(wrapper.findComponent({ name: 'ExportButton' }).exists()).toBe(false)
  })
})
