<template>
  <div class="header">
    <h1 class="title">
      {{ isEdit ? t('mapForm.title_edit') : t('mapForm.title_create') }}
    </h1>

    <BaseButton
      to="/home/maps"
      variant="secondary"
      :title="t('mapForm.actions.back_hover')"
      :aria-label="t('mapForm.actions.back_aria')"
    >
      {{ t('mapForm.actions.back') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{ isEdit: boolean }>()

const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.title {
  margin: 0;
  color: var(--color-cream);
}
</style>
