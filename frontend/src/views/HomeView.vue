<script setup lang="ts"></script>

<template>
  <div class="home">
    <h1>🎮 Bienvenue sur GameDash</h1>
    <p>Le panneau de contrôle de tes maps.</p>

    <nav>
      <RouterLink to="/maps" class="btn">
        Voir les Maps (Test API)
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.home { text-align: center; margin-top: 50px; }
.btn {
  display: inline-block;
  background-color: #42b883;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}
.btn:hover { background-color: #35495e; }
</style>
