import PocketBase from 'pocketbase'

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'

export const pb = new PocketBase(POCKETBASE_URL)

export interface AuthUser {
  id: string
  email: string
  username?: string
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const authData = await pb.collection('users').authWithPassword(email, password)
    return {
      id: authData.record.id,
      email: authData.record.email,
      username: authData.record.username,
    }
  },

  async signup(email: string, password: string, username?: string): Promise<AuthUser> {
    const record = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      username: username || email.split('@')[0],
      role: 'player',
      status: 'offline',
      is_banned: false,
    })
    await pb.collection('users').authWithPassword(email, password)
    return {
      id: record.id,
      email: record.email,
      username: record.username,
    }
  },

  async logout(): Promise<void> {
    pb.authStore.clear()
  },

  isAuthenticated(): boolean {
    return pb.authStore.isValid
  },

  getUser(): AuthUser | null {
    if (!pb.authStore.record) return null
    return {
      id: pb.authStore.record.id,
      email: pb.authStore.record.email,
      username: pb.authStore.record.username,
    }
  },
}
