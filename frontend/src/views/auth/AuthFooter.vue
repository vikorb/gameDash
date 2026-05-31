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
  padding-top: 1.35rem;
  border-top: 1px solid rgba(252, 239, 225, 0.12);
}

.auth-footer p {
  margin: 0 0 0.5rem;
  color: rgba(252, 239, 225, 0.6);
  font-size: 0.9rem;
  line-height: 1.5;
}

.link {
  color: var(--color-primary-strong);
  text-decoration: none;
  font-weight: 900;
  transition:
    color 0.16s ease,
    opacity 0.16s ease;
}

.link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
