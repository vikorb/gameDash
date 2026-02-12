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
  font-weight: 600;
  color: var(--color-cream);
  font-size: 0.95rem;
  text-align: left;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  font-size: 1rem;
  transition: border-color 0.2s;
  background: #d9d9d9;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}
</style>
