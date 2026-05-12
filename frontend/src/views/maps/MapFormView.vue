<template>
  <main class="moderation-page maps-form-page">
    <div class="page-shell">
      <!-- ── Breadcrumb ──────────────────────────────────────────── -->
      <nav class="detail-nav">
        <RouterLink to="/maps" class="detail-nav__back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiArrowLeft" /></svg>
          {{ t('maps.detail.backToMaps') }}
        </RouterLink>
        <span class="detail-nav__sep">/</span>
        <RouterLink
          v-if="isEditMode && existingMap"
          :to="`/maps/${existingMap.id}`"
          class="detail-nav__back"
        >
          {{ existingMap.title }}
        </RouterLink>
        <span v-if="isEditMode" class="detail-nav__sep">/</span>
        <span class="detail-nav__current">
          {{ isEditMode ? t('maps.form.editTitle') : t('maps.form.createTitle') }}
        </span>
      </nav>

      <!-- ── Hero ───────────────────────────────────────────────── -->
      <header class="page-hero">
        <div>
          <span class="page-badge">{{
            isEditMode ? t('maps.form.badgeEdit') : t('maps.form.badgeCreate')
          }}</span>
          <h1 class="page-title">
            {{ isEditMode ? t('maps.form.editTitle') : t('maps.form.createTitle') }}
          </h1>
          <p v-if="isEditMode && existingMap" class="page-subtitle">
            {{ existingMap.title }} · v{{ existingMap.current_version_number }}
          </p>
          <p v-else class="page-subtitle">{{ t('maps.form.createSubtitle') }}</p>
        </div>
        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('maps.form.editorHeroLabel') }}</div>
            <div class="hero-side__title">{{ t('maps.form.editorHeroTitle') }}</div>
            <p class="hero-side__text">{{ t('maps.form.editorHeroText') }}</p>
          </div>
          <div class="hero-side__chips">
            <span v-for="bt in BLOCK_TYPES.slice(0, 4)" :key="bt.type">
              <span class="hero-chip-dot" :style="{ background: bt.color }" />
              {{ locale === 'fr' ? bt.label_fr : bt.label_en }}
            </span>
          </div>
        </aside>
      </header>

      <!-- ── 2-col layout ────────────────────────────────────────── -->
      <div class="maps-form-grid">
        <!-- ── LEFT ──────────────────────────────────────────────── -->
        <div class="form-col">
          <!-- Map info -->
          <section class="surface">
            <div class="surface-header">
              <h2 class="surface-title">{{ t('maps.form.mapInfo') }}</h2>
            </div>
            <div class="form-field">
              <label class="form-label">{{ t('maps.form.titleLabel') }} *</label>
              <input
                v-model="form.title"
                type="text"
                class="field"
                :placeholder="t('maps.form.titlePlaceholder')"
                maxlength="60"
              />
              <div class="form-row-meta">
                <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
                <span class="form-hint form-hint--right">{{ form.title.length }}/60</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">{{ t('maps.form.descLabel') }}</label>
              <textarea
                v-model="form.description"
                class="field form-textarea"
                :placeholder="t('maps.form.descPlaceholder')"
                rows="4"
                maxlength="500"
              />
              <span class="form-hint form-hint--right">{{ form.description.length }}/500</span>
            </div>
            <div class="form-field">
              <label class="form-label">{{ t('maps.form.statusLabel') }}</label>
              <select v-model="form.status" class="select">
                <option value="draft">{{ t('maps.status.draft') }}</option>
                <option value="beta">{{ t('maps.status.beta') }}</option>
                <option value="stable">{{ t('maps.status.stable') }}</option>
              </select>
            </div>
            <div v-if="isEditMode && existingMap" class="form-meta">
              <span class="form-meta__item"
                >{{ t('maps.form.currentVersionLabel') }}
                <strong>v{{ existingMap.current_version_number }}</strong></span
              >
              <span class="form-meta__item"
                >{{ t('maps.form.versionsCountLabel') }}
                <strong>{{ existingMap.versions_count }}</strong></span
              >
            </div>
          </section>

          <!-- ── Screenshots manager ─────────────────────────────── -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.form.screenshots.title') }}</h2>
                <p class="surface-subtitle">
                  {{
                    t('maps.form.screenshots.subtitle', {
                      count: realScreenshots.length,
                      max: MAX_SCREENSHOTS,
                    })
                  }}
                </p>
              </div>
              <span
                v-if="realScreenshots.length > 0"
                :class="[
                  'ss-count-badge',
                  { 'ss-count-badge--full': realScreenshots.length >= MAX_SCREENSHOTS },
                ]"
              >
                {{ realScreenshots.length }}/{{ MAX_SCREENSHOTS }}
              </span>
            </div>

            <TransitionGroup name="ss" tag="div" class="screenshots-grid">
              <div v-for="(ss, idx) in screenshots" :key="ss.id" class="ss-card">
                <div class="ss-card__thumb">
                  <div v-if="ss.isLoading" class="ss-card__shimmer">
                    <div class="ss-card__shimmer-bar" />
                  </div>
                  <img
                    v-else
                    :src="ss.url"
                    :alt="`Screenshot ${idx + 1}`"
                    class="ss-card__img"
                    loading="lazy"
                  />
                  <div v-if="!ss.isLoading" class="ss-card__overlay">
                    <span class="ss-card__pos">{{ idx + 1 }}</span>
                    <button
                      type="button"
                      class="ss-card__remove"
                      :aria-label="t('maps.form.screenshots.remove')"
                      @click.stop="removeScreenshot(ss.id)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
                    </button>
                  </div>
                </div>
                <div v-if="!ss.isLoading" class="ss-card__controls">
                  <button
                    type="button"
                    class="ss-card__arrow"
                    :disabled="idx === 0"
                    :aria-label="t('maps.form.screenshots.moveUp')"
                    @click="moveUp(idx)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiChevronUp" /></svg>
                  </button>
                  <button
                    type="button"
                    class="ss-card__arrow"
                    :disabled="idx === realScreenshots.length - 1"
                    :aria-label="t('maps.form.screenshots.moveDown')"
                    @click="moveDown(idx)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiChevronDown" /></svg>
                  </button>
                </div>
              </div>

              <!-- Add button -->
              <button
                v-if="realScreenshots.length < MAX_SCREENSHOTS"
                key="__add"
                type="button"
                class="ss-add-btn"
                :disabled="isUploading"
                @click="addScreenshot"
              >
                <div class="ss-add-btn__inner">
                  <div v-if="isUploading" class="ss-spinner" />
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiPlus" /></svg>
                  <span>{{
                    isUploading
                      ? t('maps.form.screenshots.uploading')
                      : t('maps.form.screenshots.add')
                  }}</span>
                </div>
              </button>
            </TransitionGroup>

            <p v-if="realScreenshots.length >= MAX_SCREENSHOTS" class="ss-max-notice">
              {{ t('maps.form.screenshots.maxReached', { max: MAX_SCREENSHOTS }) }}
            </p>
          </section>

          <!-- Tags -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.form.tagsLabel') }}</h2>
                <p class="surface-subtitle">
                  {{ t('maps.form.tagsSelected', { count: selectedTags.length }) }}
                </p>
              </div>
            </div>
            <div class="tags-picker">
              <button
                v-for="tag in store.tagLibrary"
                :key="tag.id"
                type="button"
                :class="['tag-btn', { 'is-selected': isTagSelected(tag) }]"
                @click="toggleTag(tag)"
              >
                {{ tagLabel(tag) }}
              </button>
            </div>
          </section>

          <!-- New version (edit mode) -->
          <section v-if="isEditMode" class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.form.newVersionTitle') }}</h2>
                <p class="surface-subtitle">{{ t('maps.form.newVersionSub') }}</p>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">{{ t('maps.form.releaseNotesLabel') }}</label>
              <textarea
                v-model="form.releaseNotes"
                class="field form-textarea"
                :placeholder="t('maps.form.releaseNotesPlaceholder')"
                rows="3"
              />
              <p class="form-hint">{{ t('maps.form.releaseNotesHint') }}</p>
            </div>
          </section>
        </div>

        <!-- ── RIGHT: grid editor ──────────────────────────────────── -->
        <div class="editor-col">
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('maps.form.editorTitle') }}</h2>
                <p class="surface-subtitle">{{ t('maps.form.editorSub') }}</p>
              </div>
              <button type="button" class="btn-inline btn-inline--secondary" @click="randomize">
                <svg
                  viewBox="0 0 24 24"
                  style="width: 16px; height: 16px; fill: currentColor; margin-right: 0.35rem"
                  aria-hidden="true"
                >
                  <path :d="mdiShuffle" />
                </svg>
                {{ t('maps.form.randomize') }}
              </button>
            </div>

            <div class="block-toolbar">
              <button
                v-for="bt in BLOCK_TYPES"
                :key="bt.type"
                type="button"
                :class="['block-btn', { 'is-active': selectedBlock === bt.type }]"
                @click="selectedBlock = bt.type"
              >
                <span
                  class="block-btn__swatch"
                  :style="
                    bt.type === 'empty'
                      ? 'background:transparent;border:1.5px dashed rgba(81,96,121,0.4)'
                      : `background:${bt.color}`
                  "
                />
                {{ locale === 'fr' ? bt.label_fr : bt.label_en }}
              </button>
            </div>

            <div class="map-grid" @mouseleave="isDragging = false" @mouseup="isDragging = false">
              <div v-for="(row, y) in grid" :key="y" class="map-grid__row">
                <div
                  v-for="(cell, x) in row"
                  :key="x"
                  :class="['map-grid__cell', `map-grid__cell--${cell}`]"
                  @mousedown.prevent="startDrawing(x, y)"
                  @mouseover="continueDrawing(x, y)"
                />
              </div>
            </div>

            <div class="editor-stats">
              <span
                v-for="bt in BLOCK_TYPES.filter((b) => b.type !== 'empty')"
                :key="bt.type"
                class="editor-stat"
              >
                <span class="editor-stat__dot" :style="{ background: bt.color }" />
                {{ blockCounts[bt.type] }}
                {{ locale === 'fr' ? bt.label_fr.toLowerCase() : bt.label_en.toLowerCase() }}s
              </span>
              <span class="editor-stat editor-stat--total">
                {{ GRID_SIZE * GRID_SIZE - blockCounts.empty }} {{ t('maps.form.blocksTotal') }}
              </span>
            </div>
          </section>

          <section class="surface">
            <div class="surface-header json-header" @click="jsonExpanded = !jsonExpanded">
              <div>
                <h2 class="surface-title">{{ t('maps.form.jsonPreview') }}</h2>
                <p class="surface-subtitle">
                  {{ mapJson.blocks.length }} {{ t('maps.form.jsonBlocks') }}
                </p>
              </div>
              <svg
                viewBox="0 0 24 24"
                class="json-toggle-icon"
                :class="{ 'is-open': jsonExpanded }"
                aria-hidden="true"
              >
                <path :d="mdiChevronDown" />
              </svg>
            </div>
            <Transition name="collapse">
              <div v-if="jsonExpanded">
                <pre class="json-preview">{{ JSON.stringify(mapJson, null, 2) }}</pre>
              </div>
            </Transition>
          </section>
        </div>
      </div>

      <!-- ── Submit bar ──────────────────────────────────────────── -->
      <div class="form-actions">
        <RouterLink to="/maps" class="btn btn--ghost maps-btn">{{
          t('maps.form.cancel')
        }}</RouterLink>
        <button
          type="button"
          class="btn btn--primary maps-btn"
          :disabled="isSaving"
          @click="handleSubmit"
        >
          <span v-if="isSaving" class="btn-spinner" />
          <svg v-else viewBox="0 0 24 24" class="maps-btn__icon" aria-hidden="true">
            <path :d="mdiContentSave" />
          </svg>
          {{
            isSaving
              ? t('maps.form.saving')
              : isEditMode
                ? t('maps.form.saveEdit')
                : t('maps.form.saveCreate')
          }}
        </button>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" :class="['toast', `toast--${toast.type}`]">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiCheck" /></svg>
        {{ toast.message }}
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiCheck,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiContentSave,
  mdiPlus,
  mdiShuffle,
} from '@mdi/js'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import { useMapsStore } from '@/stores/mapsStore'
import type { MapStatus, MapTag } from '@/types/maps'

