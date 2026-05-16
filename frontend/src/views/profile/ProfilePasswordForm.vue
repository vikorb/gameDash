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
  gap: 1.35rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  min-height: auto;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.field-label {
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

.field-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  padding: 0.95rem 1rem;
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
  font: inherit;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
}

.field-input::placeholder {
  color: rgba(252, 239, 225, 0.34);
  font-weight: 600;
}

.field-input:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.field-input:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
  transform: translateY(-1px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.35rem;
}

.submit-button,
.cancel-button {
  min-height: 46px;
  border-radius: 14px;
  padding: 0.92rem 1.2rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.submit-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border: 1px solid rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.cancel-button {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border: 1px solid rgba(252, 239, 225, 0.12);
}

.cancel-button:hover:not(:disabled) {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
