import { Preferences } from '@capacitor/preferences';
import axios from './api';

export const initializeUser = async () => {
  console.log('[DeviceService] initializeUser called');
  
  // 1. Vérifier si un ID existe déjà localement
  const { value: storedUuid } = await Preferences.get({ key: 'user_uuid' });
  console.log('[DeviceService] Stored UUID:', storedUuid);

  if (storedUuid) {
    // L'utilisateur est connu, on peut charger ses préférences
    console.log('[DeviceService] Returning existing UUID:', storedUuid);
    return storedUuid;
  } else {
    // 2. Premier lancement : On demande un ID au serveur
    console.log('[DeviceService] No stored UUID found, creating new user...');
    try {
      const response = await axios.post('api/users');
      const newUuid = response.data.device_uuid;
      console.log('[DeviceService] New UUID received from server:', newUuid);

      // 3. Sauvegarde locale pour les prochaines fois
      await Preferences.set({
        key: 'user_uuid',
        value: newUuid,
      });
      console.log('[DeviceService] UUID saved to preferences');

      return newUuid;
    } catch (error) {
      console.error("[DeviceService] Erreur lors de la création de l'utilisateur anonyme", error);
    }
  }
};