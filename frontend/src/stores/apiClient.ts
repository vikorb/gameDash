const DEFAULT_API_BASE_URL = 'http://localhost:3000/api'

export type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | null | undefined>
}

export class ApiRequestError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.payload = payload
  }
}

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return (configured || DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = getApiBaseUrl()
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'

  const url = new URL(`${base}${normalizedPath}`, origin)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function readPayload(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (response.status === 204) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, headers, body, ...requestOptions } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, query), {
    credentials: 'include',
    ...requestOptions,
    headers: requestHeaders,
    body,
  })

  const payload = await readPayload(response)

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : `API error ${response.status}`

    throw new ApiRequestError(message, response.status, payload)
  }

  return payload as T
}
