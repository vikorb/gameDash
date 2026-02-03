<template>
  <div class="field">
    <label class="label" for="title">{{ t('mapForm.fields.title.label') }}</label>
    <input
      id="title"
      :value="title"
      class="input"
      type="text"
      :placeholder="t('mapForm.fields.title.placeholder')"
      :title="t('mapForm.fields.title.hover')"
      :aria-label="t('mapForm.fields.title.aria')"
      :disabled="saving"
      autocomplete="off"
      @input="emit('update:title', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="errors?.title" class="error">{{ errors.title }}</p>
  </div>

  <div class="field">
    <label class="label" for="description">{{ t('mapForm.fields.description.label') }}</label>
    <textarea
      id="description"
      :value="description"
      class="textarea"
      :placeholder="t('mapForm.fields.description.placeholder')"
      :title="t('mapForm.fields.description.hover')"
      :aria-label="t('mapForm.fields.description.aria')"
      :disabled="saving"
      rows="6"
      @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  title: string;
  description: string;
  saving: boolean;
  errors: { title?: string };
}>();

const emit = defineEmits<{
  (e: 'update:title', v: string): void;
  (e: 'update:description', v: string): void;
}>();

const { t } = useI18n({ useScope: 'global' });
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-weight: 700;
  color: var(--color-text);
}

.input,
.textarea {
  width: 100%;
  border: var(--border-1);
  border-radius: var(--radius-1);
  padding: 10px 12px;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;
}

.input:focus,
.textarea:focus {
  border-color: var(--color-primary);
}

.error {
  color: var(--color-danger, #d14343);
  font-weight: 600;
  margin: 0;
}
</style>
