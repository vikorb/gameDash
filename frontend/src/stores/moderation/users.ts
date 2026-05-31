import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiRequest } from '../apiClient'
import type { ModerationSelectedUser, ModerationUserRole, ModerationUserStatus } from './types'

const SELECTED_USER_STORAGE_KEY = 'moderation:selected-user'

type UserSortBy = 'updated_at' | 'created_at' | 'username' | 'email' | 'role' | 'status'
type UserSortOrder = 'asc' | 'desc'
type UserDeletedFilter = 'all' | 'active' | 'deleted'

export type ModerationUsersFilters = {
  search?: string
  role?: 'all' | ModerationUserRole
  status?: 'all' | ModerationUserStatus | `${ModerationUserStatus}`
  deleted?: UserDeletedFilter
  page?: number
  limit?: number
  sortBy?: UserSortBy
  sortOrder?: UserSortOrder
}

type UsersResponse = {
  data: ModerationSelectedUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    bannedCount: number
    deletedCount: number
    adminsAndModeratorsCount: number
  }
}

type UserResponse = {
  data: ModerationSelectedUser
}

function normalizeUser(user: Partial<ModerationSelectedUser> & { id: string | number }) {
  return {
    id: Number(user.id),
    pocketbase_user_id: user.pocketbase_user_id ?? null,
    username: user.username ?? null,
    email: user.email ?? null,
    role: user.role ?? 'player',
    status: Number(user.status ?? 2) as ModerationUserStatus,
    region: user.region ?? null,
    bio: user.bio ?? null,
    language: user.language ?? null,
    matchmaking_pref: user.matchmaking_pref ?? null,
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null,
    deleted_at: user.deleted_at ?? null,
  } satisfies ModerationSelectedUser
}

function readStoredSelectedUser(): ModerationSelectedUser | null {
  if (typeof window === 'undefined') return null

  const rawValue = window.sessionStorage.getItem(SELECTED_USER_STORAGE_KEY)
  if (!rawValue) return null

  try {
    return normalizeUser(JSON.parse(rawValue) as ModerationSelectedUser)
  } catch {
    window.sessionStorage.removeItem(SELECTED_USER_STORAGE_KEY)
    return null
  }
}

function persistSelectedUser(user: ModerationSelectedUser | null) {
  if (typeof window === 'undefined') return

  if (!user) {
    window.sessionStorage.removeItem(SELECTED_USER_STORAGE_KEY)
    return
  }

  window.sessionStorage.setItem(SELECTED_USER_STORAGE_KEY, JSON.stringify(user))
}

export const useModerationUsersStore = defineStore('moderation-users', () => {
  const users = ref<ModerationSelectedUser[]>([])
  const selectedUser = ref<ModerationSelectedUser | null>(null)
  const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const summary = ref({ total: 0, bannedCount: 0, deletedCount: 0, adminsAndModeratorsCount: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  function replaceUser(user: ModerationSelectedUser) {
    const normalized = normalizeUser(user)
    const index = users.value.findIndex((item) => item.id === normalized.id)

    if (index !== -1) {
      users.value[index] = normalized
    }

    if (selectedUser.value?.id === normalized.id) {
      selectedUser.value = normalized
      persistSelectedUser(normalized)
    }
  }

  async function fetchUsers(filters: ModerationUsersFilters = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await apiRequest<UsersResponse>('/moderation/users', {
        query: {
          search: filters.search,
          role: filters.role,
          status: filters.status,
          deleted: filters.deleted,
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
      })

      users.value = response.data.map(normalizeUser)
      pagination.value = response.pagination
      summary.value = response.summary
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les utilisateurs.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setSelectedUser(user: ModerationSelectedUser) {
    selectedUser.value = normalizeUser(user)
    persistSelectedUser(selectedUser.value)
  }

  async function hydrateSelectedUser(userId?: string | number) {
    if (selectedUser.value) {
      if (userId === undefined || Number(selectedUser.value.id) === Number(userId)) {
        return selectedUser.value
      }
    }

    const foundInList = users.value.find((user) => Number(user.id) === Number(userId))
    if (foundInList) {
      setSelectedUser(foundInList)
      return selectedUser.value
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
    if (!selectedUser.value) return

    selectedUser.value = {
      ...selectedUser.value,
      ...payload,
      updated_at: payload.updated_at ?? new Date().toISOString(),
    }

    persistSelectedUser(selectedUser.value)
  }

  async function updateUserRole(userId: number, role: ModerationUserRole, actor = 'POC Admin') {
    const response = await apiRequest<UserResponse>(`/moderation/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, actor }),
    })

    replaceUser(response.data)
    return normalizeUser(response.data)
  }

  async function updateUserStatus(userId: number, status: ModerationUserStatus, actor = 'POC Admin') {
    const response = await apiRequest<UserResponse>(`/moderation/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actor }),
    })

    replaceUser(response.data)
    return normalizeUser(response.data)
  }

  return {
    users,
    selectedUser,
    pagination,
    summary,
    loading,
    error,
    fetchUsers,
    setSelectedUser,
    hydrateSelectedUser,
    clearSelectedUser,
    patchSelectedUser,
    updateUserRole,
    updateUserStatus,
  }
})
