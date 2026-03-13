<template>
  <div class="form-group">
    <label for="avatar" class="label">{{ t('auth.signup.avatar') }}</label>
    <input
      id="avatar"
      ref="fileInput"
      type="file"
      accept="image/*"
      class="sr-only"
      @change="onChange"
    />
    <div
      class="dropzone"
      :class="{ dragging: isDragging, filled: !!previewUrl }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <button
        v-if="previewUrl"
        type="button"
        class="remove-btn"
        :aria-label="t('auth.signup.remove_avatar')"
        :title="t('auth.signup.remove_avatar')"
        @click.stop="removeFile"
      >
        ×
      </button>
      <img v-if="previewUrl" :src="previewUrl" :alt="t('auth.signup.avatar')" class="preview" />
      <div v-else class="placeholder">
        <p>{{ t('auth.signup.avatar_drop') }}</p>
        <p class="hint">{{ t('auth.signup.avatar_hint') }}</p>
      </div>
    </div>
    <p v-if="fileName" class="hint">{{ fileName }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  'update:file': [file: File | null]
}>()

const { t } = useI18n({ useScope: 'global' })
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)

const fileName = computed(() => selectedFile.value?.name ?? '')

const setFile = (file: File | null) => {
  if (file && !file.type.startsWith('image/')) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = file ? URL.createObjectURL(file) : null
  if (!file && fileInput.value) fileInput.value.value = ''
  emit('update:file', file)
}

const removeFile = () => {
  setFile(null)
}

const openPicker = () => fileInput.value?.click()

const onChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  setFile(input.files?.[0] ?? null)
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  setFile(event.dataTransfer?.files?.[0] ?? null)
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}
.label {
  font-weight: 600;
  color: var(--color-cream);
  font-size: 0.95rem;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.dropzone {
  position: relative;
  min-height: 140px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  display: grid;
  place-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.dropzone.dragging {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.dropzone.filled {
  border-style: solid;
}
.placeholder {
  text-align: center;
  color: var(--color-text);
  font-weight: 500;
}
.preview {
  max-width: 100%;
  max-height: 220px;
  border-radius: calc(var(--radius) - 4px);
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1.2rem;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.remove-btn:hover {
  border-color: var(--color-primary);
}
.hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-cream);
  opacity: 0.9;
}
</style>
