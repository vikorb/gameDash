import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useMapsStore } from '@/stores/mapsStore'
import { useUserStore } from '@/stores/userStore'
import type { MapItem } from '@/types/maps'

import MapsBrowseView from './MapsBrowseView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (!params) return key
      return Object.entries(params).reduce(
        (text, [paramKey, value]) => text.replace(`{${paramKey}}`, String(value)),
        key,
      )
    },
    locale: { value: 'fr' },
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const sampleMap: MapItem = {
  id: 1,
  title: 'Arena Prime',
  description: 'Fast lane',
  status: 'stable',
  moderation_status: 'visible',
  featured: true,
  creator: {
    id: 1,
    username: 'Nova',
    region: 'EU',
    maps_count: 3,
    total_tests: 1200,
    total_likes: 530,
  },
  tags: [
    { id: 1, slug: 'fps', label_fr: 'FPS', label_en: 'FPS' },
    { id: 2, slug: 'ctf', label_fr: 'CTF', label_en: 'CTF' },
  ],
  screenshots: [{ id: 1, url: 'https://example.com/1.png', position: 0 }],
  grid_data: null,
  current_version_number: 4,
  current_version_id: 1,
  versions_count: 4,
  versions: [
    {
      id: 1,
      version_number: 1,
      release_notes: 'init',
      created_at: '2026-05-10T00:00:00.000Z',
    },
  ],
  comments: [],
  stats: {
    tests_count: 250,
    likes_count: 100,
    dislikes_count: 10,
    favorites_count: 44,
    comments_count: 0,
    score: 760,
    retention: 0.41,
    last_activity_at: '2026-05-18T01:00:00.000Z',
  },
  user_vote: null,
  user_favorite: false,
  user_tested: false,
  created_at: '2026-05-10T00:00:00.000Z',
  updated_at: '2026-05-18T00:00:00.000Z',
}

function mountView() {
  return mount(MapsBrowseView, {
    global: {
      stubs: {
        RouterLink: {
          name: 'RouterLink',
          props: ['to'],
          template: '<a><slot /></a>',
        },
        MapCard: true,
        MapReportModal: true,
        Transition: false,
        ExportButton: {
          name: 'ExportButton',
          props: ['clientRows'],
          template: '<button data-test="export-button" />',
        },
      },
    },
  })
}

describe('MapsBrowseView integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true,
    })
  })

  it('passes flattened filtered maps to export button when user is admin', async () => {
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

    const mapsStore = useMapsStore()

    mapsStore.maps = [sampleMap]

    if ('loadMaps' in mapsStore) {
      vi.spyOn(mapsStore, 'loadMaps').mockResolvedValue(undefined)
    }

    const wrapper = mountView()

    await nextTick()

    const exportButton = wrapper.findComponent({ name: 'ExportButton' })

    expect(exportButton.exists()).toBe(true)

    const rows = exportButton.props('clientRows') as Array<Record<string, unknown>>

    expect(rows).toHaveLength(mapsStore.filteredMaps.length)
    expect(rows[0]).toMatchObject({
      id: 1,
      title: 'Arena Prime',
      creator_username: 'Nova',
      tags: 'fps|ctf',
      tests_count: 250,
      score: 760,
    })
  })

  it('hides export button for non-admin users', async () => {
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

    const mapsStore = useMapsStore()

    mapsStore.maps = [sampleMap]

    if ('loadMaps' in mapsStore) {
      vi.spyOn(mapsStore, 'loadMaps').mockResolvedValue(undefined)
    }

    const wrapper = mountView()

    await nextTick()

    expect(wrapper.findComponent({ name: 'ExportButton' }).exists()).toBe(false)
  })
})
