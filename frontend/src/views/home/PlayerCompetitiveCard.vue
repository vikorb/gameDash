<template>
  <BaseCard class="player-card competitive-card">

    <div class="competitive-header">
    <h4 class="competitive-title">Profil 
        </h4>
        <ModeSelector v-if="modes && modes.length"
          :modes="modes"
          :model-value="selectedModeId"
          @update:modelValue="onModeChange"/>
    </div>
    <div class="competitive-line">
      <span class="label">MMR actuel</span>
      <strong class="value">{{ displayedMMR }}</strong>
    </div>

    <WinrateCard v-if="postgresUserId" :user-id="postgresUserId" :mode-id="Number(selectedModeId)" />

    <RouterLink to="/progress" class="competitive-link">{{ t('home.player_dashboard.competitive.link') }}</RouterLink>
  </BaseCard>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ModeSelector from '@/components/game-mode/ModeSelector.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useMMRStore } from '@/stores/mmrStore'
import { useUserStore } from '@/stores/userStore'
import type { GameMode } from '@/types/gameMode'
import WinrateCard from '@/views/home/WinrateCard.vue'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  modes?: GameMode[]
  selectedModeId?: number | string
}>()
const emit = defineEmits<{ 'update:selectedModeId': [value: number | string] }>()

const modes = computed(() => props.modes ?? [])
const selectedModeId = computed(() => props.selectedModeId ?? 1)

const userStore = useUserStore()
const mmrStore = useMMRStore()
const { profile } = storeToRefs(userStore)
const { mmrData } = storeToRefs(mmrStore)
const postgresUserId = computed(() => profile.value?.id)

const displayedMMR = computed(() => {
  return typeof mmrData.value?.mmr === 'number' ? mmrData.value.mmr : '-'
})

async function loadMMR() {
  if (profile.value?.pocketbase_user_id && selectedModeId.value) {
    await mmrStore.fetchMMR(profile.value.pocketbase_user_id, Number(selectedModeId.value))
  }
}

function onModeChange(val: number | string) {
  emit('update:selectedModeId', val)
}

onMounted(async () => {
  await loadMMR()
})

watch([selectedModeId, () => profile.value?.pocketbase_user_id], async () => {
  await loadMMR()
})
</script>

<style scoped>
.player-card {
  background: color-mix(in srgb, var(--color-bg) 78%, var(--color-background-secondary));
  border: 1px solid color-mix(in srgb, var(--color-background-secondary) 60%, var(--color-cream));
  color: var(--color-cream);
}

.competitive-title {
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

.competitive-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.55rem 0;
}

.label {
  color: color-mix(in srgb, var(--color-cream) 78%, var(--color-background-secondary));
  font-size: 0.95rem;
}

.value {
  color: var(--color-cream);
  font-size: 1.55rem;
}

.competitive-link {
  margin: 0.9rem 0 0;
  font-size: 0.95rem;
  color: color-mix(in srgb, var(--color-cream) 88%, var(--color-background-secondary));
}
</style>
