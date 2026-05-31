<template>
  <div class="competitive-line">
    <span class="label">{{ t('home.player_dashboard.competitive.winrate') }}</span>
    <strong class="value winrate-value">
      <template v-if="loading">…</template>
      <template v-else-if="winrateStore.winrate !== null">{{ winrateStore.winrate }}%</template>
      <template v-else>–</template>
    </strong>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useWinrateStore } from '@/stores/winrateStore'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  userId: number
  modeId?: number
}>()

const winrateStore = useWinrateStore()
const { loading } = storeToRefs(winrateStore)

async function load() {
  await winrateStore.fetch(props.userId, props.modeId)
}

onMounted(load)

watch(() => [props.userId, props.modeId], load)
</script>

<style scoped>
.winrate-value {
  font-size: 1.5rem;
}
</style>
