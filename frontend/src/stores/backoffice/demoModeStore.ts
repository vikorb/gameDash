import { defineStore } from 'pinia'
import { ref } from 'vue'

import { apiRequest } from '../apiClient'

export const useDemoModeStore = defineStore('backoffice-demo-mode', () => {
  const demoMode = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDemoMode() {
    loading.value = true
    error.value = null
    try {
      const response = await apiRequest<{ enabled: boolean }>('/backoffice/matchmaking/demo-mode')
      demoMode.value = response.enabled
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch demo mode status'
    } finally {
      loading.value = false
    }
  }

  async function toggleDemoMode(enabled: boolean) {
    loading.value = true
    error.value = null
    try {
      const response = await apiRequest<{ enabled: boolean }>('/backoffice/matchmaking/demo-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      demoMode.value = response.enabled
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set demo mode status'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    demoMode,
    loading,
    error,
    fetchDemoMode,
    toggleDemoMode,
  }
})
