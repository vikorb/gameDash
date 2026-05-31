import type {
  IdLike,
  MapComment,
  MapItem,
  MapsActivityResponse,
  MapSavePayload,
  MapsListResponse,
  MapUpdatePayload,
  MapVote,
} from '@/types/maps'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const DEV_USER_ID = Number(import.meta.env.VITE_DEV_USER_ID ?? 66)

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
}

function withQuery(path: string, query?: RequestOptions['query']): string {
  if (!query) return path

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }

  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${withQuery(path, options.query)}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': String(DEV_USER_ID),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    let message = `API error ${response.status}`

    try {
      const payload = (await response.json()) as { message?: string; error?: string }
      message = payload.message ?? payload.error ?? message
    } catch {
      // Keep fallback message.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const mapsApi = {
  listMaps(): Promise<MapsListResponse> {
    return apiRequest<MapsListResponse>('/maps')
  },

  getMap(id: IdLike): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}`)
  },

  getActivity(): Promise<MapsActivityResponse> {
    return apiRequest<MapsActivityResponse>('/maps/activity')
  },

  createMap(payload: MapSavePayload): Promise<MapItem> {
    return apiRequest<MapItem>('/maps', {
      method: 'POST',
      body: payload,
    })
  },

  updateMap(id: IdLike, payload: MapUpdatePayload): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  toggleVote(id: IdLike, vote: MapVote): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}/vote`, {
      method: 'POST',
      body: { vote },
    })
  },

  toggleFavorite(id: IdLike): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}/favorite`, {
      method: 'POST',
    })
  },

  recordTest(id: IdLike): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}/tests`, {
      method: 'POST',
    })
  },

  addComment(id: IdLike, content: string): Promise<MapComment> {
    return apiRequest<MapComment>(`/maps/${id}/comments`, {
      method: 'POST',
      body: { content },
    })
  },

  toggleCommentLike(commentId: IdLike): Promise<MapComment> {
    return apiRequest<MapComment>(`/maps/comments/${commentId}/like`, {
      method: 'POST',
    })
  },

  publishVersion(id: IdLike, releaseNotes: string): Promise<MapItem> {
    return apiRequest<MapItem>(`/maps/${id}/versions`, {
      method: 'POST',
      body: { releaseNotes },
    })
  },
}
