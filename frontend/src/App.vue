<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppNavbar from '@/views/AppNavbar.vue';
</script>

<template>
  <header>
    <AppNavbar />
  </header>

  <main class="app-main">
    <RouterView :key="$route.fullPath" />
  </main>
</template>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  color: var(--color-text);
}
.app-main {
  padding: 20px;
}
</style>
