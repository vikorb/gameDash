<template>
  <div class="demo-card">
    <div class="demo-card__info">
      <h3 class="demo-title">Matchmaking Demo Mode</h3>
      <p class="demo-desc">Enable dummy bots and simulated 4v4 instant game ready checks for developer testing.</p>
    </div>
    <label class="premium-switch">
      <input type="checkbox" :checked="store.demoMode" :disabled="store.loading" @change="onToggle" />
      <span class="premium-slider"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useDemoModeStore } from '@/stores/backoffice/demoModeStore'

const store = useDemoModeStore()
onMounted(() => { store.fetchDemoMode() })
const onToggle = async (e: Event) => {
  const target = e.target as HTMLInputElement
  await store.toggleDemoMode(target.checked)
}
</script>

<style scoped>
.demo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(241, 138, 95, 0.2);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 12px rgba(241, 138, 95, 0.05);
}
.demo-title { font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0; letter-spacing: 0.5px; }
.demo-desc { font-size: 0.9rem; color: #94a3b8; margin: 0; }
.premium-switch { position: relative; display: inline-block; width: 60px; height: 32px; flex-shrink: 0; }
.premium-switch input { opacity: 0; width: 0; height: 0; }
.premium-slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #334155; border: 1.5px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 32px;
}
.premium-slider:before {
  position: absolute; content: ""; height: 24px; width: 24px; left: 3px; bottom: 2.5px;
  background-color: #f8fafc; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
input:checked + .premium-slider { background-color: rgba(241, 138, 95, 0.9); border-color: rgba(241, 138, 95, 1); }
input:checked + .premium-slider:before { transform: translateX(28px); background-color: #fff; }
input:disabled + .premium-slider { opacity: 0.6; cursor: not-allowed; }
</style>
