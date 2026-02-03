<template>
  <select class="lang-switch" :value="props.modelValue" @change="onChange">
    <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
export type LangOption<T extends string> = {
  value: T;
  label: string;
};

const props = defineProps<{
  modelValue: string;
  options: LangOption<string>[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value;
  emit('update:modelValue', value);
}
</script>

<style scoped>
.lang-switch {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-1);
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 700;
}
</style>
