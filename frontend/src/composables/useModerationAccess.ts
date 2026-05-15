import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/userStore'

export function useModerationAccess() {
  const router = useRouter()
  const userStore = useUserStore()
  const { profile } = storeToRefs(userStore)

  const canAccess = computed(() => {
    const role = profile.value?.role ?? ''
    return ['admin', 'moderator'].includes(role)
  })

  onMounted(() => {
    if (!canAccess.value) {
      router.replace('/home')
    }
  })

  return {
    canAccess,
  }
}
