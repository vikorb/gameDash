<template>
  <div class="maps-list">
    <div class="header">
      <h1 class="title">{{ t('listMaps.title') }}</h1>

      <BaseButton
        to="/maps/new"
        variant="primary"
        :title="t('listMaps.actions.create_hover')"
        :aria-label="t('listMaps.actions.create_aria')"
      >
        {{ t('listMaps.actions.create') }}
      </BaseButton>
    </div>

    <div v-if="mapStore.loading" class="loading">
      {{ t('common.loading') }}
    </div>

    <div v-else class="grid">
      <BaseCard v-for="map in mapStore.maps" :key="map.id" class="map-card">
        <h3 class="map-title">{{ map.title }}</h3>
        <p class="map-desc">{{ map.description || t('listMaps.empty_description') }}</p>

        <BaseButton
          variant="secondary"
          class="btn-edit"
          :title="t('listMaps.actions.edit_hover', { title: map.title })"
          :aria-label="t('listMaps.actions.edit_aria', { title: map.title })"
          @click="goToEdit(map.id)"
        >
          {{ t('listMaps.actions.edit') }}
        </BaseButton>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useMapStore } from '@/stores/mapStore';

const { t } = useI18n({ useScope: 'global' });
const mapStore = useMapStore();
const router = useRouter();

onMounted(() => {
  mapStore.fetchMaps();
});

const goToEdit = (id: number) => {
  router.push(`/maps/edit/${id}`);
};
</script>

<style scoped>
.maps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.title {
  margin: 0;
  color: var(--color-text);
}

.loading {
  color: var(--color-text-muted);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}

.map-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.map-title {
  margin: 0;
  color: var(--color-text);
  font-weight: 800;
}

.map-desc {
  margin: 0;
  color: var(--color-text-muted);
  min-height: 44px;
}

.btn-edit {
  margin-top: var(--space-2);
  width: 100%;
}
</style>
