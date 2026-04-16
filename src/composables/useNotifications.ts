import { LocalNotifications } from '@capacitor/local-notifications';

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

  return { scheduleUserRhythm };
}