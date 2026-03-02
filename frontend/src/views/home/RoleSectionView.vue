<template>
  <div class="role-section-view">
    <h1 class="title">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  sectionKey: 'progress' | 'tasks' | 'activities' | 'shop'
}>()

const { t } = useI18n({ useScope: 'global' })

const title = computed(() => t(`nav.${props.sectionKey}`))
</script>

<style scoped>
.role-section-view {
  max-width: 1000px;
  margin: 24px auto 60px;
  padding: 0 24px;
}

.title {
  color: var(--color-cream);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}
</style>
