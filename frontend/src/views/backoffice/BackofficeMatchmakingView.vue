<template>
  <section class="backoffice-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('backoffice.matchmaking.badge') }}</span>
            <h1 class="page-title">{{ t('backoffice.matchmaking.title') }}</h1>
            <p class="page-subtitle">{{ t('backoffice.matchmaking.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToBackoffice">
              {{ t('backoffice.common.actions.backToBackoffice') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetAllPending">
              {{ t('backoffice.matchmaking.actions.resetAll') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('backoffice.matchmaking.side.label') }}</div>
            <div class="hero-side__title">{{ t('backoffice.matchmaking.side.title') }}</div>
            <p class="hero-side__text">{{ t('backoffice.matchmaking.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('backoffice.matchmaking.side.chips.live') }}</span>
            <span>{{ t('backoffice.matchmaking.side.chips.audit') }}</span>
          </div>
        </aside>
      </header>

      <div v-if="feedback" :class="['feedback-banner', `feedback-banner--${feedback.type}`]">
        {{ feedback.message }}
      </div>

      <section class="stat-grid">
        <article class="stat-card">
          <span class="stat-card__label">{{ t('backoffice.matchmaking.stats.totalInQueue') }}</span>
          <strong class="stat-card__value">{{ totalInQueue.toLocaleString(locale) }}</strong>
          <div class="stat-card__caption">
            {{ t('backoffice.matchmaking.stats.totalInQueueCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('backoffice.matchmaking.stats.avgWait') }}</span>
          <strong class="stat-card__value">{{ avgWaitSeconds }}s</strong>
          <div class="stat-card__caption">
            {{ t('backoffice.matchmaking.stats.avgWaitCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('backoffice.matchmaking.stats.activeModes') }}</span>
          <strong class="stat-card__value">{{ modes.length }}</strong>
          <div class="stat-card__caption">
            {{ t('backoffice.matchmaking.stats.activeModesCaption') }}
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-card__label">{{ t('backoffice.matchmaking.stats.lastUpdate') }}</span>
          <strong class="stat-card__value">{{ formatRelativeTime(lastUpdateAt) }}</strong>
          <div class="stat-card__caption">
            {{ t('backoffice.matchmaking.stats.lastUpdateCaption', { actor: lastUpdateActor }) }}
          </div>
        </article>
      </section>

      <section class="modes-grid">
        <article
          v-for="mode in modes"
          :key="mode.id"
          :class="['mode-card', dirtyModes.has(mode.id) ? 'mode-card--dirty' : '']"
        >
          <div class="mode-card__header">
            <div class="mode-card__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="getModeIcon(mode.key)" />
              </svg>
            </div>

            <div class="mode-card__title-block">
              <h2 class="mode-card__title">{{ getModeLabel(mode.key) }}</h2>
              <p class="mode-card__description">{{ getModeDescription(mode.key) }}</p>
            </div>

            <span :class="['mode-card__status', mode.enabled ? 'is-on' : 'is-off']">
              {{
                mode.enabled
                  ? t('backoffice.matchmaking.modes.enabled')
                  : t('backoffice.matchmaking.modes.disabled')
              }}
            </span>
          </div>

          <div class="mode-card__queue">
            <div class="queue-pill">
              <span class="queue-pill__dot"></span>
              <strong>{{ mode.playersInQueue }}</strong>
              <span>{{ t('backoffice.matchmaking.modes.playersInQueue') }}</span>
            </div>

            <div class="queue-pill queue-pill--muted">
              <strong>{{ mode.matchesLastHour }}</strong>
              <span>{{ t('backoffice.matchmaking.modes.matchesLastHour') }}</span>
            </div>
          </div>

          <div class="mode-card__form">
            <label class="form-field">
              <span class="form-field__label">
                {{ t('backoffice.matchmaking.settings.maxWaitTime') }}
              </span>
              <div class="form-field__control">
                <input
                  v-model.number="pending[mode.id]!.maxWaitTimeSec"
                  type="number"
                  min="10"
                  max="600"
                  step="5"
                  class="input"
                />
                <span class="form-field__unit">{{
                  t('backoffice.matchmaking.units.seconds')
                }}</span>
              </div>
              <span class="form-field__hint">
                {{ t('backoffice.matchmaking.settings.maxWaitTimeHint') }}
              </span>
            </label>

            <label class="form-field">
              <span class="form-field__label">
                {{ t('backoffice.matchmaking.settings.mmrWindow') }}
              </span>
              <div class="form-field__control">
                <input
                  v-model.number="pending[mode.id]!.mmrWindow"
                  type="number"
                  min="50"
                  max="1000"
                  step="25"
                  class="input"
                />
                <span class="form-field__unit">{{ t('backoffice.matchmaking.units.mmr') }}</span>
              </div>
              <span class="form-field__hint">
                {{ t('backoffice.matchmaking.settings.mmrWindowHint') }}
              </span>
            </label>

            <label class="form-field">
              <span class="form-field__label">
                {{ t('backoffice.matchmaking.settings.teamSize') }}
              </span>
              <div class="form-field__control">
                <select v-model.number="pending[mode.id]!.teamSize" class="select">
                  <option :value="1">1v1</option>
                  <option :value="2">2v2</option>
                  <option :value="3">3v3</option>
                  <option :value="4">4v4</option>
                  <option :value="5">5v5</option>
                </select>
              </div>
              <span class="form-field__hint">
                {{ t('backoffice.matchmaking.settings.teamSizeHint') }}
              </span>
            </label>

            <label class="form-field form-field--toggle">
              <span class="form-field__label">
                {{ t('backoffice.matchmaking.settings.enabled') }}
              </span>
              <div class="form-field__control">
                <button
                  type="button"
                  :class="['toggle', pending[mode.id]!.enabled ? 'toggle--on' : '']"
                  :aria-pressed="pending[mode.id]!.enabled"
                  @click="pending[mode.id]!.enabled = !pending[mode.id]!.enabled"
                >
                  <span class="toggle__knob"></span>
                </button>
                <span class="form-field__inline-label">
                  {{
                    pending[mode.id]!.enabled
                      ? t('backoffice.matchmaking.modes.enabled')
                      : t('backoffice.matchmaking.modes.disabled')
                  }}
                </span>
              </div>
              <span class="form-field__hint">
                {{ t('backoffice.matchmaking.settings.enabledHint') }}
              </span>
            </label>
          </div>

          <div class="mode-card__audit">
            <span class="meta-item meta-item--audit">
              {{
                t('backoffice.matchmaking.audit.lastUpdated', {
                  actor: mode.lastUpdatedBy,
                  date: formatDate(mode.lastUpdatedAt),
                })
              }}
            </span>

            <span v-if="dirtyModes.has(mode.id)" class="meta-item meta-item--warning">
              {{ t('backoffice.matchmaking.audit.unsavedChanges') }}
            </span>
          </div>

          <div class="mode-card__actions">
            <button
              type="button"
              class="btn-inline btn-inline--ghost"
              :disabled="!dirtyModes.has(mode.id) || savingId === mode.id"
              @click="resetMode(mode.id)"
            >
              {{ t('backoffice.matchmaking.actions.cancel') }}
            </button>

            <button
              type="button"
              class="btn-inline btn-inline--primary"
              :disabled="!dirtyModes.has(mode.id) || savingId === mode.id"
              @click="saveMode(mode.id)"
            >
              {{
                savingId === mode.id
                  ? t('backoffice.matchmaking.actions.saving')
                  : t('backoffice.matchmaking.actions.save')
              }}
            </button>
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.matchmaking.history.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.matchmaking.history.subtitle') }}</p>
          </div>
          <span class="meta-item">
            {{ auditTrail.length }} {{ t('backoffice.matchmaking.history.entries') }}
          </span>
        </div>

        <div v-if="auditTrail.length" class="history-list">
          <article v-for="entry in auditTrail" :key="entry.id" class="history-item">
            <div class="history-item__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiClipboardEditOutline" />
              </svg>
            </div>

            <div class="history-item__body">
              <strong class="history-item__title">
                {{
                  t('backoffice.matchmaking.history.action', {
                    actor: entry.actor,
                    mode: getModeLabel(entry.modeKey),
                  })
                }}
              </strong>

              <div class="history-item__changes">
                <span
                  v-for="change in entry.changes"
                  :key="change"
                  class="meta-item meta-item--subtle"
                >
                  {{ change }}
                </span>
              </div>
            </div>

            <span class="meta-item">{{ formatDate(entry.timestamp) }}</span>
          </article>
        </div>

        <div v-else class="empty-state">
          <h3 class="empty-state__title">{{ t('backoffice.matchmaking.history.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('backoffice.matchmaking.history.emptyText') }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiClipboardEditOutline,
  mdiPartyPopper,
  mdiShieldCrownOutline,
  mdiSwordCross,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

type ModeKey = 'ranked' | 'casual' | 'fun'
type FeedbackType = 'success' | 'warning' | 'error'

type MatchmakingMode = {
  id: number
  key: ModeKey
  enabled: boolean
  maxWaitTimeSec: number
  mmrWindow: number
  teamSize: number
  playersInQueue: number
  matchesLastHour: number
  lastUpdatedAt: string
  lastUpdatedBy: string
}

type AuditEntry = {
  id: number
  modeKey: ModeKey
  actor: string
  changes: string[]
  timestamp: string
}

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })

const feedback = ref<{ type: FeedbackType; message: string } | null>(null)
const savingId = ref<number | null>(null)

const modes = ref<MatchmakingMode[]>([
  {
    id: 1,
    key: 'ranked',
    enabled: true,
    maxWaitTimeSec: 180,
    mmrWindow: 150,
    teamSize: 5,
    playersInQueue: 84,
    matchesLastHour: 142,
    lastUpdatedAt: hoursAgo(6),
    lastUpdatedBy: 'enzo',
  },
  {
    id: 2,
    key: 'casual',
    enabled: true,
    maxWaitTimeSec: 90,
    mmrWindow: 400,
    teamSize: 5,
    playersInQueue: 156,
    matchesLastHour: 218,
    lastUpdatedAt: hoursAgo(28),
    lastUpdatedBy: 'alice',
  },
  {
    id: 3,
    key: 'fun',
    enabled: true,
    maxWaitTimeSec: 60,
    mmrWindow: 800,
    teamSize: 3,
    playersInQueue: 42,
    matchesLastHour: 76,
    lastUpdatedAt: hoursAgo(72),
    lastUpdatedBy: 'enzo',
  },
])

const pending = reactive<
  Record<
    number,
    {
      enabled: boolean
      maxWaitTimeSec: number
      mmrWindow: number
      teamSize: number
    }
  >
>({})

modes.value.forEach((mode) => {
  pending[mode.id] = {
    enabled: mode.enabled,
    maxWaitTimeSec: mode.maxWaitTimeSec,
    mmrWindow: mode.mmrWindow,
    teamSize: mode.teamSize,
  }
})

const auditTrail = ref<AuditEntry[]>([
  {
    id: 1,
    modeKey: 'ranked',
    actor: 'enzo',
    changes: ['maxWaitTimeSec: 240 → 180', 'mmrWindow: 200 → 150'],
    timestamp: hoursAgo(6),
  },
  {
    id: 2,
    modeKey: 'casual',
    actor: 'alice',
    changes: ['mmrWindow: 350 → 400'],
    timestamp: hoursAgo(28),
  },
  {
    id: 3,
    modeKey: 'fun',
    actor: 'enzo',
    changes: ['enabled: false → true', 'teamSize: 5 → 3'],
    timestamp: hoursAgo(72),
  },
])

const dirtyModes = computed(() => {
  const dirty = new Set<number>()

  modes.value.forEach((mode) => {
    const p = pending[mode.id]
    if (!p) return

    if (
      p.enabled !== mode.enabled ||
      p.maxWaitTimeSec !== mode.maxWaitTimeSec ||
      p.mmrWindow !== mode.mmrWindow ||
      p.teamSize !== mode.teamSize
    ) {
      dirty.add(mode.id)
    }
  })

  return dirty
})

const totalInQueue = computed(() =>
  modes.value.reduce((sum, mode) => sum + (mode.enabled ? mode.playersInQueue : 0), 0),
)

const avgWaitSeconds = computed(() => {
  const enabledModes = modes.value.filter((m) => m.enabled)
  if (enabledModes.length === 0) return 0
  const sum = enabledModes.reduce((acc, mode) => acc + mode.maxWaitTimeSec, 0)
  return Math.round(sum / enabledModes.length)
})

const lastUpdateAt = computed(() => {
  const sorted = [...modes.value].sort(
    (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
  )
  return sorted[0]?.lastUpdatedAt ?? new Date().toISOString()
})

const lastUpdateActor = computed(() => {
  const sorted = [...modes.value].sort(
    (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
  )
  return sorted[0]?.lastUpdatedBy ?? '—'
})

// --- Actions ---------------------------------------------------------------

function goBackToBackoffice() {
  router.push('/backoffice')
}

function resetMode(modeId: number) {
  const mode = modes.value.find((m) => m.id === modeId)
  if (!mode) return

  pending[modeId] = {
    enabled: mode.enabled,
    maxWaitTimeSec: mode.maxWaitTimeSec,
    mmrWindow: mode.mmrWindow,
    teamSize: mode.teamSize,
  }
}

function resetAllPending() {
  modes.value.forEach((mode) => resetMode(mode.id))
  feedback.value = null
}

async function saveMode(modeId: number) {
  const mode = modes.value.find((m) => m.id === modeId)
  if (!mode) return

  const p = pending[modeId]
  if (!p) return

  savingId.value = modeId

  // Build change list for audit
  const changes: string[] = []
  if (p.enabled !== mode.enabled) {
    changes.push(`enabled: ${mode.enabled} → ${p.enabled}`)
  }
  if (p.maxWaitTimeSec !== mode.maxWaitTimeSec) {
    changes.push(`maxWaitTimeSec: ${mode.maxWaitTimeSec} → ${p.maxWaitTimeSec}`)
  }
  if (p.mmrWindow !== mode.mmrWindow) {
    changes.push(`mmrWindow: ${mode.mmrWindow} → ${p.mmrWindow}`)
  }
  if (p.teamSize !== mode.teamSize) {
    changes.push(`teamSize: ${mode.teamSize} → ${p.teamSize}`)
  }

  await wait(280)

  const actor = profile.value?.username || profile.value?.email || 'POC Admin'
  const now = new Date().toISOString()

  modes.value = modes.value.map((m) =>
    m.id === modeId
      ? {
          ...m,
          enabled: p.enabled,
          maxWaitTimeSec: p.maxWaitTimeSec,
          mmrWindow: p.mmrWindow,
          teamSize: p.teamSize,
          lastUpdatedAt: now,
          lastUpdatedBy: actor,
        }
      : m,
  )

  auditTrail.value = [
    {
      id: Date.now(),
      modeKey: mode.key,
      actor,
      changes,
      timestamp: now,
    },
    ...auditTrail.value,
  ]

  feedback.value = {
    type: 'success',
    message: t('backoffice.matchmaking.feedback.saved', {
      mode: getModeLabel(mode.key),
    }),
  }

  savingId.value = null
}

// --- Helpers ---------------------------------------------------------------

function getModeLabel(key: ModeKey) {
  return t(`backoffice.matchmaking.modes.${key}.label`)
}

function getModeDescription(key: ModeKey) {
  return t(`backoffice.matchmaking.modes.${key}.description`)
}

function getModeIcon(key: ModeKey) {
  if (key === 'ranked') return mdiShieldCrownOutline
  if (key === 'fun') return mdiPartyPopper
  return mdiSwordCross
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.round(diffMs / (60 * 1000))

  if (diffMinutes < 1) return t('backoffice.common.time.justNow')
  if (diffMinutes < 60) return t('backoffice.common.time.minutesAgo', { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return t('backoffice.common.time.hoursAgo', { count: diffHours })

  const diffDays = Math.floor(diffHours / 24)
  return t('backoffice.common.time.daysAgo', { count: diffDays })
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})
</script>

<style scoped>
.backoffice-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.page-hero > * {
  position: relative;
  z-index: 1;
}

.page-hero__content {
  display: grid;
  gap: 1rem;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 720px;
  color: rgba(252, 239, 225, 0.68);
  line-height: 1.6;
}

.btn,
.btn-inline {
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}

.btn {
  min-height: 42px;
  padding: 0.85rem 1.1rem;
  font-size: 0.9rem;
}

.btn-inline {
  min-height: 38px;
  padding: 0.58rem 0.9rem;
  font-size: 0.84rem;
}

.btn:hover:not(:disabled),
.btn-inline:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-inline:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary,
.btn-inline--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.btn-inline--primary:hover:not(:disabled) {
  filter: brightness(1.04);
}

.btn--ghost,
.btn-inline--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.btn-inline--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.hero-side {
  padding: 1.25rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.2), transparent 38%),
    rgba(18, 24, 38, 0.38);
  color: var(--color-cream);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 900;
}

.hero-side__text {
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.hero-side__chips span {
  display: inline-flex;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.74rem;
  font-weight: 800;
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
}

.feedback-banner {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-weight: 900;
  line-height: 1.45;
}

.feedback-banner--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
}

.feedback-banner--error {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.35);
}

.stat-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 1.15rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.9)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  line-height: 1;
}

.stat-card__caption {
  display: block;
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.8rem;
  line-height: 1.4;
}

.modes-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mode-card {
  padding: 1.25rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.mode-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.mode-card--dirty {
  border-color: rgba(242, 139, 91, 0.48);
  box-shadow: 0 20px 44px -34px rgba(242, 139, 91, 0.8);
}

.mode-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.mode-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
}

.mode-card__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.mode-card__title-block {
  flex: 1;
  min-width: 0;
}

.mode-card__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 1rem;
  font-weight: 900;
}

.mode-card__description {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.86rem;
  line-height: 1.45;
}

.mode-card__status {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.mode-card__status.is-on {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.28);
}

.mode-card__status.is-off {
  color: #ff9a9a;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.28);
}

.mode-card__queue {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.queue-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
  color: rgba(252, 239, 225, 0.76);
  font-size: 0.76rem;
  font-weight: 800;
}

.queue-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-strong);
}

.queue-pill--muted {
  color: rgba(252, 239, 225, 0.5);
}

.mode-card__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: auto;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.form-field--toggle {
  grid-column: span 2;
}

.form-field__label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.1);
  border: 1px solid rgba(242, 139, 91, 0.22);
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.form-field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.input,
.select {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.85rem 0.95rem;
  font: inherit;
  font-weight: 800;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.input:hover,
.select:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.input:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
  transform: translateY(-1px);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

.form-field__unit {
  position: absolute;
  right: 0.8rem;
  color: rgba(252, 239, 225, 0.46);
  font-size: 0.78rem;
  font-weight: 900;
  pointer-events: none;
}

.form-field__control .input {
  padding-right: 3rem;
}

.form-field__hint {
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.78rem;
  line-height: 1.4;
}

.form-field__inline-label {
  color: rgba(252, 239, 225, 0.72);
  font-weight: 800;
  font-size: 0.86rem;
  margin-left: 0.6rem;
}

.toggle {
  width: 48px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.52);
  padding: 3px;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.toggle__knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(252, 239, 225, 0.72);
  transition: transform 0.18s ease;
}

.toggle--on {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
}

.toggle--on .toggle__knob {
  transform: translateX(20px);
  background: var(--color-navy);
}

.mode-card__audit {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(252, 239, 225, 0.14);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.76rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.72);
  background: rgba(18, 24, 38, 0.3);
}

.meta-item--audit {
  background: rgba(80, 120, 238, 0.14);
  color: #9ab8ff;
  border-color: rgba(80, 120, 238, 0.28);
}

.meta-item--warning {
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.28);
}

.meta-item--subtle {
  color: rgba(252, 239, 225, 0.56);
}

.mode-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.surface {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.surface-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  color: var(--color-cream);
  font-weight: 900;
}

.surface-subtitle {
  margin: 0.3rem 0 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.88rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
}

.history-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
}

.history-item__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.history-item__body {
  flex: 1;
  min-width: 0;
}

.history-item__title {
  display: block;
  color: var(--color-cream);
  font-size: 0.92rem;
  font-weight: 900;
}

.history-item__changes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
}

.empty-state {
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
}

.empty-state__text {
  margin: 0.5rem 0 0;
  color: rgba(252, 239, 225, 0.58);
}

@media (max-width: 1100px) {
  .stat-grid,
  .modes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .modes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .backoffice-page {
    padding: 1rem;
  }

  .page-hero,
  .surface,
  .mode-card {
    border-radius: 22px;
    padding: 1rem;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .mode-card__form {
    grid-template-columns: 1fr;
  }

  .form-field--toggle {
    grid-column: span 1;
  }

  .mode-card__actions,
  .page-hero__actions {
    flex-direction: column;
  }

  .btn,
  .btn-inline {
    width: 100%;
  }

  .history-item {
    align-items: flex-start;
  }
}
</style>
