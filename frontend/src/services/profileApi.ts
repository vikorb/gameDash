import api from '@/api'
import { pb } from '@/services/pocketbase'

export type ProfileUser = {
  id: number
  pocketbase_user_id: string | null
  username: string | null
  email: string | null
  role: string
  status: number
  region: string | null
  bio: string | null
  language: string | null
  matchmaking_pref: unknown
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type UserResponse = {
  user: ProfileUser
}

type AvatarResponse = {
  avatar_url: string | null
}

type PasswordResponse = {
  status: string
}

type DeleteUserResponse = {
  status: string
  user: ProfileUser
}

export async function deleteUserProfile(
  id: number,
  payload: { currentPassword: string },
): Promise<DeleteUserResponse> {
  return apiFetch<DeleteUserResponse>(`/users/${id}/delete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = pb.authStore.token

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  const rawText = await response.text()
  let data: unknown = null

  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = rawText
    }
  }

  if (!response.ok) {
    if (typeof data === 'object' && data !== null) {
      if ('message' in data) {
        throw new Error(String((data as Record<string, unknown>).message))
      }

      throw new Error(JSON.stringify(data))
    }

    if (typeof data === 'string' && data.trim()) {
      throw new Error(data)
    }

    throw new Error(`Erreur API (${response.status})`)
  }

  return data as T
}

export async function getUserProfileByPocketbaseId(pocketbaseUserId: string): Promise<ProfileUser> {
  const data = await apiFetch<UserResponse>(`/users/by-pocketbase/${pocketbaseUserId}`, {
    method: 'GET',
  })

  return data.user
}

export async function getUserAvatar(id: number): Promise<string | null> {
  const data = await apiFetch<AvatarResponse>(`/users/${id}/avatar`, {
    method: 'GET',
  })

  return data.avatar_url
}

export async function uploadUserAvatar(
  id: number,
  avatar: string,
  currentPassword: string,
): Promise<AvatarResponse> {
  return apiFetch<AvatarResponse>(`/users/${id}/avatar`, {
    method: 'POST',
    body: JSON.stringify({
      avatar,
      currentPassword,
    }),
  })
}

export async function changeUserPassword(
  id: number,
  payload: {
    currentPassword: string
    password: string
    passwordConfirm: string
  },
): Promise<PasswordResponse> {
  return apiFetch<PasswordResponse>(`/users/${id}/password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getUserProfileById(userId: number) {
  const response = await api.get<{ user: ProfileUser }>(`/users/${userId}`)
  return response.data
}

export async function updateUserProfile(
  userId: number,
  payload: {
    username: string
    email: string
    region?: string
    bio?: string
    language?: string
    status?: number
    role?: string
    matchmaking_pref?: unknown
  },
) {
  const response = await api.post<{ status: string; user: ProfileUser }>(
    `/users/${userId}`,
    payload,
  )
  return response.data
}
