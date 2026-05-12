<template>
  <main v-if="map" class="moderation-page maps-detail-page">
    <div class="page-shell">
      <nav class="detail-nav">
        <RouterLink to="/maps" class="detail-nav__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          {{ t('maps.detail.backToMaps') }}
        </RouterLink>
        <span class="detail-nav__sep">/</span>
        <span class="detail-nav__current">{{ map.title }}</span>
      </nav>

      <!-- Gallery -->
      <section class="gallery-card">
        <div class="gallery__main">
          <Transition name="gallery-fade" mode="out-in">
            <img
              :key="activeIndex"
              :src="activeShot?.url"
              :alt="map.title"
              class="gallery__image"
            />
          </Transition>
          <div class="gallery__overlay">
            <div class="gallery__overlay-left">
              <div class="gallery__badges">
                <span :class="['pill', `pill--${pillStatus}`]">{{ statusLabel }}</span>
                <span class="gallery__version-badge">v{{ map.current_version_number }}</span>
                <span v-if="map.featured" class="gallery__featured-badge">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiStar" /></svg>
                  {{ t('maps.card.featured') }}
                </span>
              </div>
              <h1 class="gallery__title">{{ map.title }}</h1>
              <div class="gallery__creator-line">
                <span class="gallery__creator-avatar">{{
                  map.creator.username[0]?.toUpperCase()
                }}</span>
                {{ t('maps.card.by') }} <strong>{{ map.creator.username }}</strong>
                <span class="gallery__region">· {{ map.creator.region }}</span>
              </div>
            </div>
            <div class="gallery__overlay-right">
              <div class="gallery__score-badge">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiTrophy" /></svg>
                <span class="gallery__score-value">{{ formatNumber(map.stats.score) }}</span>
                <span class="gallery__score-label">{{ t('maps.card.score') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="gallery__thumbs">
          <button
            v-for="(ss, i) in map.screenshots"
            :key="ss.id"
            :class="['gallery__thumb', { 'is-active': activeIndex === i }]"
            @click="activeIndex = i"
          >
            <img :src="ss.url" :alt="`Screenshot ${i + 1}`" loading="lazy" />
          </button>
          <span v-if="map.screenshots.length === 0" class="gallery__no-shots">{{
            t('maps.detail.noScreenshots')
          }}</span>
        </div>
      </section>

      <!-- Actions bar -->
      <div class="detail-actions-bar">
        <div class="detail-actions-bar__votes">
          <button
            type="button"
            :class="['action-vote', { 'is-active': map.user_vote === 'like' }]"
            @click="onLike"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiThumbUp" /></svg>
            <span>{{ formatNumber(map.stats.likes_count) }}</span>
          </button>
          <button
            type="button"
            :class="[
              'action-vote',
              'action-vote--dislike',
              { 'is-active': map.user_vote === 'dislike' },
            ]"
            @click="onDislike"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiThumbDown" /></svg>
            <span>{{ formatNumber(map.stats.dislikes_count) }}</span>
          </button>
          <button
            type="button"
            :class="['action-fav', { 'is-active': map.is_favorite }]"
            @click="onFavorite"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="map.is_favorite ? mdiHeart : mdiHeartOutline" />
            </svg>
            <span>{{ formatNumber(map.stats.favorites_count) }}</span>
          </button>
          <div class="action-share-wrap">
            <button type="button" class="action-share" @click="handleShare">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiShareVariant" /></svg>
            </button>
            <Transition name="tooltip">
              <span v-if="copyTooltip" class="action-share__tooltip">{{
                t('maps.detail.linkCopied')
              }}</span>
            </Transition>
          </div>
        </div>
        <div class="detail-actions-bar__right">
          <RouterLink
            v-if="store.isMyMap(map.id)"
            :to="`/maps/${map.id}/edit`"
            class="btn btn--ghost maps-btn"
          >
            <svg viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
              <path :d="mdiPencil" />
            </svg>
            {{ t('maps.detail.edit') }}
          </RouterLink>
          <button
            type="button"
            :class="['test-btn', `test-btn--step${launchStep}`]"
            :disabled="launchStep > 0 && launchStep < 4"
            @click="handleTest"
          >
            <template v-if="launchStep === 0">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiGamepadVariant" /></svg>
              {{ t('maps.detail.testBtn.idle') }}
            </template>
            <template v-else-if="launchStep === 1 || launchStep === 2">
              <span class="test-btn__spinner" />
              {{
                launchStep === 1
                  ? t('maps.detail.testBtn.connecting')
                  : t('maps.detail.testBtn.loading')
              }}
            </template>
            <template v-else-if="launchStep === 3">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiCheck" /></svg>
              {{ t('maps.detail.testBtn.ready') }}
            </template>
          </button>
        </div>
      </div>

      <!-- Content grid -->
      <div class="detail-grid">
        <div class="detail-main">
          <!-- Description -->
          <section class="surface">
            <div class="surface-header">
              <h2 class="surface-title">{{ t('maps.detail.description') }}</h2>
            </div>
            <p class="detail-description">{{ map.description }}</p>
            <div class="detail-tags">
              <span v-for="tag in map.tags" :key="tag.id" class="tag-item">{{
                tagLabel(tag)
              }}</span>
            </div>
          </section>

          <!-- Version history -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.detail.versions') }}</h2>
                <p class="surface-subtitle">
                  {{ t('maps.detail.versionsSubtitle', { count: map.versions_count }) }}
                </p>
              </div>
            </div>
            <div class="version-timeline">
              <article
                v-for="version in [...map.versions].reverse()"
                :key="version.id"
                :class="[
                  'version-item',
                  { 'is-current': version.version_number === map.current_version_number },
                ]"
              >
                <div class="version-item__track">
                  <div class="version-item__dot" />
                  <div class="version-item__line" />
                </div>
                <div class="version-item__content">
                  <div class="version-item__header">
                    <span class="version-item__badge">v{{ version.version_number }}</span>
                    <span
                      v-if="version.version_number === map.current_version_number"
                      class="pill pill--visible version-item__current"
                      >{{ t('maps.detail.currentVersion') }}</span
                    >
                    <span class="version-item__date">{{
                      formatRelativeDate(version.created_at)
                    }}</span>
                  </div>
                  <p class="version-item__notes">{{ version.release_notes }}</p>
                </div>
              </article>
            </div>
          </section>

          <!-- ── Comments ─────────────────────────────────────────── -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.detail.comments.title') }}</h2>
                <p class="surface-subtitle">
                  {{ t('maps.detail.comments.subtitle', { count: mapComments.length }) }}
                </p>
              </div>
              <svg viewBox="0 0 24 24" class="comments-header-icon" aria-hidden="true">
                <path :d="mdiCommentText" />
              </svg>
            </div>

            <!-- Write comment -->
            <div class="comment-form">
              <div class="comment-form__avatar">V</div>
              <div class="comment-form__input-wrap">
                <textarea
                  v-model="newComment"
                  class="field comment-form__textarea"
                  :placeholder="t('maps.detail.comments.placeholder')"
                  rows="3"
                  maxlength="500"
                />
                <div class="comment-form__footer">
                  <span class="form-hint">{{ newComment.length }}/500</span>
                  <button
                    type="button"
                    class="btn btn--primary comment-submit-btn"
                    :disabled="!newComment.trim() || isPosting"
                    @click="submitComment"
                  >
                    <span v-if="isPosting" class="comment-spinner" />
                    <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiSend" /></svg>
                    {{
                      isPosting
                        ? t('maps.detail.comments.posting')
                        : t('maps.detail.comments.submit')
                    }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Comments list -->
            <TransitionGroup
              v-if="mapComments.length > 0"
              name="comment"
              tag="div"
              class="comments-list"
            >
              <article
                v-for="comment in mapComments"
                :key="comment.id"
                :class="['comment-item', { 'is-mine': comment.author.id === 'user-me' }]"
              >
                <div class="comment-item__avatar">
                  {{ comment.author.username[0]?.toUpperCase() }}
                </div>
                <div class="comment-item__body">
                  <div class="comment-item__header">
                    <span class="comment-item__author">{{ comment.author.username }}</span>
                    <span v-if="comment.author.id === 'user-me'" class="comment-item__me-badge">{{
                      t('maps.detail.comments.meBadge')
                    }}</span>
                    <span class="comment-item__date">{{
                      formatRelativeDate(comment.created_at)
                    }}</span>
                  </div>
                  <p class="comment-item__content">{{ comment.content }}</p>
                  <div class="comment-item__actions">
                    <button
                      type="button"
                      :class="['comment-like-btn', { 'is-active': comment.user_liked }]"
                      @click="store.toggleCommentLike(comment.id)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path :d="comment.user_liked ? mdiHeart : mdiHeartOutline" />
                      </svg>
                      {{ comment.likes_count }}
                    </button>
                  </div>
                </div>
              </article>
            </TransitionGroup>

            <div v-else class="comments-empty">
              <svg viewBox="0 0 24 24" class="comments-empty__icon" aria-hidden="true">
                <path :d="mdiCommentOutline" />
              </svg>
              <p class="comments-empty__text">{{ t('maps.detail.comments.emptyText') }}</p>
            </div>
          </section>

          <!-- Other maps by creator -->
          <section v-if="creatorMaps.length > 0" class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">
                  {{ t('maps.detail.byCreator', { name: map.creator.username }) }}
                </h2>
                <p class="surface-subtitle">{{ t('maps.detail.byCreatorSub') }}</p>
              </div>
            </div>
            <div class="mini-maps-grid">
              <MapCard v-for="m in creatorMaps" :key="m.id" :map="m" @view="onViewMap" />
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="detail-side">
          <section class="surface">
            <h2 class="surface-title detail-side__title">{{ t('maps.detail.stats') }}</h2>
            <div class="stat-big">
              <svg viewBox="0 0 24 24" class="stat-big__icon" aria-hidden="true">
                <path :d="mdiPlayCircle" />
              </svg>
              <div>
                <span class="stat-big__value">{{ formatNumber(map.stats.tests_count) }}</span>
                <span class="stat-big__label">{{ t('maps.detail.testCount') }}</span>
              </div>
            </div>
            <div class="like-rate">
              <div class="like-rate__bar">
                <div
                  class="like-rate__fill like-rate__fill--like"
                  :style="{ width: `${likeRate}%` }"
                />
                <div
                  class="like-rate__fill like-rate__fill--dislike"
                  :style="{ width: `${100 - likeRate}%` }"
                />
              </div>
              <div class="like-rate__labels">
                <span class="like-rate__like"
                  ><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiThumbUp" /></svg
                  >{{ likeRate }}%</span
                >
                <span class="like-rate__dislike"
                  >{{ 100 - likeRate }}%<svg viewBox="0 0 24 24" aria-hidden="true">
                    <path :d="mdiThumbDown" /></svg
                ></span>
              </div>
            </div>
            <div class="info-grid" style="margin-top: 1rem">
              <div class="info-card">
                <span class="info-card__label">{{ t('maps.detail.score') }}</span>
                <span class="info-card__value">{{ formatNumber(map.stats.score) }}</span>
              </div>
              <div class="info-card">
                <span class="info-card__label">{{ t('maps.detail.favorites') }}</span>
                <span class="info-card__value">{{ formatNumber(map.stats.favorites_count) }}</span>
              </div>
              <div class="info-card">
                <span class="info-card__label">{{ t('maps.detail.retention') }}</span>
                <span class="info-card__value">{{ retentionPct }}%</span>
              </div>
              <div class="info-card">
                <span class="info-card__label">{{ t('maps.detail.lastActivity') }}</span>
                <span class="info-card__value info-card__value--sm">{{
                  formatRelativeDate(map.stats.last_activity_at)
                }}</span>
              </div>
            </div>
          </section>

          <section class="surface">
            <h2 class="surface-title detail-side__title">{{ t('maps.detail.creator') }}</h2>
            <div class="creator-profile">
              <div class="creator-profile__avatar">
                {{ map.creator.username[0]?.toUpperCase() }}
              </div>
              <div class="creator-profile__meta">
                <div class="creator-profile__name">{{ map.creator.username }}</div>
                <div class="creator-profile__region">{{ map.creator.region }}</div>
              </div>
            </div>
            <div class="stack-list" style="margin-top: 1rem">
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.creators.mapsLabel') }}</div>
                <div class="stack-item__value">{{ map.creator.maps_count }}</div>
              </div>
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.creators.tests') }}</div>
                <div class="stack-item__value">{{ formatNumber(map.creator.total_tests) }}</div>
              </div>
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.creators.likes') }}</div>
                <div class="stack-item__value">{{ formatNumber(map.creator.total_likes) }}</div>
              </div>
            </div>
          </section>

          <section class="surface">
            <h2 class="surface-title detail-side__title">{{ t('maps.detail.infos') }}</h2>
            <div class="stack-list">
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.detail.publishedAt') }}</div>
                <div class="stack-item__value">{{ formatDate(map.created_at) }}</div>
              </div>
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.detail.updatedAt') }}</div>
                <div class="stack-item__value">{{ formatDate(map.updated_at) }}</div>
              </div>
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.detail.versionsCount') }}</div>
                <div class="stack-item__value">{{ map.versions_count }}</div>
              </div>
              <div class="stack-item">
                <div class="stack-item__label">{{ t('maps.detail.visibility') }}</div>
                <div class="stack-item__value stack-item__value--wrap">
                  <span :class="['pill', `pill--${pillStatus}`]" style="font-size: 0.72rem">{{
                    statusLabel
                  }}</span>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" :class="['toast', `toast--${toast.type}`]">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="toast.type === 'success' ? mdiCheck : mdiAlert" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </main>

  <main v-else class="moderation-page">
    <div class="page-shell">
      <div class="empty-state" style="margin-top: 2rem">
        <h3 class="empty-state__title">{{ t('maps.detail.notFound') }}</h3>
        <p class="empty-state__text">{{ t('maps.detail.notFoundText') }}</p>
        <RouterLink
          to="/maps"
          class="btn btn--primary maps-btn"
          style="margin-top: 1rem; display: inline-flex; text-decoration: none"
          >{{ t('maps.detail.backToMaps') }}</RouterLink
        >
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  mdiAlert,
  mdiArrowLeft,
  mdiCheck,
  mdiCommentOutline,
  mdiCommentText,
  mdiGamepadVariant,
  mdiHeart,
  mdiHeartOutline,
  mdiPencil,
  mdiPlayCircle,
  mdiSend,
  mdiShareVariant,
  mdiStar,
  mdiThumbDown,
  mdiThumbUp,
  mdiTrophy,
} from '@mdi/js'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import MapCard from '@/components/MapCard.vue'
import { useMapsStore } from '@/stores/mapsStore'
import type { MapTag } from '@/types/maps'

