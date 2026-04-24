<template>
  <section class="rate-card">
    <div class="rate-item rate-item-winrate">
      <div class="winrate-circle-wrap" role="img" aria-label="Winrate progress">
        <svg class="winrate-circle" viewBox="0 0 120 120">
          <circle class="winrate-circle-bg" cx="60" cy="60" :r="radius" />
          <circle
            class="winrate-circle-progress"
            cx="60"
            cy="60"
            :r="radius"
            :style="{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: progressOffset,
            }"
          />
        </svg>

        <strong class="rate-value winrate-value">{{ winrateText }}</strong>
      </div>

      <span class="rate-label winrate-label">Winrate</span>
    </div>

    <div class="rate-item rate-item-killrate">
      <strong class="rate-value killrate-value">
        <template v-if="loading">…</template>
        <template v-else-if="rateStore.killRate !== null">{{ rateStore.killRate }}</template>
        <template v-else>–</template>
      </strong>
      <span class="rate-label killrate-label">Kill rate</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'

import { useRateStore } from '@/stores/rateStore'

const props = defineProps<{
  userId: number
  modeId?: number
  dateFrom?: string
  dateTo?: string
}>()

const rateStore = useRateStore()
const { loading } = storeToRefs(rateStore)

const radius = 42
const circumference = 2 * Math.PI * radius

const progressOffset = computed(() => {
  if (loading.value || rateStore.winrate === null) return circumference
  const clamped = Math.max(0, Math.min(100, rateStore.winrate))
  return circumference - (clamped / 100) * circumference
})

const winrateText = computed(() => {
  if (loading.value) return '...'
  if (rateStore.winrate === null) return '-'
  return `${rateStore.winrate}%`
})

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

.rate-item-winrate {
  background: transparent;
  border: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
}

.rate-item-killrate {
  background: transparent;
  border: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
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

.winrate-circle-wrap {
  position: relative;
  width: 116px;
  height: 116px;
  display: grid;
  place-items: center;
}

.winrate-circle {
  width: 116px;
  height: 116px;
  transform: rotate(-90deg);
}

.winrate-circle-bg,
.winrate-circle-progress {
  fill: none;
  stroke-width: 10;
}

.winrate-circle-bg {
  stroke: rgba(255, 255, 255, 0.12);
}

.winrate-circle-progress {
  stroke: #f28b5b;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.35s ease;
}

.winrate-value {
  position: absolute;
  font-size: 1.55rem;
}

.winrate-label {
  font-size: 0.95rem;
}

.killrate-value {
  font-size: 1.9rem;
}

.killrate-label {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .rate-card {
    grid-template-columns: 1fr;
  }
}
</style>