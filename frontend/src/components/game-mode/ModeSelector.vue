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
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #232c3a;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.mode-button:hover {
  border-color: #ff9f40;
}

.mode-button.is-selected {
  background: #ff8c1a;
  border-color: #ff8c1a;
  color: #1f1f1f;
}
</style>
