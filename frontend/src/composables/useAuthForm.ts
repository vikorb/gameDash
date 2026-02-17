import { computed, reactive, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authService, pb } from '@/services/pocketbase'
import { useUserStore } from '@/stores/userStore'

type AuthType = 'login' | 'signup'
type FormField = { key: string; type: string }

const AUTH_CONFIG: Record<AuthType, { fields: FormField[]; linkTo: string }> = {
  login: { linkTo: '/signup', fields: [{ key: 'email', type: 'email' }, { key: 'password', type: 'password' }] },
  signup: {
    linkTo: '/login',
    fields: [
      { key: 'username', type: 'text' },
      { key: 'email', type: 'email' },
      { key: 'password', type: 'password' },
      { key: 'password_confirm', type: 'password' },
    ],
  },
}

export const useAuthForm = (type: Ref<AuthType>) => {
  const router = useRouter()
  const userStore = useUserStore()
  const { t } = useI18n({ useScope: 'global' })
  const baseKey = computed(() => `auth.${type.value}`)
  const config = computed(() => AUTH_CONFIG[type.value])
  const linkTo = computed(() => config.value.linkTo)
  const fields = computed(() => config.value.fields.map((f) => ({ ...f, labelKey: `${baseKey.value}.${f.key}`, placeholderKey: `${baseKey.value}.${f.key}_placeholder` })))
  const titleKey = computed(() => `${baseKey.value}.title`)
  const subtitleKey = computed(() => `${baseKey.value}.subtitle`)
  const buttonKey = computed(() => `${baseKey.value}.button`)
  const footerTextKey = computed(() => type.value === 'login' ? `${baseKey.value}.no_account` : `${baseKey.value}.have_account`)
  const linkTextKey = computed(() => type.value === 'login' ? `${baseKey.value}.signup_link` : `${baseKey.value}.login_link`)
  const form = reactive<Record<string, string>>({ username: '', email: '', password: '', password_confirm: '' })
  const loading = ref(false)
  const error = ref('')
  const avatarFile = ref<File | null>(null)
  const updateForm = (newValue: Record<string, string>) => Object.assign(form, newValue)
  const setAvatarFile = (file: File | null) => { avatarFile.value = file }
  const handleSubmit = async () => {
    error.value = ''
    if (type.value === 'signup' && form.password !== form.password_confirm) return void (error.value = t('auth.signup.password_mismatch'))
    if (!form.email || !form.password) return void (error.value = t('auth.error.generic'))
    loading.value = true
    try {
      if (type.value === 'login') await authService.login(form.email, form.password)
      else await authService.signup(form.email, form.password, form.username, avatarFile.value)
      const fallbackEmail = String(form.email)
      const fallbackUsername = form.username || fallbackEmail.split('@')[0] || fallbackEmail
      const syncRecord = pb.authStore.record ? (pb.authStore.record as Record<string, unknown>) : null
      await userStore.syncFromPocketBase(syncRecord, { email: fallbackEmail, username: fallbackUsername })
      router.push('/test')
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('auth.error.generic')
    } finally { loading.value = false }
  }
  return { t, form, fields, loading, error, linkTo, titleKey, subtitleKey, buttonKey, footerTextKey, linkTextKey, updateForm, setAvatarFile, handleSubmit }
}
