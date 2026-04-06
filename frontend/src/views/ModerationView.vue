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

            <button type="button" class="btn btn--ghost" disabled>
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

              <span :class="['section-card__badge', section.soon ? 'is-soon' : 'is-live']">
                {{ section.badge }}
              </span>
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

      <section class="roadmap-block">
        <div class="section-heading">
          <h2 class="section-heading__title">{{ t('moderation.roadmap.title') }}</h2>
          <p class="section-heading__subtitle">
            {{ t('moderation.roadmap.subtitle') }}
          </p>
        </div>

        <div class="roadmap-grid">
          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.reports.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.reports.description') }}</p>
          </article>

          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.sanctions.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.sanctions.description') }}</p>
          </article>

          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.content.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.content.description') }}</p>
          </article>

          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.appeals.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.appeals.description') }}</p>
          </article>

          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.audit.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.audit.description') }}</p>
          </article>

          <article class="roadmap-card">
            <h3>{{ t('moderation.roadmap.cards.automation.title') }}</h3>
            <p>{{ t('moderation.roadmap.cards.automation.description') }}</p>
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
  badge: string
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
    badge: t('moderation.badges.available'),
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
    badge: t('moderation.badges.comingSoon'),
    items: [
      t('moderation.cards.reports.items.reports'),
      t('moderation.cards.reports.items.priorities'),
      t('moderation.cards.reports.items.sorting'),
    ],
    soon: true,
  },
  {
    key: 'content',
    title: t('moderation.cards.content.title'),
    description: t('moderation.cards.content.description'),
    icon: mdiImageSearchOutline,
    badge: t('moderation.badges.comingSoon'),
    items: [
      t('moderation.cards.content.items.maps'),
      t('moderation.cards.content.items.activities'),
      t('moderation.cards.content.items.assets'),
    ],
    soon: true,
  },
  {
    key: 'sanctions',
    title: t('moderation.cards.sanctions.title'),
    description: t('moderation.cards.sanctions.description'),
    icon: mdiGavel,
    badge: t('moderation.badges.comingSoon'),
    items: [
      t('moderation.cards.sanctions.items.warn'),
      t('moderation.cards.sanctions.items.suspend'),
      t('moderation.cards.sanctions.items.ban'),
    ],
    soon: true,
  },
  {
    key: 'appeals',
    title: t('moderation.cards.appeals.title'),
    description: t('moderation.cards.appeals.description'),
    icon: mdiFileDocumentAlertOutline,
    badge: t('moderation.badges.comingSoon'),
    items: [
      t('moderation.cards.appeals.items.claims'),
      t('moderation.cards.appeals.items.decisions'),
      t('moderation.cards.appeals.items.followUp'),
    ],
    soon: true,
  },
  {
    key: 'audit',
    title: t('moderation.cards.audit.title'),
    description: t('moderation.cards.audit.description'),
    icon: mdiClipboardAccountOutline,
    badge: t('moderation.badges.comingSoon'),
    items: [
      t('moderation.cards.audit.items.traceability'),
      t('moderation.cards.audit.items.history'),
      t('moderation.cards.audit.items.security'),
    ],
    soon: true,
  },
])

onMounted(() => {
  const role = profile.value?.role

  if (role !== 'admin') {
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
}

.moderation-shell {
  max-width: 1380px;
  margin: 0 auto;
}

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
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  box-shadow: var(--shadow-md);
}

.hero__content {
  padding: 2rem;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}

.hero__title {
  margin: 1rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  color: var(--color-ink);
}

.hero__subtitle {
  margin: 1rem 0 0;
  max-width: 720px;
  color: var(--color-text-muted);
  font-size: 1rem;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.2rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn--primary {
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  box-shadow: 0 16px 30px -18px rgba(242, 139, 91, 0.8);
}

.btn--primary:hover {
  transform: translateY(-1px);
}

.btn--ghost {
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.15);
}

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
  background: linear-gradient(145deg, rgba(46, 50, 68, 0.97), rgba(81, 96, 121, 0.95));
  color: var(--color-cream);
}

.hero-panel-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
}

.hero-panel-card__icon svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
}

.hero-panel-card__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.78;
  letter-spacing: 0.04em;
}

.hero-panel-card__title {
  margin-top: 0.3rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.hero-panel-card__text {
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.92rem;
}

.hero-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-stat-card {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(81, 96, 121, 0.08);
  border: 1px solid rgba(81, 96, 121, 0.12);
}

.mini-stat-card__label {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.mini-stat-card__value {
  display: block;
  margin-top: 0.35rem;
  color: var(--color-ink);
  font-size: 1rem;
}

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
  color: var(--color-ink);
}

.section-heading__subtitle {
  margin: 0.4rem 0 0;
  color: var(--color-text-muted);
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

.section-card,
.roadmap-card {
  border-radius: 22px;
  border: 1px solid rgba(46, 50, 68, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.18)),
    rgba(252, 239, 225, 0.7);
  box-shadow: var(--shadow-sm);
}

.section-card {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.section-card--highlight {
  border-color: rgba(242, 139, 91, 0.35);
  box-shadow: 0 18px 38px -26px rgba(242, 139, 91, 0.7);
}

.section-card--soon {
  opacity: 0.92;
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
  background: rgba(81, 96, 121, 0.09);
  color: var(--color-ink);
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
  font-weight: 700;
}

.section-card__badge.is-live {
  color: #146c43;
  background: rgba(61, 191, 125, 0.16);
}

.section-card__badge.is-soon {
  color: var(--color-ink-muted);
  background: rgba(81, 96, 121, 0.12);
}

.section-card__body {
  margin-top: 1rem;
  flex: 1;
}

.section-card__title {
  margin: 0;
  color: var(--color-ink);
  font-size: 1.1rem;
}

.section-card__description {
  margin: 0.55rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.94rem;
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
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-ink);
  background: rgba(81, 96, 121, 0.08);
}

.section-card__footer {
  margin-top: 1.2rem;
}

.card-action {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.card-action:hover {
  transform: translateY(-1px);
}

.card-action--disabled {
  cursor: not-allowed;
  opacity: 0.72;
  background: linear-gradient(135deg, #8b95a7, #6a7288);
}

.roadmap-card {
  padding: 1.15rem;
}

.roadmap-card h3 {
  margin: 0;
  color: var(--color-ink);
  font-size: 1rem;
}

.roadmap-card p {
  margin: 0.5rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
}

@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .sections-grid,
  .roadmap-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .moderation-view {
    padding: 1rem;
  }

  .hero__content,
  .hero__panel,
  .sections-block,
  .roadmap-block {
    border-radius: 22px;
  }

  .hero-panel-grid,
  .sections-grid,
  .roadmap-grid {
    grid-template-columns: 1fr;
  }

  .hero__actions {
    flex-direction: column;
  }

  .btn,
  .card-action {
    width: 100%;
  }
}
</style>