const props = defineProps<{ id?: string }>()
const store = useMapsStore()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })

const isEditMode = computed(() => !!props.id)
const existingMap = computed(() => (props.id ? store.getMap(props.id) : null))

/* ── Form ─────────────────────────────────────────────────────── */
const form = reactive({
  title: '',
  description: '',
  status: 'draft' as MapStatus,
  releaseNotes: '',
})
const errors = reactive({ title: '' })
const selectedTags = ref<MapTag[]>([])

function tagLabel(tag: MapTag) {
  return locale.value === 'fr' ? tag.label_fr : tag.label_en
}
function isTagSelected(tag: MapTag) {
  return selectedTags.value.some((t) => t.id === tag.id)
}
function toggleTag(tag: MapTag) {
  const idx = selectedTags.value.findIndex((t) => t.id === tag.id)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(tag)
}

/* ── Screenshots ──────────────────────────────────────────────── */
interface DraftSS {
  id: string
  url: string
  position: number
  isLoading: boolean
}
const MAX_SCREENSHOTS = 5
const screenshots = ref<DraftSS[]>([])
const isUploading = ref(false)
const realScreenshots = computed(() => screenshots.value.filter((s) => !s.isLoading))

async function addScreenshot() {
  if (realScreenshots.value.length >= MAX_SCREENSHOTS || isUploading.value) return
  isUploading.value = true
  const tempId = `loading-${Date.now()}`
  screenshots.value.push({
    id: tempId,
    url: '',
    position: screenshots.value.length,
    isLoading: true,
  })
  await new Promise((r) => setTimeout(r, 700))
  const seed = `gamedash-upload-${Date.now()}-${Math.floor(Math.random() * 99999)}`
  const idx = screenshots.value.findIndex((s) => s.id === tempId)
  if (idx >= 0)
    screenshots.value[idx] = {
      id: `ss-${Date.now()}`,
      url: `https://picsum.photos/seed/${seed}/960/540`,
      position: idx,
      isLoading: false,
    }
  isUploading.value = false
}

