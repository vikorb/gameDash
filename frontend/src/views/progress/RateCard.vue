<template>
  <section class="rate-card" aria-label="Indicateurs rapides">
    <div class="rate-item rate-item-winrate">
      <p class="rate-item-title">Winrate</p>
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

      <span class="rate-label winrate-label">Taux de victoire</span>
    </div>

    <div class="rate-item rate-item-killrate">
      <p class="rate-item-title">Kill rate</p>
      <strong class="rate-value killrate-value">
        <template v-if="loading">…</template>
        <template v-else-if="rateStore.killRate !== null">{{ rateStore.killRate }}</template>
        <template v-else>–</template>
      </strong>
      <span class="rate-label killrate-label">Moyenne de kills / match</span>
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
  gap: 0.95rem;
  margin: 0;
}

.rate-item {
  background: rgba(16, 24, 35, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.rate-item-winrate {
  flex-direction: column;
  gap: 0.35rem;
}

.rate-item-killrate {
  flex-direction: column;
  gap: 0.35rem;
}

.rate-item-title {
  margin: 0;
  color: color-mix(in srgb, var(--color-cream) 74%, var(--color-background-secondary));
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rate-label {
  color: rgba(255, 255, 255, 0.56);
  font-size: 0.86rem;
}

.rate-value {
  color: var(--color-cream);
  font-size: 1.8rem;
  line-height: 1;
}

.winrate-circle-wrap {
  position: relative;
  width: 126px;
  height: 126px;
  display: grid;
  place-items: center;
}

.winrate-circle {
  width: 126px;
  height: 126px;
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
  stroke: var(--color-apricot);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.35s ease;
}

.winrate-value {
  position: absolute;
  font-size: 1.5rem;
}

.winrate-label {
  font-size: 0.9rem;
}

.killrate-value {
  font-size: clamp(1.9rem, 2.6vw, 2.35rem);
  margin-top: 0.2rem;
}

.killrate-label {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .rate-card {
    grid-template-columns: 1fr;
  }
}
</style>