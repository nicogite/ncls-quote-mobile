import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export function useNotifications() {
  
  const NOTIFICATION_ID = 20260416;

  const scheduleUserRhythm = async (frequence: 'daily' | 'weekly') => {
    // Vérifier les permissions
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Annuler les anciennes programmations
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

    // Calculer la prochaine occurrence dans le futur
    const now = new Date();
    const scheduleDate = new Date();
    
    if (frequence === 'daily') {
      // Programmer pour 17h00
      scheduleDate.setHours(17, 0, 0, 0);
      
      // Si l'heure est déjà passée aujourd'hui, programmer pour demain
      if (scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }
    } else {
      // Programmer pour lundi 17h00
      scheduleDate.setHours(17, 0, 0, 0);
      const currentDay = scheduleDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay) % 7;
      
      scheduleDate.setDate(scheduleDate.getDate() + daysUntilMonday);
      
      // Si c'est déjà lundi mais après 9h, aller au lundi suivant
      if (currentDay === 1 && scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 7);
      }
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_ID,
        title: "Ma citation du jour",
        body: "Votre citation du jour vous attend !",
        schedule: { 
          at: scheduleDate,
          repeats: true,
          every: frequence === 'daily' ? 'day' : 'week'
        },
      }]
    });
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    await Preferences.set({
      key: NOTIFICATION_SETTINGS_KEY,
      value: JSON.stringify(settings)
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

  const restoreNotifications = async () => {
    const settings = await getNotificationSettings();
    if (settings && settings.enabled) {
      await scheduleUserRhythm(settings.frequency);
    }
    return settings;
  };

  return { 
    scheduleUserRhythm,
    saveNotificationSettings,
    getNotificationSettings,
    cancelNotifications,
    restoreNotifications
  };
}