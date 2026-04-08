<template>
  <section class="moderation-users-view">
    <div class="moderation-users-shell">
      <header class="page-header">
        <div>
          <span class="page-header__badge">{{ t('moderationUsers.badge') }}</span>
          <h1 class="page-header__title">{{ t('moderationUsers.title') }}</h1>
          <p class="page-header__subtitle">
            {{ t('moderationUsers.subtitle') }}
          </p>
        </div>

        <div class="page-header__actions">
          <button
            type="button"
            class="toolbar-btn toolbar-btn--primary"
            @click="goBackToModeration"
          >
            {{ t('moderation.cards.audit.actions.backToModeration') }}
          </button>

          <button type="button" class="toolbar-btn toolbar-btn--ghost" @click="resetFilters">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="mdiRefresh" />
            </svg>
            {{ t('moderationUsers.actions.reset') }}
          </button>
        </div>
      </header>

      <div v-if="feedback" :class="['feedback-banner', `feedback-banner--${feedback.type}`]">
        {{ feedback.message }}
      </div>

      <section class="filters-card">
        <div class="search-row">
          <label class="search-field">
            <span class="field__label">{{ t('moderationUsers.filters.search') }}</span>

            <div class="search-field__control">
              <svg class="search-field__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiMagnify" />
              </svg>

              <input
                v-model="filters.search"
                class="search-field__input"
                type="text"
                :placeholder="t('moderationUsers.filters.searchPlaceholder')"
                @keyup.enter="submitFilters"
              />

              <button
                v-if="filters.search"
                type="button"
                class="search-field__clear"
                :aria-label="t('moderationUsers.actions.clearSearch')"
                @click="clearSearch"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="mdiClose" />
                </svg>
              </button>
            </div>
          </label>

          <div class="search-actions">
            <button type="button" class="toolbar-btn toolbar-btn--ghost" @click="resetFilters">
              {{ t('moderationUsers.actions.clearFilters') }}
            </button>
            <button type="button" class="toolbar-btn toolbar-btn--primary" @click="submitFilters">
              {{ t('moderationUsers.actions.applyFilters') }}
            </button>
          </div>
        </div>

        <div class="quick-statuses">
          <button
            v-for="option in statusQuickFilters"
            :key="option.value"
            type="button"
            :class="['quick-status', filters.status === option.value ? 'quick-status--active' : '']"
            @click="setQuickStatus(option.value)"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="filters-grid">
          <label class="field">
            <span class="field__label">{{ t('moderationUsers.filters.role') }}</span>
            <select v-model="filters.role" class="field__control">
              <option value="all">{{ t('moderationUsers.roles.all') }}</option>
              <option value="player">{{ t('moderationUsers.roles.player') }}</option>
              <option value="moderator">{{ t('moderationUsers.roles.moderator') }}</option>
              <option value="admin">{{ t('moderationUsers.roles.admin') }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field__label">{{ t('moderationUsers.filters.deleted') }}</span>
            <select v-model="filters.deleted" class="field__control">
              <option value="all">{{ t('moderationUsers.deleted.all') }}</option>
              <option value="active">{{ t('moderationUsers.deleted.active') }}</option>
              <option value="deleted">{{ t('moderationUsers.deleted.deleted') }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field__label">{{ t('moderationUsers.filters.sortBy') }}</span>
            <select v-model="filters.sortBy" class="field__control">
              <option value="updated_at">{{ t('moderationUsers.sort.updatedAt') }}</option>
              <option value="created_at">{{ t('moderationUsers.sort.createdAt') }}</option>
              <option value="username">{{ t('moderationUsers.sort.username') }}</option>
              <option value="email">{{ t('moderationUsers.sort.email') }}</option>
              <option value="role">{{ t('moderationUsers.sort.role') }}</option>
              <option value="status">{{ t('moderationUsers.sort.status') }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field__label">{{ t('moderationUsers.filters.sortOrder') }}</span>
            <select v-model="filters.sortOrder" class="field__control">
              <option value="desc">{{ t('moderationUsers.sort.desc') }}</option>
              <option value="asc">{{ t('moderationUsers.sort.asc') }}</option>
            </select>
          </label>

          <label class="field">
            <span class="field__label">{{ t('moderationUsers.filters.limit') }}</span>
            <select v-model.number="filters.limit" class="field__control">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
        </div>

        <div class="filters-footer">
          <div class="filters-summary">
            <span class="summary-pill">
              {{
                t('moderationUsers.filters.results', {
                  count: usersPagination.total,
                })
              }}
            </span>

            <span v-if="activeFilterCount > 0" class="summary-pill summary-pill--accent">
              {{
                t('moderationUsers.filters.activeFilters', {
                  count: activeFilterCount,
                })
              }}
            </span>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderationUsers.stats.visibleUsers') }}</span>
          <strong class="stat-card__value">{{ usersPagination.total }}</strong>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderationUsers.stats.adminsModerators') }}</span>
          <strong class="stat-card__value">{{ adminsAndModeratorsCount }}</strong>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderationUsers.stats.banned') }}</span>
          <strong class="stat-card__value">{{ bannedCount }}</strong>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('moderationUsers.stats.deleted') }}</span>
          <strong class="stat-card__value">{{ deletedCount }}</strong>
        </article>
      </section>

      <section class="table-card">
        <div class="table-card__header">
          <div>
            <h2 class="table-card__title">{{ t('moderationUsers.table.title') }}</h2>
            <p class="table-card__subtitle">
              {{
                t('moderationUsers.table.subtitle', {
                  total: usersPagination.total,
                  page: usersPagination.page,
                  totalPages: Math.max(usersPagination.totalPages, 1),
                })
              }}
            </p>
          </div>

          <span v-if="loading" class="table-card__loading">
            {{ t('moderationUsers.loading') }}
          </span>
        </div>

        <div v-if="!loading && users.length === 0" class="empty-state">
          <h3>{{ t('moderationUsers.empty.title') }}</h3>
          <p>{{ t('moderationUsers.empty.description') }}</p>
        </div>

        <div v-else class="users-table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>{{ t('moderationUsers.columns.user') }}</th>
                <th>{{ t('moderationUsers.columns.role') }}</th>
                <th>{{ t('moderationUsers.columns.status') }}</th>
                <th>{{ t('moderationUsers.columns.region') }}</th>
                <th>{{ t('moderationUsers.columns.updatedAt') }}</th>
                <th>{{ t('moderationUsers.columns.actions') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-cell__avatar">
                      {{ getUserInitial(user) }}
                    </div>

                    <div class="user-cell__content">
                      <div class="user-cell__name-row">
                        <strong class="user-cell__name">{{ getDisplayName(user) }}</strong>
                        <span v-if="user.deleted_at" class="inline-badge inline-badge--deleted">
                          {{ t('moderationUsers.badges.deleted') }}
                        </span>
                      </div>

                      <div class="user-cell__meta">
                        <span>{{ user.email || t('moderationUsers.values.noEmail') }}</span>
                        <span>•</span>
                        <span>#{{ user.id }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span :class="['pill', `pill--role-${user.role}`]">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>

                <td>
                  <span :class="['pill', `pill--status-${getStatusKey(user)}`]">
                    {{ getStatusLabel(user) }}
                  </span>
                </td>

                <td>
                  {{ user.region || t('moderationUsers.values.notSet') }}
                </td>

                <td>
                  {{ formatDate(user.updated_at || user.created_at) }}
                </td>

                <td>
                  <div class="actions-panel">
                    <button
                      type="button"
                      class="mini-btn mini-btn--primary"
                      :disabled="actionLoadingId === user.id"
                      @click="viewUser(user)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="mdiEyeOutline" />
                      </svg>
                      {{ t('moderationUsers.rowActions.view') }}
                    </button>

                    <div class="actions-panel__bottom">
                      <label class="row-select">
                        <span class="row-select__label">
                          {{ t('moderationUsers.rowActions.role') }}
                        </span>

                        <select
                          v-model="pendingRoles[user.id]"
                          class="row-select__control"
                          :disabled="actionLoadingId === user.id"
                          @change="changeRoleFromSelect(user)"
                        >
                          <option value="player">{{ t('moderationUsers.roles.player') }}</option>
                          <option value="moderator">
                            {{ t('moderationUsers.roles.moderator') }}
                          </option>
                          <option value="admin">{{ t('moderationUsers.roles.admin') }}</option>
                        </select>
                      </label>

                      <button
                        type="button"
                        class="mini-btn mini-btn--warn"
                        :disabled="actionLoadingId === user.id"
                        @click="toggleBan(user)"
                      >
                        {{
                          user.status === 3
                            ? t('moderationUsers.rowActions.unban')
                            : t('moderationUsers.rowActions.ban')
                        }}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <button
            type="button"
            class="pagination-btn"
            :disabled="loading || usersPagination.page <= 1"
            @click="goToPage(usersPagination.page - 1)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="mdiChevronLeft" />
            </svg>
            {{ t('moderationUsers.pagination.previous') }}
          </button>

          <span class="pagination-info">
            {{
              t('moderationUsers.pagination.page', {
                page: usersPagination.page,
                totalPages: Math.max(usersPagination.totalPages, 1),
              })
            }}
          </span>

          <button
            type="button"
            class="pagination-btn"
            :disabled="loading || usersPagination.page >= usersPagination.totalPages"
            @click="goToPage(usersPagination.page + 1)"
          >
            {{ t('moderationUsers.pagination.next') }}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="mdiChevronRight" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiEyeOutline,
  mdiMagnify,
  mdiRefresh,
} from '@mdi/js'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useModerationUsersStore } from '@/stores/moderation'

type UserRole = 'player' | 'admin' | 'moderator'
type UserStatus = 0 | 1 | 2 | 3
type UserDeletedFilter = 'all' | 'active' | 'deleted'
type UserSortBy = 'updated_at' | 'created_at' | 'username' | 'email' | 'role' | 'status'
type UserSortOrder = 'asc' | 'desc'
type UiStatusFilter = 'all' | '0' | '1' | '2' | '3'
type FeedbackType = 'success' | 'warning' | 'error'

type UserProfile = {
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

type UserListFilters = {
  search: string
  role: 'all' | UserRole
  status: 'all' | UserStatus
  deleted: UserDeletedFilter
  page: number
  limit: number
  sortBy: UserSortBy
  sortOrder: UserSortOrder
}

const DEFAULT_USER_LIST_FILTERS: UserListFilters = {
  search: '',
  role: 'all',
  status: 'all',
  deleted: 'all',
  page: 1,
  limit: 20,
  sortBy: 'updated_at',
  sortOrder: 'desc',
}

const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })

