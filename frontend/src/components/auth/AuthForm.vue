<template>
  <div>
    <AuthHeader :title-key="titleKey" :subtitle-key="subtitleKey" />

    <form class="auth-form" @submit.prevent="handleSubmit">
      <AuthFields v-model="form" :fields="fields" />
      <BaseButton type="submit" variant="primary" class="submit-btn">
        {{ t(buttonKey) }}
      </BaseButton>
    </form>

    <AuthFooter :footer-text-key="footerTextKey" :link-text-key="linkTextKey" :link-to="linkTo" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthHeader from './AuthHeader.vue'
import AuthFields from './AuthFields.vue'
import AuthFooter from './AuthFooter.vue'

interface FormField {
  key: string
  type: string
}

const AUTH_CONFIG: Record<'login' | 'signup', { fields: FormField[]; linkTo: string }> = {
  login: {
    linkTo: '/signup',
    fields: [
      { key: 'email', type: 'email' },
      { key: 'password', type: 'password' },
    ],
  },
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

const props = defineProps<{ type: 'login' | 'signup' }>()

const router = useRouter()
const { t } = useI18n({ useScope: 'global' })

const baseKey = computed(() => `auth.${props.type}`)
const config = computed(() => AUTH_CONFIG[props.type])
const linkTo = computed(() => config.value.linkTo)

const fields = computed<(FormField & { labelKey: string; placeholderKey: string })[]>(() =>
  config.value.fields.map((f) => ({
    ...f,
    labelKey: `${baseKey.value}.${f.key}`,
    placeholderKey: `${baseKey.value}.${f.key}_placeholder`,
  })),
)

const titleKey = computed(() => `${baseKey.value}.title`)
const subtitleKey = computed(() => `${baseKey.value}.subtitle`)
const buttonKey = computed(() => `${baseKey.value}.button`)
const footerTextKey = computed(() =>
  props.type === 'login' ? `${baseKey.value}.no_account` : `${baseKey.value}.have_account`,
)
const linkTextKey = computed(() =>
  props.type === 'login' ? `${baseKey.value}.signup_link` : `${baseKey.value}.login_link`,
)

const form = reactive<Record<string, string>>({
  username: '',
  email: '',
  password: '',
  password_confirm: '',
})

const handleSubmit = () => {
  if (props.type === 'signup' && form.password !== form.password_confirm) {
    alert(t('auth.signup.password_mismatch'))
    return
  }
  router.push('/test')
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  font-weight: 600;
}
</style>
