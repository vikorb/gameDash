<template>
  <div class="top-row">
    <p v-if="welcomeText" class="top-welcome">{{ welcomeText }}</p>

    <PlayerPlayButton
      v-if="showPlayButton"
      to="/home/progress"
      :label="playLabel"
      :title="playTitle"
      :aria-label="playAria"
    />
  </div>
</template>

<script setup lang="ts">
import PlayerPlayButton from '@/components/home/PlayerPlayButton.vue'

defineProps<{
  welcomeText?: string
  showPlayButton: boolean
  playLabel: string
  playTitle: string
  playAria: string
}>()
</script>

<style scoped>
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.top-welcome {
  color: var(--color-cream);
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  text-align: left;
}

@media (max-width: 900px) {
  .top-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
