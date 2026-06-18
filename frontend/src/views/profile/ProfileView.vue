<template>
  <div class="profile-page">
    <div class="profile-shell">
      <ProfileHeroCard :username="profileForm.username" :avatar-url="displayedAvatar" />

      <div v-if="loading" class="state-card">
        {{ $t('profile.states.loading') }}
      </div>

      <div v-else-if="loadError" class="state-card state-card--error">
        {{ loadError }}
      </div>

      <ProfileGrid v-else-if="user">
        <ProfileCard>
          <ProfileSectionHead
            title-key="profile.sections.profile.title"
            subtitle-key="profile.sections.profile.subtitle"
          />

          <ProfileNotice
            v-if="profileNotice"
            :type="profileNotice.type"
            :text="profileNotice.text"
          />

          <ProfileProfileForm
            :loading="savingProfile"
            :initial-values="profileForm"
            @submit="handleProfileSubmit"
            @cancel="handleProfileCancel"
          />
        </ProfileCard>

        <ProfileCard v-if="isAdminTargetView && user">
          <ProfileSectionHead
            title-key="profile.admin.sections.moderation.title"
            subtitle-key="profile.admin.sections.moderation.subtitle"
          />

          <ProfileNotice v-if="adminNotice" :type="adminNotice.type" :text="adminNotice.text" />

          <div class="admin-actions">
            <button
              type="button"
              class="admin-action-btn"
              :disabled="savingAdminActions"
              @click="handleAdminRoleQuickChange('player')"
            >
              {{ $t('profile.admin.actions.makePlayer') }}
            </button>

            <button
              type="button"
              class="admin-action-btn"
              :disabled="savingAdminActions"
              @click="handleAdminRoleQuickChange('moderator')"
            >
              {{ $t('profile.admin.actions.makeModerator') }}
            </button>

            <button
              type="button"
              class="admin-action-btn"
              :disabled="savingAdminActions"
              @click="handleAdminRoleQuickChange('admin')"
            >
              {{ $t('profile.admin.actions.makeAdmin') }}
            </button>

            <button
              type="button"
              class="admin-action-btn admin-action-btn--warn"
              :disabled="savingAdminActions"
              @click="handleAdminToggleBan"
            >
              {{
                Number(user.status) === 3
                  ? $t('profile.admin.actions.unban')
                  : $t('profile.admin.actions.ban')
              }}
            </button>
          </div>
        </ProfileCard>

        <template v-if="canShowSensitiveSections">
          <ProfileCard>
            <ProfileSectionHead
              title-key="profile.sections.avatar.title"
              subtitle-key="profile.sections.avatar.subtitle"
            />

            <ProfileNotice
              v-if="avatarNotice"
              :type="avatarNotice.type"
              :text="avatarNotice.text"
            />

            <ProfileAvatarCard
              :avatar-url="displayedAvatar"
              :file-name="avatarFile?.name ?? null"
              :initial="displayInitial"
              :has-file="!!avatarFile"
              :loading="savingAvatar"
              @change="handleAvatarFileChange"
              @cancel="handleAvatarCancel"
              @save="handleAvatarSubmit"
            />
          </ProfileCard>

          <ProfileCard>
            <ProfileSectionHead
              title-key="profile.sections.security.title"
              subtitle-key="profile.sections.security.subtitle"
            />

            <ProfileNotice
              v-if="passwordNotice"
              :type="passwordNotice.type"
              :text="passwordNotice.text"
            />

            <ProfilePasswordForm
              :loading="savingPassword"
              :reset-version="passwordResetVersion"
              @submit="handlePasswordSubmit"
              @cancel="handlePasswordCancel"
            />
          </ProfileCard>

          <ProfileCard>
            <ProfileSectionHead
              title-key="profile.sections.delete.title"
              subtitle-key="profile.sections.delete.subtitle"
            />

            <ProfileNotice
              v-if="deleteNotice"
              :type="deleteNotice.type"
              :text="deleteNotice.text"
            />

            <ProfileDeleteSection
              :loading="savingDelete"
              :reset-version="deleteResetVersion"
              @submit="handleDeleteProfile"
              @cancel="handleDeleteCancel"
            />
          </ProfileCard>
        </template>
      </ProfileGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { authService } from '@/services/pocketbase'
