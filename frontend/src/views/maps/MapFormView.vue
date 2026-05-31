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
                      ? 'background:rgba(81,96,121,0.28);border:1.5px dashed rgba(252,239,225,0.55)'
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
import type { GridData, MapItem, MapStatus, MapTag } from '@/types/maps'

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
  { type: 'wall', label_fr: 'Mur', label_en: 'Wall', color: '#111827' },
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

function applyGridData(data: GridData | null | undefined) {
  applyTemplate(null)
  if (!data?.blocks?.length) return

  for (const block of data.blocks) {
    if (grid[block.y] && block.x >= 0 && block.x < GRID_SIZE) {
      grid[block.y]![block.x] = block.type
    }
  }
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

const mapJson = computed<GridData>(() => {
  const blocks: GridData['blocks'] = []

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

  try {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      tags: selectedTags.value,
      screenshots: realScreenshots.value.map((s, position) => ({ url: s.url, position })),
      gridData: mapJson.value,
      releaseNotes: form.releaseNotes.trim() || undefined,
    }

    if (isEditMode.value && existingMap.value) {
      const updated = await store.updateMap(existingMap.value.id, payload)
      showToast(t('maps.form.savedSuccess'))
      await new Promise((r) => setTimeout(r, 650))
      router.push(`/maps/${updated.id}`)
    } else {
      const created = await store.createMap(payload)
      showToast(t('maps.form.createdSuccess'))
      await new Promise((r) => setTimeout(r, 650))
      router.push(`/maps/${created.id}`)
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : t('maps.form.saveError'), 'error')
  } finally {
    isSaving.value = false
  }
}

function hydrateForm(map: MapItem) {
  form.title = map.title
  form.description = map.description
  form.status = map.status
  selectedTags.value = [...map.tags]
  screenshots.value = [...map.screenshots]
    .sort((a, b) => a.position - b.position)
    .map((s, position) => ({ id: String(s.id), url: s.url, position, isLoading: false }))
  applyGridData(map.grid_data)
}

/* ── Init ─────────────────────────────────────────────────────── */
onMounted(async () => {
  window.scrollTo({ top: 0 })
  await store.loadMaps()

  if (isEditMode.value && props.id) {
    const map = existingMap.value ?? (await store.loadMapDetail(props.id))
    hydrateForm(map)
  } else {
    applyTemplate(null)
  }
})
</script>

<style scoped>
.maps-form-page {
  padding-bottom: 3rem;
  color: var(--color-cream);
}

/* ── Layout ─────────────────────────────────────────────── */
.page-shell {
  width: min(1440px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 3rem;
}

/* ── Breadcrumb ──────────────────────────────────────────── */
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
  font-weight: 800;
  transition:
    color 0.16s ease,
    transform 0.16s ease;
}

.detail-nav__back:hover {
  color: var(--color-primary-strong);
  transform: translateX(-2px);
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
  color: var(--color-cream);
  font-weight: 900;
}

/* ── Hero ───────────────────────────────────────────────── */
.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 1.25rem;
  align-items: stretch;
  margin-bottom: 1.35rem;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  overflow: hidden;
  position: relative;
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

.page-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: 0.75rem;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3.3rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.85rem 0 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 1rem;
  line-height: 1.65;
}

.hero-side {
  min-height: 100%;
  padding: 1.15rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.2), transparent 38%),
    rgba(18, 24, 38, 0.38);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.15;
}

.hero-side__text {
  margin: 0.55rem 0 0;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.88rem;
  line-height: 1.55;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.hero-side__chips span {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
  font-size: 0.74rem;
  font-weight: 800;
}

.hero-chip-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 0.3rem;
  vertical-align: middle;
  box-shadow: 0 0 0 1px rgba(252, 239, 225, 0.12);
}

/* ── Main form grid ──────────────────────────────────────── */
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

/* ── Surface ─────────────────────────────────────────────── */
.surface {
  padding: 1.15rem;
  border-radius: 28px;
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
  margin-bottom: 1rem;
}

.surface-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.surface-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.88rem;
  line-height: 1.55;
}

/* ── Buttons / Inputs ────────────────────────────────────── */
.btn,
.btn-inline {
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease,
    filter 0.16s ease;
}

.btn {
  min-height: 42px;
  padding: 0.7rem 1rem;
  font-size: 0.88rem;
}

.btn-inline {
  min-height: 36px;
  padding: 0.48rem 0.82rem;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover:not(:disabled),
.btn-inline:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-inline:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn--primary,
.btn-inline--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.btn-inline--primary:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 20px 36px -20px rgba(242, 139, 91, 1);
}

