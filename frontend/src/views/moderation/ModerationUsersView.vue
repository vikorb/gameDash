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
          <ExportButton entity="users" />

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
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import ExportButton from '@/components/export/ExportButton.vue'
import {
  type ModerationSelectedUser,
  type ModerationUserRole,
  type ModerationUserStatus,
  useModerationUsersStore,
} from '@/stores/moderation'

type UserRole = ModerationUserRole
type UserStatus = ModerationUserStatus
type UserDeletedFilter = 'all' | 'active' | 'deleted'
type UserSortBy = 'updated_at' | 'created_at' | 'username' | 'email' | 'role' | 'status'
type UserSortOrder = 'asc' | 'desc'
type UiStatusFilter = 'all' | '0' | '1' | '2' | '3'
type FeedbackType = 'success' | 'warning' | 'error'
type UserProfile = ModerationSelectedUser

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
const moderationStore = useModerationUsersStore()
const {
  users,
  pagination: usersPagination,
  summary: usersSummary,
  loading,
} = storeToRefs(moderationStore)

const actionLoadingId = ref<number | null>(null)
const feedback = ref<{ type: FeedbackType; message: string } | null>(null)
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

const statusQuickFilters = computed(() => [
  { value: 'all' as const, label: t('moderationUsers.statuses.all') },
  { value: '1' as const, label: t('moderationUsers.statuses.online') },
  { value: '2' as const, label: t('moderationUsers.statuses.offline') },
  { value: '3' as const, label: t('moderationUsers.statuses.banned') },
  { value: '0' as const, label: t('moderationUsers.statuses.deleted') },
])

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

const bannedCount = computed(() => usersSummary.value.bannedCount)
const deletedCount = computed(() => usersSummary.value.deletedCount)
const adminsAndModeratorsCount = computed(() => usersSummary.value.adminsAndModeratorsCount)

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

onMounted(() => {
  void initPage()
})

async function initPage() {
  await loadUsers()
}

function goBackToModeration() {
  router.push('/moderation')
}

function setFeedback(type: FeedbackType, message: string) {
  feedback.value = { type, message }
}