const props = defineProps<{ id: string }>()
const store = useMapsStore()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })

const map = computed(() => store.getMap(props.id))
const activeIndex = ref(0)
const activeShot = computed(() => map.value?.screenshots[activeIndex.value] ?? null)
const pillStatus = computed(() =>
  map.value?.status === 'stable' ? 'visible' : map.value?.status === 'beta' ? 'review' : 'draft',
)
const statusLabel = computed(() => t(`maps.status.${map.value?.status ?? 'draft'}`))
const likeRate = computed(() => {
  if (!map.value) return 0
  const total = map.value.stats.likes_count + map.value.stats.dislikes_count
  return total === 0 ? 0 : Math.round((map.value.stats.likes_count / total) * 100)
})
const retentionPct = computed(() => (map.value ? Math.round(map.value.stats.retention * 100) : 0))
const creatorMaps = computed(() => {
  if (!map.value) return []
  return store.visibleMaps
    .filter((m) => m.creator.id === map.value!.creator.id && m.id !== map.value!.id)
    .sort((a, b) => b.stats.score - a.stats.score)
    .slice(0, 3)
})

function onLike() {
  if (map.value) store.toggleVote(map.value.id, 'like')
}
function onDislike() {
  if (map.value) store.toggleVote(map.value.id, 'dislike')
}
function onFavorite() {
  if (map.value) store.toggleFavorite(map.value.id)
}
function onViewMap(id: string) {
  router.push(`/maps/${id}`)
}

