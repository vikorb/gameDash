<template>
  <section class="ranks-page">
    <div class="ranks-shell">
      <header class="ranks-hero">
        <div>
          <span class="ranks-badge">{{ t('backoffice.ranks.badge') }}</span>
          <h1 class="ranks-title">{{ t('backoffice.ranks.title') }}</h1>
          <p class="ranks-subtitle">{{ t('backoffice.ranks.subtitle') }}</p>
        </div>

        <div class="ranks-hero__actions">
          <button
            type="button"
            class="icon-btn icon-btn--create icon-btn--hero"
            :title="t('backoffice.ranks.actions.create')"
            :aria-label="t('backoffice.ranks.actions.create')"
            @click="openCreateDialog"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPlus" /></svg>
          </button>
          <button
            type="button"
            class="icon-btn icon-btn--back icon-btn--hero"
            :title="t('backoffice.ranks.actions.backToDashboard')"
            :aria-label="t('backoffice.ranks.actions.backToDashboard')"
            @click="goToDashboard"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          </button>
        </div>
      </header>

      <section class="ranks-summary">
        <div class="summary-chip">
          <span>{{ t('backoffice.ranks.summary.totalRanks') }}</span>
          <strong>{{ localRanks.length }}</strong>
        </div>
        <div class="summary-chip">
          <span>{{ t('backoffice.ranks.summary.totalDivisions') }}</span>
          <strong>{{ totalDivisionsLocal }}</strong>
        </div>
      </section>

      <section class="ranks-grid">
        <ul class="rank-list">
          <li
            v-for="rank in localRanks"
            :key="rank.id"
            :class="['rank-item', `rank-item--${getRankTone(rank.name)}`]"
          >
            <div class="rank-item__header">
              <button
                type="button"
                class="rank-toggle"
                :aria-expanded="isExpanded(rank.id)"
                @click="toggleRank(rank.id)"
              >
                <svg :class="['rank-toggle__icon', { 'rank-toggle__icon--open': isExpanded(rank.id) }]" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="mdiChevronDown" />
                </svg>
                <span class="rank-toggle__title">{{ rank.name }}</span>
                <span class="rank-toggle__meta">
                  XP {{ rank.minXp.toLocaleString(locale) }} - {{ rank.maxXp.toLocaleString(locale) }}
                </span>
              </button>

              <div class="rank-item__actions">
                <span class="rank-card__count">
                  {{ t('backoffice.ranks.divisionCount', { count: rank.divisions.length }) }}
                </span>
                <button
                  type="button"
                  class="icon-btn icon-btn--create"
                  :title="t('backoffice.ranks.actions.createDivision')"
                  :aria-label="t('backoffice.ranks.actions.createDivision')"
                  @click.stop="openCreateDivisionDialog(rank.id)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPlus" /></svg>
                </button>
                <button
                  type="button"
                  class="icon-btn icon-btn--edit"
                  :title="t('backoffice.ranks.actions.edit')"
                  :aria-label="t('backoffice.ranks.actions.edit')"
                  @click.stop="openEditDialog(rank)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPencil" /></svg>
                </button>
                <button
                  type="button"
                  class="icon-btn icon-btn--delete"
                  :title="t('backoffice.ranks.actions.delete')"
                  :aria-label="t('backoffice.ranks.actions.delete')"
                  @click.stop="deleteRank(rank.id)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiTrashCanOutline" /></svg>
                </button>
              </div>
            </div>

            <ul v-if="isExpanded(rank.id)" class="division-list">
              <li v-for="division in rank.divisions" :key="division.id" class="division-row">
                <div class="division-row__left">
                  <span class="division-row__order">#{{ division.order }}</span>
                  <span class="division-row__name">{{ division.name }}</span>
                </div>
                <div class="division-row__right">
                  <span class="division-row__xp">
                    {{ division.minXp.toLocaleString(locale) }} - {{ division.maxXp.toLocaleString(locale) }} XP
                  </span>
                  <div class="division-row__actions">
                    <button
                      type="button"
                      class="icon-btn icon-btn--edit"
                      :title="t('backoffice.ranks.actions.editDivision')"
                      :aria-label="t('backoffice.ranks.actions.editDivision')"
                      @click="openEditDivisionDialog(rank.id, division)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPencil" /></svg>
                    </button>
                    <button
                      type="button"
                      class="icon-btn icon-btn--delete"
                      :title="t('backoffice.ranks.actions.deleteDivision')"
                      :aria-label="t('backoffice.ranks.actions.deleteDivision')"
                      @click="deleteDivision(rank.id, division.id)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiTrashCanOutline" /></svg>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <div v-if="dialogOpen" class="rank-dialog-backdrop" @click.self="closeDialog">
        <section class="rank-dialog" role="dialog" aria-modal="true">
          <h2 class="rank-dialog__title">
            {{ dialogTitle }}
          </h2>

          <div v-if="dialogEntity === 'rank'" class="rank-dialog__fields">
            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.name') }}</span>
              <input v-model="rankForm.name" type="text" maxlength="64" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.minXp') }}</span>
              <input v-model.number="rankForm.minXp" type="number" min="0" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.maxXp') }}</span>
              <input v-model.number="rankForm.maxXp" type="number" min="0" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisions') }}</span>
              <input v-model.number="rankForm.divisionCount" type="number" min="1" max="10" />
            </label>
          </div>

          <div v-else class="rank-dialog__fields">
            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisionName') }}</span>
              <input v-model="divisionForm.name" type="text" maxlength="64" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisionOrder') }}</span>
              <input v-model.number="divisionForm.order" type="number" min="1" max="10" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisionMinXp') }}</span>
              <input v-model.number="divisionForm.minXp" type="number" min="0" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisionMaxXp') }}</span>
              <input v-model.number="divisionForm.maxXp" type="number" min="0" />
            </label>
          </div>

          <p v-if="formError" class="rank-dialog__error">{{ formError }}</p>

          <div class="rank-dialog__actions">
            <button type="button" class="rank-dialog-btn rank-dialog-btn--ghost" @click="closeDialog">
              {{ t('backoffice.ranks.actions.cancel') }}
            </button>
            <button type="button" class="rank-dialog-btn rank-dialog-btn--primary" @click="saveDialog">
              {{ dialogCta }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { mdiArrowLeft, mdiChevronDown, mdiPencil, mdiPlus, mdiTrashCanOutline } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import {
  type BackofficeRankDivision,
  type BackofficeRankWithDivisions,
  useBackofficeRanksStore,
} from '@/stores/backoffice'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const ranksStore = useBackofficeRanksStore()
const { t, locale } = useI18n({ useScope: 'global' })

const { profile } = storeToRefs(userStore)
const { ranks } = storeToRefs(ranksStore)

const localRanks = ref<BackofficeRankWithDivisions[]>([])
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogEntity = ref<'rank' | 'division'>('rank')
const editingRankId = ref<number | null>(null)
const divisionRankId = ref<number | null>(null)
const editingDivisionId = ref<number | null>(null)
const expandedRankIds = ref<number[]>([])
const formError = ref('')
const rankForm = ref({
  name: '',
  minXp: 0,
  maxXp: 1000,
  divisionCount: 3,
})
const divisionForm = ref({
  name: '',
  order: 1,
  minXp: 0,
  maxXp: 1000,
})

const normalizedTones = computed(() => ({
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
  master: 'master',
  grandmaster: 'grandmaster',
}))

function getRankTone(rankName: string) {
  const key = rankName.trim().toLowerCase()
  return normalizedTones.value[key as keyof typeof normalizedTones.value] ?? 'master'
}

function isExpanded(rankId: number) {
  return expandedRankIds.value.includes(rankId)
}

function toggleRank(rankId: number) {
  if (expandedRankIds.value.includes(rankId)) {
    expandedRankIds.value = expandedRankIds.value.filter((id) => id !== rankId)
    return
  }

  expandedRankIds.value = [...expandedRankIds.value, rankId]
}

const totalDivisionsLocal = computed(() =>
  localRanks.value.reduce((sum, rank) => sum + rank.divisions.length, 0),
)

const dialogTitle = computed(() => {
  if (dialogEntity.value === 'division') {
    return dialogMode.value === 'create'
      ? t('backoffice.ranks.actions.createDivision')
      : t('backoffice.ranks.actions.editDivision')
  }

  return dialogMode.value === 'create'
    ? t('backoffice.ranks.actions.create')
    : t('backoffice.ranks.actions.edit')
})

const dialogCta = computed(() => {
  if (dialogEntity.value === 'division') {
    return dialogMode.value === 'create'
      ? t('backoffice.ranks.actions.saveCreateDivision')
      : t('backoffice.ranks.actions.saveEditDivision')
  }

  return dialogMode.value === 'create'
    ? t('backoffice.ranks.actions.saveCreate')
    : t('backoffice.ranks.actions.saveEdit')
})

watch(
  ranks,
  (value) => {
    localRanks.value = value.map((rank) => ({
      ...rank,
      divisions: rank.divisions.map((division) => ({ ...division })),
    }))

    expandedRankIds.value = []
  },
  { immediate: true },
)

function resetRankForm() {
  rankForm.value = {
    name: '',
    minXp: 0,
    maxXp: 1000,
    divisionCount: 3,
  }
}

function resetDivisionForm() {
  divisionForm.value = {
    name: '',
    order: 1,
    minXp: 0,
    maxXp: 1000,
  }
}

function resetForms() {
  resetRankForm()
  resetDivisionForm()
  formError.value = ''
}

function openCreateDialog() {
  dialogEntity.value = 'rank'
  dialogMode.value = 'create'
  editingRankId.value = null
  resetForms()
  dialogOpen.value = true
}

function openEditDialog(rank: BackofficeRankWithDivisions) {
  dialogEntity.value = 'rank'
  dialogMode.value = 'edit'
  editingRankId.value = rank.id
  rankForm.value = {
    name: rank.name,
    minXp: rank.minXp,
    maxXp: rank.maxXp,
    divisionCount: Math.max(1, rank.divisions.length),
  }
  formError.value = ''
  dialogOpen.value = true
}

function openCreateDivisionDialog(rankId: number) {
  const rank = localRanks.value.find((item) => item.id === rankId)
  if (!rank) return

  dialogEntity.value = 'division'
  dialogMode.value = 'create'
  divisionRankId.value = rankId
  editingDivisionId.value = null
  divisionForm.value = {
    name: `Division ${rank.divisions.length + 1}`,
    order: rank.divisions.length + 1,
    minXp: rank.minXp,
    maxXp: rank.maxXp,
  }
  formError.value = ''
  dialogOpen.value = true
}

function openEditDivisionDialog(rankId: number, division: BackofficeRankDivision) {
  dialogEntity.value = 'division'
  dialogMode.value = 'edit'
  divisionRankId.value = rankId
  editingDivisionId.value = division.id
  divisionForm.value = {
    name: division.name,
    order: division.order,
    minXp: division.minXp,
    maxXp: division.maxXp,
  }
  formError.value = ''
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  divisionRankId.value = null
  editingDivisionId.value = null
  editingRankId.value = null
}

function buildDivisions(minXp: number, maxXp: number, divisionCount: number, startId: number) {
  const safeCount = Math.max(1, divisionCount)
  const step = Math.max(1, Math.floor((maxXp - minXp + 1) / safeCount))

  return Array.from({ length: safeCount }, (_, index) => {
    const order = safeCount - index
    const currentMin = minXp + index * step
    const currentMax = index === safeCount - 1 ? maxXp : currentMin + step - 1

    return {
      id: startId + index,
      name: `Division ${order}`,
      order,
      minXp: currentMin,
      maxXp: currentMax,
    }
  })
}

function saveRank() {
  const trimmedName = rankForm.value.name.trim()
  if (!trimmedName) {
    formError.value = t('backoffice.ranks.form.errors.nameRequired')
    return
  }

  if (rankForm.value.maxXp < rankForm.value.minXp) {
    formError.value = t('backoffice.ranks.form.errors.invalidRange')
    return
  }

  const maxRankId = localRanks.value.reduce((maxId, rank) => Math.max(maxId, rank.id), 0)
  const maxDivisionId = localRanks.value.reduce(
    (maxId, rank) => Math.max(maxId, ...rank.divisions.map((division) => division.id), 0),
    0,
  )

  if (dialogMode.value === 'create') {
    const newRankId = maxRankId + 1
    const newDivisions = buildDivisions(
      rankForm.value.minXp,
      rankForm.value.maxXp,
      rankForm.value.divisionCount,
      maxDivisionId + 1,
    )

    localRanks.value.push({
      id: newRankId,
      name: trimmedName,
      minXp: rankForm.value.minXp,
      maxXp: rankForm.value.maxXp,
      divisionCount: rankForm.value.divisionCount,
      divisions: newDivisions,
    })
  } else {
    const targetId = editingRankId.value
    if (targetId === null) {
      return
    }

    localRanks.value = localRanks.value.map((rank) => {
      if (rank.id !== targetId) return rank

      const divisions = buildDivisions(
        rankForm.value.minXp,
        rankForm.value.maxXp,
        rankForm.value.divisionCount,
        maxDivisionId + 1,
      )

      return {
        ...rank,
        name: trimmedName,
        minXp: rankForm.value.minXp,
        maxXp: rankForm.value.maxXp,
        divisionCount: rankForm.value.divisionCount,
        divisions,
      }
    })
  }

  closeDialog()
}

function saveDivision() {
  const rankId = divisionRankId.value
  if (rankId === null) return

  const trimmedName = divisionForm.value.name.trim()
  if (!trimmedName) {
    formError.value = t('backoffice.ranks.form.errors.divisionNameRequired')
    return
  }

  if (divisionForm.value.maxXp < divisionForm.value.minXp) {
    formError.value = t('backoffice.ranks.form.errors.invalidRange')
    return
  }

  if (divisionForm.value.order < 1) {
    formError.value = t('backoffice.ranks.form.errors.invalidDivisionOrder')
    return
  }

  const maxDivisionId = localRanks.value.reduce(
    (maxId, rank) => Math.max(maxId, ...rank.divisions.map((division) => division.id), 0),
    0,
  )

  localRanks.value = localRanks.value.map((rank) => {
    if (rank.id !== rankId) return rank

    if (dialogMode.value === 'create') {
      const nextDivision: BackofficeRankDivision = {
        id: maxDivisionId + 1,
        name: trimmedName,
        order: Math.max(1, divisionForm.value.order),
        minXp: divisionForm.value.minXp,
        maxXp: divisionForm.value.maxXp,
      }

      const divisions = [...rank.divisions, nextDivision]
        .sort((a, b) => b.order - a.order)
        .map((division, index) => ({ ...division, order: divisionsOrder(rank.divisions.length + 1, index) }))

      return {
        ...rank,
        divisionCount: divisions.length,
        divisions,
      }
    }

    const targetDivisionId = editingDivisionId.value
    const divisions = rank.divisions.map((division) => {
      if (division.id !== targetDivisionId) return division
      return {
        ...division,
        name: trimmedName,
        order: Math.max(1, divisionForm.value.order),
        minXp: divisionForm.value.minXp,
        maxXp: divisionForm.value.maxXp,
      }
    })

    const sortedDivisions = [...divisions]
      .sort((a, b) => b.order - a.order)
      .map((division, index) => ({ ...division, order: divisionsOrder(divisions.length, index) }))

    return {
      ...rank,
      divisionCount: sortedDivisions.length,
      divisions: sortedDivisions,
    }
  })

  closeDialog()
}

function divisionsOrder(total: number, index: number) {
  return Math.max(1, total - index)
}

function deleteRank(rankId: number) {
  localRanks.value = localRanks.value.filter((rank) => rank.id !== rankId)
}

function deleteDivision(rankId: number, divisionId: number) {
  localRanks.value = localRanks.value.map((rank) => {
    if (rank.id !== rankId) return rank

    const remaining = rank.divisions
      .filter((division) => division.id !== divisionId)
      .sort((a, b) => b.order - a.order)
      .map((division, index) => ({ ...division, order: divisionsOrder(rank.divisions.length - 1, index) }))

    return {
      ...rank,
      divisionCount: remaining.length,
      divisions: remaining,
    }
  })
}

function saveDialog() {
  if (dialogEntity.value === 'division') {
    saveDivision()
    return
  }

  saveRank()
}

function goToDashboard() {
  router.push('/backoffice/dashboard')
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
    return
  }

  void ranksStore.fetchRanks()
})
</script>

