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
  color: rgba(252, 239, 225, 0.72);
  font-size: 0.86rem;
  font-weight: 900;
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
  min-height: 150px;
  border: 1px dashed rgba(252, 239, 225, 0.18);
  border-radius: 18px;
  background: rgba(18, 24, 38, 0.3);
  display: grid;
  place-items: center;
  padding: 0.85rem;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.dropzone:hover {
  border-color: rgba(242, 139, 91, 0.44);
  background: rgba(242, 139, 91, 0.08);
  transform: translateY(-1px);
}

.dropzone.dragging {
  border-color: rgba(242, 139, 91, 0.68);
  background: rgba(242, 139, 91, 0.12);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}

.dropzone.filled {
  border-style: solid;
  border-color: rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.42);
}

.placeholder {
  text-align: center;
  color: rgba(252, 239, 225, 0.76);
  font-weight: 800;
}

.placeholder p {
  margin: 0;
}

.preview {
  width: 100%;
  max-width: 100%;
  max-height: 230px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.remove-btn {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid rgba(225, 91, 91, 0.38);
  border-radius: 999px;
  background: rgba(225, 91, 91, 0.92);
  color: #fff;
  font-size: 1.15rem;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    background-color 0.14s ease;
}

.remove-btn:hover {
  background: #e15b5b;
  transform: scale(1.08);
}

.hint {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(252, 239, 225, 0.54);
  line-height: 1.4;
}
</style>
