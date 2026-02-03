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
import { computed } from 'vue';
import type { MapFormData } from '@/types/form';

const props = defineProps<{
  isEdit: boolean;
  saving: boolean;
  canSubmit: boolean;
  form: Pick<MapFormData, 'title'>;
}>();

const emit = defineEmits<{
  (e: 'reset'): void;
}>();

const { t } = useI18n({ useScope: 'global' });

const submitLabel = computed(() =>
  props.isEdit ? t('mapForm.actions.save') : t('mapForm.actions.create')
);

const submitHover = computed(() =>
  props.isEdit
    ? t('mapForm.actions.save_hover', { title: props.form.title || t('mapForm.unnamed') })
    : t('mapForm.actions.create_hover')
);

const submitAria = computed(() =>
  props.isEdit
    ? t('mapForm.actions.save_aria', { title: props.form.title || t('mapForm.unnamed') })
    : t('mapForm.actions.create_aria')
);
</script>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
