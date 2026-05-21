import PocketBase from 'pocketbase'

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'

export const pb = new PocketBase(POCKETBASE_URL)

type PocketBaseUserRecord = {
  id: string
  email: string
  username?: string
  avatar?: string | null
}

export interface AuthUser {
  id: string
  email: string
  username?: string
  avatar?: string | null
  avatarUrl?: string | null
}

const toAuthUser = (record: PocketBaseUserRecord | null | undefined): AuthUser | null => {
  if (!record) return null

  const avatar =
    typeof record.avatar === 'string' && record.avatar.trim() !== '' ? record.avatar : null

  return {
    id: record.id,
    email: record.email,
    username: record.username,
    avatar,
    avatarUrl: avatar ? pb.files.getURL(record as never, avatar) : null,
  }
}

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

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const authData = await pb.collection('users').authWithPassword(email, password)
    return toAuthUser(authData.record as unknown as PocketBaseUserRecord)!
  },

  async signup(
    email: string,
    password: string,
    username?: string,
    avatar?: File | null,
  ): Promise<AuthUser> {
    const payload: Record<string, unknown> = {
      email,
      password,
      passwordConfirm: password,
      username: username || email.split('@')[0],
    }

    if (avatar) {
      payload.avatar = avatar
    }

    const record = await pb.collection('users').create(payload)
    await pb.collection('users').authWithPassword(email, password)

    return toAuthUser(record as unknown as PocketBaseUserRecord)!
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

  isAuthenticated(): boolean {
    return pb.authStore.isValid
  },

  getUser(): AuthUser | null {
    return toAuthUser(pb.authStore.record as unknown as PocketBaseUserRecord | null)
  },

  async refreshUser(): Promise<AuthUser | null> {
    const current = pb.authStore.record as PocketBaseUserRecord | null
    if (!current?.id) return null

    const record = (await pb.collection('users').getOne(current.id)) as PocketBaseUserRecord

    if (pb.authStore.token) {
      pb.authStore.save(pb.authStore.token, record as never)
    }

    return toAuthUser(record)
  },

  async getAvatarUrl(userId?: string): Promise<string | null> {
    const id = userId || (pb.authStore.record as PocketBaseUserRecord | null)?.id
    if (!id) return null

    const record = (await pb.collection('users').getOne(id)) as PocketBaseUserRecord
    const avatar =
      typeof record.avatar === 'string' && record.avatar.trim() !== '' ? record.avatar : null

    return avatar ? pb.files.getURL(record as never, avatar) : null
  },

  async updateAvatar(file: File): Promise<string | null> {
    const current = pb.authStore.record as PocketBaseUserRecord | null

    if (!current?.id) {
      throw new Error('Utilisateur PocketBase introuvable')
    }

    const formData = new FormData()
    formData.append('avatar', file)

    const updatedRecord = (await pb
      .collection('users')
      .update(current.id, formData)) as PocketBaseUserRecord

    if (pb.authStore.token) {
      pb.authStore.save(pb.authStore.token, updatedRecord as never)
    }

    const avatar =
      typeof updatedRecord.avatar === 'string' && updatedRecord.avatar.trim() !== ''
        ? updatedRecord.avatar
        : null

    return avatar ? pb.files.getURL(updatedRecord as never, avatar) : null
  },

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    return pb.authStore.onChange(() => {
      callback(authService.getUser())
    })
  },
}