const actionLoadingId = ref<number | null>(null)
const feedback = ref<{ type: FeedbackType; message: string } | null>(null)
const loading = ref(false)
const pendingRoles = ref<Record<number, UserRole>>({})

const filters = reactive<{
  search: string
  role: 'all' | UserRole
  status: UiStatusFilter
  deleted: UserDeletedFilter
  page: number
  limit: number
  sortBy: UserSortBy
  sortOrder: UserSortOrder
}>({
  search: DEFAULT_USER_LIST_FILTERS.search,
  role: DEFAULT_USER_LIST_FILTERS.role,
  status: 'all',
  deleted: DEFAULT_USER_LIST_FILTERS.deleted,
  page: DEFAULT_USER_LIST_FILTERS.page,
  limit: DEFAULT_USER_LIST_FILTERS.limit,
  sortBy: DEFAULT_USER_LIST_FILTERS.sortBy,
  sortOrder: DEFAULT_USER_LIST_FILTERS.sortOrder,
})

function buildIso(date: string) {
  return new Date(date).toISOString()
}

const allUsers = ref<UserProfile[]>([
  {
    id: 1,
    pocketbase_user_id: 'pb_001',
    username: 'enzo',
    email: 'enzo@gamedash.test',
    role: 'admin',
    status: 1,
    region: 'Île-de-France',
    bio: 'Admin principal',
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-01T10:00:00'),
    updated_at: buildIso('2026-04-06T11:15:00'),
    deleted_at: null,
  },
  {
    id: 2,
    pocketbase_user_id: 'pb_002',
    username: 'alice',
    email: 'alice@gamedash.test',
    role: 'moderator',
    status: 1,
    region: 'Lyon',
    bio: 'Modération communauté',
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-02T14:00:00'),
    updated_at: buildIso('2026-04-06T09:40:00'),
    deleted_at: null,
  },
  {
    id: 3,
    pocketbase_user_id: 'pb_003',
    username: 'neo_runner',
    email: 'neo.runner@gamedash.test',
    role: 'player',
    status: 2,
    region: 'Marseille',
    bio: null,
    language: 'en',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-04T09:30:00'),
    updated_at: buildIso('2026-04-05T18:20:00'),
    deleted_at: null,
  },
  {
    id: 4,
    pocketbase_user_id: 'pb_004',
    username: 'shadowfox',
    email: 'shadowfox@gamedash.test',
    role: 'player',
    status: 3,
    region: 'Lille',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-05T12:10:00'),
    updated_at: buildIso('2026-04-06T07:15:00'),
    deleted_at: null,
  },
  {
    id: 5,
    pocketbase_user_id: 'pb_005',
    username: 'luna',
    email: 'luna@gamedash.test',
    role: 'player',
    status: 1,
    region: 'Bordeaux',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-06T16:00:00'),
    updated_at: buildIso('2026-04-04T20:10:00'),
    deleted_at: null,
  },
  {
    id: 6,
    pocketbase_user_id: 'pb_006',
    username: 'atlas',
    email: 'atlas@gamedash.test',
    role: 'moderator',
    status: 2,
    region: 'Toulouse',
    bio: null,
    language: 'en',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-07T08:00:00'),
    updated_at: buildIso('2026-04-02T13:00:00'),
    deleted_at: null,
  },
  {
    id: 7,
    pocketbase_user_id: 'pb_007',
    username: 'nova',
    email: 'nova@gamedash.test',
    role: 'player',
    status: 1,
    region: 'Nantes',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-08T11:00:00'),
    updated_at: buildIso('2026-04-05T10:30:00'),
    deleted_at: null,
  },
  {
    id: 8,
    pocketbase_user_id: 'pb_008',
    username: 'blitz',
    email: 'blitz@gamedash.test',
    role: 'player',
    status: 0,
    region: 'Paris',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-09T09:00:00'),
    updated_at: buildIso('2026-04-01T15:40:00'),
    deleted_at: buildIso('2026-04-01T15:40:00'),
  },
  {
    id: 9,
    pocketbase_user_id: 'pb_009',
    username: 'raven',
    email: 'raven@gamedash.test',
    role: 'player',
    status: 2,
    region: 'Nice',
    bio: null,
    language: 'en',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-10T13:20:00'),
    updated_at: buildIso('2026-04-03T14:10:00'),
    deleted_at: null,
  },
  {
    id: 10,
    pocketbase_user_id: 'pb_010',
    username: 'pixelqueen',
    email: 'pixelqueen@gamedash.test',
    role: 'player',
    status: 1,
    region: 'Strasbourg',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-11T18:30:00'),
    updated_at: buildIso('2026-04-06T08:55:00'),
    deleted_at: null,
  },
  {
    id: 11,
    pocketbase_user_id: 'pb_011',
    username: 'thorium',
    email: 'thorium@gamedash.test',
    role: 'player',
    status: 3,
    region: 'Rennes',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-12T07:10:00'),
    updated_at: buildIso('2026-04-05T17:45:00'),
    deleted_at: null,
  },
  {
    id: 12,
    pocketbase_user_id: 'pb_012',
    username: 'mira',
    email: 'mira@gamedash.test',
    role: 'player',
    status: 1,
    region: 'Montpellier',
    bio: null,
    language: 'en',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-13T10:45:00'),
    updated_at: buildIso('2026-04-06T06:25:00'),
    deleted_at: null,
  },
  {
    id: 13,
    pocketbase_user_id: 'pb_013',
    username: 'helios',
    email: 'helios@gamedash.test',
    role: 'moderator',
    status: 1,
    region: 'Grenoble',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-14T12:00:00'),
    updated_at: buildIso('2026-04-04T19:00:00'),
    deleted_at: null,
  },
  {
    id: 14,
    pocketbase_user_id: 'pb_014',
    username: 'ivy',
    email: 'ivy@gamedash.test',
    role: 'player',
    status: 2,
    region: null,
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-15T09:40:00'),
    updated_at: buildIso('2026-04-03T21:00:00'),
    deleted_at: null,
  },
  {
    id: 15,
    pocketbase_user_id: 'pb_015',
    username: 'zenit',
    email: 'zenit@gamedash.test',
    role: 'player',
    status: 0,
    region: 'Paris',
    bio: null,
    language: 'en',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-16T15:15:00'),
    updated_at: buildIso('2026-04-02T10:25:00'),
    deleted_at: buildIso('2026-04-02T10:25:00'),
  },
  {
    id: 16,
    pocketbase_user_id: 'pb_016',
    username: 'ember',
    email: 'ember@gamedash.test',
    role: 'admin',
    status: 2,
    region: 'Bruxelles',
    bio: null,
    language: 'fr',
    matchmaking_pref: null,
    created_at: buildIso('2026-03-17T11:20:00'),
    updated_at: buildIso('2026-04-06T05:45:00'),
    deleted_at: null,
  },
])

