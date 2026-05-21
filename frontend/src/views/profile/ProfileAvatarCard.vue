<template>
  <div class="avatar-card">
    <div class="avatar-preview">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="$t('profile.avatar.previewAlt')" />
      <span v-else>{{ initial }}</span>
    </div>

    <div class="avatar-meta">
      <p class="avatar-name">
        {{ fileName || $t('profile.avatar.noFile') }}
      </p>

      <div class="avatar-actions">
        <label class="upload-button">
          <input type="file" accept="image/*" class="upload-input" @change="handleChange" />
          <span>{{ $t('profile.avatar.choose') }}</span>
        </label>

        <button
          type="button"
          class="cancel-button"
          :disabled="loading || !hasFile"
          @click="emit('cancel')"
        >
          {{ $t('profile.common.cancel') }}
        </button>

        <button
          type="button"
          class="save-button"
          :disabled="!hasFile || loading"
          @click="emit('save')"
        >
          {{ loading ? $t('profile.common.saving') : $t('profile.avatar.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  change: [file: File]
  cancel: []
  save: []
}>()

defineProps<{
  avatarUrl?: string | null
  fileName?: string | null
  initial: string
  hasFile: boolean
  loading: boolean
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return
  emit('change', file)
}
</script>

<style scoped>
.avatar-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(46, 50, 68, 0.08);
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.avatar-name {
  margin: 0;
  color: var(--color-ink);
  font-weight: 600;
  word-break: break-word;
}

.avatar-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.avatar-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.upload-button,
.save-button,
.cancel-button {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;
  border: none;
}

.save-button {
  background: var(--color-primary);
  color: white;
}

.save-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.upload-button,
.cancel-button {
  background: rgba(81, 96, 121, 0.12);
  color: var(--color-ink);
  border: 1px solid rgba(46, 50, 68, 0.14);
}

.upload-button:hover,
.cancel-button:hover:not(:disabled) {
  background: rgba(81, 96, 121, 0.18);
  transform: translateY(-1px);
}

.save-button:disabled,
.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-input {
  display: none;
}

@media (max-width: 720px) {
  .avatar-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