function removeScreenshot(id: string) {
  screenshots.value = screenshots.value
    .filter((s) => s.id !== id)
    .map((s, i) => ({ ...s, position: i }))
}

function moveUp(idx: number) {
  if (idx === 0) return
  const arr = [...screenshots.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!]
  screenshots.value = arr.map((s, i) => ({ ...s, position: i }))
}

function moveDown(idx: number) {
  if (idx >= realScreenshots.value.length - 1) return
  const arr = [...screenshots.value]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!]
  screenshots.value = arr.map((s, i) => ({ ...s, position: i }))
}

function setCell(x: number, y: number) {
  if (grid[y] && x >= 0 && x < GRID_SIZE) {
    grid[y]![x] = selectedBlock.value
  }
}

function startDrawing(x: number, y: number) {
  isDragging.value = true
  setCell(x, y)
}

function continueDrawing(x: number, y: number) {
  if (!isDragging.value) return
  setCell(x, y)
}

/* ── Grid editor ──────────────────────────────────────────────── */
const GRID_SIZE = 14
type BlockType = 'empty' | 'wall' | 'floor' | 'spawn' | 'objective'
const BLOCK_TYPES: { type: BlockType; label_fr: string; label_en: string; color: string }[] = [
  { type: 'wall', label_fr: 'Mur', label_en: 'Wall', color: '#2e3244' },
  { type: 'floor', label_fr: 'Sol', label_en: 'Floor', color: '#e8d5c4' },
  { type: 'spawn', label_fr: 'Apparition', label_en: 'Spawn', color: '#3dbf7d' },
  { type: 'objective', label_fr: 'Objectif', label_en: 'Objective', color: '#f28b5b' },
  { type: 'empty', label_fr: 'Effacer', label_en: 'Erase', color: 'transparent' },
]