const statusQuickFilters = computed(() => [
  { value: 'all' as const, label: t('moderationUsers.statuses.all') },
  { value: '1' as const, label: t('moderationUsers.statuses.online') },
  { value: '2' as const, label: t('moderationUsers.statuses.offline') },
  { value: '3' as const, label: t('moderationUsers.statuses.banned') },
  { value: '0' as const, label: t('moderationUsers.statuses.deleted') },
])

const filteredUsers = computed(() => {
  let result = [...allUsers.value]

  const search = filters.search.trim().toLowerCase()
  if (search) {
    result = result.filter((user) => {
      const haystack = [user.username, user.email, user.region, user.role, user.language]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(search)
    })
  }

  if (filters.role !== 'all') {
    result = result.filter((user) => user.role === filters.role)
  }

  if (filters.status !== 'all') {
    const status = Number(filters.status) as UserStatus
    result = result.filter((user) => user.status === status)
  }

  if (filters.deleted === 'active') {
    result = result.filter((user) => !user.deleted_at)
  }

  if (filters.deleted === 'deleted') {
    result = result.filter((user) => !!user.deleted_at)
  }

  result.sort((left, right) => {
    const leftValue = getSortableValue(left, filters.sortBy)
    const rightValue = getSortableValue(right, filters.sortBy)

    if (leftValue < rightValue) {
      return filters.sortOrder === 'asc' ? -1 : 1
    }

    if (leftValue > rightValue) {
      return filters.sortOrder === 'asc' ? 1 : -1
    }

    return 0
  })

  return result
})

