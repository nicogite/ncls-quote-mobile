import { Preferences } from '@capacitor/preferences';
import axios from './api';

export const initializeUser = async () => {
  // 1. Vérifier si un ID existe déjà localement
  const { value: storedUuid } = await Preferences.get({ key: 'user_uuid' });

  if (storedUuid) {
    // L'utilisateur est connu, on peut charger ses préférences
    return storedUuid;
  } else {
    // 2. Premier lancement : On demande un ID au serveur
    try {
      const response = await axios.post('api/users');
      const newUuid = response.data.device_uuid;

      // 3. Sauvegarde locale pour les prochaines fois
      await Preferences.set({
        key: 'user_uuid',
        value: newUuid,
      });

      return newUuid;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur anonyme", error);
    }
  }
};