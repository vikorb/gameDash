<template>
  <div :class="['notice', `notice--${type}`]">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'success' | 'error'
  text: string
}>()
</script>

<style scoped>
.notice {
  padding: 0.95rem 1rem;
  border-radius: 16px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  margin-bottom: 10px;
}

.notice--success {
  background: rgba(62, 180, 137, 0.12);
  border: 1px solid rgba(62, 180, 137, 0.3);
  color: #226b54;
}

.notice--error {
  background: rgba(225, 91, 91, 0.12);
  border: 1px solid rgba(225, 91, 91, 0.3);
  color: #a63f3f;
}
</style>
