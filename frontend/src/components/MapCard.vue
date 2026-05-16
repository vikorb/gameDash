<template>
  <article class="map-card" @click="onView">
    <div class="map-card__media">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="map.title"
        class="map-card__image"
        loading="lazy"
      />
      <div v-else class="map-card__image map-card__image--placeholder" />

      <div class="map-card__overlay">
        <span :class="['pill', `pill--${pillStatus}`]">{{ statusLabel }}</span>
        <span v-if="map.featured" class="map-card__featured">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiStar" />
          </svg>
          {{ t('maps.card.featured') }}
        </span>
      </div>

      <div class="map-card__score">
        <span class="map-card__score-value">{{ formatNumber(map.stats.score) }}</span>
        <span class="map-card__score-label">{{ t('maps.card.score') }}</span>
      </div>
    </div>

    <div class="map-card__body">
      <header class="map-card__head">
        <h3 class="map-card__title">{{ map.title }}</h3>
        <span class="map-card__version">v{{ map.current_version_number }}</span>
      </header>

      <div class="map-card__creator">
        <span class="map-card__creator-avatar">
          {{ map.creator.username.charAt(0).toUpperCase() }}
        </span>
        <span class="map-card__creator-name">
          {{ t('maps.card.by') }} <strong>{{ map.creator.username }}</strong>
        </span>
        <span class="map-card__region">· {{ map.creator.region }}</span>
      </div>

      <div class="map-card__tags">
        <span v-for="tag in displayedTags" :key="tag.id" class="map-card__tag">
          {{ tagLabel(tag) }}
        </span>
        <span v-if="hiddenTagsCount > 0" class="map-card__tag map-card__tag--muted">
          +{{ hiddenTagsCount }}
        </span>
      </div>

      <div class="map-card__stats">
        <span class="map-card__stat" :title="t('maps.card.tests')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiPlayCircle" />
          </svg>
          {{ formatNumber(map.stats.tests_count) }}
        </span>
        <span class="map-card__stat" :title="t('maps.card.likeRate')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiThumbUp" />
          </svg>
          {{ likeRate }}%
        </span>
        <span class="map-card__stat" :title="t('maps.card.favorites')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="mdiHeart" />
          </svg>
          {{ formatNumber(map.stats.favorites_count) }}
        </span>
      </div>
    </div>

    <footer class="map-card__actions" @click.stop>
      <button
        type="button"
        :class="['map-card__icon-btn', { 'is-active': map.user_vote === 'like' }]"
        :aria-label="t('maps.card.like')"
        @click="onLike"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="mdiThumbUp" />
        </svg>
      </button>
      <button
        type="button"
        :class="[
          'map-card__icon-btn',
          'map-card__icon-btn--dislike',
          { 'is-active': map.user_vote === 'dislike' },
        ]"
        :aria-label="t('maps.card.dislike')"
        @click="onDislike"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="mdiThumbDown" />
        </svg>
      </button>
      <button
        type="button"
        :class="['map-card__icon-btn', 'map-card__icon-btn--fav', { 'is-active': map.is_favorite }]"
        :aria-label="t('maps.card.favorite')"
        @click="onFavorite"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="map.is_favorite ? mdiHeart : mdiHeartOutline" />
        </svg>
      </button>
      <button type="button" class="map-card__cta" @click="onView">
        {{ t('maps.card.view') }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import {
  mdiHeart,
  mdiHeartOutline,
  mdiPlayCircle,
  mdiStar,
  mdiThumbDown,
  mdiThumbUp,
} from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useMapsStore } from '@/stores/mapsStore'
import type { MapItem, MapTag } from '@/types/maps'

const props = defineProps<{ map: MapItem }>()
const emit = defineEmits<{ view: [id: string] }>()

const { t, locale } = useI18n({ useScope: 'global' })
const mapsStore = useMapsStore()

const thumbnail = computed(() => props.map.screenshots[0]?.url ?? null)

const pillStatus = computed(() => {
  if (props.map.status === 'stable') return 'visible'
  if (props.map.status === 'beta') return 'review'
  return 'draft'
})

const statusLabel = computed(() => t(`maps.status.${props.map.status}`))

const displayedTags = computed(() => props.map.tags.slice(0, 3))
const hiddenTagsCount = computed(() => Math.max(0, props.map.tags.length - 3))

const likeRate = computed(() => {
  const total = props.map.stats.likes_count + props.map.stats.dislikes_count
  if (total === 0) return 0
  return Math.round((props.map.stats.likes_count / total) * 100)
})

function tagLabel(tag: MapTag) {
  return locale.value === 'fr' ? tag.label_fr : tag.label_en
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return n.toString()
}

function onView() {
  emit('view', props.map.id)
}

function onLike() {
  mapsStore.toggleVote(props.map.id, 'like')
}

function onDislike() {
  mapsStore.toggleVote(props.map.id, 'dislike')
}

function onFavorite() {
  mapsStore.toggleFavorite(props.map.id)
}
</script>

