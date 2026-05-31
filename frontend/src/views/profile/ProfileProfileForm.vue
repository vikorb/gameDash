<template>
  <form class="profile-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <label class="field">
        <span class="field-label">{{ $t('profile.form.username') }}</span>
        <input v-model="form.username" type="text" class="field-input" required />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.email') }}</span>
        <input v-model="form.email" type="email" class="field-input" required />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.region') }}</span>
        <input
          v-model="form.region"
          type="text"
          class="field-input"
          :placeholder="$t('profile.form.regionPlaceholder')"
        />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.language') }}</span>
        <input
          v-model="form.language"
          type="text"
          class="field-input"
          :placeholder="$t('profile.form.languagePlaceholder')"
        />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.status') }}</span>
        <select v-model="form.status" class="field-input">
          <option value="1">{{ $t('profile.status.online') }}</option>
          <option value="2">{{ $t('profile.status.offline') }}</option>
          <option value="3">{{ $t('profile.status.banned') }}</option>
        </select>
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.bio') }}</span>
        <textarea
          v-model="form.bio"
          class="field-input field-textarea"
          rows="5"
          :placeholder="$t('profile.form.bioPlaceholder')"
        />
      </label>

      <label class="field">
        <span class="field-label">{{ $t('profile.form.matchmaking') }}</span>
        <textarea
          v-model="form.matchmaking_pref"
          class="field-input field-textarea field-textarea--code"
          rows="6"
          :placeholder="$t('profile.form.matchmakingPlaceholder')"
        />
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="cancel-button" :disabled="loading" @click="handleCancel">
        {{ $t('profile.common.cancel') }}
      </button>

      <button type="submit" class="submit-button" :disabled="loading">
        {{ loading ? $t('profile.common.saving') : $t('profile.form.submit') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

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

const props = defineProps<{
  loading: boolean
  initialValues: ProfileFormValues
}>()

const emit = defineEmits<{
  submit: [payload: ProfileFormValues]
  cancel: []
}>()

const form = reactive<ProfileFormValues>({
  username: '',
  email: '',
  region: '',
  bio: '',
  language: '',
  status: '1',
  role: '',
  matchmaking_pref: '',
})

watch(
  () => props.initialValues,
  (value) => {
    Object.assign(form, value)
  },
  { immediate: true, deep: true },
)

function handleSubmit() {
  emit('submit', { ...form })
}

function handleCancel() {
  Object.assign(form, props.initialValues)
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

.field-input--readonly {
  background: linear-gradient(180deg, rgba(27, 32, 45, 0.82), rgba(33, 39, 55, 0.82));
  color: rgba(252, 239, 225, 0.5);
  cursor: not-allowed;
  border-style: dashed;
}

.field-input--readonly:hover,
.field-input--readonly:focus {
  transform: none;
  border-color: rgba(252, 239, 225, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.02),
    0 10px 24px -18px rgba(0, 0, 0, 0.7);
}

.field-textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.field-textarea--code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.86rem;
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
