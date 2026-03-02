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
          :form="form"
          @reset="onReset"
        />
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useMapStore } from '@/stores/mapStore'
import { toApiError } from '@/utils/apiError'
import MapFormFields from '@/components/maps/form/MapFormFields.vue'
import MapFormActions from '@/components/maps/form/MapFormActions.vue'
import MapFormHeader from '@/components/maps/form/MapFormHeader.vue'
import type { GameMap } from '@/types/map'
import type { MapFormData } from '@/types/form'
import {
  initMapFormData,
  mapToFormData,
  parseRouteId,
  resetMapFormData,
  toSavePayload,
  validateMapForm,
  type MapFormErrors,
} from '@/utils/mapForm'

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const mapStore = useMapStore()

const saving = ref(false)
const submitError = ref<string | null>(null)

const mapId = computed(() => parseRouteId(route.params.id))
const isEditMode = computed(() => mapId.value !== null)

const form = reactive<MapFormData>(initMapFormData())
const errors = reactive<MapFormErrors>({})

const canSubmit = computed(() => form.title.trim().length >= 2)

function onReset() {
  submitError.value = null
  errors.title = undefined
  resetMapFormData(form)
}

async function loadIfEdit() {
  if (!isEditMode.value || mapId.value === null) return

  const id = mapId.value

  const existing = mapStore.maps.find((m) => m.id === id)
  if (existing) {
    mapToFormData(form, existing)
    return
  }

  const fetched = await mapStore.fetchMapById(id)
  if (!fetched) {
    submitError.value = t('mapForm.errors.not_found')
    return
  }

  mapToFormData(form, fetched)
}

async function onSubmit() {
  submitError.value = null

  const valid = validateMapForm(form, t, errors)
  if (!valid) return

  saving.value = true
  try {
    const payload: Partial<GameMap> = toSavePayload(form, isEditMode.value, mapId.value)
    await mapStore.saveMap(payload)
    router.push('/home/maps')
  } catch (err) {
    const apiErr = toApiError(err, t('mapForm.errors.save_failed'))
    submitError.value = apiErr.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadIfEdit()
})
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
  background: #516079;
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