const grid = reactive<BlockType[][]>(
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): BlockType => 'empty'),
  ),
)
const selectedBlock = ref<BlockType>('wall')
const isDragging = ref(false)

function makeMulberry(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function applyTemplate(r: (() => number) | null) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const border = x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1

      if (border) {
        grid[y]![x] = 'wall'
      } else if (r) {
        const v = r()

        if (v < 0.22) {
          grid[y]![x] = 'wall'
        } else if (v < 0.52) {
          grid[y]![x] = 'floor'
        } else {
          grid[y]![x] = 'empty'
        }
      } else {
        grid[y]![x] = 'empty'
      }
    }
  }

  grid[1]![1] = 'spawn'
  grid[GRID_SIZE - 2]![GRID_SIZE - 2] = 'spawn'

  if (r) {
    grid[1]![GRID_SIZE - 2] = 'spawn'
    grid[GRID_SIZE - 2]![1] = 'spawn'
  }

  const mid = Math.floor(GRID_SIZE / 2)
  grid[mid]![mid] = 'objective'
}

function randomize() {
  applyTemplate(makeMulberry(Math.floor(Math.random() * 999_999)))
}

const blockCounts = computed(() => {
  const c: Record<BlockType, number> = {
    empty: 0,
    wall: 0,
    floor: 0,
    spawn: 0,
    objective: 0,
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      c[grid[y]![x]!]++
    }
  }

  return c
})

