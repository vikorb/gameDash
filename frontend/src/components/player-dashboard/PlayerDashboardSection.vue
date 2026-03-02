<template>
  <section class="player-dashboard">
    <div class="player-dashboard__top">
      <PlayerShopCard />
      <PlayerCompetitiveCard />
    </div>

    <PlayerRankCard />
  </section>
</template>

<script setup lang="ts">
import PlayerCompetitiveCard from '@/components/player-dashboard/PlayerCompetitiveCard.vue'
import PlayerRankCard from '@/components/player-dashboard/PlayerRankCard.vue'
import PlayerShopCard from '@/components/player-dashboard/PlayerShopCard.vue'
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
