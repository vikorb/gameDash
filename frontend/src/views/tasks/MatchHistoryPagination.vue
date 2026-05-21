<template>
  <div class="pagination">
    <button :disabled="offset === 0" @click="emit('prev-page')">← Précédent</button>

    <span class="pagination-meta">
      Page {{ currentPage }} / {{ totalPages }}
      · {{ pageStartItem }}-{{ pageEndItem }} sur {{ safeTotal }} items
    </span>

    <label class="page-size-wrap">
      <span class="page-size-label">Items/page</span>
      <select class="page-size-select" :value="limit" @change="onLimitChange">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
      </select>
    </label>

    <button :disabled="offset + limit >= safeTotal" @click="emit('next-page')">Suivant →</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  total: number
  limit: number
  offset: number
  currentItemsCount?: number
  pageSizeOptions?: number[]
}>(), {
  currentItemsCount: 0,
  pageSizeOptions: () => [5, 10, 20, 50, 100],
})

const emit = defineEmits<{
  'prev-page': []
  'next-page': []
  'update:limit': [value: number]
}>()

const safeTotal = computed(() => Math.max(props.total, props.currentItemsCount))
const currentPage = computed(() => Math.floor(props.offset / props.limit) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(safeTotal.value / props.limit)))
const pageStartItem = computed(() => (safeTotal.value === 0 ? 0 : props.offset + 1))
const pageEndItem = computed(() => Math.min(props.offset + props.limit, safeTotal.value))

function onLimitChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = Number(target.value)
  if (!Number.isFinite(value) || value <= 0) return
  emit('update:limit', value)
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 0;
  flex-wrap: wrap;
}

.pagination-meta {
  white-space: nowrap;
  font-size: 0.85rem;
  color: #c9d2e3;
}

.pagination button {
  background: #1a2230;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-size-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.page-size-label {
  font-size: 0.8rem;
  color: #c9d2e3;
}

.page-size-select {
  background: #1a2230;
  color: var(--color-cream);
  border: 1px solid #3a4a5e;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>
