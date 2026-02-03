<script setup lang="ts">
import { RouterLink } from 'vue-router';

export type NavItem = {
  label: string;
  to: string;
  exact?: boolean;
};

defineProps<{
  items: NavItem[];
}>();
</script>

<template>
  <nav class="base-nav">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="base-nav__link"
      :exact-active-class="item.exact ? 'is-active' : undefined"
      active-class="is-active"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.base-nav {
  padding: 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  align-items: center;
}

.base-nav__link {
  text-decoration: none;
  color: var(--color-primary);
  font-weight: 700;
}

.base-nav__link.is-active {
  color: var(--color-primary-strong);
  text-decoration: underline;
}
</style>
