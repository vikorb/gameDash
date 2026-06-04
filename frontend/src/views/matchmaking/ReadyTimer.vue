<template>
  <div class="ready-timer">
    <div class="timer-box">
      <span class="timer-value">{{ secondsLeft }}s</span>
    </div>
    <p class="timer-label">LAUNCHING AUTOMATICALLY</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ readyCheckStartTime: number }>()
const now = ref(Date.now())
let timerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerId = setInterval(() => { now.value = Date.now() }, 100)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

const secondsLeft = computed(() => {
  const elapsed = Math.floor((now.value - props.readyCheckStartTime) / 1000)
  return Math.max(0, 60 - elapsed)
})
</script>

<style scoped>
.ready-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.timer-box {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 4px solid #f18a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(241, 138, 95, 0.1);
  box-shadow: 0 0 15px rgba(241, 138, 95, 0.3);
}
.timer-value {
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: bold;
  color: #fff;
}
.timer-label {
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: #a0aec0;
  margin: 0;
}
</style>