const copyTooltip = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null
function handleShare() {
  navigator.clipboard.writeText(window.location.href).catch(() => {})
  copyTooltip.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copyTooltip.value = false
  }, 1500)
}

const launchStep = ref(0)
async function handleTest() {
  if (launchStep.value !== 0) return
  launchStep.value = 1
  await delay(900)
  launchStep.value = 2
  await delay(900)
  launchStep.value = 3
  if (map.value) store.recordTest(map.value.id)
  showToast(t('maps.detail.testRecorded'), 'success')
  await delay(2200)
  launchStep.value = 0
}
function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

/* ── Comments ───────────────────────────────────────────────── */
const newComment = ref('')
const isPosting = ref(false)
const mapComments = computed(() => (props.id ? store.getCommentsForMap(props.id) : []))

async function submitComment() {
  if (!newComment.value.trim() || isPosting.value || !map.value) return
  isPosting.value = true
  await delay(280)
  store.addComment(map.value.id, newComment.value)
  newComment.value = ''
  isPosting.value = false
}

/* ── Toast ──────────────────────────────────────────────────── */
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message: msg, type }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3200)
}

/* ── Helpers ────────────────────────────────────────────────── */
function tagLabel(tag: MapTag) {
  return locale.value === 'fr' ? tag.label_fr : tag.label_en
}
function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : n.toString()
}
function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000),
    isFr = locale.value === 'fr'
  if (days === 0) return isFr ? "aujourd'hui" : 'today'
  if (days === 1) return isFr ? 'hier' : 'yesterday'
  if (days < 7) return isFr ? `il y a ${days} jours` : `${days} days ago`
  const w = Math.floor(days / 7)
  if (days < 30) return isFr ? `il y a ${w} sem.` : `${w}w ago`
  const m = Math.floor(days / 30)
  if (days < 365) return isFr ? `il y a ${m} mois` : `${m}mo ago`
  const y = Math.floor(days / 365)
  return isFr ? `il y a ${y} an${y > 1 ? 's' : ''}` : `${y}y ago`
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.maps-detail-page {
  padding-bottom: 3rem;
}
.detail-nav {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.1rem;
  font-size: 0.9rem;
  color: rgba(252, 239, 225, 0.7);
}
.detail-nav__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(252, 239, 225, 0.85);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.16s ease;
}
.detail-nav__back:hover {
  color: var(--color-primary);
}
.detail-nav__back svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
.detail-nav__sep {
  opacity: 0.45;
}
.detail-nav__current {
  color: rgba(252, 239, 225, 0.98);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Gallery */
.gallery-card {
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.gallery__main {
  position: relative;
  aspect-ratio: 21/9;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-navy), var(--color-slate));
}
.gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.22s ease;
}
.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}
.gallery__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(24, 27, 40, 0.92) 0%,
    rgba(24, 27, 40, 0.18) 55%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1.5rem;
  gap: 1rem;
}
.gallery__overlay-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gallery__badges {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.gallery__version-badge {
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(252, 239, 225, 0.15);
  color: rgba(252, 239, 225, 0.9);
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid rgba(252, 239, 225, 0.2);
}
.gallery__featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.gallery__featured-badge svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
.gallery__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  color: rgba(252, 239, 225, 0.98);
  font-weight: 700;
  line-height: 1.05;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}
