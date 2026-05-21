<template>
  <div class="password-input">
    <input
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      class="input"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      class="toggle-btn"
      @click.prevent.stop="visible = !visible"
      :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
    >
      <EyeIcon :visible="visible" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import EyeIcon from './EyeIcon.vue'

defineProps<{
  id: string
  modelValue: string
  placeholder: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)
</script>

<style scoped>
.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
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

.toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  opacity: 1;
}

.toggle-btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
  opacity: 1;
}
</style>
