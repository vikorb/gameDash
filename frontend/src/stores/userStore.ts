import { defineStore } from 'pinia'

import api from '@/api'
import { pb } from '@/services/pocketbase'
import { type AsyncState, run } from '@/stores/helpers/storeAsync'

export type UserRole = 'player' | 'admin' | 'moderator'
export type UserStatus = 0 | 1 | 2 | 3
export type UserSortBy = 'updated_at' | 'created_at' | 'username' | 'email' | 'role' | 'status'
export type UserSortOrder = 'asc' | 'desc'
export type UserDeletedFilter = 'all' | 'active' | 'deleted'
export type UserStatusFilter = 'all' | UserStatus
export type UserRoleFilter = 'all' | UserRole

export type UserProfile = {
  id: number
  pocketbase_user_id: string | null
  username: string | null
  email: string | null
  role: UserRole
  status: UserStatus
  region: string | null
  bio: string | null
  language: string | null
  matchmaking_pref: unknown
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type UserSyncPayload = {
  pocketbase_user_id: string
  username?: string
  email?: string
  role?: string
  status?: number | string
  region?: string
  bio?: string
  language?: string
  matchmaking_pref?: unknown
}

export type UserPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type UserListFilters = {
  search?: string
  role?: UserRoleFilter
  status?: UserStatusFilter
  deleted?: UserDeletedFilter
  page?: number
  limit?: number
  sortBy?: UserSortBy
  sortOrder?: UserSortOrder
}

type UsersListResponse = {
  users: UserProfile[]
  pagination: UserPagination
  filters: {
    search: string | null
    role: string | null
    status: number | null
    deleted: boolean | null
    sortBy: UserSortBy
    sortOrder: UserSortOrder
  }
}

const DEFAULT_PAGINATION: UserPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

export const DEFAULT_USER_LIST_FILTERS: Required<UserListFilters> = {
  search: '',
  role: 'all',
  status: 'all',
  deleted: 'all',
  page: 1,
  limit: 20,
  sortBy: 'updated_at',
  sortOrder: 'desc',
}

const toString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

const toNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

const normalizeStatus = (value: unknown): UserStatus => {
  const parsed = Number(value)

  if (parsed === 0 || parsed === 1 || parsed === 2 || parsed === 3) {
    return parsed
  }

  return 1
}

export const normalizeRole = (value: unknown): UserRole => {
  if (typeof value !== 'string') return 'player'

  const normalized = value.trim().toLowerCase()

  if (normalized === 'admin' || normalized === 'administrator' || normalized === 'administrateur') {
    return 'admin'
  }

  if (normalized === 'moderator' || normalized === 'moderateur') {
    return 'moderator'
  }

  return 'player'
}

const normalizeUserProfile = (
  value: Partial<UserProfile> | Record<string, unknown>,
): UserProfile => ({
  id: Number(value.id ?? 0),
  pocketbase_user_id: toNullableString(value.pocketbase_user_id),
  username: toNullableString(value.username),
  email: toNullableString(value.email),
  role: normalizeRole(value.role),
  status: normalizeStatus(value.status),
  region: toNullableString(value.region),
  bio: toNullableString(value.bio),
  language: toNullableString(value.language),
  matchmaking_pref: value.matchmaking_pref ?? null,
  created_at: toNullableString(value.created_at),
  updated_at: toNullableString(value.updated_at),
  deleted_at: toNullableString(value.deleted_at),
})

const buildUsersQueryParams = (filters: Required<UserListFilters>) => ({
  search: filters.search.trim() || undefined,
  role: filters.role === 'all' ? undefined : filters.role,
  status: filters.status === 'all' ? undefined : filters.status,
  deleted: filters.deleted === 'all' ? undefined : filters.deleted === 'deleted',
  page: filters.page,
  limit: filters.limit,
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
})

export const useUserStore = defineStore('userStore', {
  state: () => ({
    loading: false,
    error: null as AsyncState['error'],
    profile: null as UserProfile | null,
    users: [] as UserProfile[],
    usersPagination: { ...DEFAULT_PAGINATION } as UserPagination,
    usersFilters: { ...DEFAULT_USER_LIST_FILTERS } as Required<UserListFilters>,
  }),

  getters: {
    currentRole: (state): UserRole => normalizeRole(state.profile?.role),
    isAdmin: (state): boolean => normalizeRole(state.profile?.role) === 'admin',
    isModerator: (state): boolean => normalizeRole(state.profile?.role) === 'moderator',
  },

  actions: {
    clearError() {
      this.error = null
    },

    async syncFromPocketBase(record: Record<string, unknown> | null) {
      return run(this, async () => {
        const pocketbase_user_id = toString(record?.id)

        if (!pocketbase_user_id) {
          throw new Error('PocketBase user id is required to sync user profile')
        }

        const payload: UserSyncPayload = {
          pocketbase_user_id,
          username: toString(record?.username),
          email: toString(record?.email),
          role: toString(record?.role),
          status: record?.status as number | string | undefined,
          region: toString(record?.region),
          bio: toString(record?.bio),
          language: toString(record?.language),
          matchmaking_pref: record?.matchmaking_pref,
        }

        const response = await api.post<{ status: string; user: UserProfile }>('/users', payload)
        this.profile = normalizeUserProfile(response.data.user)
      })
    },

    async fetchByPocketBaseId(pocketbaseUserId: string) {
      return run(this, async () => {
        const response = await api.get<{ user: UserProfile }>(
          `/users/by-pocketbase/${encodeURIComponent(pocketbaseUserId)}`,
        )
        this.profile = normalizeUserProfile(response.data.user)
      })
    },

    async fetchUsers(filters: UserListFilters = {}) {
      return run(this, async () => {
        const nextFilters: Required<UserListFilters> = {
          ...this.usersFilters,
          ...filters,
        }

        const response = await api.get<UsersListResponse>('/users', {
          params: buildUsersQueryParams(nextFilters),
        })

        this.users = response.data.users.map((user) => normalizeUserProfile(user))
        this.usersPagination = response.data.pagination ?? { ...DEFAULT_PAGINATION }
        this.usersFilters = nextFilters
      })
    },

    async updateUser(
      userId: number,
      payload: Partial<
        Pick<UserProfile, 'username' | 'email' | 'role' | 'region' | 'bio' | 'language' | 'status'>
      > & {
        matchmaking_pref?: unknown
      },
    ) {
      return run(this, async () => {
        const response = await api.post<{ status: string; user: UserProfile }>(
          `/users/${userId}`,
          payload,
        )
        const normalized = normalizeUserProfile(response.data.user)

        this.patchLocalUser(userId, normalized)

        if (this.profile?.id === userId) {
          this.profile = normalized
        }

        return normalized
      })
    },

    patchLocalUser(userId: number, payload: Partial<UserProfile>) {
      this.users = this.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...payload,
              role: payload.role ? normalizeRole(payload.role) : user.role,
              status: payload.status !== undefined ? normalizeStatus(payload.status) : user.status,
            }
          : user,
      )

      if (this.profile?.id === userId) {
        this.profile = {
          ...this.profile,
          ...payload,
          role: payload.role ? normalizeRole(payload.role) : this.profile.role,
          status:
            payload.status !== undefined ? normalizeStatus(payload.status) : this.profile.status,
        }
      }
    },

    clearUsersList() {
      this.users = []
      this.usersPagination = { ...DEFAULT_PAGINATION }
      this.usersFilters = { ...DEFAULT_USER_LIST_FILTERS }
    },

    clearProfile() {
      this.profile = null
      this.error = null
      this.loading = false
    },

    async hydrateFromSession(pocketbaseUserId: string | null | undefined) {
      if (!pocketbaseUserId) {
        this.clearProfile()
        return
      }

      try {
        await this.fetchByPocketBaseId(pocketbaseUserId)
      } catch (err: any) {
        // If the backend returns 404, it means the user exists in PocketBase but not in Postgres.
        // This is a corrupt state. We clear the session gracefully.
        if (err?.response?.status === 404) {
          console.warn("User not found in backend database. Clearing session.")
          this.clearProfile()
          pb.authStore.clear()
        } else {
          throw err
        }
      }
    },
  },
})
