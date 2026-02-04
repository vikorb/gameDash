<template>
  <div v-for="field in fields" :key="field.key" class="form-group">
    <label :for="field.key" class="label">{{ t(field.labelKey) }}</label>
    <input
      :id="field.key"
      :value="modelValue[field.key]"
      :type="field.type"
      :placeholder="t(field.placeholderKey)"
      class="input"
      required
      @input="
        $emit('update:modelValue', {
          ...modelValue,
          [field.key]: ($event.target as HTMLInputElement).value,
        })
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface FormField {
  key: string
  type: string
  labelKey: string
  placeholderKey: string
}

defineProps<{
  fields: FormField[]
  modelValue: Record<string, string>
}>()

defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}
</style>