const mapJson = computed(() => {
  const blocks: { x: number; y: number; type: BlockType; rotation: number }[] = []

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const block = grid[y]![x]!

      if (block !== 'empty') {
        blocks.push({
          x,
          y,
          type: block,
          rotation: 0,
        })
      }
    }
  }

  return {
    blocks,
    grid_size: GRID_SIZE,
    version: 1,
  }
})

const jsonExpanded = ref(false)

/* ── Save ─────────────────────────────────────────────────────── */
const isSaving = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message: msg, type }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3200)
}

async function handleSubmit() {
  errors.title = ''
  if (!form.title.trim()) {
    errors.title = t('maps.form.titleRequired')
    return
  }
  isSaving.value = true
  await new Promise((r) => setTimeout(r, 750))
  const ssPayload = realScreenshots.value.map((s) => ({ url: s.url, position: s.position }))
  if (isEditMode.value && existingMap.value) {
    store.updateMap(existingMap.value.id, {
      title: form.title,
      description: form.description,
      status: form.status,
      tags: selectedTags.value,
      releaseNotes: form.releaseNotes.trim() || undefined,
      screenshots: ssPayload,
    })
    isSaving.value = false
    showToast(t('maps.form.savedSuccess'))
    await new Promise((r) => setTimeout(r, 1100))
    router.push(`/maps/${existingMap.value.id}`)
  } else {
    const newId = store.createMap({
      title: form.title,
      description: form.description,
      status: form.status,
      tags: selectedTags.value,
      screenshots: ssPayload,
    })
    isSaving.value = false
    showToast(t('maps.form.createdSuccess'))
    await new Promise((r) => setTimeout(r, 1100))
    router.push(`/maps/${newId}`)
  }
}