const usersPagination = computed(() => {
  const total = filteredUsers.value.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit)
  const safePage = totalPages === 0 ? 1 : Math.min(filters.page, totalPages)

  return {
    page: safePage,
    limit: filters.limit,
    total,
    totalPages,
  }
})

const users = computed(() => {
  const offset = (usersPagination.value.page - 1) * usersPagination.value.limit
  return filteredUsers.value.slice(offset, offset + usersPagination.value.limit)
})

const activeFilterCount = computed(() => {
  let count = 0

  if (filters.search.trim()) count += 1
  if (filters.role !== DEFAULT_USER_LIST_FILTERS.role) count += 1
  if (filters.status !== 'all') count += 1
  if (filters.deleted !== DEFAULT_USER_LIST_FILTERS.deleted) count += 1
  if (filters.sortBy !== DEFAULT_USER_LIST_FILTERS.sortBy) count += 1
  if (filters.sortOrder !== DEFAULT_USER_LIST_FILTERS.sortOrder) count += 1
  if (filters.limit !== DEFAULT_USER_LIST_FILTERS.limit) count += 1

  return count
})

const bannedCount = computed(() => filteredUsers.value.filter((user) => user.status === 3).length)
const deletedCount = computed(() => filteredUsers.value.filter((user) => !!user.deleted_at).length)
const adminsAndModeratorsCount = computed(
  () =>
    filteredUsers.value.filter((user) => user.role === 'admin' || user.role === 'moderator').length,
)

