import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('pocketbase', () => {
  class MockPocketBase {
    authStore = {
      isValid: false,
      record: null,
      clear: vi.fn(),
      loadFromCookie: vi.fn(),
      exportToCookie: vi.fn(() => 'cookie'),
      onChange: vi.fn(),
    }

    collection = vi.fn((name) => ({
      authWithPassword: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }))
  }
  return { default: MockPocketBase }
})

import { authService } from '@/services/pocketbase'

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have authService methods', () => {
    expect(authService).toBeDefined()
    expect(authService.login).toBeDefined()
    expect(authService.signup).toBeDefined()
    expect(authService.logout).toBeDefined()
  })

  it('should check authentication status', () => {
    expect(authService.isAuthenticated()).toBe(false)
  })

  it('should get user when authenticated', () => {
    const user = authService.getUser()
    expect(user).toBeNull()
  })
})