<style scoped>
.ranks-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.ranks-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.ranks-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(145deg, rgba(54, 57, 63, 0.94), rgba(30, 31, 34, 0.96)),
    radial-gradient(circle at 84% 12%, rgba(88, 101, 242, 0.24), transparent 36%);
  padding: 1.5rem;
  box-shadow: 0 20px 44px -26px rgba(0, 0, 0, 0.86);
}

.ranks-hero__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ranks-badge {
  display: inline-flex;
  padding: 0.34rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(88, 101, 242, 0.4);
  background: rgba(88, 101, 242, 0.16);
  color: #cfd5ff;
  font-size: 0.73rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ranks-title {
  margin: 0.8rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.75rem, 2.4vw, 2.4rem);
  letter-spacing: -0.03em;
}

.ranks-subtitle {
  margin: 0.45rem 0 0;
  color: rgba(252, 239, 225, 0.66);
  max-width: 700px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.45);
  color: var(--color-cream);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.icon-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.icon-btn--hero {
  width: 42px;
  height: 42px;
}

.icon-btn--back {
  border-color: rgba(88, 101, 242, 0.35);
  background: rgba(88, 101, 242, 0.22);
  color: #e7e9ff;
}

.ranks-summary {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.summary-chip {
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(30, 31, 34, 0.85);
  padding: 0.46rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.8rem;
}

.summary-chip strong {
  color: var(--color-cream);
  font-size: 0.9rem;
}

.ranks-grid {
  margin-top: 1rem;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rank-item {
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(170deg, rgba(54, 57, 63, 0.95), rgba(30, 31, 34, 0.98));
  box-shadow: 0 12px 24px -18px rgba(0, 0, 0, 0.8);
  padding: 0.7rem;
}

.rank-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.rank-item__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.rank-toggle {
  border: none;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  padding: 0.2rem 0.1rem;
  cursor: pointer;
}

.rank-toggle__icon {
  width: 18px;
  height: 18px;
  color: rgba(252, 239, 225, 0.66);
  transition: transform 0.18s ease;
  flex-shrink: 0;
}

.rank-toggle__icon path {
  fill: currentColor;
}

.rank-toggle__icon--open {
  transform: rotate(180deg);
}

.rank-toggle__title {
  font-size: 1rem;
  font-weight: 900;
  color: var(--color-cream);
}

.rank-toggle__meta {
  font-size: 0.8rem;
  color: rgba(252, 239, 225, 0.6);
}

.rank-card__title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 900;
}

.rank-card__xp {
  margin: 0.22rem 0 0;
  font-size: 0.82rem;
  color: rgba(252, 239, 225, 0.58);
}

.rank-card__count {
  font-size: 0.76rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.3rem 0.56rem;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.72);
}

