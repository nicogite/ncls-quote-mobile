import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

/**
 * Notifications locales : ne sert plus qu'au bouton de test (5 s) et au
 * stockage des préférences. La notification quotidienne/hebdomadaire est
 * désormais un push FCM envoyé par le serveur — voir usePushNotifications.
 */
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

  /**
   * Annule la notification locale planifiée par les anciennes versions de
   * l'app (avant le passage au push serveur).
   */
  const cancelNotifications = async () => {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
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
    scheduleSimpleNotification,
    saveNotificationSettings,
    getNotificationSettings,
    cancelNotifications,
  };
}
