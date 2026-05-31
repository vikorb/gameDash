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
  color: rgba(252, 239, 225, 0.64);
  line-height: 1.6;
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
  background: rgba(225, 91, 91, 0.12);
  border: 1px solid rgba(225, 91, 91, 0.28);
  color: #ffb3b3;
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
  border: 1px solid rgba(225, 91, 91, 0.18);
  padding: 0.95rem 1rem;
  background: linear-gradient(180deg, rgba(30, 24, 28, 0.96), rgba(42, 29, 34, 0.96));
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
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
}

.field-input::placeholder {
  color: rgba(252, 239, 225, 0.34);
}

.field-input:hover {
  border-color: rgba(225, 91, 91, 0.26);
}

.field-input:focus {
  border-color: rgba(225, 91, 91, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 0 0 4px rgba(225, 91, 91, 0.12),
    0 16px 30px -20px rgba(225, 91, 91, 0.28);
  transform: translateY(-1px);
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
  min-height: 46px;
  padding: 0.92rem 1.2rem;
  border-radius: 14px;
  font-weight: 900;
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
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

.delete-button {
  background: linear-gradient(135deg, rgba(225, 91, 91, 0.92), rgba(180, 52, 52, 0.96));
  color: #fff;
  border: 1px solid rgba(225, 91, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(225, 91, 91, 0.65);
}

.delete-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(225, 91, 91, 0.8);
}

.cancel-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .delete-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .delete-button {
    width: 100%;
  }
}
</style>
