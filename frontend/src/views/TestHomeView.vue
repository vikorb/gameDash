<template>
  <div class="home-container">
    <header class="hero">
      <h1 class="hero-title">{{ t('home.hero.title') }}</h1>
      <p class="hero-subtitle">{{ t('home.hero.subtitle') }}</p>
    </header>

    <div class="stats-grid">
      <BaseCard class="stat-card">
        <h3 class="card-title">{{ t('home.stats.title') }}</h3>
        <div class="stat-content">
          <span class="big-number">{{ mapStore.maps.length }}</span>
          <span class="label">
            {{ t('home.stats.maps_created', { count: mapStore.maps.length }) }}
          </span>
        </div>
      </BaseCard>

      <BaseCard class="action-card">
        <h3 class="card-title">{{ t('home.quick_actions.title') }}</h3>
        <div class="actions-group">
          <BaseButton
            to="/test/maps/new"
            variant="primary"
            :title="t('home.quick_actions.create_map_hover')"
            :aria-label="t('home.quick_actions.create_map_aria')"
          >
            {{ t('home.quick_actions.create_map') }}
          </BaseButton>

          <BaseButton
            to="/test/maps"
            variant="secondary"
            :title="t('home.quick_actions.view_list_hover')"
            :aria-label="t('home.quick_actions.view_list_aria')"
          >
            {{ t('home.quick_actions.view_list') }}
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { useMapStore } from '@/stores/mapStore';

const { t } = useI18n({ useScope: 'global' });
const mapStore = useMapStore();
</script>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 60px auto;
  padding: 0 24px;
}

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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.big-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--color-primary);
  line-height: 1;
}

.label {
  color: var(--color-text-muted);
  font-weight: 500;
  margin-top: 4px;
}

.actions-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
