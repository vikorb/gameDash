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
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
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
  color: var(--color-navy);
  font-size: 2rem;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 16px 34px -18px rgba(242, 139, 91, 0.95);
  border: 1px solid rgba(252, 239, 225, 0.14);
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
  color: var(--color-cream);
  font-weight: 900;
  word-break: break-word;
}

.avatar-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.avatar-hint {
  margin: 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.9rem;
  line-height: 1.45;
}

.upload-button,
.save-button,
.cancel-button {
  display: inline-flex;
  width: fit-content;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 0.95rem;
  border-radius: 14px;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.save-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border: 1px solid rgba(242, 139, 91, 0.42);
  box-shadow: 0 14px 28px -20px rgba(242, 139, 91, 0.95);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.upload-button,
.cancel-button {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border: 1px solid rgba(252, 239, 225, 0.12);
}

.upload-button:hover,
.cancel-button:hover:not(:disabled) {
  transform: translateY(-1px);
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
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

  .avatar-actions {
    width: 100%;
    flex-direction: column;
  }

  .upload-button,
  .save-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
