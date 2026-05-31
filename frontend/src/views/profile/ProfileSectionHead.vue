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
  color: var(--color-cream);
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.section-subtitle {
  margin: 0.4rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.95rem;
  line-height: 1.55;
}
</style>
