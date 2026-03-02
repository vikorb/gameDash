<template>
  <div v-if="loading" class="loading">
    {{ t('common.loading') }}
  </div>

  <div v-else-if="maps.length === 0" class="empty">
    <p class="empty-title">{{ t('listMaps.empty.title') }}</p>
    <p class="empty-subtitle">{{ t('listMaps.empty.subtitle') }}</p>
  </div>

  <div v-else class="grid">
    <MapCardItem v-for="map in maps" :key="map.id" :map="map" @edit="emit('edit', map.id)" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { GameMap } from '@/types/map'
import MapCardItem from '@/components/maps/list/MapCardItem.vue'

defineProps<{
  maps: GameMap[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', id: number): void
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.loading {
  color: var(--color-text-muted);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}

.empty {
  border: var(--border-1);
  border-radius: var(--radius-1);
  padding: var(--space-4);
  background: var(--color-bg);
}

.empty-title {
  margin: 0;
  font-weight: 800;
  color: var(--color-text);
}

.empty-subtitle {
  margin: var(--space-2) 0 0 0;
  color: var(--color-text-muted);
}
</style>