import {
  changeUserPassword,
  deleteUserProfile,
  type ProfileUser,
  updateUserProfile,
} from '@/services/profileApi'
import { useModerationUsersStore } from '@/stores/moderation'
import { useUserStore } from '@/stores/userStore'
import ProfileAvatarCard from '@/views/profile/ProfileAvatarCard.vue'
import ProfileCard from '@/views/profile/ProfileCard.vue'
import ProfileDeleteSection from '@/views/profile/ProfileDeleteSection.vue'
import ProfileGrid from '@/views/profile/ProfileGrid.vue'
import ProfileHeroCard from '@/views/profile/ProfileHeroCard.vue'
import ProfileNotice from '@/views/profile/ProfileNotice.vue'
import ProfilePasswordForm from '@/views/profile/ProfilePasswordForm.vue'
import ProfileProfileForm from '@/views/profile/ProfileProfileForm.vue'
import ProfileSectionHead from '@/views/profile/ProfileSectionHead.vue'

type Notice = {
  type: 'success' | 'error'
  text: string
}

type ProfileFormValues = {
  username: string
  email: string
  region: string
  bio: string
  language: string
  status: string
  role: string
  matchmaking_pref: string
}

type PasswordFormValues = {
  currentPassword: string
  password: string
  passwordConfirm: string
}

type DeleteFormValues = {
  currentPassword: string
}

const props = withDefaults(
  defineProps<{
    adminMode?: boolean
    userId?: number | null
  }>(),
  {
    adminMode: false,
    userId: null,
  },
)

const deleteResetVersion = ref(0)
const { t } = useI18n()
const loading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)
const savingAdminActions = ref(false)
const loadError = ref('')
const profileNotice = ref<Notice | null>(null)
const adminNotice = ref<Notice | null>(null)
const avatarNotice = ref<Notice | null>(null)
const passwordNotice = ref<Notice | null>(null)
const user = ref<ProfileUser | null>(null)
const avatarUrl = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const passwordResetVersion = ref(0)
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const savingAvatar = ref(false)
const router = useRouter()
const savingDelete = ref(false)
const deleteNotice = ref<Notice | null>(null)

const profileForm = ref<ProfileFormValues>({
  username: '',
  email: '',
  region: '',
  bio: '',
  language: '',
  status: '1',
  role: '',
  matchmaking_pref: '',
})

const isAdminTargetView = computed(() => props.adminMode && typeof props.userId === 'number')
const canShowSensitiveSections = computed(() => !isAdminTargetView.value)

const displayedAvatar = computed(() => avatarPreview.value || avatarUrl.value || null)
const displayInitial = computed(() => {
  const value = profileForm.value.username?.trim() || user.value?.username || 'U'
  return value.charAt(0).toUpperCase()
})

function clearProfileNotice() {
  profileNotice.value = null
}

function clearAdminNotice() {
  adminNotice.value = null
}

function clearAvatarNotice() {
  avatarNotice.value = null
}

function clearPasswordNotice() {
  passwordNotice.value = null
}

function clearDeleteNotice() {
  deleteNotice.value = null
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    throw new Error(t('profile.errors.invalidMatchmakingJson'))
  }
}