.gallery__creator-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.95rem;
}
.gallery__creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.78rem;
  flex-shrink: 0;
}
.gallery__creator-line strong {
  color: rgba(252, 239, 225, 0.98);
}
.gallery__region {
  opacity: 0.65;
}
.gallery__overlay-right {
  flex-shrink: 0;
}
.gallery__score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  background: rgba(46, 50, 68, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(252, 239, 225, 0.15);
  color: var(--color-cream);
  gap: 0.2rem;
}
.gallery__score-badge svg {
  width: 22px;
  height: 22px;
  fill: var(--color-primary);
}
.gallery__score-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}
.gallery__score-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.65;
}
.gallery__thumbs {
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(81, 96, 121, 0.3) transparent;
}
.gallery__thumb {
  flex-shrink: 0;
  width: 100px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: none;
  transition:
    border-color 0.16s ease,
    transform 0.16s ease,
    opacity 0.16s ease;
  opacity: 0.65;
}
.gallery__thumb:hover {
  opacity: 0.85;
  transform: translateY(-2px);
}
.gallery__thumb.is-active {
  border-color: var(--color-primary);
  opacity: 1;
}
.gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gallery__no-shots {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

/* Actions bar */
.detail-actions-bar {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  background: rgba(252, 239, 225, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  box-shadow: var(--shadow-md);
  flex-wrap: wrap;
}
.detail-actions-bar__votes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.detail-actions-bar__right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.action-vote,
.action-fav,
.action-share {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 14px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-ink);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}
.action-vote svg,
.action-fav svg,
.action-share svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
.action-vote:hover,
.action-fav:hover,
.action-share:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.4);
}
.action-vote.is-active {
  background: rgba(61, 191, 125, 0.18);
  color: #146c43;
  border-color: rgba(61, 191, 125, 0.35);
}
.action-vote--dislike.is-active {
  background: rgba(214, 69, 69, 0.16);
  color: #8a4040;
  border-color: rgba(214, 69, 69, 0.32);
}
.action-fav.is-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  border-color: transparent;
}
.action-share {
  padding: 0.55rem 0.7rem;
}
.action-share-wrap {
  position: relative;
}
.action-share__tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 0.32rem 0.65rem;
  border-radius: 10px;
  background: var(--color-navy);
  color: var(--color-cream);
  font-size: 0.78rem;
  font-weight: 700;
  pointer-events: none;
}
.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
.test-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1.4rem;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--color-navy), var(--color-slate));
  color: var(--color-cream);
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
  min-width: 190px;
  justify-content: center;
  box-shadow: 0 12px 26px -14px rgba(46, 50, 68, 0.5);
}
.test-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
.test-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px -14px rgba(242, 139, 91, 0.55);
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
}
.test-btn--step1,
.test-btn--step2 {
  background: linear-gradient(135deg, var(--color-slate), #394455);
  cursor: not-allowed;
  opacity: 0.85;
}
.test-btn--step3 {
  background: linear-gradient(135deg, #2d6a4f, #1b4332);
}
.test-btn__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(252, 239, 225, 0.35);
  border-top-color: var(--color-cream);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.6rem 1rem;
}
.maps-btn__icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Detail grid */
.detail-main,
.detail-side {
  display: grid;
  gap: 1rem;
  align-content: start;
}
.detail-side__title {
  margin-bottom: 1rem;
}
.detail-description {
  margin: 0;
  color: var(--color-ink);
  line-height: 1.7;
  font-size: 0.97rem;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1rem;
}

/* Versions */
.version-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.version-item {
  display: flex;
  gap: 0.9rem;
  position: relative;
}
.version-item__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 0.2rem;
}
.version-item__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(81, 96, 121, 0.25);
  border: 2px solid rgba(81, 96, 121, 0.35);
  flex-shrink: 0;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease;
}
.version-item.is-current .version-item__dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.22);
}
.version-item__line {
  width: 2px;
  flex: 1;
  background: rgba(81, 96, 121, 0.15);
  margin-top: 4px;
  min-height: 0.8rem;
}
.version-item:last-child .version-item__line {
  display: none;
}
.version-item__content {
  padding-bottom: 1.15rem;
  flex: 1;
  min-width: 0;
}
.version-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.version-item__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(46, 50, 68, 0.07);
  color: var(--color-ink);
  font-size: 0.78rem;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
}
.version-item.is-current .version-item__badge {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
}
.version-item__current {
  font-size: 0.7rem !important;
  padding: 0.2rem 0.5rem !important;
}
.version-item__date {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-left: auto;
}
.version-item__notes {
  margin: 0.45rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

/* ── Comments ──────────────────────────────────────────────── */
.comments-header-icon {
  width: 22px;
  height: 22px;
  fill: var(--color-text-muted);
  flex-shrink: 0;
}

.comment-form {
  display: flex;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(81, 96, 121, 0.1);
}
.comment-form__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.comment-form__input-wrap {
  flex: 1;
  min-width: 0;
}
.comment-form__textarea {
  width: 100%;
  resize: none;
  font-family: inherit;
  min-height: 80px;
}
.comment-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}
.form-hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}
.comment-submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.88rem;
}
.comment-submit-btn svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}
.comment-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(252, 239, 225, 0.35);
  border-top-color: var(--color-cream);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.comments-list {
  display: grid;
  gap: 0;
}

