<template>
  <div class="export-inline">
    <button type="button" class="export-button" :disabled="isLoading" @click="exportData">
      {{ isLoading ? 'Export...' : buttonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import api from '@/api'
import { type CsvRow,toCsv } from '@/services/export'

type ExportType = 'users' | 'matches' | 'maps' | 'transactions'

const props = withDefaults(
  defineProps<{
    entity: ExportType
    label?: string
    clientRows?: CsvRow[]
  }>(),
  {
    label: 'Exporter en CSV',
    clientRows: () => [],
  },
)

const isLoading = ref(false)
const buttonLabel = computed(() => props.label)

async function exportData() {
  isLoading.value = true

  try {
    let blob: Blob
    if (props.clientRows.length > 0) {
      const csvPayload = toCsv(props.clientRows)
      blob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8' })
    } else {
      const response = await api.get(`/admin/export/${props.entity}`, {
        responseType: 'blob',
      })
      blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateTag = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `${props.entity}_${dateTag}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    // Silent failure by design: no status text shown in UI.
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.export-inline {
  display: grid;
  gap: 0.45rem;
}

.export-button {
  min-height: 40px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-cream);
  padding: 0.55rem 0.9rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.18s ease;
}

.export-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-button:hover {
  transform: translateY(-1px);
}

</style>