async function loadUsers() {
  try {
    await moderationStore.fetchUsers({
      search: filters.search,
      role: filters.role,
      status: filters.status,
      deleted: filters.deleted,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    })
  } catch (err) {
    setFeedback(
      'error',
      err instanceof Error ? err.message : 'Impossible de charger les utilisateurs.',
    )
  }
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
  filters.page = 1
  void loadUsers()
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

async function changeRoleFromSelect(user: UserProfile) {
  const nextRole = pendingRoles.value[user.id] ?? user.role

  if (nextRole === user.role) return

  actionLoadingId.value = user.id

  try {
    await moderationStore.updateUserRole(user.id, nextRole, 'POC Admin')
    setFeedback(
      'success',
      t('moderationUsers.messages.roleSimulated', {
        user: getDisplayName(user),
        role: getRoleLabel(nextRole),
      }),
    )
  } catch (err) {
    pendingRoles.value[user.id] = user.role
    setFeedback('error', err instanceof Error ? err.message : 'Action impossible côté API.')
  } finally {
    actionLoadingId.value = null
  }
}

async function toggleBan(user: UserProfile) {
  const nextStatus: UserStatus = user.status === 3 ? 2 : 3
  actionLoadingId.value = user.id

  try {
    await moderationStore.updateUserStatus(user.id, nextStatus, 'POC Admin')
    setFeedback(
      'warning',
      user.status === 3
        ? t('moderationUsers.messages.userUnbannedSimulated', { user: getDisplayName(user) })
        : t('moderationUsers.messages.userBannedSimulated', { user: getDisplayName(user) }),
    )
  } catch (err) {
    setFeedback('error', err instanceof Error ? err.message : 'Action impossible côté API.')
  } finally {
    actionLoadingId.value = null
  }
}

function viewUser(user: UserProfile) {
  moderationStore.setSelectedUser(user)

  router.push({
    name: 'moderation-user-detail',
    params: { id: user.id },
  })
}
</script>

<style scoped>
.moderation-users-view {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

/* ── Layout ─────────────────────────────────────────────── */
.moderation-users-shell {
  max-width: 1380px;
  margin: 0 auto;
}

/* ── Header ─────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.35rem;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.24), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.page-header > * {
  position: relative;
  z-index: 1;
}

.page-header__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header__title {
  margin: 1rem 0 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.page-header__subtitle {
  max-width: 760px;
  margin: 0.9rem 0 0;
  color: rgba(252, 239, 225, 0.7);
  font-size: 1rem;
  line-height: 1.65;
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.7rem;
  flex-shrink: 0;
}

/* ── Buttons ─────────────────────────────────────────────── */
.toolbar-btn,
.mini-btn,
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    filter 0.16s ease;
}

.toolbar-btn {
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

.toolbar-btn svg,
.mini-btn svg,
.pagination-btn svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
  flex-shrink: 0;
}

.toolbar-btn:hover:not(:disabled),
.mini-btn:hover:not(:disabled),
.pagination-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.toolbar-btn:disabled,
.mini-btn:disabled,
.pagination-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.toolbar-btn--primary,
.mini-btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.toolbar-btn--primary:hover:not(:disabled),
.mini-btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.toolbar-btn--ghost,
.pagination-btn {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.toolbar-btn--ghost:hover:not(:disabled),
.pagination-btn:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.mini-btn {
  min-height: 36px;
  padding: 0.52rem 0.82rem;
  font-size: 0.78rem;
}

.mini-btn--warn {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.32);
  margin-top: 33px;
  height: 20px;
}

.mini-btn--warn:hover:not(:disabled) {
  color: #ffd0d0;
  background: rgba(225, 91, 91, 0.22);
  border-color: rgba(225, 91, 91, 0.46);
}

/* ── Feedback ────────────────────────────────────────────── */
.feedback-banner {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-weight: 900;
  line-height: 1.45;
  box-shadow: 0 14px 30px -24px rgba(0, 0, 0, 0.85);
}

.feedback-banner--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
}

.feedback-banner--warning {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border: 1px solid rgba(242, 139, 91, 0.32);
}

.feedback-banner--error {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.35);
}

/* ── Shared cards ────────────────────────────────────────── */
.filters-card,
.table-card,
.stat-card,
.empty-state {
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.filters-card,
.table-card {
  padding: 1.15rem;
}

/* ── Filters ─────────────────────────────────────────────── */
.filters-card {
  margin-bottom: 1.35rem;
}

.search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
}

.search-field,
.field,
.row-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: auto;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.field__label,
.search-field__label,
.row-select__label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.1);
  border: 1px solid rgba(242, 139, 91, 0.22);
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.search-field__control {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 54px;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.search-field__control:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.search-field__control:focus-within {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
}

.search-field__icon {
  width: 20px;
  height: 20px;
  fill: rgba(252, 239, 225, 0.48);
  margin-left: 1rem;
  flex-shrink: 0;
}

.search-field__input {
  width: 100%;
  min-height: 54px;
  border: none;
  background: transparent;
  color: var(--color-cream);
  padding: 0 0.8rem;
  font: inherit;
  font-weight: 800;
  outline: none;
}

.search-field__input::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.search-field__clear {
  width: 42px;
  height: 42px;
  margin-right: 0.45rem;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.64);
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.search-field__clear:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
  transform: translateY(-1px);
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
  min-height: 40px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.76);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  font-size: 0.84rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.quick-status:hover {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.12);
  border-color: rgba(242, 139, 91, 0.34);
}

.quick-status--active {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: transparent;
  box-shadow: 0 14px 26px -20px rgba(242, 139, 91, 0.95);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1rem;
}

.field__control,
.row-select__control {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.85rem 0.95rem;
  font: inherit;
  font-weight: 800;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.field__control:hover,
.row-select__control:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field__control:focus,
.row-select__control:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
  transform: translateY(-1px);
}

.field__control option,
.row-select__control option {
  background: var(--color-navy);
  color: var(--color-cream);
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
  width: fit-content;
  padding: 0.36rem 0.68rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.78rem;
  font-weight: 900;
}

