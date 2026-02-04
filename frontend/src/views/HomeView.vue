<template>
  <div class="landing-container">
    <div class="landing-content">
      <header class="landing-header">
        <h1 class="landing-title">{{ t('home.hero.title') }}</h1>
        <p class="landing-subtitle">{{ t('home.hero.subtitle') }}</p>
      </header>

      <div class="landing-buttons">
        <BaseButton
          to="/login"
          variant="secondary"
          class="landing-btn"
          :title="t('home.landing.login_hover')"
        >
          {{ t('home.landing.login') }}
        </BaseButton>

        <BaseButton
          to="/signup"
          variant="primary"
          class="landing-btn"
          :title="t('home.landing.signup_hover')"
        >
          {{ t('home.landing.signup') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-background) 0%,
    var(--color-background-secondary) 100%
  );
  padding: 24px;
}

.landing-content {
  text-align: center;
  max-width: 600px;
}

.landing-header {
  margin-bottom: 3rem;
}

.landing-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--color-primary-strong);
  letter-spacing: -1px;
}

.landing-subtitle {
  font-size: 1.5rem;
  color: var(--color-text-muted);
  font-weight: 400;
  line-height: 1.6;
}

.landing-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.landing-btn {
  min-width: 200px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .landing-title {
    font-size: 2.5rem;
  }

  .landing-subtitle {
    font-size: 1.1rem;
  }

  .landing-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .landing-btn {
    width: 100%;
  }
}
</style>
