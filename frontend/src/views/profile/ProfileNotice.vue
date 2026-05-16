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
  font-weight: 800;
  box-shadow: 0 12px 28px -24px rgba(0, 0, 0, 0.8);
  margin-bottom: 10px;
  line-height: 1.45;
}

.notice--success {
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
  color: #7ee0ad;
}

.notice--error {
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.35);
  color: #ffb3b3;
}
</style>
