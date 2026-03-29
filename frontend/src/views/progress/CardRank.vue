

<template>
	<div class="card-rank">
		<div class="rank-header">
			<h2>Rang actuel</h2>
		</div>
		<div v-if="gameModes.length > 0" class="mode-selector">
			<label for="mode-select">Mode :</label>
			<select id="mode-select" v-model="selectedModeId" @change="loadRank">
				<option v-for="mode in gameModes" :key="mode.id" :value="mode.id">
					{{ mode.name }}
				</option>
			</select>
		</div>
		<div v-if="loading">Chargement...</div>
		<div v-else-if="error" class="error">{{ error }}</div>
		<div v-else>
			<div class="rank-info">
				<span class="rank" v-if="rankData">{{ rankData.rank }}</span>
				<span v-if="rankData && rankData.division" class="division">{{ rankData.division }}</span>
			</div>
			<div v-if="rankData && rankData.rank !== 'Unranked'">
				<div class="xp-bar">
					<div class="xp-bar-inner" :style="{ width: xpPercent + '%' }"></div>
				</div>
				<div class="xp-label">
					{{ rankData && rankData.xpInDivision || 0 }} XP / {{ divisionXpMax }} XP pour la division
				</div>
				<div v-if="rankData && rankData.nextDivision" class="next-division">
					Prochaine division : <span class="next-division-name">{{ rankData.nextDivision }}</span>
					<span class="next-division-xp">({{ rankData.nextDivisionMinXp }} XP)</span>
				</div>
			</div>
			<div v-else>
				<em>Unranked</em>
			</div>
		</div>
	</div>
</template>



<script setup lang="ts">

import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { fetchGameModes } from '@/services/gameMode'
import { useRankStore } from '@/stores/rankStore'
import type { GameMode } from '@/types/gameMode'

const props = defineProps<{ userId: number }>()
const rankStore = useRankStore()
const { rankData, loading, error } = storeToRefs(rankStore)

const gameModes = ref<GameMode[]>([])
const selectedModeId = ref<number|null>(null)

async function loadGameModes() {
	       const modes = await fetchGameModes()
	       gameModes.value = modes
	       if (modes.length > 0 && selectedModeId.value === null) {
		       selectedModeId.value = modes[0]?.id ?? null
	       }
}

async function loadRank() {
	if (!selectedModeId.value) return
	rankStore.rankData = null
	rankStore.error = null
	rankStore.loading = true
	await rankStore.fetchRank(props.userId, selectedModeId.value)
}

onMounted(async () => {
	await loadGameModes()
	await loadRank()
})
watch(() => props.userId, loadRank)
watch(selectedModeId, loadRank)

const divisionXpMax = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 0
	const rd = rankData.value
	return ((rd.nextDivisionMinXp ?? rd.xp) as number) - ((rd.xp as number) - (rd.xpInDivision ?? 0))
})

const xpPercent = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked' || !divisionXpMax.value) return 0
	const rd = rankData.value
	return Math.round(100 * (rd.xpInDivision ?? 0) / divisionXpMax.value)
})
</script>

<style scoped>
.card-rank {
	background: #232c3a;
	border-radius: 18px;
	padding: 24px;
	margin-bottom: 32px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	width: 100%;
}
.mode-selector {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rank-header {
	margin-bottom: 18px;
}
.rank-header h2 {
	color: var(--color-cream);
	font-size: 1.4rem;
	margin: 0 0 0.5rem 0;
}
.rank-info {
	font-size: 1.5rem;
	margin-bottom: 0.5rem;
	color: var(--color-cream);
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
}
.rank {
	font-weight: bold;
	font-size: 1.5rem;
	color: #fff;
}
.division {
	color: #f28b5b;
	font-size: 1.1rem;
	font-weight: 500;
}
.xp-bar {
	width: 100%;
	height: 16px;
	background: #1a2230;
	border-radius: 8px;
	margin: 0.7rem 0 0.3rem 0;
	overflow: hidden;
	box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.xp-bar-inner {
	height: 100%;
	background: linear-gradient(90deg, #4caf50 60%, #8bc34a 100%);
	border-radius: 8px 0 0 8px;
	transition: width 0.3s;
}
.xp-label {
	font-size: 1.05rem;
	color: #e0e0e0;
	margin-bottom: 0.2rem;
}
.next-division {
	font-size: 1rem;
	color: #b0b0b0;
	margin-top: 0.2rem;
}
.next-division-name {
	color: #f28b5b;
	font-weight: 500;
}
.next-division-xp {
	color: #fff;
	margin-left: 0.2rem;
}
.error {
	color: #c00;
}
</style>
