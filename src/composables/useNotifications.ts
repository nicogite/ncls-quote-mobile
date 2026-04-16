import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotifications() {
  
  const scheduleUserRhythm = async (frequence: 'daily' | 'weekly') => {
    // Vérifier les permissions
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Annuler les anciennes programmations
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    // Configurer la nouvelle date
    const scheduleOn = frequence === 'daily' 
      ? { hour: 9, minute: 0 } 
      : { weekday: 2, hour: 9, minute: 0 }; // Lundi 9h

    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: "Ma citation du jour",
        body: "Votre citation du jour vous attend !",
        schedule: { on: scheduleOn, repeats: true },
      }]
    });
  };

  return { scheduleUserRhythm };
}