.summary-pill--accent {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

/* ── Stats ───────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.stat-card {
  padding: 1rem;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1;
}

/* ── Table card ──────────────────────────────────────────── */
.table-card {
  padding: 1.15rem;
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
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.table-card__subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.9rem;
  line-height: 1.55;
}

.table-card__loading {
  display: inline-flex;
  align-items: center;
  padding: 0.36rem 0.68rem;
  border-radius: 999px;
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border: 1px solid rgba(242, 139, 91, 0.28);
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  border-style: dashed;
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.68), rgba(46, 50, 68, 0.94)), var(--color-navy);
}

.empty-state h3 {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}

.empty-state p {
  max-width: 520px;
  margin: 0.6rem auto 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* ── Users table ─────────────────────────────────────────── */
.users-table-wrap {
  overflow-x: auto;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.22);
}

.users-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 0.9rem;
  border-bottom: 1px solid rgba(252, 239, 225, 0.08);
  text-align: left;
  color: rgba(252, 239, 225, 0.78);
  vertical-align: middle;
}

.users-table th {
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(18, 24, 38, 0.34);
  white-space: nowrap;
}

.users-table tbody tr {
  transition:
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.users-table tbody tr:hover {
  background: rgba(242, 139, 91, 0.06);
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

/* ── User cell ───────────────────────────────────────────── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 260px;
}

.user-cell__avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 12px 24px -18px rgba(242, 139, 91, 0.95);
}

.user-cell__content {
  min-width: 0;
}

.user-cell__name-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.user-cell__name {
  color: var(--color-cream);
  font-weight: 900;
}

.user-cell__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.18rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.8rem;
}

/* ── Pills / badges ──────────────────────────────────────── */
.pill,
.inline-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.34rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.76rem;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.inline-badge--deleted,
.pill--status-deleted,
.pill--status-banned {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border-color: rgba(225, 91, 91, 0.3);
}

.pill--status-online {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.pill--status-offline {
  color: rgba(252, 239, 225, 0.6);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.pill--role-admin {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.28);
}

.pill--role-moderator {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.28);
}

.pill--role-player {
  color: rgba(252, 239, 225, 0.76);
  background: rgba(18, 24, 38, 0.32);
  border-color: rgba(252, 239, 225, 0.1);
}

/* ── Row actions ─────────────────────────────────────────── */
.actions-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 230px;
}

.actions-panel__bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.row-select {
  flex: 1 1 130px;
}

.row-select__control {
  min-height: 36px;
  padding: 0.5rem 0.7rem;
  border-radius: 12px;
  font-size: 0.78rem;
}

.actions-panel__bottom .mini-btn {
  flex: 1 1 auto;
}

/* ── Pagination ──────────────────────────────────────────── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0 0;
}

.pagination-info {
  color: rgba(252, 239, 225, 0.58);
  font-weight: 800;
  text-align: center;
}

.pagination-btn {
  min-height: 38px;
  padding: 0.55rem 0.85rem;
  font-size: 0.82rem;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1180px) {
  .stats-grid,
  .filters-grid,
  .search-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    justify-content: flex-start;
  }

  .search-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .moderation-users-view {
    padding: 1rem;
  }

  .page-header,
  .filters-card,
  .table-card,
  .stat-card,
  .empty-state {
    border-radius: 22px;
  }

  .page-header,
  .filters-card,
  .table-card {
    padding: 1rem;
  }

  .page-header__title {
    font-size: 2rem;
  }

  .page-header__actions,
  .search-actions,
  .filters-footer,
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-btn,
  .pagination-btn {
    width: 100%;
  }

  .quick-status {
    flex: 1 1 calc(50% - 0.65rem);
    justify-content: center;
  }

  .table-card__header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 560px) {
  .quick-status {
    flex-basis: 100%;
  }

  .actions-panel,
  .actions-panel__bottom {
    min-width: 0;
    width: 100%;
  }

  .actions-panel__bottom {
    flex-direction: column;
  }

  .mini-btn,
  .row-select {
    width: 100%;
  }
}
</style>