.comment-item {
  display: flex;
  gap: 0.85rem;
  padding: 1rem 0;
  border-bottom: 1px dashed rgba(81, 96, 121, 0.12);
}
.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.comment-item.is-mine {
  background: rgba(242, 139, 91, 0.05);
  margin: 0 -1.35rem;
  padding: 0.9rem 1.35rem;
  border-bottom: none;
  border-left: 3px solid rgba(242, 139, 91, 0.35);
}

.comment-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-navy), var(--color-slate));
  color: var(--color-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.comment-item.is-mine .comment-item__avatar {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
}
.comment-item__body {
  flex: 1;
  min-width: 0;
}
.comment-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.38rem;
  flex-wrap: wrap;
}
.comment-item__author {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-ink);
}
.comment-item__me-badge {
  padding: 0.14rem 0.45rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
}
.comment-item__date {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin-left: auto;
}
.comment-item__content {
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-ink);
  line-height: 1.55;
}
.comment-item__actions {
  margin-top: 0.55rem;
}

.comment-like-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.5);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.14s ease;
}
.comment-like-btn svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.comment-like-btn:hover {
  border-color: rgba(225, 91, 91, 0.35);
  color: #8a4040;
}
.comment-like-btn.is-active {
  background: rgba(225, 91, 91, 0.12);
  color: #8a4040;
  border-color: rgba(225, 91, 91, 0.32);
}

