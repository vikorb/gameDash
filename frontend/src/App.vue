<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav class="main-nav">
      <RouterLink to="/">Accueil</RouterLink> |
      <RouterLink to="/test-maps">Maps</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style>
/* Style global minimaliste */
body { font-family: sans-serif; margin: 0; color: #333; }
.main-nav {
  padding: 1rem;
  background: #f4f4f4;
  border-bottom: 1px solid #ddd;
}
.main-nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #42b883;
  font-weight: bold;
}
.main-nav a.router-link-active { color: #35495e; text-decoration: underline; }
main { padding: 20px; }
</style>
