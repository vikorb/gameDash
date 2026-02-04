<template>
  <header class="auth-header">
    <h1 class="auth-title">{{ t(titleKey) }}</h1>
    <p class="auth-subtitle">{{ t(subtitleKey) }}</p>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  titleKey: string
  subtitleKey: string
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.auth-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