.icon-btn--edit {
  border-color: rgba(88, 101, 242, 0.42);
  background: rgba(88, 101, 242, 0.2);
}

.icon-btn--create {
  border-color: rgba(67, 181, 129, 0.44);
  background: rgba(67, 181, 129, 0.2);
  color: #c7ffe3;
}

.icon-btn--delete {
  border-color: rgba(237, 66, 69, 0.44);
  background: rgba(237, 66, 69, 0.2);
}

.division-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.division-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.34);
  padding: 0.52rem 0.62rem;
}

.division-row__left {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.division-row__order {
  font-size: 0.72rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.56);
}

.division-row__name {
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--color-cream);
}

.division-row__xp {
  font-size: 0.76rem;
  color: rgba(252, 239, 225, 0.64);
  font-weight: 700;
  text-align: right;
}

.division-row__right {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.division-row__actions {
  display: inline-flex;
  gap: 0.35rem;
}

.rank-item--bronze {
  border-color: rgba(176, 135, 88, 0.4);
}

.rank-item--silver {
  border-color: rgba(216, 222, 234, 0.36);
}

.rank-item--gold {
  border-color: rgba(241, 194, 90, 0.42);
}

.rank-item--platinum {
  border-color: rgba(96, 214, 196, 0.4);
}

.rank-item--diamond {
  border-color: rgba(116, 169, 255, 0.4);
}

.rank-item--master {
  border-color: rgba(255, 106, 168, 0.4);
}

.rank-item--grandmaster {
  border-color: rgba(255, 79, 79, 0.44);
}

.rank-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  display: grid;
  place-items: center;
  z-index: 40;
  padding: 1rem;
}

