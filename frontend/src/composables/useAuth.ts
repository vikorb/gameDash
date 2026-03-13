import { computed, ref } from 'vue'

import { authService, type AuthUser } from '@/services/pocketbase'

const user = ref<AuthUser | null>(null)
const isAuthenticated = computed(() => user.value !== null)

export const useAuth = () => {
  const setUser = (newUser: AuthUser | null) => {
    user.value = newUser
  }

  const getUser = () => user.value

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const checkAuth = () => {
    if (authService.isAuthenticated()) {
      const authUser = authService.getUser()
      if (authUser) setUser(authUser)
    }
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    setUser,
    getUser,
    logout,
    checkAuth,
  }
}
