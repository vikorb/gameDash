<template>
  <div class="matchmaking-view">
    <MatchmakingSearching v-if="phase === 'searching'" @cancel="cancelSearch" />
    <div v-else-if="phase === 'lobby' || phase === 'ready_check'" class="lobby-container">
      <ReadyTimer v-if="phase === 'ready_check' && room?.readyCheckStartTime" :ready-check-start-time="room.readyCheckStartTime" />
      <div class="teams">
        <TeamList title="Your Team" :players="myTeam" :ready-states="room?.readyStates" color-theme="blue" />
        <TeamList title="Opponents" :players="oppTeam" :ready-states="room?.readyStates" color-theme="orange" />
      </div>
      <div class="actions">
        <button v-if="phase === 'ready_check' && !isMeReady" class="ready-btn" @click="pressReady">READY</button>
        <button class="leave-btn" @click="leaveRoom">LEAVE</button>
      </div>
    </div>
    <LoadingScreen v-else-if="phase === 'in_game'" />
    <EndingScreen v-else-if="phase === 'ended'" :my-team="myTeam" :winner="winnerTeam" :my-player-id="myPlayerId" :rewards="rewardsData" @home="goToHome" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { socket } from '@/services/socket'
import { useUserStore } from '@/stores/userStore'

import EndingScreen from './EndingScreen.vue'
import LoadingScreen from './LoadingScreen.vue'
import MatchmakingSearching from './MatchmakingSearching.vue'
import ReadyTimer from './ReadyTimer.vue'
import TeamList from './TeamList.vue'

interface PlayerData { id: string | number; name: string; rank: string; division: number; mmr: number; isMe?: boolean }
interface RoomData { roomId: string; teamA: PlayerData[]; teamB: PlayerData[]; status: 'searching' | 'ready_check' | 'in_game'; readyStates: Record<string | number, boolean>; readyCheckStartTime: number }
interface RewardData { xp: number; coins: number; mmrChange: number; nextMMR: number; rewardedItem?: { name: string; category: string; rarity: string; slot: string; image_seed: string } | null }

const router = useRouter(), userStore = useUserStore()
const phase = ref<'searching' | 'lobby' | 'ready_check' | 'in_game' | 'ended'>('searching')
const room = ref<RoomData | null>(null), winnerTeam = ref<'Team A' | 'Team B'>('Team A'), rewardsData = ref<Record<string | number, RewardData> | null>(null)
const myPlayerId = computed(() => userStore.profile?.id || '')
const myTeam = computed(() => room.value?.teamA || []), oppTeam = computed(() => room.value?.teamB || [])
const isMeReady = computed(() => !!room.value?.readyStates?.[myPlayerId.value])

onMounted(() => {
  if (!socket.connected) socket.connect()
  socket.on('room_update', (d: RoomData) => { room.value = d; phase.value = d.status === 'ready_check' ? 'ready_check' : 'lobby' })
  socket.on('game_started', () => { phase.value = 'in_game' })
  socket.on('game_ended', (d: { winner: 'Team A' | 'Team B'; rewards: Record<string | number, RewardData> }) => { winnerTeam.value = d.winner; rewardsData.value = d.rewards; phase.value = 'ended' })
  socket.on('queue_left', () => { phase.value = 'searching'; room.value = null })
})
onUnmounted(() => { socket.off('room_update'); socket.off('game_started'); socket.off('game_ended'); socket.off('queue_left') })

const cancelSearch = () => { socket.emit('leave_queue'); router.push('/home') }
const pressReady = () => { socket.emit('player_ready', { roomId: room.value?.roomId, playerId: myPlayerId.value }) }
const leaveRoom = () => { socket.emit('leave_room', { roomId: room.value?.roomId, playerId: myPlayerId.value }) }
const goToHome = () => { router.push('/home') }
</script>

<style scoped>
.matchmaking-view { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; color: #fff; padding: 2rem; position: relative; gap: 2rem; }
.lobby-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; width: 100%; max-width: 900px; }
.teams { display: flex; gap: 2rem; width: 100%; }
.actions { display: flex; gap: 1rem; margin-top: 1rem; width: 100%; max-width: 400px; }
.ready-btn, .leave-btn { flex: 1; border: none; padding: 0.8rem; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: .2s; }
.ready-btn { background: #48bb78; color: white; }
.ready-btn:hover { background: #38a169; }
.leave-btn { background: #e53e3e; color: white; }
.leave-btn:hover { background: #c53030; }
</style>
