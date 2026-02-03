<template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/ui/BaseButton.vue';

const { t } = useI18n({ useScope: 'global' });
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
</style>
