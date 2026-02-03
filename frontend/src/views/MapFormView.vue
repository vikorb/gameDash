<template>
  <div class="map-form">
    <div class="header">
      <h1 class="title">
        {{ isEditMode ? t('mapForm.title_edit') : t('mapForm.title_create') }}
      </h1>

      <BaseButton
        to="/maps"
        variant="secondary"
        :title="t('mapForm.actions.back_hover')"
        :aria-label="t('mapForm.actions.back_aria')"
      >
        {{ t('mapForm.actions.back') }}
      </BaseButton>
    </div>

    <BaseCard class="form-card">
      <form class="form" @submit.prevent="onSubmit">
        <div class="field">
          <label class="label" for="title">{{ t('mapForm.fields.title.label') }}</label>
          <input
            id="title"
            v-model="form.title"
            class="input"
            type="text"
            :placeholder="t('mapForm.fields.title.placeholder')"
            :title="t('mapForm.fields.title.hover')"
            :aria-label="t('mapForm.fields.title.aria')"
            :disabled="saving"
            autocomplete="off"
          />
          <p v-if="errors.title" class="error">{{ errors.title }}</p>
        </div>

        <div class="field">
          <label class="label" for="description">{{ t('mapForm.fields.description.label') }}</label>
          <textarea
            id="description"
            v-model="form.description"
            class="textarea"
            :placeholder="t('mapForm.fields.description.placeholder')"
            :title="t('mapForm.fields.description.hover')"
            :aria-label="t('mapForm.fields.description.aria')"
            :disabled="saving"
            rows="6"
          />
        </div>

        <p v-if="submitError" class="submit-error">
          {{ submitError }}
        </p>

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
            variant="secondary"
            :title="t('mapForm.actions.reset_hover')"
            :aria-label="t('mapForm.actions.reset_aria')"
            :disabled="saving"
            @click="onReset"
          >
            {{ t('mapForm.actions.reset') }}
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useMapStore } from '@/stores/mapStore';
import { toApiError } from '@/utils/apiError';
import type { GameMap } from '@/types/map';

const { t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const mapStore = useMapStore();

const saving = ref(false);
const submitError = ref<string | null>(null);

const idParam = computed(() => route.params.id);
const mapId = computed<number | null>(() => {
  const raw = idParam.value;
  const n = typeof raw === 'string' ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
});

const isEditMode = computed(() => mapId.value !== null);

const form = reactive<{
  title: string;
  description: string;
  original?: Pick<GameMap, 'id' | 'title' | 'description'> | null;
}>({
  title: '',
  description: '',
  original: null,
});

const errors = reactive<{ title?: string }>({});

const submitLabel = computed(() =>
  isEditMode.value ? t('mapForm.actions.save') : t('mapForm.actions.create')
);

const submitHover = computed(() =>
  isEditMode.value
    ? t('mapForm.actions.save_hover', { title: form.title || t('mapForm.unnamed') })
    : t('mapForm.actions.create_hover')
);

const submitAria = computed(() =>
  isEditMode.value
    ? t('mapForm.actions.save_aria', { title: form.title || t('mapForm.unnamed') })
    : t('mapForm.actions.create_aria')
);

const canSubmit = computed(() => form.title.trim().length >= 2);

function validate() {
  errors.title = undefined;

  if (form.title.trim().length < 2) {
    errors.title = t('mapForm.validation.title_min', { min: 2 });
    return false;
  }
  return true;
}

function setFromMap(m: Pick<GameMap, 'id' | 'title' | 'description'>) {
  form.title = m.title ?? '';
  form.description = m.description ?? '';
  form.original = { id: m.id, title: form.title, description: form.description };
}

function onReset() {
  submitError.value = null;
  errors.title = undefined;

  if (form.original) {
    form.title = form.original.title ?? '';
    form.description = form.original.description ?? '';
  } else {
    form.title = '';
    form.description = '';
  }
}

async function loadIfEdit() {
  if (!isEditMode.value || mapId.value === null) return;

  const id = mapId.value;

  const existingInStore = mapStore.maps.find((m) => m.id === id);
  if (existingInStore) {
    setFromMap(existingInStore);
    return;
  }

  const fetched = await mapStore.fetchMapById(id);
  if (!fetched) {
    submitError.value = t('mapForm.errors.not_found');
    return;
  }
  setFromMap(fetched);
}

async function onSubmit() {
  submitError.value = null;

  if (!validate()) return;

  saving.value = true;
  try {
    const payload: Partial<GameMap> = {
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (isEditMode.value && mapId.value !== null) {
      payload.id = mapId.value;
    } else {
      payload.creator_id = 1;
    }

    if (isEditMode.value && mapId.value !== null) {
      payload.id = mapId.value;
    }

    await mapStore.saveMap(payload);

    router.push('/maps');
  } catch (err) {
    const apiErr = toApiError(err, t('mapForm.errors.save_failed'));
    submitError.value = apiErr.message;
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadIfEdit();
});
</script>

<style scoped>
.map-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.title {
  margin: 0;
  color: var(--color-text);
}

.form-card {
  display: flex;
  flex-direction: column;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

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

.submit-error {
  color: var(--color-danger, #d14343);
  font-weight: 700;
  margin: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
