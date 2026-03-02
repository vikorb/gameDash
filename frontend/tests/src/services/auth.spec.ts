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

import { authService } from '../../../src/services/pocketbase'
import { normalizeRole } from '../../../src/stores/userStore'

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

describe('Role normalization', () => {
  it('maps admin variants to admin', () => {
    expect(normalizeRole('admin')).toBe('admin')
    expect(normalizeRole('Admin')).toBe('admin')
    expect(normalizeRole('ADMIN')).toBe('admin')
    expect(normalizeRole('administrateur')).toBe('admin')
  })

  it('maps moderator variants to moderator', () => {
    expect(normalizeRole('moderator')).toBe('moderator')
    expect(normalizeRole('moderateur')).toBe('moderator')
    expect(normalizeRole('MODERATOR')).toBe('moderator')
  })

  it('falls back to player for unknown values', () => {
    expect(normalizeRole('player')).toBe('player')
    expect(normalizeRole('unknown')).toBe('player')
    expect(normalizeRole(undefined)).toBe('player')
    expect(normalizeRole(null)).toBe('player')
  })
})
