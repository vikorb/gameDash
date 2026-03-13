<template>
  <BaseCard class="map-card">
    <h3 class="map-title">{{ map.title }}</h3>
    <p class="map-desc">{{ map.description || t('listMaps.empty_description') }}</p>

    <BaseButton
      variant="secondary"
      class="btn-edit"
      :title="t('listMaps.actions.edit_hover', { title: map.title })"
      :aria-label="t('listMaps.actions.edit_aria', { title: map.title })"
      @click="emit('edit')"
    >
      {{ t('listMaps.actions.edit') }}
    </BaseButton>
  </BaseCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import type { GameMap } from '@/types/map'

defineProps<{ map: GameMap }>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
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
