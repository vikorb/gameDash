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

.field-input--readonly {
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-ink-muted);
}

.field-textarea {
  resize: vertical;
  min-height: 130px;
}

.field-textarea--code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
