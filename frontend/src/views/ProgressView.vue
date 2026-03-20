<template>
  <div class="progress-view" v-if="user">
    <h1>Progression de {{ user.username }}</h1>
    <div v-if="user">
      <CardMMR
        v-if="mmrStore.mmrData"
        :mmr="mmrStore.mmrData.mmr"
        :rank="mmrStore.mmrData.rank"
        :history="(() => {
          const hist = (mmrStore.mmrData.history ?? []).map(h => ({ ...h, date: formatDate(h.date), isCurrent: false }))
          const current = {
            date: formatDate(new Date().toISOString()),
            mmr: mmrStore.mmrData.mmr,
            isCurrent: true
          }
         
          if (!hist.length || hist[hist.length - 1]?.mmr !== current.mmr) {
            hist.push(current)
          } else if (hist.length > 0) {
            hist[hist.length - 1]!.isCurrent = true
          }
          return hist
        })()"
      />
      <div class="progress-section">
        <h3>Autres progressions</h3>
        <p>À venir : statistiques, succès, etc.</p>
      </div>
    </div>
    <div v-else>
      <p>Veuillez vous connecter pour voir votre progression.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { AuthUser } from '@/services/pocketbase'
import { authService } from '@/services/pocketbase'
import { useMMRStore } from '@/stores/mmrStore'
import { formatDate } from '@/utils/date'
import CardMMR from '@/views/progress/CardMMR.vue'

const user = ref<AuthUser | null>(null)
const selectedModeId = ref(1)
const mmrStore = useMMRStore()

onMounted(async () => {
  const pbUser = authService.getUser()
  console.log('onMounted called, pbUser:', pbUser)
  if (!pbUser) return
  user.value = pbUser
  await mmrStore.fetchMMR(pbUser.id, selectedModeId.value)
})
</script>

<style scoped>
.progress-view {
  padding: 20px;
}
.progress-section {
  margin-top: 32px;
}
</style>
