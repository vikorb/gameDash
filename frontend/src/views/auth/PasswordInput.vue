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
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 0.8rem 3rem 0.8rem 0.95rem;
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

.toggle-btn {
  position: absolute;
  right: 0.65rem;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(252, 239, 225, 0.58);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.16s ease,
    background-color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.toggle-btn:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.12);
  border-color: rgba(242, 139, 91, 0.28);
  transform: translateY(-1px);
}

.toggle-btn:focus {
  outline: none;
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.45);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.12);
}
</style>
