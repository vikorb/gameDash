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
import { RouterLink } from 'vue-router'

interface Props {
  text?: string
  to?: string | object
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
})
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
  color: var(--color-cream);
  box-shadow: 0 12px 20px -16px rgba(242, 139, 91, 0.8);
}

.primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.secondary {
  background-color: var(--color-cream);
  border-color: rgba(46, 50, 68, 0.15);
  color: var(--color-ink);
}

.secondary:hover {
  background-color: #f6e7d6;
  border-color: rgba(46, 50, 68, 0.25);
  transform: translateY(-1px);
}

.danger {
  background-color: var(--color-danger);
  color: var(--color-cream);
}
</style>
