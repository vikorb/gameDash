<template>
  <div class="ending-screen">
    <h2 class="outcome" :class="{ won: isWinner }">{{ isWinner ? 'VICTORY' : 'DEFEAT' }}</h2>
    <p class="subtitle">The match has concluded. Gained rewards:</p>

    <div class="stats-row">
      <div class="stat-card">
        <span class="value">+{{ rewardData?.xp || 0 }}</span>
        <span class="label">XP Gained</span>
      </div>
      <div class="stat-card">
        <span class="value">+{{ rewardData?.coins || 0 }}</span>
        <span class="label">Coins Gained</span>
      </div>
      <div class="stat-card">
        <span class="value" :class="{ plus: rewardData?.mmrChange > 0 }">
          {{ rewardData?.mmrChange > 0 ? '+' : '' }}{{ rewardData?.mmrChange || 0 }}
        </span>
        <span class="label">MMR ({{ rewardData?.nextMMR || 1000 }})</span>
      </div>
    </div>

    <!-- Loot drop -->
    <div v-if="rewardData?.rewardedItem" class="item-drop-card" :class="rewardData.rewardedItem.rarity">
      <div class="rarity-badge">{{ rewardData.rewardedItem.rarity.toUpperCase() }} DROP</div>
      <span class="item-name">{{ rewardData.rewardedItem.name }}</span>
      <span class="item-slot">{{ rewardData.rewardedItem.slot }} • {{ rewardData.rewardedItem.category }}</span>
    </div>

    <button class="home-btn" @click="$emit('home')">Back to Home</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  myTeam: { id: string | number; name: string; rank: string; mmr: number; isMe?: boolean }[]
  winner: 'Team A' | 'Team B'
  myPlayerId: string | number
  rewards?: Record<string | number, { xp: number; coins: number; mmrChange: number; nextMMR: number; rewardedItem?: { name: string; category: string; rarity: string; slot: string; image_seed: string } | null }>
}>()

const isWinner = computed(() => {
  const amITeamA = props.myTeam.some(p => p.id === props.myPlayerId)
  return amITeamA ? props.winner === 'Team A' : props.winner === 'Team B'
})

const rewardData = computed(() => {
  return props.rewards?.[props.myPlayerId]
})
</script>

<style scoped>
.ending-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 480px;
  background: #1a202c;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}
.outcome {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0;
  color: #e53e3e;
  text-shadow: 0 0 15px rgba(229, 62, 62, 0.4);
}
.outcome.won {
  color: #38a169;
  text-shadow: 0 0 15px rgba(56, 161, 105, 0.4);
}
.subtitle { color: #a0aec0; font-size: 0.95rem; margin: 0; }
.stats-row { display: flex; gap: 1rem; width: 100%; margin-top: 1rem; }
.stat-card {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.value { font-size: 1.4rem; font-weight: bold; color: #fff; }
.value.plus { color: #48bb78; }
.label { font-size: 0.75rem; color: #718096; margin-top: 0.25rem; font-weight: 600; }
.item-drop-card {
  width: 100%;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border: 1px solid #718096;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(255,255,255,0.1);
}
.item-drop-card.epic { border-color: #805ad5; box-shadow: 0 0 20px rgba(128, 90, 213, 0.3); }
.item-drop-card.legendary { border-color: #d69e2e; box-shadow: 0 0 25px rgba(214, 158, 46, 0.4); }
.rarity-badge { font-size: 0.65rem; font-weight: bold; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(255,255,255,0.1); color: #fff; }
.item-name { font-size: 1.25rem; font-weight: 800; color: #fff; margin-top: 0.5rem; }
.item-slot { font-size: 0.75rem; color: #a0aec0; text-transform: uppercase; font-weight: bold; }
.home-btn {
  width: 100%;
  background: #f18a5f;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: .2s;
}
.home-btn:hover { background: #df7a4f; transform: translateY(-1px); }
</style>
