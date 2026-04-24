<template>
  <section class="rate-card">
    <div class="rate-item">
      <span class="rate-label">Winrate</span>
      <strong class="rate-value">
        <template v-if="loading">…</template>
        <template v-else-if="rateStore.winrate !== null">{{ rateStore.winrate }}%</template>
        <template v-else>–</template>
      </strong>
    </div>

    <div class="rate-item">
      <span class="rate-label">Kill rate</span>
      <strong class="rate-value">
        <template v-if="loading">…</template>
        <template v-else-if="rateStore.killRate !== null">{{ rateStore.killRate }}</template>
        <template v-else>–</template>
      </strong>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

import { useRateStore } from '@/stores/rateStore'

const props = defineProps<{
  userId: number
  modeId?: number
  dateFrom?: string
  dateTo?: string
}>()

const rateStore = useRateStore()
const { loading } = storeToRefs(rateStore)

async function load() {
  await rateStore.fetch(props.userId, props.modeId, props.dateFrom, props.dateTo)
}

onMounted(load)

watch(() => [props.userId, props.modeId, props.dateFrom, props.dateTo], load)
</script>

<style scoped>
.rate-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.rate-item {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.rate-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

.rate-value {
  color: var(--color-cream);
  font-size: 1.7rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .rate-card {
    grid-template-columns: 1fr;
  }
}
</style>