.comments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: var(--color-text-muted);
  text-align: center;
}
.comments-empty__icon {
  width: 28px;
  height: 28px;
  fill: currentColor;
  opacity: 0.4;
}
.comments-empty__text {
  margin: 0;
  font-size: 0.88rem;
}

.comment-enter-active {
  transition: all 0.25s ease;
}
.comment-leave-active {
  transition: all 0.2s ease;
}
.comment-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.comment-leave-to {
  opacity: 0;
}

/* Related maps */
.mini-maps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

/* Sidebar */
.stat-big {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(81, 96, 121, 0.1);
  margin-bottom: 0.85rem;
}
.stat-big__icon {
  width: 28px;
  height: 28px;
  fill: var(--color-primary);
  flex-shrink: 0;
}
.stat-big__value {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-ink);
  line-height: 1;
}
.stat-big__label {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}
.like-rate {
  margin-bottom: 0.5rem;
}
.like-rate__bar {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  gap: 2px;
}
.like-rate__fill {
  border-radius: 999px;
  transition: width 0.4s ease;
}
.like-rate__fill--like {
  background: #3dbf7d;
}
.like-rate__fill--dislike {
  background: #e15b5b;
}
.like-rate__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.45rem;
  font-size: 0.82rem;
  font-weight: 700;
}
.like-rate__like {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #146c43;
}
.like-rate__dislike {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #8a4040;
}
.like-rate__like svg,
.like-rate__dislike svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}
.info-card__value--sm {
  font-size: 0.88rem !important;
}
.creator-profile {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.creator-profile__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.creator-profile__name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-ink);
}
.creator-profile__region {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.8rem;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.5rem;
  border-radius: 18px;
  background: var(--color-navy);
  color: var(--color-cream);
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  z-index: 9999;
  white-space: nowrap;
}
.toast svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}
.toast--success {
  background: linear-gradient(135deg, #2d6a4f, #1b4332);
}
.toast--error {
  background: linear-gradient(135deg, #8a4040, #5e2020);
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Responsive */
@media (max-width: 1100px) {
  .gallery__main {
    aspect-ratio: 16/9;
  }
  .mini-maps-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 820px) {
  .detail-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .detail-actions-bar__right {
    justify-content: flex-end;
  }
  .mini-maps-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .gallery__overlay {
    flex-direction: column;
    align-items: flex-start;
  }
  .gallery__overlay-right {
    display: none;
  }
}
</style>
