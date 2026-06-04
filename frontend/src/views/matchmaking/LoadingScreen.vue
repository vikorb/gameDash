<template>
  <div class="loading-screen">
    <div class="spinner"></div>
    <h2 class="title">GAME IN PROGRESS</h2>
    <div class="progress-bar-container">
      <div class="progress-bar"></div>
    </div>
    <p class="description">SIMULATING MATCH... PLEASE WAIT 10 SECONDS</p>
  </div>
</template>

<style scoped>
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}
.spinner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 6px solid rgba(255, 255, 255, 0.1);
  border-top-color: #f18a5f;
  animation: spin 1s linear infinite;
}
.title {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  margin: 0;
  text-shadow: 0 0 10px rgba(255,255,255,0.2);
}
.progress-bar-container {
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  width: 0%;
  background: #f18a5f;
  border-radius: 4px;
  animation: fill 10s linear forwards;
}
.description {
  font-size: 0.85rem;
  font-weight: bold;
  color: #a0aec0;
  letter-spacing: 1px;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fill { to { width: 100%; } }
</style>
