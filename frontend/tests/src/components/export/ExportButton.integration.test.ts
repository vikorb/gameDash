import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Pas d'import statique de @/api ici — on récupère le mock via vi.mocked après
vi.mock('@/services/pocketbase', () => ({
  pb: { authStore: { token: '' } },
  authService: {
    isAuthenticated: () => true,
    getUser: () => ({ id: 'u1', username: 'alice' }),
  },
}))

vi.mock('@/api', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}))

describe('ExportButton integration', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:test-url'),
      writable: true,
      configurable: true,
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(() => undefined),
      writable: true,
      configurable: true,
    })

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('exports client rows without calling backend API', async () => {
    // Import dynamique APRÈS que les mocks sont en place
    const { default: api } = await import('@/api')
    const apiGet = vi.mocked(api.get)
    apiGet.mockReset()

    const capturedParts: BlobPart[][] = []
    const OriginalBlob = globalThis.Blob

    class MockBlob extends OriginalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedParts.push(parts)
      }
    }

    vi.stubGlobal('Blob', MockBlob)

    const { default: ExportButton } = await import('@/components/export/ExportButton.vue')

    const wrapper = mount(ExportButton, {
      props: {
        entity: 'maps',
        clientRows: [
          { id: 'm1', title: 'Map 1' },
          { id: 'm2', title: 'Map 2' },
        ],
      },
    })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(apiGet).not.toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)

    const csvContent = capturedParts[0]?.[0] as string

    expect(csvContent).toContain('"id","title"')
    expect(csvContent).toContain('"m1","Map 1"')
    expect(csvContent).toContain('"m2","Map 2"')
  })

  it('falls back to backend export when no client rows are provided', async () => {
    const { default: api } = await import('@/api')
    const apiGet = vi.mocked(api.get)
    apiGet.mockReset()

    apiGet.mockResolvedValueOnce({
      data: new Blob(['"id"\n"1"'], { type: 'text/csv' }),
    })

    const { default: ExportButton } = await import('@/components/export/ExportButton.vue')

    const wrapper = mount(ExportButton, {
      props: {
        entity: 'users',
      },
    })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiGet).toHaveBeenCalledWith('/admin/export/users', {
      responseType: 'blob',
    })
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })
})
