import { defineStore } from 'pinia'

export type ModerationMockUser = {
  id: number
  pocketbase_user_id: string | null
  username: string | null
  email: string | null
  role: 'player' | 'admin' | 'moderator'
  status: 0 | 1 | 2 | 3
  region: string | null
  bio: string | null
  language: string | null
  matchmaking_pref: unknown
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

const STORAGE_KEY = 'moderation-selected-user'

export const useModerationStore = defineStore('moderationStore', {
  state: () => ({
    selectedUser: null as ModerationMockUser | null,
  }),

  actions: {
    setSelectedUser(user: ModerationMockUser) {
      this.selectedUser = user
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    },

    hydrateSelectedUser() {
      if (this.selectedUser) return

      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return

      try {
        this.selectedUser = JSON.parse(raw) as ModerationMockUser
      } catch {
        this.selectedUser = null
      }
    },

    clearSelectedUser() {
      this.selectedUser = null
      sessionStorage.removeItem(STORAGE_KEY)
    },

    patchSelectedUser(payload: Partial<ModerationMockUser>) {
      if (!this.selectedUser) return

      this.selectedUser = {
        ...this.selectedUser,
        ...payload,
        updated_at: new Date().toISOString(),
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.selectedUser))
    },
  },
})
