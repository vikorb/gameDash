<template>
  <div class="team-list" :class="colorTheme">
    <h3 class="team-title">{{ title }}</h3>
    <div class="slots">
      <LobbySlot
        v-for="i in 4"
        :key="i"
        :player="players[i - 1]"
        :ready-states="readyStates"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LobbySlot from './LobbySlot.vue'

defineProps<{
  title: string
  players: { id: string | number; name: string; rank: string; mmr: number; isMe?: boolean }[]
  readyStates?: Record<string | number, boolean>
  colorTheme: 'blue' | 'orange'
}>()
</script>

<style scoped>
.team-list {
  flex: 1;
  background: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.team-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}
.blue { border-top: 4px solid #5e6e80; }
.blue .team-title { color: #5e6e80; }
.orange { border-top: 4px solid #f18a5f; }
.orange .team-title { color: #f18a5f; }
.slots {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
