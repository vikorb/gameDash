import { vi } from 'vitest'

// 1. Mock de window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
  configurable: true,
})

// 2. Mock du contexte Canvas pour Chart.js
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    canvas: document.createElement('canvas'),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
  writable: true,
  configurable: true,
})

// 3. Intercepteur XMLHttpRequest sécurisé
const OriginalXMLHttpRequest = window.XMLHttpRequest

class TestXMLHttpRequest extends OriginalXMLHttpRequest {
  // Déclaration explicite des paramètres optionnels pour respecter les signatures DOM
  open(
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ) {
    const normalizedUrl = String(url)

    // Blocage des appels non mockés
    if (
      normalizedUrl.startsWith('/api') ||
      normalizedUrl.startsWith('/ranks') ||
      normalizedUrl.startsWith('/game-modes') ||
      normalizedUrl.includes('localhost:3000') ||
      normalizedUrl.includes('127.0.0.1:3000')
    ) {
      throw new Error(
        `[TEST NETWORK BLOCKED] ${method} ${normalizedUrl}. Mocke '@/api' ou le service appelé dans le test.`,
      )
    }

    // Gestion propre de l'appel parent (super.open) selon les arguments fournis
    if (async !== undefined) {
      return super.open(method, url, async, username, password)
    }

    return super.open(method, url)
  }
}

Object.defineProperty(window, 'XMLHttpRequest', {
  value: TestXMLHttpRequest,
  writable: true,
  configurable: true,
})