/* ── Init ─────────────────────────────────────────────────────── */
onMounted(() => {
  window.scrollTo({ top: 0 })
  const seed = props.id ? parseInt(props.id.replace(/\D/g, '') || '42') : 0
  applyTemplate(seed > 0 ? makeMulberry(seed) : null)
  if (isEditMode.value && existingMap.value) {
    form.title = existingMap.value.title
    form.description = existingMap.value.description
    form.status = existingMap.value.status
    selectedTags.value = [...existingMap.value.tags]
    screenshots.value = [...existingMap.value.screenshots]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ id: s.id, url: s.url, position: s.position, isLoading: false }))
  }
})
</script>

<style scoped>
.maps-form-page {
  padding-bottom: 3rem;
}

/* Breadcrumb */
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
  opacity: 0.4;
}
.detail-nav__current {
  color: rgba(252, 239, 225, 0.98);
  font-weight: 700;
}

/* Hero chip */
.hero-chip-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 0.3rem;
  vertical-align: middle;
}

/* Layout */
.maps-form-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(370px, 1.15fr);
  gap: 1.2rem;
  margin-top: 1.4rem;
  align-items: start;
}
.form-col,
.editor-col {
  display: grid;
  gap: 1rem;
  align-content: start;
}

/* Form fields */
.form-field {
  margin-top: 1rem;
}
.form-field:first-of-type {
  margin-top: 0;
}
.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 0.45rem;
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}
.form-row-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.3rem;
}
.form-error {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-danger);
}
.form-hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}
.form-hint--right {
  margin-left: auto;
  text-align: right;
}
.form-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(81, 96, 121, 0.18);
}
.form-meta__item {
  font-size: 0.84rem;
  color: var(--color-text-muted);
  display: flex;
  gap: 0.35rem;
}
.form-meta__item strong {
  color: var(--color-ink);
  font-weight: 800;
}

/* ── Screenshot manager ─────────────────────────────────────── */
.ss-count-badge {
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(81, 96, 121, 0.1);
  color: var(--color-ink);
  font-size: 0.78rem;
  font-weight: 800;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.ss-count-badge--full {
  background: rgba(242, 139, 91, 0.15);
  color: var(--color-primary);
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  position: relative;
}

.ss-card {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.ss-card__thumb {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-navy), var(--color-slate));
}
.ss-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.ss-card:hover .ss-card__img {
  transform: scale(1.05);
}

.ss-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.45rem;
  background: rgba(0, 0, 0, 0);
  opacity: 0;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}
.ss-card:hover .ss-card__overlay {
  background: rgba(0, 0, 0, 0.42);
  opacity: 1;
}

.ss-card__pos {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: rgba(46, 50, 68, 0.82);
  color: var(--color-cream);
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ss-card__remove {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(214, 69, 69, 0.88);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.14s ease,
    transform 0.14s ease;
  flex-shrink: 0;
}
.ss-card__remove:hover {
  background: #e15b5b;
  transform: scale(1.1);
}
.ss-card__remove svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.ss-card__shimmer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.ss-card__shimmer-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(81, 96, 121, 0.12) 25%,
    rgba(81, 96, 121, 0.26) 50%,
    rgba(81, 96, 121, 0.12) 75%
  );
  background-size: 400px 100%;
  animation: shimmer 1.2s infinite ease-in-out;
}
@keyframes shimmer {
  from {
    background-position: -300px 0;
  }
  to {
    background-position: 300px 0;
  }
}

