<template>
  <div class="map-voting">
    <h2 class="title">VOTE FOR A MAP</h2>
    <div class="timer">Time Remaining: {{ Math.max(0, timeLeft) }}s</div>
    
    <div class="maps-grid">
      <div
        v-for="map in room.voteMaps"
        :key="map.id"
        :class="['map-card', { selected: myVote === map.id }]"
        @click="vote(map.id)"
      >
        <img v-if="getMapImage(map.id)" :src="getMapImage(map.id)" class="map-image" alt="Map image" />
        <div v-else class="map-image-placeholder">No Image</div>
        <span class="map-name">{{ map.title }}</span>
        <span class="vote-count">{{ getVoteCount(map.id) }} vote(s)</span>
      </div>
    </div>

    <div class="footer-actions">
      <button :class="['blank-btn', { selected: myVote === null }]" @click="vote(null)">
        Vote Blank ({{ blankVotesCount }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useMapsStore } from '@/stores/mapsStore'

const props = defineProps<{
  room: { roomId: string; voteMaps: { id: number; title: string }[]; votes: Record<string | number, number | null>; voteStartTime: number }
  myPlayerId: string | number
}>()

const emit = defineEmits<{ vote: [mapId: number | null] }>()
const timeLeft = ref(15), mapsStore = useMapsStore()
let timerInterval: ReturnType<typeof setInterval> | null = null

const myVote = computed(() => props.room.votes[props.myPlayerId])
const blankVotesCount = computed(() => Object.values(props.room.votes).filter(v => v === null).length)
const getVoteCount = (mapId: number) => Object.values(props.room.votes).filter(v => v === mapId).length
const getMapImage = (mapId: number) => mapsStore.getMap(mapId)?.screenshots[0]?.url ?? ''
function vote(mapId: number | null) { emit('vote', mapId) }

onMounted(() => {
  const updateTimer = () => { timeLeft.value = Math.max(0, 15 - Math.floor((Date.now() - props.room.voteStartTime) / 1000)) }
  updateTimer()
  timerInterval = setInterval(updateTimer, 500)
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.map-voting { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; max-width: 600px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); }
.title { font-size: 1.8rem; font-weight: 800; color: var(--color-cream); margin: 0; letter-spacing: 1px; }
.timer { font-size: 1.1rem; color: #f18a5f; font-weight: 700; }
.maps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; }
.map-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem 0.5rem; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; text-align: center; min-height: 120px; }
.map-card:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
.map-card.selected { background: rgba(241, 138, 95, 0.15); border-color: #f18a5f; box-shadow: 0 0 12px rgba(241, 138, 95, 0.25); }
.map-image { width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 0.25rem; }
.map-image-placeholder { width: 100%; height: 90px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #718096; font-size: 0.8rem; margin-bottom: 0.25rem; }
.map-name { font-size: 0.95rem; font-weight: 700; color: #fff; }
.vote-count { font-size: 0.8rem; color: #a0aec0; }
.footer-actions { width: 100%; display: flex; justify-content: center; margin-top: 0.5rem; }
.blank-btn { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); color: #a0aec0; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.blank-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.blank-btn.selected { border-color: #f18a5f; color: #f18a5f; background: rgba(241, 138, 95, 0.08); }
</style>
