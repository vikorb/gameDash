import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive } from 'vue'

type AuthUser = {
  id: string
  email: string
  username?: string
}

const userStoreState = reactive<{ currentRole: 'player' | 'admin' | 'moderator' }>({
  currentRole: 'player',
})
const authState = reactive<{ isAuthenticated: boolean; user: AuthUser | null }>({
  isAuthenticated: false,
  user: null,
})

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => userStoreState,
}))

vi.mock('@/services/pocketbase', () => ({
  authService: {
    isAuthenticated: () => authState.isAuthenticated,
    getUser: () => authState.user,
  },
}))

vi.mock('@/components/home/HomeHeaderSection.vue', () => ({
  default: defineComponent({
    name: 'HomeHeaderSection',
    props: {
      isSessionActive: { type: Boolean, required: true },
      displayName: { type: String, default: undefined },
      showPlayButton: { type: Boolean, required: true },
    },
    template: `
      <section
        class="home-header"
        :data-session="isSessionActive ? 'true' : 'false'"
        :data-display-name="displayName ? displayName : ''"
        :data-show-play="showPlayButton ? 'true' : 'false'"
      />
    `,
  }),
}))

vi.mock('@/components/player-dashboard/PlayerDashboardSection.vue', () => ({
  default: defineComponent({
    name: 'PlayerDashboardSection',
    template: '<section class="player-dashboard" />',
  }),
}))

import HomeView from '@/views/HomeView.vue'

const mountView = () => mount(HomeView)

beforeEach(() => {
  userStoreState.currentRole = 'player'
  authState.isAuthenticated = false
  authState.user = null
})

describe('HomeView', () => {
  it('render HomeHeaderSection avec les props dérivées de auth et role', () => {
    authState.isAuthenticated = true
    authState.user = { id: 'u1', email: 'user@test.local', username: 'alice' }

    const wrapper = mountView()

    const header = wrapper.find('.home-header')
    expect(header.exists()).toBe(true)
    expect(header.attributes('data-session')).toBe('true')
    expect(header.attributes('data-display-name')).toBe('alice')
    expect(header.attributes('data-show-play')).toBe('true')
  })

  it('affiche le dashboard uniquement pour les players', () => {
    userStoreState.currentRole = 'player'
    const wrapper = mountView()
    expect(wrapper.find('.player-dashboard').exists()).toBe(true)
  })

  it('masque le dashboard pour admin/moderator', () => {
    userStoreState.currentRole = 'admin'
    const wrapper = mountView()
    expect(wrapper.find('.player-dashboard').exists()).toBe(false)
    expect(wrapper.find('.home-header').attributes('data-show-play')).toBe('false')
  })

  it('se met à jour quand le role change', async () => {
    const wrapper = mountView()
    expect(wrapper.find('.player-dashboard').exists()).toBe(true)

    userStoreState.currentRole = 'moderator'
    await nextTick()

    expect(wrapper.find('.player-dashboard').exists()).toBe(false)
    expect(wrapper.find('.home-header').attributes('data-show-play')).toBe('false')
  })
})
