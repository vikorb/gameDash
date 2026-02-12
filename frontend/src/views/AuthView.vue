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
import AuthForm from '@/components/auth/AuthForm.vue'

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
  background: linear-gradient(
    135deg,
    var(--color-background) 0%,
    var(--color-background-secondary) 100%
  );
  padding: 24px;
}

.auth-card {
  background: #516079;
  border-radius: 12px;
  padding: 3rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
</style>
