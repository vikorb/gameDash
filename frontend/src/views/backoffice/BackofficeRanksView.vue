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
          <button type="button" class="ranks-create-btn" @click="openCreateDialog">
            {{ t('backoffice.ranks.actions.create') }}
          </button>
          <button type="button" class="ranks-back-btn" @click="goToDashboard">
            {{ t('backoffice.ranks.actions.backToDashboard') }}
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
        <article
          v-for="rank in localRanks"
          :key="rank.id"
          :class="['rank-card', `rank-card--${getRankTone(rank.name)}`]"
        >
          <header class="rank-card__header">
            <div>
              <h2 class="rank-card__title">{{ rank.name }}</h2>
              <p class="rank-card__xp">
                XP {{ rank.minXp.toLocaleString(locale) }} - {{ rank.maxXp.toLocaleString(locale) }}
              </p>
            </div>

            <div class="rank-card__actions">
              <span class="rank-card__count">
                {{ t('backoffice.ranks.divisionCount', { count: rank.divisions.length }) }}
              </span>
              <button type="button" class="rank-action-btn rank-action-btn--edit" @click="openEditDialog(rank)">
                {{ t('backoffice.ranks.actions.edit') }}
              </button>
              <button type="button" class="rank-action-btn rank-action-btn--delete" @click="deleteRank(rank.id)">
                {{ t('backoffice.ranks.actions.delete') }}
              </button>
            </div>
          </header>

          <ul class="division-list">
            <li v-for="division in rank.divisions" :key="division.id" class="division-row">
              <div class="division-row__left">
                <span class="division-row__order">#{{ division.order }}</span>
                <span class="division-row__name">{{ division.name }}</span>
              </div>
              <span class="division-row__xp">
                {{ division.minXp.toLocaleString(locale) }} - {{ division.maxXp.toLocaleString(locale) }} XP
              </span>
            </li>
          </ul>
        </article>
      </section>

      <div v-if="dialogOpen" class="rank-dialog-backdrop" @click.self="closeDialog">
        <section class="rank-dialog" role="dialog" aria-modal="true">
          <h2 class="rank-dialog__title">
            {{
              dialogMode === 'create'
                ? t('backoffice.ranks.actions.create')
                : t('backoffice.ranks.actions.edit')
            }}
          </h2>

          <div class="rank-dialog__fields">
            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.name') }}</span>
              <input v-model="form.name" type="text" maxlength="64" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.minXp') }}</span>
              <input v-model.number="form.minXp" type="number" min="0" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.maxXp') }}</span>
              <input v-model.number="form.maxXp" type="number" min="0" />
            </label>

            <label class="field-row">
              <span>{{ t('backoffice.ranks.form.divisions') }}</span>
              <input v-model.number="form.divisionCount" type="number" min="1" max="10" />
            </label>
          </div>

          <p v-if="formError" class="rank-dialog__error">{{ formError }}</p>

          <div class="rank-dialog__actions">
            <button type="button" class="rank-dialog-btn rank-dialog-btn--ghost" @click="closeDialog">
              {{ t('backoffice.ranks.actions.cancel') }}
            </button>
            <button type="button" class="rank-dialog-btn rank-dialog-btn--primary" @click="saveRank">
              {{
                dialogMode === 'create'
                  ? t('backoffice.ranks.actions.saveCreate')
                  : t('backoffice.ranks.actions.saveEdit')
              }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { type BackofficeRankWithDivisions, useBackofficeRanksStore } from '@/stores/backoffice'
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
const editingRankId = ref<number | null>(null)
const formError = ref('')
const form = ref({
  name: '',
  minXp: 0,
  maxXp: 1000,
  divisionCount: 3,
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

const totalDivisionsLocal = computed(() =>
  localRanks.value.reduce((sum, rank) => sum + rank.divisions.length, 0),
)

watch(
  ranks,
  (value) => {
    localRanks.value = value.map((rank) => ({
      ...rank,
      divisions: rank.divisions.map((division) => ({ ...division })),
    }))
  },
  { immediate: true },
)

function resetForm() {
  form.value = {
    name: '',
    minXp: 0,
    maxXp: 1000,
    divisionCount: 3,
  }
  formError.value = ''
}

function openCreateDialog() {
  dialogMode.value = 'create'
  editingRankId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(rank: BackofficeRankWithDivisions) {
  dialogMode.value = 'edit'
  editingRankId.value = rank.id
  form.value = {
    name: rank.name,
    minXp: rank.minXp,
    maxXp: rank.maxXp,
    divisionCount: Math.max(1, rank.divisions.length),
  }
  formError.value = ''
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
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
  const trimmedName = form.value.name.trim()
  if (!trimmedName) {
    formError.value = t('backoffice.ranks.form.errors.nameRequired')
    return
  }

  if (form.value.maxXp < form.value.minXp) {
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
      form.value.minXp,
      form.value.maxXp,
      form.value.divisionCount,
      maxDivisionId + 1,
    )

    localRanks.value.push({
      id: newRankId,
      name: trimmedName,
      minXp: form.value.minXp,
      maxXp: form.value.maxXp,
      divisionCount: form.value.divisionCount,
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
        form.value.minXp,
        form.value.maxXp,
        form.value.divisionCount,
        maxDivisionId + 1,
      )

      return {
        ...rank,
        name: trimmedName,
        minXp: form.value.minXp,
        maxXp: form.value.maxXp,
        divisionCount: form.value.divisionCount,
        divisions,
      }
    })
  }

  closeDialog()
}

function deleteRank(rankId: number) {
  localRanks.value = localRanks.value.filter((rank) => rank.id !== rankId)
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

.ranks-back-btn {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(88, 101, 242, 0.35);
  background: rgba(88, 101, 242, 0.22);
  color: #e7e9ff;
  font-weight: 800;
  padding: 0.72rem 1rem;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}

.ranks-create-btn {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(67, 181, 129, 0.44);
  background: rgba(67, 181, 129, 0.2);
  color: #c7ffe3;
  font-weight: 800;
  padding: 0.72rem 1rem;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}

.ranks-create-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.ranks-back-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.rank-card {
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(170deg, rgba(54, 57, 63, 0.95), rgba(30, 31, 34, 0.98));
  box-shadow: 0 16px 36px -24px rgba(0, 0, 0, 0.82);
  padding: 1.1rem;
}

.rank-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.85rem;
}

.rank-card__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.rank-action-btn {
  min-height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.45);
  color: var(--color-cream);
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
}

.rank-action-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.rank-action-btn--edit {
  border-color: rgba(88, 101, 242, 0.42);
  background: rgba(88, 101, 242, 0.2);
}

.rank-action-btn--delete {
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

.rank-card--bronze {
  border-color: rgba(176, 135, 88, 0.4);
}

.rank-card--silver {
  border-color: rgba(216, 222, 234, 0.36);
}

.rank-card--gold {
  border-color: rgba(241, 194, 90, 0.42);
}

.rank-card--platinum {
  border-color: rgba(96, 214, 196, 0.4);
}

.rank-card--diamond {
  border-color: rgba(116, 169, 255, 0.4);
}

.rank-card--master {
  border-color: rgba(255, 106, 168, 0.4);
}

.rank-card--grandmaster {
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

  .ranks-create-btn,
  .ranks-back-btn {
    width: 100%;
  }

  .rank-card__actions {
    justify-content: flex-start;
  }

  .division-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .division-row__xp {
    text-align: left;
  }
}
</style>
