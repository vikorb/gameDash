<template>
  <div class="matchmaking-searching mt-12">
    <h2 class="searching-text">Searching</h2>
    <div class="timer">{{ formattedTime }}</div>
    <button class="cancel-btn mt-6" @click="$emit('cancel')">Cancel</button>

    <!-- Simulated searching visual -->
    <div class="spinner-container mt-8">
      <div class="radar-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'match-found', data: any): void
}>()

const timeElapsed = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const mins = Math.floor(timeElapsed.value / 60)
  const secs = timeElapsed.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const userStore = useUserStore()

onMounted(() => {
  intervalId = setInterval(() => {
    timeElapsed.value++
    // Fake matchmaking logic: wait 10 seconds
    if (timeElapsed.value >= 10) {
      if (intervalId) clearInterval(intervalId)
      
      // trigger match found
      // 2 players on his team (3 total including him)
      // 2 players on the opponent team
      // Max size is 4 per team
      emit('match-found', {
        myTeam: [
          { id: '1', name: userStore.profile?.username || 'You', isMe: true },
          { id: '2', name: 'RogueKnight', isMe: false },
          { id: '3', name: 'ShadowNinja', isMe: false },
        ],
        opponentTeam: [
          { id: '4', name: 'DarkMage', isMe: false },
          { id: '5', name: 'IronClad', isMe: false },
        ]
      })
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.matchmaking-searching {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.searching-text {
  font-size: 3rem;
  margin: 0;
  color: var(--color-primary, #5e6e80);
  animation: pulse 1.5s ease-in-out infinite;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.timer {
  font-size: 4rem;
  font-family: monospace;
  font-weight: bold;
  color: #c4c6c5;
  text-shadow: 0 0 10px rgba(196, 198, 197, 0.2);
}

.cancel-btn {
  background-color: #f18a5f;
  color: white;
  border: none;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cancel-btn:hover {
  background-color: #df7a4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(241, 138, 95, 0.4);
}

.cancel-btn:active {
  transform: translateY(0);
}

/* Spinner */
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.radar-spinner {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid rgba(94, 110, 128, 0.2);
  border-top-color: var(--color-primary, #5e6e80);
  animation: spin 1.2s linear infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Utils */
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
</style>
