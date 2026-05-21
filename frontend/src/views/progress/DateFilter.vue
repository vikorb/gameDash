<template>
  <select :value="modelValue" @change="onChange">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
export type DateRange = 'week' | '3weeks' | 'month' | '3months' | 'year' | 'all'

const options: { value: DateRange; label: string }[] = [
  { value: 'all',     label: 'Tout afficher' },
  { value: 'week',    label: 'Dernière semaine' },
  { value: '3weeks',  label: '3 dernières semaines' },
  { value: 'month',   label: 'Dernier mois' },
  { value: '3months', label: '3 derniers mois' },
  { value: 'year',    label: 'Sur l\'année' },
]

defineProps<{ modelValue: DateRange }>()
const emit = defineEmits<{ 'update:modelValue': [value: DateRange] }>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value as DateRange)
}
</script>
