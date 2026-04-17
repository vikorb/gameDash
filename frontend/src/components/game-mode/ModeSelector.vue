<template>
  <div class="mode-selector">
    <label for="mode-select">Mode :</label>
    <select id="mode-select" :value="modelValue" @change="onChange">
      <option v-for="mode in modes" :key="mode.id" :value="mode.id">
        {{ mode.name }}
      </option>
    </select>
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

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', typeof props.modelValue === 'number' ? Number(value) : value)
}
</script>

<style scoped>
.mode-selector {
  margin-bottom: 16px;
}
label {
  margin-right: 8px;
}
select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #232c3a;
  color: #fff;
}
</style>