function optionalString(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function revokeAvatarPreview() {
  if (avatarPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }

  avatarPreview.value = null
}

function hydrateProfileForm(profile: ProfileUser) {
  profileForm.value = {
    username: profile.username ?? '',
    email: profile.email ?? '',
    region: profile.region ?? '',
    bio: profile.bio ?? '',
    language: profile.language ?? '',
    status: String(profile.status ?? 1),
    role: profile.role ?? '',
    matchmaking_pref:
      profile.matchmaking_pref !== null && profile.matchmaking_pref !== undefined
        ? JSON.stringify(profile.matchmaking_pref, null, 2)
        : '',
  }
}

function handleProfileCancel() {
  clearProfileNotice()
  if (user.value) {
    hydrateProfileForm(user.value)
  }
}

function handleAvatarCancel() {
  clearAvatarNotice()
  avatarFile.value = null
  revokeAvatarPreview()
}

function handlePasswordCancel() {
  clearPasswordNotice()
  passwordResetVersion.value += 1
}

const moderationStore = useModerationUsersStore()

async function loadProfile() {
  loading.value = true
  loadError.value = ''

  try {
    if (isAdminTargetView.value && props.userId) {
      moderationStore.hydrateSelectedUser()

      const selectedUser = moderationStore.selectedUser

      if (!selectedUser || Number(selectedUser.id) !== Number(props.userId)) {
        throw new Error(t('profile.admin.errors.mockUserNotFound'))
      }

      user.value = selectedUser as unknown as ProfileUser
      hydrateProfileForm(user.value)
      avatarUrl.value = null
      avatarFile.value = null
      revokeAvatarPreview()
      return
    }

    const authUser = authService.getUser()

    if (!authUser?.id) {
      throw new Error(t('profile.errors.sessionNotFound'))
    }

    if (!profile.value || profile.value.pocketbase_user_id !== authUser.id) {
      await userStore.hydrateFromSession(authUser.id)
    }

    if (!userStore.profile) {
      throw new Error(t('profile.errors.load'))
    }

    user.value = userStore.profile as unknown as ProfileUser
    hydrateProfileForm(user.value)

    try {
      avatarUrl.value = await authService.getAvatarUrl(authUser.id)
    } catch {
      avatarUrl.value = null
    }

    avatarFile.value = null
    revokeAvatarPreview()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : t('profile.errors.load')
  } finally {
    loading.value = false
  }
}

function handleAvatarFileChange(file: File) {
  avatarFile.value = file
  revokeAvatarPreview()
  avatarPreview.value = URL.createObjectURL(file)
}

async function handleProfileSubmit(values: ProfileFormValues) {
  if (!user.value) return

  clearProfileNotice()
  savingProfile.value = true

  try {
    if (!values.username.trim()) {
      throw new Error(t('profile.errors.usernameRequired'))
    }

    if (!values.email.trim()) {
      throw new Error(t('profile.errors.emailRequired'))
    }

    const matchmakingPref = values.matchmaking_pref.trim()
      ? safeJsonParse(values.matchmaking_pref)
      : null

    if (props.adminMode) {
      await new Promise((resolve) => window.setTimeout(resolve, 160))

      const updatedUser = {
        ...user.value,
        username: values.username.trim(),
        email: values.email.trim(),
        region: optionalString(values.region) ?? null,
        bio: values.bio,
        language: optionalString(values.language) ?? null,
        status: Number(values.status),
        role: values.role || user.value.role,
        matchmaking_pref: matchmakingPref,
        updated_at: new Date().toISOString(),
      }

      user.value = updatedUser
      moderationStore.patchSelectedUser({
        username: updatedUser.username,
        email: updatedUser.email,
        region: updatedUser.region,
        bio: updatedUser.bio,
        language: updatedUser.language,
        status: updatedUser.status as 0 | 1 | 2 | 3,
        role: updatedUser.role as 'player' | 'admin' | 'moderator',
        matchmaking_pref: updatedUser.matchmaking_pref,
        updated_at: updatedUser.updated_at,
      })

      hydrateProfileForm(updatedUser)

      profileNotice.value = {
        type: 'success',
        text: t('profile.notices.profileUpdated'),
      }

      return
    }

    const nextUsername = values.username.trim()
    const nextEmail = values.email.trim()
    const currentUsername = user.value.username ?? ''
    const currentEmail = user.value.email ?? ''

    const response = await updateUserProfile(user.value.id, {
      username: nextUsername !== currentUsername ? nextUsername : undefined,
      email: nextEmail !== currentEmail ? nextEmail : undefined,
      region: optionalString(values.region),
      bio: values.bio,
      language: optionalString(values.language),
      status: Number(values.status),
      role: undefined,
      matchmaking_pref: matchmakingPref,
    })

    user.value = response.user

    if (profile.value?.id === response.user.id) {
      userStore.profile = response.user as never
    }

    hydrateProfileForm(response.user)

    profileNotice.value = {
      type: 'success',
      text: t('profile.notices.profileUpdated'),
    }
  } catch (error) {
    profileNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.profileUpdate'),
    }
  } finally {
    savingProfile.value = false
  }
}

async function handleAvatarSubmit() {
  if (!user.value || !avatarFile.value) return

  clearAvatarNotice()
  savingAvatar.value = true

  try {
    const newAvatarUrl = await authService.updateAvatar(avatarFile.value)

    avatarUrl.value = newAvatarUrl
    avatarFile.value = null
    revokeAvatarPreview()

    avatarNotice.value = {
      type: 'success',
      text: t('profile.notices.avatarUpdated'),
    }
  } catch (error) {
    avatarNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.avatarUpdate'),
    }
  } finally {
    savingAvatar.value = false
  }
}

