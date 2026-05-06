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
      // Programmer pour 13h25
      scheduleDate.setHours(13, 25, 0, 0);
      
      // Si l'heure est déjà passée aujourd'hui, programmer pour demain
      if (scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }
    } else {
      // Programmer pour lundi 13h25
      scheduleDate.setHours(13, 25, 0, 0);
      const currentDay = scheduleDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay) % 7;
      
      scheduleDate.setDate(scheduleDate.getDate() + daysUntilMonday);
      
      // Si c'est déjà lundi mais après 13h25, aller au lundi suivant
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
          // Ne pas utiliser repeats pour éviter le décalage progressif
          // La reprogrammation se fait via le listener
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
      // Vérifier si une notification est déjà programmée
      const pending = await LocalNotifications.getPending();
      const alreadyScheduled = pending.notifications.some(n => n.id === NOTIFICATION_ID);
      
      if (!alreadyScheduled) {
        // Aucune notification programmée, on la crée
        console.log('Aucune notification programmée, création d\'une nouvelle...');
        await scheduleUserRhythm(settings.frequency);
      } else {
        console.log('Notification déjà programmée');
      }
    }
    return settings;
  };

  const initializeNotificationListener = () => {
    // Écouter quand l'utilisateur interagit avec la notification
    LocalNotifications.addListener('localNotificationActionPerformed', async () => {
      console.log('Notification cliquée, reprogrammation de la prochaine...');
      // Reprogrammer immédiatement la prochaine notification
      const settings = await getNotificationSettings();
      if (settings && settings.enabled) {
        await scheduleUserRhythm(settings.frequency);
      }
    });

    // Écouter quand une notification est reçue (app au premier plan)
    LocalNotifications.addListener('localNotificationReceived', async () => {
      console.log('Notification reçue (app au premier plan), reprogrammation de la prochaine...');
      // Reprogrammer immédiatement la prochaine notification
      const settings = await getNotificationSettings();
      if (settings && settings.enabled) {
        await scheduleUserRhythm(settings.frequency);
      }
    });
  };

  const scheduleSimpleNotification = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: NOTIFICATION_ID,
          title: "Ma citation du jour",
          body: "Votre citation du jour vous attend !",
          schedule: { at: new Date(Date.now() + 5000) }, // 5 secondes dans le futur
        }]
      });
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification simple :', error);
    }
  }

  return { 
    scheduleUserRhythm,
    saveNotificationSettings,
    getNotificationSettings,
    cancelNotifications,
    restoreNotifications,
    initializeNotificationListener,
    scheduleSimpleNotification
  };
}