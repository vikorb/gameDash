import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ModerationSelectedUser } from './types'

const SELECTED_USER_STORAGE_KEY = 'moderation:selected-user'

function readStoredSelectedUser(): ModerationSelectedUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.sessionStorage.getItem(SELECTED_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as ModerationSelectedUser
  } catch {
    window.sessionStorage.removeItem(SELECTED_USER_STORAGE_KEY)
    return null
  }
}

function persistSelectedUser(user: ModerationSelectedUser | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!user) {
    window.sessionStorage.removeItem(SELECTED_USER_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(SELECTED_USER_STORAGE_KEY, JSON.stringify(user))
}

export const useModerationUsersStore = defineStore('moderation-users', () => {
  const selectedUser = ref<ModerationSelectedUser | null>(null)

  function setSelectedUser(user: ModerationSelectedUser) {
    selectedUser.value = { ...user }
    persistSelectedUser(selectedUser.value)
  }

  async function hydrateSelectedUser(userId?: string | number) {
    if (selectedUser.value) {
      if (userId === undefined || Number(selectedUser.value.id) === Number(userId)) {
        return selectedUser.value
      }
    }

    const storedUser = readStoredSelectedUser()

    if (!storedUser) {
      selectedUser.value = null
      return null
    }

    if (userId !== undefined && Number(storedUser.id) !== Number(userId)) {
      selectedUser.value = null
      return null
    }

    selectedUser.value = storedUser
    return selectedUser.value
  }

  function clearSelectedUser() {
    selectedUser.value = null
    persistSelectedUser(null)
  }

  function patchSelectedUser(payload: Partial<ModerationSelectedUser>) {
    if (!selectedUser.value) {
      return
    }

    selectedUser.value = {
      ...selectedUser.value,
      ...payload,
      updated_at: payload.updated_at ?? new Date().toISOString(),
    }

    persistSelectedUser(selectedUser.value)
  }

  return {
    selectedUser,
    setSelectedUser,
    hydrateSelectedUser,
    clearSelectedUser,
    patchSelectedUser,
  }
})