watch(
  users,
  (value) => {
    const next: Record<number, UserRole> = { ...pendingRoles.value }

    value.forEach((user) => {
      next[user.id] = user.role
    })

    pendingRoles.value = next
  },
  { immediate: true },
)

watch(
  () => [filteredUsers.value.length, filters.limit],
  () => {
    const totalPages = usersPagination.value.totalPages

    if (totalPages === 0) {
      filters.page = 1
      return
    }

    if (filters.page > totalPages) {
      filters.page = totalPages
    }
  },
)

onMounted(() => {
  void initPage()
})

async function initPage() {
  await loadUsers()
}

function goBackToModeration() {
  router.push('/moderation')
}

function getSortableValue(user: UserProfile, sortBy: UserSortBy) {
  if (sortBy === 'username') return (user.username ?? '').toLowerCase()
  if (sortBy === 'email') return (user.email ?? '').toLowerCase()
  if (sortBy === 'role') return user.role
  if (sortBy === 'status') return user.status
  if (sortBy === 'created_at') return user.created_at ?? ''
  return user.updated_at ?? ''
}

function setFeedback(type: FeedbackType, message: string) {
  feedback.value = { type, message }
}

async function loadUsers() {
  loading.value = true
  await wait(180)
  loading.value = false
}

async function submitFilters() {
  filters.page = 1
  await loadUsers()
}

