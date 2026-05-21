<template>
  <section class="hero-card">
    <div class="hero-left">
      <div class="hero-avatar">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="$t('profile.hero.avatarAlt')" />
        <span v-else>{{ displayInitial }}</span>
      </div>

      <div class="hero-content">
        <p class="hero-kicker">{{ $t('profile.hero.kicker') }}</p>
        <h1 class="hero-title">{{ $t('profile.hero.title', { username: displayName }) }}</h1>
        <p class="hero-subtitle">{{ $t('profile.hero.subtitle') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  username?: string | null
  avatarUrl?: string | null
}>()

const displayName = computed(() => props.username?.trim() || 'joueur')
const displayInitial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U')
</script>

<style scoped>
.hero-card {
  padding: 1.5rem;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.hero-avatar {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(242, 139, 91, 0.35);
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  min-width: 0;
}

.hero-kicker {
  margin: 0 0 0.25rem;
  color: var(--color-apricot-dark);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.hero-title {
  margin: 0;
  color: var(--color-ink);
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1.1;
}

.hero-subtitle {
  margin: 0.5rem 0 0;
  color: var(--color-text-muted);
  max-width: 640px;
}

@media (max-width: 720px) {
  .hero-left {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
