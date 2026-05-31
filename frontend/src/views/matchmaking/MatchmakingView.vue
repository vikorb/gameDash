<template>
  <div class="matchmaking-view">
    <MatchmakingSearching
      v-if="state === 'searching'"
      @cancel="cancelSearch"
      @match-found="onMatchFound"
    />
    <MatchmakingRoomFound
      v-else-if="state === 'found'"
      :my-team="myTeam"
      :opponent-team="opponentTeam"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MatchmakingSearching from './MatchmakingSearching.vue'
import MatchmakingRoomFound from './MatchmakingRoomFound.vue'

const router = useRouter()
const state = ref<'searching' | 'found'>('searching')

// We will use a web socket later. For now, simulate.
type PlayerSummary = { id: number | string; name: string; mmr: number; rank: string; division: number; isMe?: boolean }
const myTeam = ref<PlayerSummary[]>([])
const opponentTeam = ref<PlayerSummary[]>([])

const cancelSearch = () => {
  // Navigation back to home, depending on your auth/home route
  router.push('/home')
}

const onMatchFound = (data: { myTeam: PlayerSummary[]; opponentTeam: PlayerSummary[] }) => {
  state.value = 'found'
  myTeam.value = data.myTeam
  opponentTeam.value = data.opponentTeam
}
</script>

<style scoped>
.matchmaking-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--color-cream, #fff);
}
</style>
