<template>
  <span :class="['user-status-badge', `user-status-badge--${statusKey}`]">
    <span class="user-status-badge__dot" />
    <span class="user-status-badge__label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  status?: number | string | null
}>()

const { t } = useI18n()

const statusKey = computed(() => {
  const value = Number(props.status)

  if (value === 1) return 'online'
  if (value === 2) return 'offline'
  if (value === 3) return 'banned'
  if (value === 0) return 'deleted'

  return 'offline'
})

const label = computed(() => t(`profile.status.${statusKey.value}`))
</script>

<style scoped>
.user-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
}

.user-status-badge__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-status-badge--online {
  background: rgba(61, 191, 125, 0.14);
  color: #1d7a4b;
}

.user-status-badge--online .user-status-badge__dot {
  background: #3dbf7d;
}

.user-status-badge--offline {
  background: rgba(120, 130, 150, 0.16);
  color: #5c6578;
}

.user-status-badge--offline .user-status-badge__dot {
  background: #7d879b;
}

.user-status-badge--banned {
  background: rgba(225, 91, 91, 0.14);
  color: #a33b3b;
}

.user-status-badge--banned .user-status-badge__dot {
  background: #e15b5b;
}

.user-status-badge--deleted {
  background: rgba(46, 50, 68, 0.12);
  color: #4d5566;
}

.user-status-badge--deleted .user-status-badge__dot {
  background: #6a7288;
}
</style>
