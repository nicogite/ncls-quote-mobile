import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Preferences } from '@capacitor/preferences'
import api from '@/services/api'
import { initializeUser } from '@/services/deviceService'

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('deviceService.initializeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne l\'UUID existant sans appel réseau si déjà stocké', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: 'uuid-existant-123' })

    const result = await initializeUser()

    expect(result).toBe('uuid-existant-123')
    expect(api.post).not.toHaveBeenCalled()
    expect(Preferences.set).not.toHaveBeenCalled()
  })

  it('crée un utilisateur via l\'API au premier lancement et persiste l\'UUID', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: null })
    vi.mocked(api.post).mockResolvedValue({ data: { device_uuid: 'nouvel-uuid-456' } })

    const result = await initializeUser()

    expect(api.post).toHaveBeenCalledWith('api/users')
    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'user_uuid',
      value: 'nouvel-uuid-456',
    })
    expect(result).toBe('nouvel-uuid-456')
  })

  it('retourne undefined si l\'API échoue au premier lancement', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: null })
    vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

    const result = await initializeUser()

    expect(result).toBeUndefined()
    expect(Preferences.set).not.toHaveBeenCalled()
  })

  it('lit la clé user_uuid dans Preferences', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: 'uuid-test' })

    await initializeUser()

    expect(Preferences.get).toHaveBeenCalledWith({ key: 'user_uuid' })
  })
})
