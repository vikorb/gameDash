<template>
  <div class="matchmaking-view">
    <MatchmakingSearching v-if="phase === 'searching'" @cancel="cancelSearch" />
    <div v-else-if="phase === 'lobby' || phase === 'ready_check'" class="lobby-container">
      <ReadyTimer v-if="phase === 'ready_check' && room?.readyCheckStartTime" :ready-check-start-time="room.readyCheckStartTime" />
      <div class="teams"><TeamList title="Your Team" :players="lobbyMyTeam" :ready-states="room?.readyStates" color-theme="blue" /><TeamList title="Opponents" :players="lobbyOppTeam" :ready-states="room?.readyStates" color-theme="orange" /></div>
      <div class="actions"><button v-if="phase === 'ready_check' && !isMeReady" class="ready-btn" @click="pressReady">READY</button><button class="leave-btn" @click="leaveRoom">LEAVE</button></div>
    </div>
    <MapVoting v-else-if="phase === 'map_voting' && room" :room="room" :my-player-id="myPlayerId" @vote="castVote" />
    <LoadingScreen v-else-if="phase === 'in_game'" :map="selectedMap" />
    <EndingScreen v-else-if="phase === 'ended'" :my-team="room?.teamA || []" :winner="winnerTeam" :my-player-id="myPlayerId" :rewards="rewardsData" @home="goToHome" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { socket } from '@/services/socket'
import { useUserStore } from '@/stores/userStore'

import EndingScreen from './EndingScreen.vue'
import LoadingScreen from './LoadingScreen.vue'
import MapVoting from './MapVoting.vue'
import MatchmakingSearching from './MatchmakingSearching.vue'
import ReadyTimer from './ReadyTimer.vue'
import TeamList from './TeamList.vue'

interface PlayerData { id: string | number; name: string; rank: string; division: number; mmr: number }
interface RoomData { roomId: string; teamA: PlayerData[]; teamB: PlayerData[]; status: 'searching' | 'lobby' | 'ready_check' | 'map_voting' | 'in_game' | 'ended'; readyStates: Record<string | number, boolean>; readyCheckStartTime: number; votes: Record<string | number, number | null>; voteMaps: { id: number; title: string }[]; voteStartTime: number }
interface RewardData { xp: number; coins: number; mmrChange: number; nextMMR: number }
interface GameStartedData { map?: { id: number; title: string } | null }
interface GameEndedData { winner: 'Team A' | 'Team B'; rewards: Record<string | number, RewardData> }

const router = useRouter(), userStore = useUserStore()
const phase = ref<'searching' | 'lobby' | 'ready_check' | 'map_voting' | 'in_game' | 'ended'>('searching')
const room = ref<RoomData | null>(null), winnerTeam = ref<'Team A' | 'Team B'>('Team A'), rewardsData = ref<Record<string | number, RewardData> | null>(null), selectedMap = ref<{ id: number; title: string } | null>(null)
const myPlayerId = computed(() => userStore.profile?.id || '')
const lobbyMyTeam = computed(() => {
  if (!room.value) return []
  return room.value.teamA.some(p => String(p.id) === String(myPlayerId.value)) ? room.value.teamA : room.value.teamB
})
const lobbyOppTeam = computed(() => {
  if (!room.value) return []
  return room.value.teamA.some(p => String(p.id) === String(myPlayerId.value)) ? room.value.teamB : room.value.teamA
})
const isMeReady = computed(() => !!room.value?.readyStates?.[myPlayerId.value])
onMounted(() => {
  if (!socket.connected) socket.connect()
  socket.on('room_update', (d: RoomData) => { room.value = d; phase.value = d.status })
  socket.on('game_started', (d?: GameStartedData) => { phase.value = 'in_game'; if (d?.map) selectedMap.value = d.map })
  socket.on('game_ended', (d: GameEndedData) => { winnerTeam.value = d.winner; rewardsData.value = d.rewards; phase.value = 'ended' })
  socket.on('queue_left', () => router.push('/home'))
})
onUnmounted(() => {
  socket.emit('leave_room', { roomId: room.value?.roomId, playerId: myPlayerId.value })
  socket.emit('leave_queue')
  socket.off('room_update'); socket.off('game_started'); socket.off('game_ended'); socket.off('queue_left')
})
const cancelSearch = () => { socket.emit('leave_queue'); router.push('/home') }
const pressReady = () => { socket.emit('player_ready', { roomId: room.value?.roomId, playerId: myPlayerId.value }) }
const castVote = (mapId: number | null) => { socket.emit('cast_vote', { roomId: room.value?.roomId, playerId: myPlayerId.value, mapId }) }
const leaveRoom = () => { socket.emit('leave_room', { roomId: room.value?.roomId, playerId: myPlayerId.value }) }
const goToHome = () => { router.push('/home') }
</script>

<style scoped>
.matchmaking-view { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; color: #fff; padding: 2rem; position: relative; gap: 2rem; }
.lobby-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; width: 100%; max-width: 900px; }
.teams { display: flex; gap: 2rem; width: 100%; }
.actions { display: flex; gap: 1rem; margin-top: 1rem; width: 100%; max-width: 400px; }
.ready-btn, .leave-btn { flex: 1; border: none; padding: 0.8rem; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: .2s; color: white; }
.ready-btn { background: #48bb78; } .ready-btn:hover { background: #38a169; }
.leave-btn { background: #e53e3e; } .leave-btn:hover { background: #c53030; }
</style>
