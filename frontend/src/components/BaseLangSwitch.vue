<template>
  <select class="lang-switch" :value="props.modelValue" @change="onChange">
    <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
export type LangOption<T extends string> = {
  value: T
  label: string
}

const props = defineProps<{
  modelValue: string
  options: LangOption<string>[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.lang-switch {
  min-height: 40px;
  padding: 0.58rem 2.35rem 0.58rem 0.9rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  color: var(--color-cream);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  outline: none;
  appearance: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 12px 26px -20px rgba(0, 0, 0, 0.9);
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease,
    color 0.16s ease;

  background-color: var(--color-navy);
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23f7a784' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"),
    linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  background-repeat: no-repeat, no-repeat;
  background-position:
    right 0.75rem center,
    center;
  background-size:
    18px 18px,
    100% 100%;
}

.lang-switch:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.38);
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23f7a784' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"),
    linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.05),
    0 16px 30px -22px rgba(242, 139, 91, 0.45);
}

.lang-switch:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23f7a784' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"),
    linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.05),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
}

.lang-switch:active {
  transform: translateY(0);
}

.lang-switch option {
  background: var(--color-navy);
  color: var(--color-cream);
  font-weight: 800;
}
</style>
