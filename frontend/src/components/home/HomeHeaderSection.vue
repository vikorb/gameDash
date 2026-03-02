<template>
  <HomeTopRow
    :welcome-text="welcomeText"
    :show-play-button="showPlayButton"
    :play-label="t('home.player_play.label')"
    :play-title="t('home.player_play.hover')"
    :play-aria="t('home.player_play.aria')"
  />

  <HomeHero
    v-if="!showPlayButton"
    :title="t('home.hero.title')"
    :subtitle="t('home.hero.subtitle')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeTopRow from '@/components/home/HomeTopRow.vue'

const props = defineProps<{
  isSessionActive: boolean
  displayName?: string
  showPlayButton: boolean
}>()

const { t } = useI18n({ useScope: 'global' })

const welcomeText = computed(() => {
  if (!props.isSessionActive) return undefined
  return t('home.welcome', { name: props.displayName })
})
</script>
