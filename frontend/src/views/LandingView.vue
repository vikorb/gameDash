<template>
  <section class="landing-hero">
    <div class="hero-center">
      <h1 class="hero-title">
        <img :src="logo" alt="GameDash" class="hero-title-logo" />
      </h1>

      <div class="hero-actions">
        <BaseButton
          to="/login"
          variant="primary"
          class="hero-btn"
          :title="t('home.landing.login_hover')"
        >
          {{ t('home.landing.login') }}
        </BaseButton>

        <BaseButton
          to="/signup"
          variant="secondary"
          class="hero-btn"
          :title="t('home.landing.signup_hover')"
        >
          {{ t('home.landing.signup') }}
        </BaseButton>
      </div>

      <p class="hero-caption">Dashboard competitif & contenu communautaire</p>
    </div>

    <div class="hero-right">
      <div class="preview-card">
        <div class="preview-header">
          <div class="preview-brand">
            <span class="brand-dot"></span>
            <span>Home</span>
          </div>
          <div class="preview-tabs">
            <span>Matchmaking</span>
            <span>Maps</span>
            <span>Shop</span>
          </div>
        </div>

        <div class="preview-body">
          <div class="preview-section">
            <span class="preview-label">MMR</span>
            <div class="preview-chart"></div>
          </div>
          <div class="preview-section">
            <span class="preview-label">Rang</span>
            <div class="preview-rank"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import logo from '@/assets/img/logo_gameDash.svg'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.landing-hero {
  min-height: calc(100vh - var(--footer-height));
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem;
  align-items: center;
  padding: 4rem clamp(1.5rem, 5vw, 5rem) 3rem;
  position: relative;
  overflow: hidden;
}

.landing-hero::before,
.landing-hero::after {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: var(--color-cream);
  z-index: 0;
  opacity: 0.9;
}

.landing-hero::before {
  top: -80px;
  left: -60px;
}

.landing-hero::after {
  bottom: -120px;
  right: -40px;
}

.hero-left,
.hero-right {
  position: relative;
  z-index: 1;
}

.hero-center {
  text-align: center;
}

.hero-logo {
  width: 74px;
  height: 74px;
  margin-bottom: 1.5rem;
}

.hero-header {
  color: var(--color-cream);
  margin-bottom: 2.5rem;
}

.hero-kicker {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-bottom: 0.75rem;
  color: rgba(252, 239, 225, 0.7);
}

.hero-title-logo {
  height: clamp(13.8rem, 6vw, 4.5rem);
  width: auto;
}

.hero-subtitle {
  font-size: 1.15rem;
  max-width: 420px;
  color: rgba(252, 239, 225, 0.82);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.hero-btn {
  min-width: 180px;
  padding: 0.9rem 2rem;
}

.hero-caption {
  margin: 0;
  color: rgba(252, 239, 225, 0.8);
  font-size: 0.95rem;
}

.hero-right {
  display: flex;
  justify-content: center;
}

.preview-card {
  width: min(440px, 100%);
  background: #3c455f;
  border-radius: 22px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px -30px rgba(0, 0, 0, 0.6);
  color: rgba(252, 239, 225, 0.85);
  border: 1px solid rgba(252, 239, 225, 0.2);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 1.25rem;
}

.preview-brand {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 600;
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-apricot);
}

.preview-tabs {
  display: flex;
  gap: 0.75rem;
  font-size: 0.7rem;
}

.preview-body {
  display: grid;
  gap: 1.25rem;
}

.preview-section {
  background: rgba(81, 96, 121, 0.7);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: inset 0 0 0 1px rgba(252, 239, 225, 0.08);
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.preview-chart {
  height: 110px;
  border-radius: 12px;
  background: linear-gradient(160deg, rgba(252, 239, 225, 0.15), rgba(242, 139, 91, 0.35));
  position: relative;
  overflow: hidden;
}

.preview-chart::after {
  content: '';
  position: absolute;
  inset: 16px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(252, 239, 225, 0.6) 40%,
    rgba(242, 139, 91, 0.75) 60%,
    transparent
  );
  opacity: 0.8;
}

.preview-rank {
  height: 70px;
  border-radius: 12px;
  background: rgba(252, 239, 225, 0.18);
}

@media (max-width: 960px) {
  .landing-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 600px) {
  .hero-btn {
    width: 100%;
  }

  .preview-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
