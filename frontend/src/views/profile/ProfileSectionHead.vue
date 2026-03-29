<template>
  <div :class="['section-head', { 'section-head--spaced': spaced }]">
    <div>
      <h2 class="section-title">{{ $t(titleKey) }}</h2>
      <p v-if="subtitleKey" class="section-subtitle">{{ $t(subtitleKey) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titleKey: string
  subtitleKey?: string
  spaced?: boolean
}>()
</script>

<style scoped>
.section-head {
  margin-bottom: 1.25rem;
}

.section-head--spaced {
  margin-top: 2rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-ink);
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
}

.section-subtitle {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
