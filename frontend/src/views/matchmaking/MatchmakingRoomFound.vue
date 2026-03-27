<template>
  <div class="matchmaking-room-found">
    <h2 class="found-text">Match Found!</h2>
    <div class="teams-container">
      <!-- Blue Team (My Team) -->
      <div class="team my-team">
        <h3 class="team-title my-team-title">Your Team</h3>
        <div class="slots">
          <div v-for="i in 4" :key="'my'+i" class="slot" :class="{ empty: !myTeam[i-1], me: myTeam[i-1]?.isMe }">
            <template v-if="myTeam[i-1]">
              <span class="player-name">{{ myTeam[i-1].name }}</span>
            </template>
            <template v-else>
              <span class="waiting-text">Waiting...</span>
            </template>
          </div>
        </div>
      </div>

      <div class="vs-badge">VS</div>

      <!-- Red Team (Opponent Team) -->
      <div class="team opponent-team">
        <h3 class="team-title opp-team-title">Opponent Team</h3>
        <div class="slots">
          <div v-for="i in 4" :key="'opp'+i" class="slot" :class="{ empty: !opponentTeam[i-1] }">
            <template v-if="opponentTeam[i-1]">
              <span class="player-name">{{ opponentTeam[i-1].name }}</span>
            </template>
            <template v-else>
              <span class="waiting-text">Waiting...</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  myTeam: any[]
  opponentTeam: any[]
}>()
</script>

<style scoped>
.matchmaking-room-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  width: 100%;
  max-width: 900px;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.found-text {
  color: #c4c6c5;
  font-size: 3.5rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(196, 198, 197, 0.3);
}

.teams-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
  position: relative;
}

.team {
  flex: 1;
  background: #29303b;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.my-team {
  border-top: 4px solid #5e6e80;
}

.opponent-team {
  border-top: 4px solid #f18a5f;
}

.team-title {
  text-align: center;
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.my-team-title {
  color: #5e6e80;
}

.opp-team-title {
  color: #f18a5f;
}

.slots {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot {
  background: rgba(196, 198, 197, 0.05);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 500;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.slot:not(.empty) {
  background: rgba(196, 198, 197, 0.1);
}

.slot.me {
  background: rgba(94, 110, 128, 0.2);
  border: 1px solid rgba(94, 110, 128, 0.5);
  box-shadow: inset 0 0 20px rgba(94, 110, 128, 0.1);
}

.slot.me .player-name {
  color: #ffffff;
  font-weight: bold;
}

.slot.empty {
  background: rgba(41, 48, 59, 0.5);
  border: 1px dashed rgba(196, 198, 197, 0.2);
}

.player-name {
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.waiting-text {
  color: rgba(196, 198, 197, 0.5);
  font-style: italic;
}

.vs-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 900;
  font-style: italic;
  color: var(--color-cream, #ffffff);
  background: #29303b;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  border: 4px solid rgba(196, 198, 197, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .teams-container {
    flex-direction: column;
    gap: 3rem;
  }
  
  .vs-badge {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    margin: -1.5rem auto;
  }
}
</style>
