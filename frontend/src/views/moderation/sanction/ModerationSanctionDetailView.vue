<template>
  <section class="moderation-page">
    <div class="page-shell">
      <template v-if="sanction">
        <header class="page-hero">
          <div>
            <span class="page-badge">{{ t('moderation.pages.sanctions.detail.badge') }}</span>
            <h1 class="page-title">{{ sanction.targetName }}</h1>
            <p class="page-subtitle">{{ sanction.summary }}</p>

            <div class="audit-hero__actions">
              <button type="button" class="btn btn--primary" @click="goBackToModeration">
                {{ t('moderation.cards.audit.actions.backToModeration') }}
              </button>

              <button type="button" class="btn btn--ghost" @click="goBackToSanctions">
                {{ t('moderation.pages.sanctions.actions.backToList') }}
              </button>

              <button
                v-if="sanction.status === 'draft'"
                type="button"
                class="btn btn--ghost"
                @click="moderationStore.activateSanction(sanction.id, 'POC Admin')"
              >
                {{ t('moderation.pages.sanctions.actions.activate') }}
              </button>

              <button
                v-if="sanction.status === 'active'"
                type="button"
                class="btn btn--ghost"
                @click="moderationStore.revokeSanction(sanction.id, 'POC Admin')"
              >
                {{ t('moderation.pages.sanctions.actions.revoke') }}
              </button>
            </div>
          </div>

          <aside class="hero-side">
            <div>
              <div class="hero-side__label">
                {{ t('moderation.pages.sanctions.detail.side.label') }}
              </div>
              <div class="hero-side__title">
                {{ t('moderation.pages.sanctions.detail.side.title') }}
              </div>
              <p class="hero-side__text">{{ t('moderation.pages.sanctions.detail.side.text') }}</p>
            </div>

            <div class="hero-side__chips">
              <span>{{ getSanctionTypeLabel(sanction.type) }}</span>
              <span>{{ getSanctionStatusLabel(sanction.status) }}</span>
              <span>{{ getSanctionScopeLabel(sanction.scope) }}</span>
              <span>{{ getSeverityLabel(sanction.severity) }}</span>
            </div>
          </aside>
        </header>

        <section class="detail-grid">
          <div class="detail-main">
            <section class="surface">
              <div class="surface-header">
                <div>
                  <h2 class="surface-title">
                    {{ t('moderation.pages.sanctions.detail.summary.title') }}
                  </h2>
                  <p class="surface-subtitle">
                    {{ t('moderation.pages.sanctions.detail.summary.subtitle') }}
                  </p>
                </div>
              </div>

              <div class="info-grid">
                <article class="info-card">
                  <span class="info-card__label">
                    {{ t('moderation.pages.sanctions.detail.info.reason') }}
                  </span>
                  <strong class="info-card__value">{{ sanction.reason }}</strong>
                </article>

                <article class="info-card">
                  <span class="info-card__label">
                    {{ t('moderation.pages.sanctions.detail.info.scope') }}
                  </span>
                  <strong class="info-card__value">{{
                    getSanctionScopeLabel(sanction.scope)
                  }}</strong>
                </article>

                <article class="info-card">
                  <span class="info-card__label">
                    {{ t('moderation.pages.sanctions.detail.info.policy') }}
                  </span>
                  <strong class="info-card__value">{{ sanction.policyLabel }}</strong>
                </article>

                <article class="info-card">
                  <span class="info-card__label">
                    {{ t('moderation.pages.sanctions.detail.info.assignedTo') }}
                  </span>
                  <strong class="info-card__value">
                    {{ sanction.assignedTo || t('moderation.pages.common.notAssigned') }}
                  </strong>
                </article>
              </div>

              <p class="card-text">{{ sanction.note }}</p>
            </section>

            <section class="surface">
              <div class="surface-header">
                <div>
                  <h2 class="surface-title">
                    {{ t('moderation.pages.sanctions.detail.evidence.title') }}
                  </h2>
                  <p class="surface-subtitle">
                    {{ t('moderation.pages.sanctions.detail.evidence.subtitle') }}
                  </p>
                </div>
              </div>

              <div v-if="sanction.evidence.length" class="stack-list">
                <article v-for="item in sanction.evidence" :key="item.id" class="stack-item">
                  <div class="stack-item__label">{{ item.label }}</div>
                  <div class="stack-item__value">{{ item.value }}</div>
                </article>
              </div>

              <div v-else class="empty-state empty-state--compact">
                <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
                <p class="empty-state__text">
                  {{ t('moderation.pages.sanctions.detail.evidence.empty') }}
                </p>
              </div>
            </section>

            <section class="surface">
              <div class="surface-header">
                <div>
                  <h2 class="surface-title">
                    {{ t('moderation.pages.sanctions.detail.timeline.title') }}
                  </h2>
                  <p class="surface-subtitle">
                    {{ t('moderation.pages.sanctions.detail.timeline.subtitle') }}
                  </p>
                </div>
              </div>

              <div v-if="sanction.activity.length" class="timeline">
                <article
                  v-for="activity in sanction.activity"
                  :key="activity.id"
                  class="timeline-card timeline-card--dense"
                >
                  <div class="timeline-card__top">
                    <h3 class="timeline-card__title">{{ activity.actor }}</h3>
                    <span class="meta-item">{{ formatDate(activity.createdAt) }}</span>
                  </div>

                  <p class="timeline-card__text">{{ activity.message }}</p>
                </article>
              </div>

              <div v-else class="empty-state empty-state--compact">
                <h3 class="empty-state__title">{{ t('moderation.pages.common.emptyTitle') }}</h3>
                <p class="empty-state__text">
                  {{ t('moderation.pages.sanctions.detail.timeline.empty') }}
                </p>
              </div>
            </section>
          </div>

          <aside class="detail-side">
            <section class="surface">
              <div class="surface-header">
                <div>
                  <h2 class="surface-title">
                    {{ t('moderation.pages.sanctions.detail.lifecycle.title') }}
                  </h2>
                  <p class="surface-subtitle">
                    {{ t('moderation.pages.sanctions.detail.lifecycle.subtitle') }}
                  </p>
                </div>
              </div>

              <div class="stack-list">
                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.info.createdBy') }}
                  </div>
                  <div class="stack-item__value">{{ sanction.createdBy }}</div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.info.createdAt') }}
                  </div>
                  <div class="stack-item__value">{{ formatDate(sanction.createdAt) }}</div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.info.updatedAt') }}
                  </div>
                  <div class="stack-item__value">{{ formatDate(sanction.lastUpdatedAt) }}</div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.info.startAt') }}
                  </div>
                  <div class="stack-item__value">{{ formatDate(sanction.startAt) }}</div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.info.endAt') }}
                  </div>
                  <div class="stack-item__value">
                    {{
                      sanction.endAt
                        ? formatDate(sanction.endAt)
                        : t('moderation.pages.common.noEndDate')
                    }}
                  </div>
                </article>
              </div>
            </section>

            <section class="surface">
              <div class="surface-header">
                <div>
                  <h2 class="surface-title">
                    {{ t('moderation.pages.sanctions.detail.links.title') }}
                  </h2>
                  <p class="surface-subtitle">
                    {{ t('moderation.pages.sanctions.detail.links.subtitle') }}
                  </p>
                </div>
              </div>

              <div class="stack-list">
                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.links.appeals') }}
                  </div>
                  <div class="stack-item__value">{{ sanction.appealCount }}</div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.detail.links.reports') }}
                  </div>
                  <div class="stack-item__value stack-item__value--wrap">
                    <template v-if="sanction.relatedReportIds.length">
                      <span
                        v-for="reportId in sanction.relatedReportIds"
                        :key="reportId"
                        class="tag-item"
                      >
                        {{ reportId }}
                      </span>
                    </template>

                    <template v-else>
                      {{ t('moderation.pages.sanctions.detail.links.none') }}
                    </template>
                  </div>
                </article>

                <article class="stack-item">
                  <div class="stack-item__label">
                    {{ t('moderation.pages.sanctions.card.moderator') }}
                  </div>
                  <div class="stack-item__value">
                    {{ sanction.targetEmail || t('moderation.pages.common.notAssigned') }}
                  </div>
                </article>
              </div>
            </section>
          </aside>
        </section>
      </template>

      <div v-else class="empty-state">
        <h3 class="empty-state__title">{{ t('moderation.pages.sanctions.detail.emptyTitle') }}</h3>
        <p class="empty-state__text">{{ t('moderation.pages.sanctions.detail.emptyText') }}</p>

        <div class="audit-hero__actions audit-hero__actions--center">
          <button type="button" class="btn btn--primary" @click="goBackToSanctions">
            {{ t('moderation.pages.sanctions.actions.backToList') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useModerationAccess } from '@/composables/useModerationAccess'
import {
  type ModerationSanctionScope,
  type ModerationSanctionStatus,
  type ModerationSanctionType,
  type ModerationSeverity,
  useModerationSanctionsStore,
} from '@/stores/moderation'

useModerationAccess()

const route = useRoute()
const router = useRouter()
const moderationStore = useModerationSanctionsStore()
const { t, locale } = useI18n({ useScope: 'global' })

const sanctionId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? (raw[0] ?? '') : String(raw ?? '')
})

const sanction = computed(() => moderationStore.getSanctionById(sanctionId.value))

function goBackToModeration() {
  router.push('/moderation')
}

function goBackToSanctions() {
  router.push('/moderation/sanctions')
}

function getSanctionStatusLabel(status: ModerationSanctionStatus) {
  return t(`moderation.sanctionStatuses.${status}`)
}

function getSanctionTypeLabel(type: ModerationSanctionType) {
  return t(`moderation.sanctionTypes.${type}`)
}

function getSanctionScopeLabel(scope: ModerationSanctionScope) {
  return t(`moderation.sanctionScopes.${scope}`)
}

function getSeverityLabel(severity: ModerationSeverity) {
  return t(`moderation.severities.${severity}`)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>
