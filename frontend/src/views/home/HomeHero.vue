<template>
  <header class="hero">
    <h1 class="hero-title">{{ title }}</h1>
    <p class="hero-subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: var(--color-primary-strong);
  letter-spacing: -1px;
}

.hero-subtitle {
  color: var(--color-text-muted);
  font-size: 1.25rem;
  font-weight: 400;
}
</style>
