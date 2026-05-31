<template>
  <section class="moderation-view">
    <div class="moderation-shell">
      <header class="hero">
        <div class="hero__content">
          <span class="hero__badge">{{ t('moderation.hero.badge') }}</span>

          <h1 class="hero__title">{{ t('moderation.hero.title') }}</h1>

          <p class="hero__subtitle">
            {{ t('moderation.hero.subtitle') }}
          </p>

          <div class="hero__actions">
            <button type="button" class="btn btn--primary" @click="goToUsersModeration">
              {{ t('moderation.hero.primaryAction') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="router.push('/moderation/audit')">
              {{ t('moderation.hero.secondaryAction') }}
            </button>
          </div>
        </div>

        <div class="hero__panel">
          <div class="hero-panel-card hero-panel-card--highlight">
            <div class="hero-panel-card__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="mdiAccountGroup" />
              </svg>
            </div>

            <div>
              <div class="hero-panel-card__label">{{ t('moderation.highlight.label') }}</div>
              <div class="hero-panel-card__title">{{ t('moderation.highlight.title') }}</div>
              <div class="hero-panel-card__text">
                {{ t('moderation.highlight.text') }}
              </div>
            </div>
          </div>

          <div class="hero-panel-grid">
            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{ t('moderation.stats.access.label') }}</span>
              <strong class="mini-stat-card__value">{{
                t('moderation.stats.access.value')
              }}</strong>
            </div>

            <div class="mini-stat-card">
              <span class="mini-stat-card__label">{{ t('moderation.stats.entry.label') }}</span>
              <strong class="mini-stat-card__value">{{ t('moderation.stats.entry.value') }}</strong>
            </div>
          </div>
        </div>
      </header>

      <section class="sections-block">
        <div class="section-heading">
          <h2 class="section-heading__title">{{ t('moderation.sections.title') }}</h2>
          <p class="section-heading__subtitle">
            {{ t('moderation.sections.subtitle') }}
          </p>
        </div>

        <div class="sections-grid">
          <article
            v-for="section in sections"
            :key="section.key"
            :class="[
              'section-card',
              section.highlight ? 'section-card--highlight' : '',
              section.soon ? 'section-card--soon' : '',
            ]"
          >
            <div class="section-card__top">
              <div class="section-card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="section.icon" />
                </svg>
              </div>
            </div>

            <div class="section-card__body">
              <h3 class="section-card__title">{{ section.title }}</h3>
              <p class="section-card__description">{{ section.description }}</p>

              <div class="section-card__chips">
                <span v-for="item in section.items" :key="item" class="section-chip">
                  {{ item }}
                </span>
              </div>
            </div>

            <div class="section-card__footer">
              <button
                v-if="section.to"
                type="button"
                class="card-action"
                @click="router.push(section.to)"
              >
                {{ t('moderation.actions.open') }}
              </button>

              <button v-else type="button" class="card-action card-action--disabled" disabled>
                {{ t('moderation.actions.comingSoon') }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  mdiAccountGroup,
  mdiAlertOutline,
  mdiClipboardAccountOutline,
  mdiFileDocumentAlertOutline,
  mdiGavel,
  mdiImageSearchOutline,
} from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t } = useI18n({ useScope: 'global' })

type ModerationSection = {
  key: string
  title: string
  description: string
  icon: string
  items: string[]
  to?: string
  soon?: boolean
  highlight?: boolean
}

const sections = computed<ModerationSection[]>(() => [
  {
    key: 'users',
    title: t('moderation.cards.users.title'),
    description: t('moderation.cards.users.description'),
    icon: mdiAccountGroup,
    items: [
      t('moderation.cards.users.items.profiles'),
      t('moderation.cards.users.items.statuses'),
      t('moderation.cards.users.items.actions'),
    ],
    to: '/moderation/users',
    highlight: true,
  },
  {
    key: 'reports',
    title: t('moderation.cards.reports.title'),
    description: t('moderation.cards.reports.description'),
    icon: mdiAlertOutline,
    items: [
      t('moderation.cards.reports.items.reports'),
      t('moderation.cards.reports.items.priorities'),
      t('moderation.cards.reports.items.sorting'),
    ],
    to: '/moderation/reports',
  },
  {
    key: 'content',
    title: t('moderation.cards.content.title'),
    description: t('moderation.cards.content.description'),
    icon: mdiImageSearchOutline,
    items: [
      t('moderation.cards.content.items.maps'),
      t('moderation.cards.content.items.activities'),
      t('moderation.cards.content.items.assets'),
    ],
    to: '/moderation/content',
  },
  {
    key: 'sanctions',
    title: t('moderation.cards.sanctions.title'),
    description: t('moderation.cards.sanctions.description'),
    icon: mdiGavel,
    items: [
      t('moderation.cards.sanctions.items.warn'),
      t('moderation.cards.sanctions.items.suspend'),
      t('moderation.cards.sanctions.items.ban'),
    ],
    to: '/moderation/sanctions',
  },
  {
    key: 'appeals',
    title: t('moderation.cards.appeals.title'),
    description: t('moderation.cards.appeals.description'),
    icon: mdiFileDocumentAlertOutline,
    items: [
      t('moderation.cards.appeals.items.claims'),
      t('moderation.cards.appeals.items.decisions'),
      t('moderation.cards.appeals.items.followUp'),
    ],
    to: '/moderation/appeals',
  },
  {
    key: 'audit',
    title: t('moderation.cards.audit.title'),
    description: t('moderation.cards.audit.description'),
    icon: mdiClipboardAccountOutline,
    items: [
      t('moderation.cards.audit.items.traceability'),
      t('moderation.cards.audit.items.history'),
      t('moderation.cards.audit.items.security'),
    ],
    to: '/moderation/audit',
  },
])

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})

