<template>
  <div class="actions">
    <BaseButton
      variant="primary"
      type="submit"
      :title="submitHover"
      :aria-label="submitAria"
      :disabled="saving || !canSubmit"
    >
      {{ saving ? t('common.saving') : submitLabel }}
    </BaseButton>

    <BaseButton
      v-if="!isEdit"
      variant="secondary"
      :title="t('mapForm.actions.reset_hover')"
      :aria-label="t('mapForm.actions.reset_aria')"
      :disabled="saving"
      @click="emit('reset')"
    >
      {{ t('mapForm.actions.reset') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps<{
  isEdit: boolean;
  saving: boolean;
  canSubmit: boolean;
  submitLabel: string;
  submitHover: string;
  submitAria: string;
}>();

const emit = defineEmits<{
  (e: 'reset'): void;
}>();

const { t } = useI18n({ useScope: 'global' });
</script>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
