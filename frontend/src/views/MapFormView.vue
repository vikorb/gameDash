<template>
  <div class="map-form">
    <MapFormHeader :is-edit="isEditMode" />

    <BaseCard class="form-card">
      <form class="form" @submit.prevent="onSubmit">
        <MapFormFields
          v-model:title="form.title"
          v-model:description="form.description"
          :errors="errors"
          :saving="saving"
        />

        <p v-if="submitError" class="submit-error">
          {{ submitError }}
        </p>

        <MapFormActions
          :is-edit="isEditMode"
          :saving="saving"
          :can-submit="canSubmit"
          :submit-label="submitLabel"
          :submit-hover="submitHover"
          :submit-aria="submitAria"
          @reset="onReset"
        />
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import BaseCard from '@/components/ui/BaseCard.vue';
import { useMapStore } from '@/stores/mapStore';
import { toApiError } from '@/utils/apiError';
import type { GameMap } from '@/types/map';
import MapFormFields from './maps/form/MapFormFields.vue';
import MapFormActions from './maps/form/MapFormActions.vue';
import MapFormHeader from './maps/form/MapFormHeader.vue';

const { t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const mapStore = useMapStore();

const saving = ref(false);
const submitError = ref<string | null>(null);

const mapId = computed<number | null>(() => {
  const raw = route.params.id;
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
  const existing = mapStore.maps.find((m) => m.id === id);
  if (existing) {
    setFromMap(existing);
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

    // ✅ backend exige creator_id en création
    if (!isEditMode.value) payload.creator_id = 1;
    if (isEditMode.value && mapId.value !== null) payload.id = mapId.value;

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

.form-card {
  display: flex;
  flex-direction: column;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.submit-error {
  color: var(--color-danger, #d14343);
  font-weight: 700;
  margin: 0;
}
</style>
