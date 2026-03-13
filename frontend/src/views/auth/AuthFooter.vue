<template>
  <div class="auth-footer">
    <p>{{ t(footerTextKey) }}</p>
    <RouterLink :to="linkTo" class="link">{{ t(linkTextKey) }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  footerTextKey: string
  linkTextKey: string
  linkTo: string
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.auth-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.auth-footer p {
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link:hover {
  color: var(--color-primary-strong);
}
</style>