.ss-card__controls {
  display: flex;
  gap: 0.3rem;
}
.ss-card__arrow {
  flex: 1;
  padding: 0.28rem 0;
  border-radius: 8px;
  border: 1px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.55);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.14s ease;
}
.ss-card__arrow svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
.ss-card__arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-ink);
  border-color: rgba(242, 139, 91, 0.4);
}
.ss-card__arrow:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.ss-add-btn {
  aspect-ratio: 16/9;
  border-radius: 12px;
  border: 2px dashed rgba(81, 96, 121, 0.22);
  background: rgba(255, 255, 255, 0.38);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-bottom: calc(0.38rem + 26px);
}
.ss-add-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: rgba(242, 139, 91, 0.07);
  transform: translateY(-2px);
}
.ss-add-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.ss-add-btn__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
  color: var(--color-text-muted);
  pointer-events: none;
}
.ss-add-btn__inner svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}
.ss-add-btn__inner span {
  font-size: 0.78rem;
  font-weight: 700;
}

.ss-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(81, 96, 121, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.ss-max-notice {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  text-align: center;
}

/* TransitionGroup */
.ss-move {
  transition: transform 0.28s ease;
}
.ss-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}
.ss-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.ss-enter-from,
.ss-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* Tags */
.tags-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag-btn {
  padding: 0.32rem 0.65rem;
  border-radius: 999px;
  border: 1.5px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.55);
  color: var(--color-ink);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s ease;
}
.tag-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.4);
}
.tag-btn.is-selected {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-cream);
  border-color: transparent;
}

/* Block toolbar */
.block-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}
.block-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.4rem 0.75rem;
  border-radius: 12px;
  border: 2px solid rgba(81, 96, 121, 0.18);
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-ink);
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    border-color 0.14s ease,
    background-color 0.14s ease;
}
.block-btn.is-active {
  border-color: var(--color-primary);
  background: rgba(242, 139, 91, 0.1);
}
.block-btn__swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Grid */
.map-grid {
  display: inline-grid;
  grid-template-rows: repeat(14, 24px);
  user-select: none;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(81, 96, 121, 0.2);
  cursor: crosshair;
  box-shadow: var(--shadow-sm);
}
.map-grid__row {
  display: flex;
}
.map-grid__cell {
  width: 24px;
  height: 24px;
  border: 0.5px solid rgba(81, 96, 121, 0.06);
  cursor: crosshair;
  transition: opacity 0.08s ease;
  box-sizing: border-box;
}
.map-grid__cell:hover {
  opacity: 0.72;
}
.map-grid__cell--empty {
  background: rgba(81, 96, 121, 0.06);
}
.map-grid__cell--wall {
  background: #2e3244;
}
.map-grid__cell--floor {
  background: #e8d5c4;
}
.map-grid__cell--spawn {
  background: #3dbf7d;
}
.map-grid__cell--objective {
  background: #f28b5b;
}

/* Editor stats */
.editor-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;
}
.editor-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.28rem 0.6rem;
  border-radius: 8px;
  background: rgba(81, 96, 121, 0.08);
  color: var(--color-text-muted);
  font-size: 0.76rem;
  font-weight: 700;
}
.editor-stat--total {
  background: rgba(46, 50, 68, 0.07);
  color: var(--color-ink);
}
.editor-stat__dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* JSON */
.json-header {
  cursor: pointer;
}
.json-toggle-icon {
  width: 22px;
  height: 22px;
  fill: var(--color-text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.json-toggle-icon.is-open {
  transform: rotate(180deg);
}
.json-preview {
  margin-top: 0.85rem;
  background: rgba(46, 50, 68, 0.92);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  overflow: auto;
  max-height: 220px;
  font-family: 'Courier New', monospace;
  font-size: 0.74rem;
  color: rgba(252, 239, 225, 0.85);
  line-height: 1.55;
  white-space: pre;
}
.collapse-enter-active,
.collapse-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Submit */
.form-actions {
  margin-top: 1.4rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}
.maps-btn__icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Spinner / Toast */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(252, 239, 225, 0.35);
  border-top-color: var(--color-cream);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

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
@media (max-width: 960px) {
  .maps-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
