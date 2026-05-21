<template>
  <article class="stat-card" :class="[toneClass, { 'stat-card--featured': featured }]">
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
  featured?: boolean
}>(), {
  hint: '',
  tone: 'default',
  featured: false,
})

const toneClass = computed(() => `stat-card--${props.tone}`)
</script>

<style scoped>
.stat-card {
  border-radius: 13px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
  padding: 0.92rem 1rem;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 16px 28px -24px rgba(0, 0, 0, 0.6);
}

.stat-card--featured {
  background: linear-gradient(165deg, color-mix(in srgb, var(--color-apricot) 18%, transparent), rgba(255, 255, 255, 0.03));
  border-color: color-mix(in srgb, var(--color-apricot) 62%, rgba(255, 255, 255, 0.08));
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

.stat-card--featured .stat-value {
  font-size: 1.42rem;
}

.stat-hint {
  margin: 0.35rem 0 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.78rem;
}
</style>
