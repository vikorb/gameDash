<template>
  <RouterLink :to="to" class="player-play-button" :title="title" :aria-label="ariaLabel ?? label">
    <img
      :src="shieldBackgroundImg"
      alt=""
      class="player-play-button__shield"
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
    <img
      :src="wordmarkImg"
      alt=""
      class="player-play-button__wordmark"
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import wordmarkImg from '@/assets/img/play_btn_txt.png'
import shieldBackgroundImg from '@/assets/img/play_btn_shield_background.png'

withDefaults(
  defineProps<{
    to: string
    label: string
    title?: string
    ariaLabel?: string
  }>(),
  {
    title: undefined,
    ariaLabel: undefined,
  },
)
</script>

<style scoped>
.player-play-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 430px);
  min-height: 122px;
  border-radius: 24px;
  background: var(--color-primary);
  color: var(--color-cream);
  text-decoration: none;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.player-play-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.player-play-button__shield {
  position: absolute;
  inset: 10% 7% 8% auto;
  width: 50%;
  opacity: 0.35;
  object-fit: contain;
}

.player-play-button__wordmark {
  position: absolute;
  left: 5%;
  top: 50%;
  width: 84%;
  transform: translateY(-50%);
  z-index: 1;
  object-fit: contain;
}

@media (max-width: 900px) {
  .player-play-button {
    min-height: 102px;
    border-radius: 20px;
  }

  .player-play-button__wordmark {
    width: 88%;
  }
}
</style>
