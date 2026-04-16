<template>
  <div class="date-range-picker">
    <div class="drp-field">
      <label class="drp-label">Du</label>
      <input
        type="date"
        :value="from"
        :max="to || undefined"
        @change="onFromChange"
        class="drp-input"
      />
    </div>
    <span class="drp-arrow">→</span>
    <div class="drp-field">
      <label class="drp-label">Au</label>
      <input
        type="date"
        :value="to"
        :min="from || undefined"
        @change="onToChange"
        class="drp-input"
      />
    </div>
    <button v-if="from || to" class="drp-clear" @click="onClear" title="Réinitialiser">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  from: string
  to: string
}>()

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
}>()

function onFromChange(event: Event) {
  emit('update:from', (event.target as HTMLInputElement).value)
}

function onToChange(event: Event) {
  emit('update:to', (event.target as HTMLInputElement).value)
}

function onClear() {
  emit('update:from', '')
  emit('update:to', '')
}
</script>

<style scoped>
.date-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drp-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.drp-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.drp-input {
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e2736;
  color: #e2e8f0;
  font-size: 0.8rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  color-scheme: dark;
}

.drp-input:hover,
.drp-input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background-color: #263044;
}

.drp-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

.drp-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  padding: 0;
}

.drp-clear:hover {
  background: rgba(255, 80, 80, 0.15);
  color: #ff6b6b;
  border-color: rgba(255, 80, 80, 0.3);
}
</style>
