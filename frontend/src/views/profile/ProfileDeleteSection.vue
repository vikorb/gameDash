<template>
  <div class="delete-section">
    <p class="delete-text">
      {{ $t('profile.delete.description') }}
    </p>

    <label class="field">
      <span class="field-label">{{ $t('profile.delete.currentPassword') }}</span>
      <input
        v-model="form.currentPassword"
        type="password"
        class="field-input"
        :placeholder="$t('profile.delete.currentPasswordPlaceholder')"
      />
    </label>

    <div class="delete-actions">
      <button type="button" class="cancel-button" :disabled="loading" @click="handleCancel">
        {{ $t('profile.common.cancel') }}
      </button>

      <button type="button" class="delete-button" :disabled="loading" @click="handleSubmit">
        {{ loading ? $t('profile.common.deleting') : $t('profile.delete.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

type DeleteFormValues = {
  currentPassword: string
}

const props = defineProps<{
  loading: boolean
  resetVersion: number
}>()

const emit = defineEmits<{
  submit: [payload: DeleteFormValues]
  cancel: []
}>()

const form = reactive<DeleteFormValues>({
  currentPassword: '',
})

function resetForm() {
  form.currentPassword = ''
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
.delete-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delete-text {
  margin: 0;
  color: var(--color-text-muted);
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

.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cancel-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  font-weight: 700;
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
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

.delete-button {
  background: var(--color-danger);
  color: white;
  border: 1px solid transparent;
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(0.96);
}

.cancel-button:disabled,
.delete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
