<template>
  <div class="matchmaking-searching mt-12">
    <template v-if="!socketErrorMsg">
      <h2 class="searching-text">Searching</h2>
      <div class="timer">{{ formattedTime }}</div>
      <button class="cancel-btn mt-6" @click="$emit('cancel')">Cancel</button>

      <!-- Simulated searching visual -->
      <div class="spinner-container mt-8">
        <div class="radar-spinner"></div>
      </div>
    </template>
    <template v-else>
      <BaseCard class="error-card">
        <h3 class="error-title">Erreur de Connexion</h3>
        <p class="error-desc">{{ socketErrorMsg }}</p>
        <p class="error-redirect">Redirection vers le menu principal...</p>
      </BaseCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import BaseCard from '@/components/ui/BaseCard.vue'
import { socket } from '@/services/socket'
import { useUserStore } from '@/stores/userStore'

type BackendPlayer = {
  id: number | string
  pocketbase_user_id?: string
  name: string
  mmr?: number
  rank?: string
  division?: number
}

type MatchFoundEmit = {
  myTeam: { id: number | string; name: string; mmr: number; rank: string; division: number; isMe?: boolean }[]
  opponentTeam: { id: number | string; name: string; mmr: number; rank: string; division: number; isMe?: boolean }[]
}

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'match-found', data: MatchFoundEmit): void
}>()

const timeElapsed = ref(0)
const socketErrorMsg = ref('')
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
  }, 1000)

  // Connect socket and join queue
  if (!socket.connected) {
    socket.connect()
  }

  const pocketbaseUserId = userStore.profile?.pocketbase_user_id;

  if (pocketbaseUserId) {
    // We hardcode modeId to 1 for this prototype
    socket.emit('join_queue', { pocketbaseUserId, modeId: 1 })
  } else {
    console.error("No Pocketbase User ID available to join queue.")
  }

  socket.on('simulation_started', (data: { message?: string }) => {
    console.log('Simulation Event:', data.message)
  })

  socket.on('simulation_delayed_players', (data: { message?: string }) => {
    console.log('Simulation Event:', data.message)
  })

  socket.on('match_found', (data: { game?: { teams?: BackendPlayer[][] } }) => {
    if (intervalId) clearInterval(intervalId)
    
    // Parse players from both teams according to our backend Player model
    const teams = data.game?.teams || [];
    
    // Identify which team "I" am on
    let myTeamIndex = 0;
    teams.forEach((team: BackendPlayer[], index: number) => {
      if (team.some(p => p.pocketbase_user_id === pocketbaseUserId)) {
        myTeamIndex = index;
      }
    });

    const myTeam = teams[myTeamIndex]?.map((p: BackendPlayer) => ({
      id: p.id,
      name: p.name,
      mmr: Math.round(p.mmr || 0),
      rank: p.rank || 'Unranked',
      division: p.division || 1,
      isMe: p.pocketbase_user_id === pocketbaseUserId
    })) || [];

    const opponentTeamIndex = myTeamIndex === 0 ? 1 : 0;
    const opponentTeam = teams[opponentTeamIndex] ? teams[opponentTeamIndex].map((p: BackendPlayer) => ({
      id: p.id,
      name: p.name,
      mmr: Math.round(p.mmr || 0),
      rank: p.rank || 'Unranked',
      division: p.division || 1,
      isMe: false
    })) : [];

    emit('match-found', {
      myTeam,
      opponentTeam
    })
  })

  socket.on('queue_error', (error: { message?: string }) => {
    console.error('Queue error:', error)
  })

  socket.on('connect_error', (err) => {
    socketErrorMsg.value = `Impossible de joindre le serveur de matchmaking (${err.message}).`
    setTimeout(() => emit('cancel'), 4000)
  })

  socket.on('disconnect', (reason) => {
    if (reason !== 'io client disconnect') {
      socketErrorMsg.value = `Connexion au matchmaking interrompue : ${reason}.`
      setTimeout(() => emit('cancel'), 4000)
    }
  })
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  // Ensure we safely disconnect / leave when navigating away
  socket.emit('leave_queue')
  socket.off('match_found')
  socket.off('queue_error')
  socket.off('connect_error')
  socket.off('disconnect')
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

/* Error Card */
.error-card {
  text-align: center;
  border-color: #f18a5f;
  margin-top: 2rem;
  animation: fadeIn 0.3s ease;
  max-width: 400px;
}

.error-title {
  color: #f18a5f;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.error-desc {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #c4c6c5;
}

.error-redirect {
  font-style: italic;
  opacity: 0.6;
  font-size: 0.9rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
