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
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.hero-card > * {
  position: relative;
  z-index: 1;
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
  color: var(--color-navy);
  font-size: 2rem;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 16px 34px -18px rgba(242, 139, 91, 0.95);
  border: 1px solid rgba(252, 239, 225, 0.16);
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
  margin: 0 0 0.35rem;
  color: var(--color-primary-strong);
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.hero-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', 'DM Sans', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.hero-subtitle {
  margin: 0.6rem 0 0;
  color: rgba(252, 239, 225, 0.68);
  max-width: 640px;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .hero-card {
    border-radius: 22px;
    padding: 1.15rem;
  }

  .hero-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-avatar {
    width: 82px;
    height: 82px;
  }
}
</style>