<style scoped>
.map-card {
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.92), rgba(46, 50, 68, 0.96)), var(--color-navy);
  border: 1px solid rgba(252, 239, 225, 0.12);
  border-radius: 24px;
  box-shadow: 0 18px 42px -26px rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  color: var(--color-cream);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.map-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.85);
  border-color: rgba(242, 139, 91, 0.45);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.98), rgba(46, 50, 68, 1)), var(--color-navy);
}

.map-card__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(242, 139, 91, 0.24), transparent 38%),
    linear-gradient(135deg, #202637, var(--color-navy) 45%, var(--color-slate));
}

.map-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.4s ease,
    opacity 0.22s ease,
    filter 0.22s ease;
}

.map-card:hover .map-card__image {
  transform: scale(1.04);
  filter: saturate(1.08) contrast(1.04);
}

.map-card__image--placeholder {
  background:
    radial-gradient(circle at 25% 20%, rgba(242, 139, 91, 0.28), transparent 34%),
    linear-gradient(135deg, #202637, var(--color-navy), var(--color-slate));
}

.map-card__overlay {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  right: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  pointer-events: none;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.34rem 0.68rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background: rgba(18, 24, 38, 0.72);
  backdrop-filter: blur(8px);
  color: var(--color-cream);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 26px -18px rgba(0, 0, 0, 0.8);
}

.pill--visible {
  background: rgba(242, 139, 91, 0.22);
  color: var(--color-cream);
  border-color: rgba(242, 139, 91, 0.45);
}

.pill--review {
  background: rgba(247, 167, 132, 0.18);
  color: var(--color-cream);
  border-color: rgba(247, 167, 132, 0.4);
}

.pill--draft {
  background: rgba(81, 96, 121, 0.72);
  color: rgba(252, 239, 225, 0.82);
  border-color: rgba(252, 239, 225, 0.12);
}

.map-card__featured {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.34rem 0.65rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 12px 28px -14px rgba(242, 139, 91, 0.85);
}

.map-card__featured svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.map-card__score {
  position: absolute;
  right: 0.85rem;
  bottom: 0.85rem;
  background: rgba(18, 24, 38, 0.82);
  backdrop-filter: blur(8px);
  color: var(--color-cream);
  padding: 0.48rem 0.68rem;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
  border: 1px solid rgba(252, 239, 225, 0.14);
  box-shadow: 0 14px 28px -20px rgba(0, 0, 0, 0.8);
}

.map-card__score-value {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--color-primary-strong);
}

.map-card__score-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(252, 239, 225, 0.68);
  margin-top: 0.18rem;
}

.map-card__body {
  padding: 1rem 1.05rem 0.6rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.map-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.map-card__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--color-cream);
  line-height: 1.2;
}

.map-card__version {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.38);
  color: rgba(252, 239, 225, 0.78);
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.map-card__creator {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  color: rgba(252, 239, 225, 0.7);
  min-width: 0;
}

.map-card__creator-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.78rem;
  flex-shrink: 0;
  box-shadow: 0 8px 18px -12px rgba(242, 139, 91, 0.95);
}

.map-card__creator-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-card__creator-name strong {
  color: var(--color-cream);
}

.map-card__region {
  font-size: 0.74rem;
  color: rgba(252, 239, 225, 0.56);
}

.map-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.32rem;
}

.map-card__tag {
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.84);
  border: 1px solid rgba(252, 239, 225, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
}

.map-card__tag--muted {
  background: transparent;
  color: rgba(252, 239, 225, 0.58);
  border: 1px dashed rgba(252, 239, 225, 0.22);
}

.map-card__stats {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-top: 0.55rem;
  border-top: 1px dashed rgba(252, 239, 225, 0.14);
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.84rem;
  font-weight: 800;
}

.map-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
}

.map-card__stat svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  color: var(--color-primary-strong);
  opacity: 0.9;
}

.map-card__actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.05rem 1rem;
}

.map-card__icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.76);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.map-card__icon-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.map-card__icon-btn:hover {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.16);
  border-color: rgba(242, 139, 91, 0.38);
  box-shadow: 0 10px 22px -18px rgba(242, 139, 91, 0.8);
}

.map-card__icon-btn.is-active {
  background: rgba(242, 139, 91, 0.22);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.45);
}

.map-card__icon-btn--dislike.is-active {
  background: rgba(225, 91, 91, 0.18);
  color: #ff9a9a;
  border-color: rgba(225, 91, 91, 0.38);
}

.map-card__icon-btn--fav.is-active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: transparent;
  box-shadow: 0 12px 24px -18px rgba(242, 139, 91, 0.9);
}

.map-card__cta {
  margin-left: auto;
  padding: 0.58rem 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(242, 139, 91, 0.38);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  font-weight: 900;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 12px 26px -18px rgba(242, 139, 91, 0.9);
  transition:
    transform 0.16s ease,
    filter 0.16s ease,
    box-shadow 0.16s ease;
}

.map-card__cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 16px 30px -18px rgba(242, 139, 91, 1);
}

@media (max-width: 520px) {
  .map-card__body {
    padding: 0.9rem 0.9rem 0.55rem;
  }

  .map-card__actions {
    padding: 0.65rem 0.9rem 0.9rem;
  }

  .map-card__stats {
    gap: 0.65rem;
  }

  .map-card__cta {
    padding-inline: 0.78rem;
  }
}
</style>
