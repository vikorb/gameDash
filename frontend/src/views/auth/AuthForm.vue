<template>
  <div>
    <AuthHeader :title-key="titleKey" :subtitle-key="subtitleKey" />

    <form class="auth-form" @submit.prevent="handleSubmit">
      <AuthFields :model-value="form" @update:model-value="updateForm" :fields="fields" />
      <AuthAvatarUpload v-if="props.type === 'signup'" @update:file="setAvatarFile" />
      <div v-if="error" class="error-message">{{ error }}</div>
      <BaseButton
        type="button"
        variant="primary"
        class="submit-btn"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{ loading ? t('auth.loading') : t(buttonKey) }}
      </BaseButton>
    </form>

    <AuthFooter :footer-text-key="footerTextKey" :link-text-key="linkTextKey" :link-to="linkTo" />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthForm } from '@/composables/useAuthForm'

import AuthAvatarUpload from './AuthAvatarUpload.vue'
import AuthFields from './AuthFields.vue'
import AuthFooter from './AuthFooter.vue'
import AuthHeader from './AuthHeader.vue'

const props = defineProps<{ type: 'login' | 'signup' }>()

const {
  t,
  form,
  fields,
  loading,
  error,
  linkTo,
  titleKey,
  subtitleKey,
  buttonKey,
  footerTextKey,
  linkTextKey,
  updateForm,
  setAvatarFile,
  handleSubmit,
} = useAuthForm(toRef(props, 'type'))
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.7rem;
  width: 100%;
}

.submit-btn {
  width: 100%;
  min-height: 46px;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  font-weight: 900;
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.error-message {
  padding: 0.85rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(225, 91, 91, 0.35);
  background: rgba(225, 91, 91, 0.14);
  color: #ffb3b3;
  font-size: 0.86rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.45;
}
</style>