function goToUsersModeration() {
  router.push('/moderation/users')
}
</script>

<style scoped>
.moderation-view {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

/* ── Layout ─────────────────────────────────────────────── */
.moderation-shell {
  max-width: 1380px;
  margin: 0 auto;
}

/* ── Hero ───────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 1.5rem;
  align-items: stretch;
}

.hero__content,
.hero__panel,
.sections-block,
.roadmap-block {
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.hero__content {
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.hero__content::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.24), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.hero__content > * {
  position: relative;
  z-index: 1;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
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

.hero__title {
  margin: 1rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
  color: var(--color-cream);
  font-weight: 900;
}

.hero__subtitle {
  margin: 1rem 0 0;
  max-width: 720px;
  color: rgba(252, 239, 225, 0.7);
  font-size: 1rem;
  line-height: 1.65;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.85rem 1.15rem;
  font-weight: 900;
  font-size: 0.95rem;
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

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

/* ── Hero side panel ─────────────────────────────────────── */
.hero__panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-panel-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.15rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.16), transparent 38%),
    rgba(18, 24, 38, 0.36);
  color: var(--color-cream);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.04);
}

.hero-panel-card--highlight {
  border-color: rgba(242, 139, 91, 0.32);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.22), transparent 40%),
    rgba(18, 24, 38, 0.42);
}

.hero-panel-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
  box-shadow: 0 14px 28px -22px rgba(242, 139, 91, 0.95);
}

.hero-panel-card__icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

.hero-panel-card__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-panel-card__title {
  margin-top: 0.3rem;
  color: var(--color-cream);
  font-size: 1.15rem;
  font-weight: 900;
}

.hero-panel-card__text {
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
}

.hero-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-stat-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.04);
}

.mini-stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mini-stat-card__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-primary-strong);
  font-size: 1rem;
  font-weight: 900;
}

/* ── Sections block ──────────────────────────────────────── */
.sections-block,
.roadmap-block {
  margin-top: 1.5rem;
  padding: 1.5rem;
}

.section-heading {
  margin-bottom: 1.25rem;
}

.section-heading__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.55rem;
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.03em;
}

.section-heading__subtitle {
  margin: 0.4rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.95rem;
  line-height: 1.55;
}

.sections-grid,
.roadmap-grid {
  display: grid;
  gap: 1rem;
}

.sections-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.roadmap-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* ── Section cards ───────────────────────────────────────── */
.section-card,
.roadmap-card {
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.58), rgba(46, 50, 68, 0.92)), var(--color-navy);
  box-shadow: 0 16px 36px -30px rgba(0, 0, 0, 0.85);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.section-card {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.section-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.section-card--highlight {
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow:
    0 20px 44px -32px rgba(242, 139, 91, 0.85),
    0 16px 36px -30px rgba(0, 0, 0, 0.85);
}

.section-card--highlight:hover {
  border-color: rgba(242, 139, 91, 0.58);
  box-shadow:
    0 24px 48px -30px rgba(242, 139, 91, 0.9),
    0 22px 44px -32px rgba(0, 0, 0, 0.9);
}

.section-card--soon {
  opacity: 0.68;
}

.section-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  box-shadow: 0 14px 28px -22px rgba(242, 139, 91, 0.95);
}

.section-card__icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.section-card__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.76rem;
  font-weight: 900;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.section-card__badge.is-live {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.28);
}

.section-card__badge.is-soon {
  color: rgba(252, 239, 225, 0.58);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.1);
}

.section-card__body {
  margin-top: 1rem;
  flex: 1;
}

.section-card__title {
  margin: 0;
  color: var(--color-cream);
  font-size: 1.12rem;
  font-weight: 900;
  line-height: 1.2;
}

.section-card__description {
  margin: 0.6rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.94rem;
  line-height: 1.55;
}

.section-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.section-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.78);
  background: rgba(18, 24, 38, 0.3);
}

.section-card__footer {
  margin-top: 1.2rem;
}

/* ── Card action ─────────────────────────────────────────── */
.card-action {
  width: 100%;
  min-height: 44px;
  border: 1px solid rgba(242, 139, 91, 0.42);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font-weight: 900;
  cursor: pointer;
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease;
}

.card-action:hover:not(.card-action--disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.card-action--disabled {
  cursor: not-allowed;
  opacity: 0.55;
  color: rgba(252, 239, 225, 0.62);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
  box-shadow: none;
}

/* ── Roadmap fallback ────────────────────────────────────── */
.roadmap-card {
  padding: 1.15rem;
}

.roadmap-card h3 {
  margin: 0;
  color: var(--color-cream);
  font-size: 1rem;
  font-weight: 900;
}

.roadmap-card p {
  margin: 0.5rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.92rem;
  line-height: 1.55;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1180px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .sections-grid,
  .roadmap-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .moderation-view {
    padding: 1rem;
  }

  .hero__content,
  .hero__panel,
  .sections-block,
  .roadmap-block {
    padding: 1rem;
    border-radius: 22px;
  }

  .hero__title {
    font-size: 2rem;
  }

  .hero__actions {
    flex-direction: column;
  }

  .btn,
  .card-action {
    width: 100%;
    justify-content: center;
  }

  .hero-panel-grid,
  .sections-grid,
  .roadmap-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .hero-panel-card {
    flex-direction: column;
  }

  .section-card {
    min-height: auto;
  }

  .section-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
