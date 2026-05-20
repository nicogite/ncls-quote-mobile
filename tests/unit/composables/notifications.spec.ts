import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'
import { useNotifications } from '@/composables/useNotifications'

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(),
    getPending: vi.fn(),
    addListener: vi.fn(),
  },
}))

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

const NOTIFICATION_ID = 20260416

function getScheduledDate(): Date {
  const call = vi.mocked(LocalNotifications.schedule).mock.calls[0]
  return call[0].notifications[0].schedule!.at as Date
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── scheduleUserRhythm : fréquence daily ───────────────────────────────────

  describe('scheduleUserRhythm("daily")', () => {
    it('programme aujourd\'hui à 17h25 si on est avant 17h25', async () => {
      vi.setSystemTime(new Date('2026-05-18T10:00:00')) // lundi 10h00

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('daily')

      const date = getScheduledDate()
      expect(date.getHours()).toBe(17)
      expect(date.getMinutes()).toBe(25)
      expect(date.getDate()).toBe(18)
    })

    it('programme demain à 17h25 si on est après 17h25', async () => {
      vi.setSystemTime(new Date('2026-05-18T20:00:00')) // lundi 20h00

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('daily')

      const date = getScheduledDate()
      expect(date.getHours()).toBe(17)
      expect(date.getMinutes()).toBe(25)
      expect(date.getDate()).toBe(19) // mardi
    })

    it('annule l\'ancienne notification avant de planifier', async () => {
      vi.setSystemTime(new Date('2026-05-18T10:00:00'))

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('daily')

      expect(LocalNotifications.cancel).toHaveBeenCalledWith({
        notifications: [{ id: NOTIFICATION_ID }],
      })
      const cancelOrder = vi.mocked(LocalNotifications.cancel).mock.invocationCallOrder[0]
      const scheduleOrder = vi.mocked(LocalNotifications.schedule).mock.invocationCallOrder[0]
      expect(cancelOrder).toBeLessThan(scheduleOrder)
    })

    it('demande les permissions si elles ne sont pas accordées', async () => {
      vi.mocked(LocalNotifications.checkPermissions).mockResolvedValue({ display: 'denied' } as never)
      vi.setSystemTime(new Date('2026-05-18T10:00:00'))

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('daily')

      expect(LocalNotifications.requestPermissions).toHaveBeenCalled()
    })
  })

  // ─── scheduleUserRhythm : fréquence weekly ──────────────────────────────────

  describe('scheduleUserRhythm("weekly")', () => {
    it('programme le lundi suivant si aujourd\'hui est mardi', async () => {
      vi.setSystemTime(new Date('2026-05-19T10:00:00')) // mardi

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('weekly')

      const date = getScheduledDate()
      expect(date.getDay()).toBe(1) // lundi
      expect(date.getDate()).toBe(25) // 2026-05-25
      expect(date.getHours()).toBe(17)
      expect(date.getMinutes()).toBe(25)
    })

    it('programme ce lundi à 17h25 si on est lundi avant 17h25', async () => {
      vi.setSystemTime(new Date('2026-05-18T10:00:00')) // lundi 10h00

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('weekly')

      const date = getScheduledDate()
      expect(date.getDay()).toBe(1)
      expect(date.getDate()).toBe(18) // même lundi
      expect(date.getHours()).toBe(17)
    })

    it('programme le lundi suivant (+7j) si on est lundi après 17h25', async () => {
      vi.setSystemTime(new Date('2026-05-18T20:00:00')) // lundi 20h00

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('weekly')

      const date = getScheduledDate()
      expect(date.getDay()).toBe(1)
      expect(date.getDate()).toBe(25) // lundi suivant
    })

    it('programme le lendemain (lundi) si aujourd\'hui est dimanche', async () => {
      vi.setSystemTime(new Date('2026-05-17T10:00:00')) // dimanche

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('weekly')

      const date = getScheduledDate()
      expect(date.getDay()).toBe(1)
      expect(date.getDate()).toBe(18) // lundi 18 mai
    })

    it('programme le lundi suivant si aujourd\'hui est samedi', async () => {
      vi.setSystemTime(new Date('2026-05-23T10:00:00')) // samedi

      const { scheduleUserRhythm } = useNotifications()
      await scheduleUserRhythm('weekly')

      const date = getScheduledDate()
      expect(date.getDay()).toBe(1)
      expect(date.getDate()).toBe(25) // lundi 25 mai
    })
  })

  // ─── saveNotificationSettings / getNotificationSettings ────────────────────

  describe('saveNotificationSettings', () => {
    it('sérialise et sauvegarde les paramètres dans Preferences', async () => {
      const { saveNotificationSettings } = useNotifications()
      await saveNotificationSettings({ enabled: true, frequency: 'daily' })

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'notification_settings',
        value: JSON.stringify({ enabled: true, frequency: 'daily' }),
      })
    })
  })

  describe('getNotificationSettings', () => {
    it('désérialise et retourne les paramètres stockés', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify({ enabled: true, frequency: 'weekly' }),
      })

      const { getNotificationSettings } = useNotifications()
      const settings = await getNotificationSettings()

      expect(settings).toEqual({ enabled: true, frequency: 'weekly' })
    })

    it('retourne null si aucun paramètre n\'est stocké', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({ value: null })

      const { getNotificationSettings } = useNotifications()
      const settings = await getNotificationSettings()

      expect(settings).toBeNull()
    })
  })

  // ─── cancelNotifications ────────────────────────────────────────────────────

  describe('cancelNotifications', () => {
    it('annule la notification avec le bon ID', async () => {
      const { cancelNotifications } = useNotifications()
      await cancelNotifications()

      expect(LocalNotifications.cancel).toHaveBeenCalledWith({
        notifications: [{ id: NOTIFICATION_ID }],
      })
    })
  })

  // ─── restoreNotifications ───────────────────────────────────────────────────

  describe('restoreNotifications', () => {
    it('planifie si activé et aucune notification en attente', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify({ enabled: true, frequency: 'daily' }),
      })
      vi.mocked(LocalNotifications.getPending).mockResolvedValue({ notifications: [] })
      vi.setSystemTime(new Date('2026-05-18T10:00:00'))

      const { restoreNotifications } = useNotifications()
      const settings = await restoreNotifications()

      expect(LocalNotifications.schedule).toHaveBeenCalled()
      expect(settings).toEqual({ enabled: true, frequency: 'daily' })
    })

    it('ne planifie pas si une notification est déjà en attente', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify({ enabled: true, frequency: 'daily' }),
      })
      vi.mocked(LocalNotifications.getPending).mockResolvedValue({
        notifications: [{ id: NOTIFICATION_ID, title: '', body: '' }],
      })

      const { restoreNotifications } = useNotifications()
      await restoreNotifications()

      expect(LocalNotifications.schedule).not.toHaveBeenCalled()
    })

    it('ne planifie pas si les notifications sont désactivées', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify({ enabled: false, frequency: 'daily' }),
      })

      const { restoreNotifications } = useNotifications()
      await restoreNotifications()

      expect(LocalNotifications.schedule).not.toHaveBeenCalled()
    })

    it('retourne null si aucun paramètre stocké', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({ value: null })

      const { restoreNotifications } = useNotifications()
      const settings = await restoreNotifications()

      expect(settings).toBeNull()
    })
  })
})
