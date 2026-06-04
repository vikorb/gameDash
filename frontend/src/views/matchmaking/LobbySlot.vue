<template>
  <div class="lobby-slot" :class="{ empty: !player, me: player?.isMe, ready: isReady }">
    <template v-if="player">
      <div class="player-details">
        <span class="name">{{ player.name }}</span>
        <span class="stats">{{ player.rank }} • {{ Math.round(player.mmr) }} MMR</span>
      </div>
      <div class="ready-badge" :class="{ 'is-ready': isReady }">
        {{ isReady ? '✓ READY' : 'WAITING' }}
      </div>
    </template>
    <template v-else>
      <span class="searching-label">SEARCHING...</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  player?: { id: string | number; name: string; rank: string; mmr: number; isMe?: boolean }
  readyStates?: Record<string | number, boolean>
}>()

const isReady = computed(() => {
  if (!props.player) return false
  return !!props.readyStates?.[props.player.id]
})
</script>

<style scoped>
.lobby-slot {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  transition: all 0.3s ease;
}
.lobby-slot.me {
  background: rgba(94, 110, 128, 0.15);
  border-color: rgba(94, 110, 128, 0.4);
}
.lobby-slot.ready {
  border-color: rgba(72, 187, 120, 0.4);
  background: rgba(72, 187, 120, 0.05);
}
.lobby-slot.empty {
  border: 1px dashed rgba(255, 255, 255, 0.15);
  justify-content: center;
}
.player-details {
  display: flex;
  flex-direction: column;
}
.name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}
.stats {
  font-size: 0.75rem;
  color: #a0aec0;
}
.ready-badge {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #a0aec0;
}
.ready-badge.is-ready {
  background: #48bb78;
  color: white;
}
.searching-label {
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.3);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
