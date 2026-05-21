

<template>
	<div class="card-rank">
		<div class="rank-header">
			<h2>Rang actuel</h2>
		</div>
		<Transition name="rank-fade" mode="out-in">
			<div v-if="loading" key="loading" class="rank-state">
				<span class="rank-skeleton rank-skeleton--title"></span>
				<span class="rank-skeleton rank-skeleton--sub"></span>
				<span class="rank-skeleton rank-skeleton--bar"></span>
			</div>
			<div v-else-if="error" key="error" class="rank-state error">{{ error }}</div>
			<div v-else :key="rankKey" class="rank-state">
				<div class="rank-info">
					<span class="rank" v-if="rankData">{{ rankData.rank }}</span>
					<span v-if="rankData && rankData.division" class="division">{{ rankData.division }}</span>
				</div>
				<div v-if="rankData && rankData.rank !== 'Unranked'">
					<div class="xp-bar">
						<div class="xp-bar-inner" :style="{ width: xpPercent + '%' }"></div>
					</div>
					<div class="xp-label">
						{{ rankData && rankData.xp || 0 }} / {{ divisionXpMaxDisplay }} XP
					</div>
					<div class="rank-insights">
						<div class="insight-box">
							<span class="insight-label">XP restantes</span>
							<strong class="insight-value">{{ xpToNextDisplay }} XP</strong>
						</div>
						<div class="insight-box">
							<span class="insight-label">Progression division</span>
							<strong class="insight-value">{{ xpPercent }}%</strong>
						</div>
						<div class="insight-box">
							<span class="insight-label">{{ nextCapTitle }}</span>
							<strong class="insight-value">{{ nextDivisionLabel }}</strong>
						</div>
					</div>
					<p class="rank-motivation">{{ motivationText }}</p>
				</div>
				<div v-else>
					<em>Unranked</em>
				</div>
			</div>
		</Transition>
	</div>
</template>



<script setup lang="ts">

import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { useRankStore } from '@/stores/rankStore'
import type { GameMode } from '@/types/gameMode'

const props = defineProps<{ userId: number, selectedModeId: number | string, modes?: GameMode[] }>()
const rankStore = useRankStore()
const { rankData, loading, error } = storeToRefs(rankStore)

const rankKey = ref(0)

async function loadRank() {
  if (!props.selectedModeId) return
  rankStore.rankData = null
  rankStore.error = null
  rankStore.loading = true
	await rankStore.fetchRank(props.userId, typeof props.selectedModeId === 'string' ? Number(props.selectedModeId) : props.selectedModeId)
  rankKey.value++
}

onMounted(async () => {
  await loadRank()
})
watch(() => props.userId, loadRank)
watch(() => props.selectedModeId, loadRank)

const divisionXpMax = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 0
	const rd = rankData.value
	if (rd.xpInDivision === null || rd.divisionMaxXp === null) return 0

	const divisionMinXp = rd.xp - rd.xpInDivision
	return Math.max(1, rd.divisionMaxXp - divisionMinXp)
})

const divisionXpMaxDisplay = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 0
	const rd = rankData.value
	return rd.divisionMaxXp ?? 0
})

const xpPercent = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked' || !divisionXpMax.value) {
		return 0
	}
	const rd = rankData.value
	const percent = Math.round(100 * (rd.xpInDivision ?? 0) / (divisionXpMax.value || 1))
	return Math.max(0, Math.min(100, percent))
})

const xpToNextDisplay = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 0
	if (rankData.value.xpToNext !== null) return Math.max(0, rankData.value.xpToNext)
	if (rankData.value.divisionMaxXp !== null) return Math.max(0, rankData.value.divisionMaxXp - rankData.value.xp)
	return 0
})

const nextDivisionLabel = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 'Terminer placements'
	if (rankData.value.nextDivision) return rankData.value.nextDivision
	if (xpToNextDisplay.value <= 0) return 'Division max atteinte'
	return `${xpToNextDisplay.value} XP restantes`
})

const nextCapTitle = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') return 'Prochain cap'
	if (rankData.value.nextDivision) return 'Prochain cap'
	return 'Statut division'
})

const motivationText = computed(() => {
	if (!rankData.value || rankData.value.rank === 'Unranked') {
		return 'Joue tes matchs pour obtenir ton classement.'
	}
	if (xpPercent.value >= 90) return 'Presque promu, encore un match solide.'
	if (xpPercent.value >= 70) return 'Bon rythme, tu approches du prochain palier.'
	if (xpPercent.value >= 40) return 'Progression stable, continue comme ca.'
	return 'Lance une serie pour accelerer ta progression.'
})
</script>

<style scoped>
.card-rank {
	background: linear-gradient(160deg, rgba(18, 29, 43, 0.88), rgba(16, 23, 35, 0.88));
	border: 1px solid rgba(255, 255, 255, 0.11);
	border-radius: 16px;
	padding: 1rem 1.05rem 1.1rem;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	width: 100%;
}
.mode-selector {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rank-header {
	margin-bottom: 0.7rem;
}
.rank-header h2 {
	color: var(--color-cream);
	font-size: 1.18rem;
	margin: 0;
}
.rank-info {
	font-size: 1.45rem;
	margin-bottom: 0.5rem;
	color: var(--color-cream);
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
}
.rank {
	font-weight: bold;
	font-size: 1.45rem;
	color: var(--color-cream);
}
.division {
	color: var(--color-apricot);
	font-size: 1.1rem;
	font-weight: 500;
}
.xp-bar {
	width: 100%;
	height: 14px;
	background: #1a2230;
	border-radius: 8px;
	margin: 0.7rem 0 0.3rem 0;
	overflow: hidden;
	box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.xp-bar-inner {
	height: 100%;
	background: var(--color-apricot) !important;
	border-radius: 8px 0 0 8px;
	transition: width 0.3s;
}
.xp-label {
	font-size: 0.95rem;
	color: rgba(255, 255, 255, 0.82);
	margin-bottom: 0.7rem;
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
	color: var(--color-danger);
}

.rank-insights {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.45rem;
	margin-top: 0.2rem;
}

.insight-box {
	padding: 0.55rem 0.6rem;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.insight-label {
	font-size: 0.72rem;
	line-height: 1.2;
	color: rgba(255, 255, 255, 0.62);
}

.insight-value {
	font-size: 0.92rem;
	line-height: 1.2;
	color: var(--color-cream);
}

.rank-motivation {
	margin: 0.6rem 0 0;
	font-size: 0.82rem;
	color: color-mix(in srgb, var(--color-cream) 78%, var(--color-background-secondary));
}

.rank-fade-enter-active,
.rank-fade-leave-active {
	transition: opacity 0.25s ease, transform 0.25s ease;
}
.rank-fade-enter-from {
	opacity: 0;
	transform: translateY(8px);
}
.rank-fade-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}

.rank-state {
	min-height: 220px;
}

.rank-skeleton {
	display: block;
	border-radius: 6px;
	background: linear-gradient(90deg, #1e2736 25%, #263044 50%, #1e2736 75%);
	background-size: 200% 100%;
	animation: skeleton-shimmer 1.4s infinite;
}
.rank-skeleton--title {
	width: 55%;
	height: 28px;
	margin-bottom: 10px;
}
.rank-skeleton--sub {
	width: 30%;
	height: 18px;
	margin-bottom: 14px;
}
.rank-skeleton--bar {
	width: 100%;
	height: 16px;
	border-radius: 8px;
}

@media (max-width: 760px) {
	.rank-insights {
		grid-template-columns: 1fr;
	}
}

@keyframes skeleton-shimmer {
	0%   { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}
</style>
