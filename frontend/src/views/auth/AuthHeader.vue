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
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 1;
}

.auth-subtitle {
  max-width: 340px;
  margin: 0.75rem auto 0;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