.rank-dialog {
  width: min(520px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: linear-gradient(160deg, rgba(54, 57, 63, 0.98), rgba(30, 31, 34, 1));
  box-shadow: 0 24px 52px -28px rgba(0, 0, 0, 0.94);
  padding: 1rem;
}

.rank-dialog__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
}

.rank-dialog__fields {
  margin-top: 0.85rem;
  display: grid;
  gap: 0.7rem;
}

.field-row {
  display: grid;
  gap: 0.3rem;
}

.field-row span {
  font-size: 0.76rem;
  font-weight: 700;
  color: rgba(252, 239, 225, 0.72);
}

.field-row input {
  width: 100%;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.5);
  color: var(--color-cream);
  padding: 0.52rem 0.62rem;
}

.rank-dialog__error {
  margin: 0.65rem 0 0;
  color: #ffb6b7;
  font-size: 0.78rem;
  font-weight: 800;
}

.rank-dialog__actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.rank-dialog-btn {
  min-height: 36px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(252, 239, 225, 0.16);
  cursor: pointer;
}

.rank-dialog-btn--ghost {
  background: rgba(18, 24, 38, 0.46);
  color: rgba(252, 239, 225, 0.86);
}

.rank-dialog-btn--primary {
  border-color: rgba(67, 181, 129, 0.44);
  background: rgba(67, 181, 129, 0.25);
  color: #d5ffea;
}

@media (max-width: 768px) {
  .ranks-page {
    padding: 1rem;
  }

  .ranks-hero {
    flex-direction: column;
  }

  .ranks-hero__actions {
    width: 100%;
  }

  .rank-item__actions {
    justify-content: flex-start;
  }

  .rank-item__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .rank-item__actions {
    width: 100%;
  }

  .division-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .division-row__right {
    justify-content: flex-start;
  }

  .division-row__xp {
    text-align: left;
  }
}
</style>
