<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label class="field">
        <span class="field-label">{{ $t('profile.password.currentPassword') }}</span>
        <input
          v-model="form.currentPassword"
          type="password"
          class="field-input"
          :placeholder="$t('profile.password.currentPasswordPlaceholder')"
        />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.password.newPassword') }}</span>
        <input
          v-model="form.password"
          type="password"
          class="field-input"
          :placeholder="$t('profile.password.newPasswordPlaceholder')"
        />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.password.confirmPassword') }}</span>
        <input
          v-model="form.passwordConfirm"
          type="password"
          class="field-input"
          :placeholder="$t('profile.password.confirmPasswordPlaceholder')"
        />
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="cancel-button" :disabled="loading" @click="handleCancel">
        {{ $t('profile.common.cancel') }}
      </button>

      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? $t('profile.common.updating') : $t('profile.password.submit') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

type PasswordFormValues = {
  currentPassword: string
  password: string
  passwordConfirm: string
}

const props = defineProps<{
  loading: boolean
  resetVersion: number
}>()

const emit = defineEmits<{
  submit: [payload: PasswordFormValues]
  cancel: []
}>()

const form = reactive<PasswordFormValues>({
  currentPassword: '',
  password: '',
  passwordConfirm: '',
})

function resetForm() {
  form.currentPassword = ''
  form.password = ''
  form.passwordConfirm = ''
}

watch(
  () => props.resetVersion,
  () => {
    resetForm()
  },
)

function handleSubmit() {
  emit('submit', { ...form })
}

function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field-label {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-ink);
}

.field-input {
  width: 100%;
  border: 1px solid rgba(46, 50, 68, 0.16);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-ink);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  font: inherit;
}

.field-input:focus {
  border-color: rgba(242, 139, 91, 0.65);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.submit-button,
.cancel-button {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.submit-button {
  background: var(--color-primary);
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.cancel-button {
  background: rgba(81, 96, 121, 0.12);
  color: var(--color-ink);
  border: 1px solid rgba(46, 50, 68, 0.14);
}

.cancel-button:hover:not(:disabled) {
  background: rgba(81, 96, 121, 0.18);
  transform: translateY(-1px);
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
