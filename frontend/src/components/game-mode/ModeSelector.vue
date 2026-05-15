<template>
  <div class="mode-selector">
    <div class="mode-buttons" role="group" aria-label="Selection du mode de jeu">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        class="mode-button"
        :class="{ 'is-selected': mode.id === modelValue }"
        :aria-pressed="mode.id === modelValue"
        @click="selectMode(mode.id)"
      >
        {{ mode.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Mode {
  id: number | string
  name: string
}

const props = defineProps<{
  modes: Mode[]
  modelValue: number | string
}>()
const emit = defineEmits(['update:modelValue'])

function selectMode(modeId: number | string) {
  emit('update:modelValue', typeof props.modelValue === 'number' ? Number(modeId) : modeId)
}
</script>

<style scoped>
.mode-selector {
  margin-bottom: 16px;
}
.mode-label {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
}

.mode-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-button {
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: #1e2736;
  color: var(--color-cream);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.mode-button:hover {
  border-color: color-mix(in srgb, var(--color-apricot) 72%, #ffffff);
  transform: translateY(-1px);
}

.mode-button.is-selected {
  background: var(--color-apricot);
  border-color: var(--color-apricot);
  color: var(--color-ink);
}
</style>
