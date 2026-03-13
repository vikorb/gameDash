<template>
  <div class="app-shell">
    <header class="app-header">
      <NavbarView />
    </header>

    <main class="app-main">
      <div class="app-page-frame">
        <RouterView :key="$route.fullPath" />
      </div>
    </main>

    <footer class="app-footer">
      <span>Copyright @SDV 2026</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavbarView from '@/views/NavbarView.vue'
</script>

<style>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
}

.app-page-frame {
  width: min(1500px, 100%);
  height: min(760px, 100%);
  background: transparent;
  overflow: auto;
}

.app-footer {
  height: var(--footer-height);
  background: var(--color-cream);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
</style>