async function handlePasswordSubmit(values: PasswordFormValues) {
  if (!user.value) return

  clearPasswordNotice()

  if (!values.currentPassword.trim()) {
    passwordNotice.value = {
      type: 'error',
      text: t('profile.errors.passwordCurrentRequired'),
    }
    return
  }

  if (values.password.length < 8) {
    passwordNotice.value = {
      type: 'error',
      text: t('profile.errors.passwordTooShort'),
    }
    return
  }

  if (values.password !== values.passwordConfirm) {
    passwordNotice.value = {
      type: 'error',
      text: t('profile.errors.passwordConfirmMismatch'),
    }
    return
  }

  savingPassword.value = true

  try {
    try {
      await changeUserPassword(user.value.id, {
        currentPassword: values.currentPassword,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      })

      passwordNotice.value = {
        type: 'success',
        text: t('profile.notices.passwordUpdated'),
      }
    } catch {
      passwordNotice.value = {
        type: 'success',
        text: t('profile.notices.passwordUpdatedDemo'),
      }
    }

    passwordResetVersion.value += 1
  } catch (error) {
    passwordNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.passwordUpdate'),
    }
  } finally {
    savingPassword.value = false
  }
}

async function handleDeleteProfile(values: DeleteFormValues) {
  if (!user.value) return

  clearDeleteNotice()

  if (!values.currentPassword.trim()) {
    deleteNotice.value = {
      type: 'error',
      text: t('profile.errors.deletePasswordRequired'),
    }
    return
  }

  const confirmed = window.confirm(t('profile.delete.confirmPopup'))

  if (!confirmed) {
    return
  }

  savingDelete.value = true

  try {
    await deleteUserProfile(user.value.id, {
      currentPassword: values.currentPassword,
    })

    deleteNotice.value = {
      type: 'success',
      text: t('profile.notices.profileDeleted'),
    }

    deleteResetVersion.value += 1

    await authService.logout()
    userStore.clearProfile()
    await router.push('/login')
  } catch (error) {
    deleteNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.profileDelete'),
    }
  } finally {
    savingDelete.value = false
  }
}

function handleDeleteCancel() {
  clearDeleteNotice()
  deleteResetVersion.value += 1
}

async function handleAdminRoleQuickChange(role: 'player' | 'moderator' | 'admin') {
  if (!user.value) return

  clearAdminNotice()
  savingAdminActions.value = true

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 160))

    const nextUser = {
      ...user.value,
      role,
      updated_at: new Date().toISOString(),
    }

    user.value = nextUser
    moderationStore.patchSelectedUser({
      role,
      updated_at: nextUser.updated_at,
    })
    hydrateProfileForm(nextUser)

    adminNotice.value = {
      type: 'success',
      text: t('profile.admin.notices.roleUpdated'),
    }
  } catch (error) {
    adminNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.profileUpdate'),
    }
  } finally {
    savingAdminActions.value = false
  }
}

async function handleAdminToggleBan() {
  if (!user.value) return

  clearAdminNotice()
  savingAdminActions.value = true

  const nextStatus = Number(user.value.status) === 3 ? 2 : 3

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 160))

    const nextUser = {
      ...user.value,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    }

    user.value = nextUser
    moderationStore.patchSelectedUser({
      status: nextStatus,
      updated_at: nextUser.updated_at,
    })
    hydrateProfileForm(nextUser)

    adminNotice.value = {
      type: 'success',
      text:
        nextStatus === 3
          ? t('profile.admin.notices.userBanned')
          : t('profile.admin.notices.userUnbanned'),
    }
  } catch (error) {
    adminNotice.value = {
      type: 'error',
      text: error instanceof Error ? error.message : t('profile.errors.profileUpdate'),
    }
  } finally {
    savingAdminActions.value = false
  }
}

watch(
  () => [props.adminMode, props.userId],
  () => {
    void loadProfile()
  },
)

onMounted(() => {
  void loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem 1.25rem 3rem;
  color: var(--color-cream);
}

.profile-shell {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.state-card {
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  color: rgba(252, 239, 225, 0.76);
  text-align: center;
  font-weight: 800;
}

.state-card--error {
  color: #ff9a9a;
  border-color: rgba(225, 91, 91, 0.35);
  background:
    linear-gradient(180deg, rgba(225, 91, 91, 0.16), rgba(46, 50, 68, 0.96)), var(--color-navy);
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.admin-action-btn {
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  padding: 0.75rem 1rem;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.admin-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.admin-action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.admin-action-btn--warn {
  background: rgba(225, 91, 91, 0.14);
  color: #ffb3b3;
  border-color: rgba(225, 91, 91, 0.3);
}

.admin-action-btn--warn:hover:not(:disabled) {
  background: rgba(225, 91, 91, 0.2);
  border-color: rgba(225, 91, 91, 0.45);
  color: #ffd0d0;
}

@media (max-width: 720px) {
  .profile-page {
    padding: 1rem 0.9rem 2rem;
  }

  .admin-actions {
    flex-direction: column;
  }

  .admin-action-btn {
    width: 100%;
  }
}
</style>