async function resetFilters() {
  filters.search = DEFAULT_USER_LIST_FILTERS.search
  filters.role = DEFAULT_USER_LIST_FILTERS.role
  filters.status = 'all'
  filters.deleted = DEFAULT_USER_LIST_FILTERS.deleted
  filters.page = DEFAULT_USER_LIST_FILTERS.page
  filters.limit = DEFAULT_USER_LIST_FILTERS.limit
  filters.sortBy = DEFAULT_USER_LIST_FILTERS.sortBy
  filters.sortOrder = DEFAULT_USER_LIST_FILTERS.sortOrder
  feedback.value = null

  await loadUsers()
}

function clearSearch() {
  filters.search = ''
}

function setQuickStatus(value: UiStatusFilter) {
  filters.status = value
}

async function goToPage(page: number) {
  if (page < 1) return
  if (usersPagination.value.totalPages !== 0 && page > usersPagination.value.totalPages) return

  filters.page = page
  await loadUsers()
}

function getDisplayName(user: UserProfile) {
  return user.username || user.email || t('moderationUsers.values.unknownUser')
}

function getUserInitial(user: UserProfile) {
  return getDisplayName(user).charAt(0).toUpperCase() || 'U'
}

function getRoleLabel(role: UserRole) {
  if (role === 'admin') return t('moderationUsers.roles.admin')
  if (role === 'moderator') return t('moderationUsers.roles.moderator')
  return t('moderationUsers.roles.player')
}

function getStatusKey(user: UserProfile) {
  if (user.deleted_at || user.status === 0) return 'deleted'
  if (user.status === 1) return 'online'
  if (user.status === 2) return 'offline'
  if (user.status === 3) return 'banned'
  return 'offline'
}

