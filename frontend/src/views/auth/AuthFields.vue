<template>
  <div v-for="field in fields" :key="field.key" class="form-group">
    <label :for="field.key" class="label">{{ t(field.labelKey) }}</label>
    <PasswordInput
      v-if="field.type === 'password'"
      :id="field.key"
      :model-value="modelValue[field.key] ?? ''"
      :placeholder="t(field.placeholderKey)"
      @update:model-value="handleInput(field.key, $event)"
    />
    <input
      v-else
      :id="field.key"
      :value="modelValue[field.key] ?? ''"
      :type="field.type"
      :placeholder="t(field.placeholderKey)"
      class="input"
      autocomplete="off"
      @input="handleInput(field.key, ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import PasswordInput from './PasswordInput.vue'

interface FormField {
  key: string
  type: string
  labelKey: string
  placeholderKey: string
}

const props = defineProps<{
  fields: FormField[]
  modelValue: Record<string, string | undefined>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const { t } = useI18n({ useScope: 'global' })

const handleInput = (key: string, value: string) => {
  const normalized = Object.fromEntries(
    Object.entries(props.modelValue).map(([fieldKey, fieldValue]) => [fieldKey, fieldValue ?? '']),
  ) as Record<string, string>
  normalized[key] = value
  emit('update:modelValue', normalized)
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.label {
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.86rem;
  font-weight: 900;
}

.input {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 0.8rem 0.95rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.95rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.input::placeholder {
  color: rgba(252, 239, 225, 0.42);
}

.input:focus {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}
</style>
