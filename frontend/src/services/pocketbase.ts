import PocketBase from 'pocketbase'

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'

export const pb = new PocketBase(POCKETBASE_URL)

if (typeof document !== 'undefined') {
  pb.authStore.loadFromCookie(document.cookie)
  pb.authStore.onChange(() => {
    const twoWeeksSeconds = 14 * 24 * 60 * 60
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax',
      path: '/',
      maxAge: twoWeeksSeconds,
    })
  })
}

export interface AuthUser {
  id: string
  email: string
  username?: string
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const authData = await pb.collection('users').authWithPassword(email, password)
    await authService.setStatusOnline(authData.record.id)
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
      status: 'online',
      is_banned: false,
    })
    await pb.collection('users').authWithPassword(email, password)
    await authService.setStatusOnline(record.id)
    return {
      id: record.id,
      email: record.email,
      username: record.username,
    }
  },

  async logout(): Promise<void> {
    pb.authStore.clear()
    if (typeof document !== 'undefined') {
      document.cookie = pb.authStore.exportToCookie({
        httpOnly: false,
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax',
        path: '/',
        maxAge: 0,
      })
    }
  },

  async setStatusOnline(userId: string): Promise<void> {
    await pb.collection('users').update(userId, { status: 'online' })
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
