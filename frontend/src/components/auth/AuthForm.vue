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
import AuthHeader from './AuthHeader.vue'
import AuthFields from './AuthFields.vue'
import AuthFooter from './AuthFooter.vue'
import AuthAvatarUpload from './AuthAvatarUpload.vue'
import { useAuthForm } from '@/composables/useAuthForm'

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

<style scoped src="./AuthForm.css"></style>