.btn--ghost,
.btn-inline--secondary {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover,
.btn-inline--secondary:hover {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
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

.field,
.select {
  width: 100%;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.field {
  padding: 0.82rem 0.9rem;
}

.select {
  padding: 0 0.85rem;
  cursor: pointer;
}

.field::placeholder {
  color: rgba(252, 239, 225, 0.42);
}

.field:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

/* ── Form fields ─────────────────────────────────────────── */
.form-field {
  margin-top: 1rem;
}

.form-field:first-of-type {
  margin-top: 0;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.68);
  margin-bottom: 0.45rem;
}

.form-textarea {
  resize: vertical;
  min-height: 84px;
  font-family: inherit;
  line-height: 1.55;
}

.form-row-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 0.35rem;
}

.form-error {
  font-size: 0.8rem;
  font-weight: 900;
  color: #ff9a9a;
}

.form-hint {
  font-size: 0.76rem;
  color: rgba(252, 239, 225, 0.5);
}

.form-hint--right {
  margin-left: auto;
  text-align: right;
}

.form-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(252, 239, 225, 0.14);
}

.form-meta__item {
  display: flex;
  gap: 0.35rem;
  padding: 0.38rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.82rem;
  font-weight: 800;
}

.form-meta__item strong {
  color: var(--color-primary-strong);
  font-weight: 900;
}

/* ── Screenshot manager ──────────────────────────────────── */
.ss-count-badge {
  padding: 0.32rem 0.68rem;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.82);
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.78rem;
  font-weight: 900;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.ss-count-badge--full {
  background: rgba(242, 139, 91, 0.18);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.32);
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
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(242, 139, 91, 0.22), transparent 36%),
    linear-gradient(135deg, #202637, var(--color-navy), var(--color-slate));
  border: 1px solid rgba(252, 239, 225, 0.08);
}

.ss-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 0.3s ease,
    filter 0.2s ease;
}

.ss-card:hover .ss-card__img {
  transform: scale(1.05);
  filter: saturate(1.08) contrast(1.04);
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
  background: rgba(0, 0, 0, 0.44);
  opacity: 1;
}

.ss-card__pos {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(18, 24, 38, 0.86);
  color: var(--color-cream);
  border: 1px solid rgba(252, 239, 225, 0.12);
  font-size: 0.72rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ss-card__remove {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(225, 91, 91, 0.9);
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
  background: rgba(18, 24, 38, 0.35);
}

.ss-card__shimmer-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(252, 239, 225, 0.06) 25%,
    rgba(242, 139, 91, 0.16) 50%,
    rgba(252, 239, 225, 0.06) 75%
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
  padding: 0.3rem 0;
  border-radius: 9px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.66);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.14s ease,
    color 0.14s ease,
    border-color 0.14s ease,
    transform 0.14s ease,
    opacity 0.14s ease;
}

.ss-card__arrow svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.ss-card__arrow:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-cream);
  border-color: rgba(242, 139, 91, 0.38);
}

.ss-card__arrow:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.ss-add-btn {
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  border: 2px dashed rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.26);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
  margin-bottom: calc(0.38rem + 26px);
}

.ss-add-btn:hover:not(:disabled) {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(242, 139, 91, 0.1);
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
  color: rgba(252, 239, 225, 0.66);
  pointer-events: none;
}

.ss-add-btn__inner svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.ss-add-btn__inner span {
  font-size: 0.78rem;
  font-weight: 900;
}

.ss-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(252, 239, 225, 0.2);
  border-top-color: var(--color-primary-strong);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.ss-max-notice {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: rgba(252, 239, 225, 0.58);
  text-align: center;
}

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

/* ── Tags ───────────────────────────────────────────────── */
.tags-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-btn {
  padding: 0.34rem 0.68rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.74);
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    border-color 0.14s ease,
    background 0.14s ease,
    color 0.14s ease;
}

.tag-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.38);
  background: rgba(242, 139, 91, 0.12);
  color: var(--color-cream);
}

.tag-btn.is-selected {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: transparent;
  font-weight: 900;
}

/* ── Block toolbar ───────────────────────────────────────── */
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
  padding: 0.42rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.32);
  color: rgba(252, 239, 225, 0.78);
  font-weight: 900;
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    border-color 0.14s ease,
    background-color 0.14s ease,
    color 0.14s ease,
    transform 0.14s ease;
}

.block-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.34);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.1);
}

.block-btn.is-active {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(242, 139, 91, 0.18);
  color: var(--color-cream);
}

.block-btn__swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(252, 239, 225, 0.14);
}

/* ── Grid editor ─────────────────────────────────────────── */
.map-grid {
  display: inline-grid;
  grid-template-rows: repeat(14, 24px);
  user-select: none;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(252, 239, 225, 0.16);
  cursor: crosshair;
  box-shadow: 0 18px 34px -28px rgba(0, 0, 0, 0.95);
  background: rgba(18, 24, 38, 0.72);
}

