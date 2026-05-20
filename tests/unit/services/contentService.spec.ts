import { describe, beforeEach, it, expect, vi } from 'vitest'

// Utilise vi.doMock + vi.resetModules + import() dynamique pour isoler l'état
// module-level de contentService entre chaque test.

describe('contentService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('loadAllContent construit une map clé→valeur depuis l\'API', async () => {
    const getMock = vi.fn().mockResolvedValue({
      data: [
        { id: 1, key: 'welcome', value: 'Bienvenue' },
        { id: 2, key: 'cgu', value: 'Texte CGU' },
      ],
    })
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { loadAllContent, getContentValue } = await import('@/services/contentService')
    await loadAllContent()

    expect(getMock).toHaveBeenCalledWith('/api/content')
    expect(getContentValue('welcome')).toBe('Bienvenue')
    expect(getContentValue('cgu')).toBe('Texte CGU')
  })

  it('ensureContentLoaded ne refait pas l\'appel API si déjà chargé', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: [] })
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { ensureContentLoaded } = await import('@/services/contentService')
    await ensureContentLoaded()
    await ensureContentLoaded()

    expect(getMock).toHaveBeenCalledOnce()
  })

  it('loadAllContent(force=true) recharge même si déjà chargé', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: [] })
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { loadAllContent } = await import('@/services/contentService')
    await loadAllContent()
    await loadAllContent(true)

    expect(getMock).toHaveBeenCalledTimes(2)
  })

  it('getContentValue retourne une chaîne vide pour une clé inconnue', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: [] })
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { ensureContentLoaded, getContentValue } = await import('@/services/contentService')
    await ensureContentLoaded()

    expect(getContentValue('inexistant')).toBe('')
  })

  it('loadAllContent propage l\'erreur réseau', async () => {
    const getMock = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { loadAllContent } = await import('@/services/contentService')

    await expect(loadAllContent()).rejects.toThrow('Network error')
  })

  it('contentState.isContentLoaded passe à true après chargement', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: [] })
    vi.doMock('@/services/api', () => ({ default: { get: getMock } }))

    const { loadAllContent, contentState } = await import('@/services/contentService')
    expect(contentState.isContentLoaded.value).toBe(false)
    await loadAllContent()
    expect(contentState.isContentLoaded.value).toBe(true)
  })
})