function getStatusLabel(user: UserProfile) {
  return t(`moderationUsers.statuses.${getStatusKey(user)}`)
}

function formatDate(value: string | null) {
  if (!value) return t('moderationUsers.values.notSet')

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function patchLocalUser(userId: number, payload: Partial<UserProfile>) {
  const updatedAt = new Date().toISOString()

  allUsers.value = allUsers.value.map((user) =>
    user.id === userId
      ? {
          ...user,
          ...payload,
          updated_at: updatedAt,
        }
      : user,
  )

  if (moderationStore.selectedUser?.id === userId) {
    moderationStore.patchSelectedUser({
      ...payload,
      updated_at: updatedAt,
    })
  }
}

async function runLocalAction(
  user: UserProfile,
  payload: Partial<Pick<UserProfile, 'role' | 'status'>>,
  message: string,
  feedbackType: FeedbackType = 'success',
) {
  actionLoadingId.value = user.id

  await wait(160)

  patchLocalUser(user.id, payload)
  setFeedback(feedbackType, message)

  actionLoadingId.value = null
}

async function changeRoleFromSelect(user: UserProfile) {
  const nextRole = pendingRoles.value[user.id] ?? user.role

  if (nextRole === user.role) {
    return
  }

  await runLocalAction(
    user,
    { role: nextRole },
    t('moderationUsers.messages.roleSimulated', {
      user: getDisplayName(user),
      role: getRoleLabel(nextRole),
    }),
  )
}

async function toggleBan(user: UserProfile) {
  const nextStatus: UserStatus = user.status === 3 ? 2 : 3

  await runLocalAction(
    user,
    { status: nextStatus },
    user.status === 3
      ? t('moderationUsers.messages.userUnbannedSimulated', { user: getDisplayName(user) })
      : t('moderationUsers.messages.userBannedSimulated', { user: getDisplayName(user) }),
    'warning',
  )
}

const moderationStore = useModerationUsersStore()

function viewUser(user: UserProfile) {
  moderationStore.setSelectedUser(user)

  router.push({
    name: 'moderation-user-detail',
    params: { id: user.id },
  })
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
</script>

<style scoped>
.moderation-users-view {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
}

.moderation-users-shell {
  max-width: 1450px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}

.page-header__title {
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 1.05;
  color: var(--color-cream);
}

.page-header__subtitle {
  margin: 0.65rem 0 0;
  max-width: 760px;
  color: rgba(252, 239, 225, 0.8);
}

.page-header__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feedback-banner,
.filters-card,
.table-card,
.stat-card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
}

.feedback-banner {
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  color: var(--color-ink);
  background: rgba(252, 239, 225, 0.98);
}

.feedback-banner--success {
  border-color: rgba(61, 191, 125, 0.35);
}

.feedback-banner--warning {
  border-color: rgba(242, 139, 91, 0.35);
}

.feedback-banner--error {
  border-color: rgba(225, 91, 91, 0.35);
}

.filters-card,
.table-card {
  background: rgba(252, 239, 225, 0.98);
}

.filters-card {
  padding: 1.4rem;
}

.search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.search-field__control {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.search-field__control:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.16);
}

.search-field__icon {
  width: 20px;
  height: 20px;
  fill: var(--color-ink-muted);
  margin-left: 1rem;
  flex-shrink: 0;
}

.search-field__input {
  flex: 1;
  min-width: 0;
  height: 56px;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 0.85rem;
  font: inherit;
  color: var(--color-text);
}

.search-field__clear {
  width: 42px;
  height: 42px;
  margin-right: 0.45rem;
  border: none;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink-muted);
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-field__clear svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.search-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-statuses {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1rem;
}

.quick-status {
  border: 1px solid rgba(46, 50, 68, 0.12);
  background: rgba(255, 255, 255, 0.74);
  color: var(--color-ink);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.quick-status:hover {
  transform: translateY(-1px);
}

.quick-status--active {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  border-color: transparent;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1rem;
}

.field__control {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.86);
  padding: 0.75rem 0.9rem;
  color: var(--color-text);
  font: inherit;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field__control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.16);
}

