<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :class="['base-button', variant]"
  >
    <slot>{{ text }}</slot>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'; // <--- AJOUTER CET IMPORT

interface Props {
  text?: string;
  to?: string | object;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button'
});
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.4rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  text-decoration: none;
  line-height: 1.2;
}

.primary {
  background-color: var(--color-primary);
  color: white;
}

.primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.secondary {
  background-color: white;
  border-color: var(--color-border);
  color: var(--color-text);
}

.secondary:hover {
  background-color: var(--color-bg);
  border-color: var(--color-text-muted);
}

.danger {
  background-color: var(--color-danger);
  color: white;
}
</style>
