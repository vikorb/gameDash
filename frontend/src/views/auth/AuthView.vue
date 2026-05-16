<template>
  <div class="auth-container">
    <div class="auth-card">
      <AuthForm :type="authType" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AuthForm from '@/views/auth/AuthForm.vue'

const route = useRoute()

const authType = computed<'login' | 'signup'>(() => {
  return route.path === '/login' ? 'login' : 'signup'
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: var(--color-cream);
}

.auth-card {
  width: 100%;
  max-width: 460px;
  padding: 2.2rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.78), rgba(46, 50, 68, 0.98)), var(--color-navy);
  box-shadow: 0 24px 60px -34px rgba(0, 0, 0, 0.9);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 15% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 90% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.auth-card > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 520px) {
  .auth-container {
    align-items: flex-start;
    padding: 1rem;
  }

  .auth-card {
    padding: 1.4rem;
    border-radius: 22px;
  }
}
</style>