.filters-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.filters-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.42rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
}

.summary-pill--accent {
  color: #8a5c1d;
  background: rgba(242, 139, 91, 0.16);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 46px;
  border: none;
  border-radius: 14px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.toolbar-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.toolbar-btn:hover {
  transform: translateY(-1px);
}

.toolbar-btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
}

.toolbar-btn--ghost {
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.stat-card {
  padding: 1.1rem 1.2rem;
  background: rgba(252, 239, 225, 0.98);
}

.stat-card__label {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-ink);
  font-size: 1.6rem;
  font-weight: 700;
}

.table-card {
  padding: 1.25rem;
}

.table-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.table-card__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.4rem;
  color: var(--color-ink);
}

.table-card__subtitle {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
}

.table-card__loading {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 700;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state h3 {
  margin: 0;
  color: var(--color-ink);
}

.empty-state p {
  margin: 0.5rem 0 0;
  color: var(--color-text-muted);
}

.users-table-wrap {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem 0.8rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(46, 50, 68, 0.08);
}

.users-table th {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.user-cell {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 280px;
}

.user-cell__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: white;
  font-weight: 700;
  flex-shrink: 0;
}

.user-cell__content {
  min-width: 0;
}

.user-cell__name-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.user-cell__name {
  color: var(--color-ink);
}

.user-cell__meta {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-top: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.inline-badge,
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
}

.inline-badge {
  padding: 0.28rem 0.55rem;
}

.inline-badge--deleted {
  color: var(--color-ink-muted);
  background: rgba(106, 114, 136, 0.14);
}

.pill {
  padding: 0.35rem 0.7rem;
}

.pill--role-player {
  color: #31598c;
  background: rgba(49, 89, 140, 0.12);
}

.pill--role-moderator {
  color: #8a5c1d;
  background: rgba(242, 139, 91, 0.18);
}

.pill--role-admin {
  color: #5d2ca8;
  background: rgba(93, 44, 168, 0.12);
}

.pill--status-online {
  color: #146c43;
  background: rgba(61, 191, 125, 0.14);
}

.pill--status-offline {
  color: #5d677a;
  background: rgba(106, 114, 136, 0.12);
}

.pill--status-banned {
  color: #9f2f2f;
  background: rgba(225, 91, 91, 0.14);
}

.pill--status-deleted {
  color: #5d677a;
  background: rgba(106, 114, 136, 0.14);
}

.actions-panel {
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.actions-panel__bottom {
  display: flex;
  align-items: end;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.row-select {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 150px;
  flex: 1;
}

.row-select__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.row-select__control {
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.84);
  padding: 0.5rem 0.75rem;
  color: var(--color-text);
  font: inherit;
  outline: none;
}

.row-select__control:focus {
  border-color: var(--color-primary);
}

.mini-btn {
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.84);
  color: var(--color-ink);
  border-radius: 12px;
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.mini-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.mini-btn:hover {
  transform: translateY(-1px);
}

.mini-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.mini-btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  border-color: transparent;
}

.mini-btn--warn {
  color: #8a5c1d;
  background: rgba(242, 139, 91, 0.14);
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.82);
  padding: 0.65rem 0.9rem;
  color: var(--color-ink);
  font-weight: 700;
  cursor: pointer;
}

.pagination-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.pagination-info {
  color: var(--color-text-muted);
  font-weight: 700;
}

@media (max-width: 1300px) {
  .filters-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
  .moderation-users-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-row {
    grid-template-columns: 1fr;
  }

  .search-actions {
    justify-content: stretch;
  }

  .search-actions .toolbar-btn {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-btn {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .stats-grid,
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .actions-panel__bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .row-select {
    width: 100%;
  }

  .mini-btn {
    width: 100%;
  }
}
</style>
