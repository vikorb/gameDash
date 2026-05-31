/** URL d'image picsum stable basée sur un seed textuel */
export function picsumUrl(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/** Délai async (simule une latence réseau pour la démo) */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Base URL de l'API – peut être surchargée via .env */
export const API_BASE: string =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ??
  'http://localhost:3000'

/** Fetch typé vers l'API backend avec header x-user-id fixe */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '66',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
    ;(err as Error & { status: number }).status = res.status
    throw err
  }

  return res.json() as Promise<T>
}