.map-grid__row {
  display: flex;
}

.map-grid__cell {
  width: 24px;
  height: 24px;
  border: 0.5px solid rgba(252, 239, 225, 0.1);
  cursor: crosshair;
  transition:
    opacity 0.08s ease,
    transform 0.08s ease,
    box-shadow 0.08s ease,
    filter 0.08s ease;
  box-sizing: border-box;
}

.map-grid__cell:hover {
  opacity: 0.9;
  filter: brightness(1.12);
  box-shadow: inset 0 0 0 2px rgba(242, 139, 91, 0.55);
}

/* Case vide / effacer : plus claire, avec effet quadrillage */
.map-grid__cell--empty {
  background:
    linear-gradient(45deg, rgba(252, 239, 225, 0.055) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(252, 239, 225, 0.055) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(252, 239, 225, 0.055) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(252, 239, 225, 0.055) 75%),
    rgba(81, 96, 121, 0.28);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}

/* Mur : vraiment foncé et plein */
.map-grid__cell--wall {
  background: linear-gradient(135deg, rgba(17, 24, 39, 1), rgba(32, 38, 55, 1));
  box-shadow:
    inset 0 0 0 1px rgba(252, 239, 225, 0.04),
    inset 0 -4px 8px rgba(0, 0, 0, 0.22);
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

/* ── Editor stats ────────────────────────────────────────── */
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
  padding: 0.3rem 0.62rem;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.3);
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.76rem;
  font-weight: 800;
}

.editor-stat--total {
  background: rgba(242, 139, 91, 0.12);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.26);
}

.editor-stat__dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(252, 239, 225, 0.14);
}

/* ── JSON ───────────────────────────────────────────────── */
.json-header {
  cursor: pointer;
}

.json-toggle-icon {
  width: 22px;
  height: 22px;
  fill: rgba(252, 239, 225, 0.56);
  transition:
    transform 0.2s ease,
    fill 0.2s ease;
  flex-shrink: 0;
}

.json-header:hover .json-toggle-icon {
  fill: var(--color-primary-strong);
}

.json-toggle-icon.is-open {
  transform: rotate(180deg);
}

.json-preview {
  margin-top: 0.85rem;
  background: rgba(18, 24, 38, 0.72);
  border: 1px solid rgba(252, 239, 225, 0.1);
  border-radius: 16px;
  padding: 1rem 1.1rem;
  overflow: auto;
  max-height: 220px;
  font-family: 'Courier New', monospace;
  font-size: 0.74rem;
  color: rgba(252, 239, 225, 0.86);
  line-height: 1.55;
  white-space: pre;
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.04);
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

/* ── Submit bar ──────────────────────────────────────────── */
.form-actions {
  margin-top: 1.4rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.7), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

/* ── Spinner / Toast ─────────────────────────────────────── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(46, 50, 68, 0.35);
  border-top-color: var(--color-navy);
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
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.96);
  color: var(--color-cream);
  font-weight: 900;
  font-size: 0.95rem;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.36);
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
  border-color: rgba(61, 191, 125, 0.35);
}

.toast--error {
  background: linear-gradient(135deg, #8a4040, #5e2020);
  border-color: rgba(225, 91, 91, 0.35);
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

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1100px) {
  .maps-form-grid {
    grid-template-columns: 1fr;
  }

  .map-grid {
    max-width: 100%;
    overflow: hidden;
  }
}

@media (max-width: 760px) {
  .page-shell {
    width: min(100% - 1rem, 1440px);
    padding-top: 1rem;
  }

  .page-hero,
  .surface,
  .form-actions {
    border-radius: 22px;
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .surface-header {
    flex-direction: column;
    align-items: stretch;
  }

  .screenshots-grid {
    grid-template-columns: 1fr;
  }

  .maps-form-grid {
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn,
  .form-actions .maps-btn {
    width: 100%;
    justify-content: center;
  }

  .map-grid {
    grid-template-rows: repeat(14, minmax(20px, 1fr));
    width: 100%;
  }

  .map-grid__row {
    width: 100%;
  }

  .map-grid__cell {
    width: calc((100vw - 4rem) / 14);
    height: calc((100vw - 4rem) / 14);
    max-width: 24px;
    max-height: 24px;
  }
}

@media (max-width: 520px) {
  .hero-side__chips span {
    width: 100%;
  }

  .form-meta {
    flex-direction: column;
  }

  .tags-picker,
  .block-toolbar {
    gap: 0.35rem;
  }

  .tag-btn,
  .block-btn {
    flex: 1 1 calc(50% - 0.35rem);
    justify-content: center;
  }

  .editor-stats {
    flex-direction: column;
  }

  .toast {
    left: 1rem;
    right: 1rem;
    transform: none;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(10px);
  }
}
</style>
