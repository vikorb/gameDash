<template>
  <section class="player-dashboard">
    <div class="player-dashboard__top">
      <PlayerShopCard />
      <PlayerCompetitiveCard :modes="modes" :selectedModeId="selectedModeId" @update:selectedModeId="selectedModeId = $event" />
    </div>

    <CardRank v-if="postgresUserId" :userId="Number(postgresUserId)" :selectedModeId="selectedModeId" :modes="modes" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { fetchGameModes } from '@/services/gameMode'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'
import PlayerCompetitiveCard from '@/views/home/PlayerCompetitiveCard.vue'
import PlayerShopCard from '@/views/home/PlayerShopCard.vue'
import CardRank from '@/views/progress/CardRank.vue'

const userStore = useUserStore()
const postgresUserId = computed(() => userStore.profile?.id)
const selectedModeId = ref<number | string>(1)
const modes = ref<GameMode[]>([])

onMounted(async () => {
  modes.value = await fetchGameModes()
  if (modes.value.length > 0 && modes.value[0]) {
    selectedModeId.value = modes.value[0].id
  }
})
</script>

<style scoped>
.player-dashboard {
  display: grid;
  gap: 24px;
}

.player-dashboard__top {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr);
  gap: 24px;
  align-items: stretch;
}

@media (max-width: 900px) {
  .player-dashboard__top {
    grid-template-columns: 1fr;
  }
}
</style>
