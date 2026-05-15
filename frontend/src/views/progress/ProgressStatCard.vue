<template>
  <article class="stat-card" :class="toneClass">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value">{{ value }}</p>
    <p v-if="hint" class="stat-hint">{{ hint }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'positive' | 'negative' | 'accent'
}>(), {
  hint: '',
  tone: 'default',
})

const toneClass = computed(() => `stat-card--${props.tone}`)
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.9rem 1rem;
}

.stat-card--accent {
  border-color: color-mix(in srgb, var(--color-apricot) 55%, transparent);
}

.stat-card--positive {
  border-color: color-mix(in srgb, var(--color-primary-strong) 55%, transparent);
}

.stat-card--negative {
  border-color: color-mix(in srgb, var(--color-danger) 55%, transparent);
}

.stat-label {
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.8rem;
  line-height: 1.2;
}

.stat-value {
  margin: 0.35rem 0 0;
  color: var(--color-cream);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
}

.stat-hint {
  margin: 0.35rem 0 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.78rem;
}
</style>
