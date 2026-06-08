import { LocalNotifications, type Weekday } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Heure d'envoi de la notification
// ⚠️ TEMPORAIRE (test) — remettre 13:25 avant prod
const NOTIFY_HOUR = 17;
const NOTIFY_MINUTE = 48;

// Jour de la notification hebdomadaire — lundi.
// Capacitor : Sunday = 1, Monday = 2, ... Saturday = 7
const WEEKLY_WEEKDAY: Weekday = 2 as Weekday;

export function useNotifications() {

  const NOTIFICATION_ID = 20260416;

  /**
   * Demande la permission d'afficher des notifications.
   * Indispensable sur Android 13+ (POST_NOTIFICATIONS) et iOS.
   * Retourne true si la permission est accordée.
   */
  const ensurePermission = async (): Promise<boolean> => {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'prompt' || perm.display === 'prompt-with-rationale') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  };

  /**
   * Programme une notification répétitive gérée par l'OS.
   *
   * On utilise une planification CALENDAIRE (`on` + `repeats: true`) :
   * la notification se déclenche à l'heure d'horloge exacte chaque jour
   * (ou chaque lundi), sans décalage progressif, et survit à la fermeture
   * de l'app comme au redémarrage de l'appareil — contrairement à une
   * reprogrammation manuelle via les listeners, qui ne se déclenche pas
   * lorsque l'app est fermée.
   */
  const scheduleUserRhythm = async (frequence: 'daily' | 'weekly') => {
    const granted = await ensurePermission();
    if (!granted) {
      console.warn('Permission de notification refusée, planification annulée.');
      return false;
    }

    // Annuler l'ancienne programmation avant d'en recréer une
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

    // Planification calendaire répétitive native
    const on =
      frequence === 'daily'
        ? { hour: NOTIFY_HOUR, minute: NOTIFY_MINUTE }
        : { weekday: WEEKLY_WEEKDAY, hour: NOTIFY_HOUR, minute: NOTIFY_MINUTE };

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_ID,
        title: 'Ma citation du jour',
        body: 'Votre citation du jour vous attend !',
        schedule: {
          on,
          repeats: true,
          // Permet le déclenchement même en mode Doze (Android),
          // sans exiger la permission d'alarme exacte (compatible Play Store).
          allowWhileIdle: true,
        },
      }],
    });

    return true;
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    await Preferences.set({
      key: NOTIFICATION_SETTINGS_KEY,
      value: JSON.stringify(settings),
    });
  };

  const getNotificationSettings = async (): Promise<NotificationSettings | null> => {
    const { value } = await Preferences.get({ key: NOTIFICATION_SETTINGS_KEY });
    if (value) {
      return JSON.parse(value) as NotificationSettings;
    }
    return null;
  };

  const cancelNotifications = async () => {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
  };

  /**
   * Au démarrage de l'app, ré-applique la planification si l'utilisateur
   * a activé les notifications. L'opération est idempotente (annule puis
   * reprogramme), ce qui garantit l'état correct même après une mise à
   * jour de l'app ou si la planification a été perdue.
   */
  const restoreNotifications = async () => {
    const settings = await getNotificationSettings();
    if (settings && settings.enabled) {
      await scheduleUserRhythm(settings.frequency);
    }
    return settings;
  };

  /** Notification de test, déclenchée 5 secondes plus tard (debug). */
  const scheduleSimpleNotification = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      console.warn('Permission de notification refusée.');
      return;
    }
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: NOTIFICATION_ID,
          title: 'Ma citation du jour',
          body: 'Votre citation du jour vous attend !',
          schedule: { at: new Date(Date.now() + 5000) },
        }],
      });
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification de test :', error);
    }
  };

  return {
    ensurePermission,
    scheduleUserRhythm,
    scheduleSimpleNotification,
    saveNotificationSettings,
    getNotificationSettings,
    cancelNotifications,
    restoreNotifications,
  };
}
