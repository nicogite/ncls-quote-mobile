import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import axios from '@/services/api';
import { useNotifications } from './useNotifications';

/**
 * Notifications push (FCM) envoyées par le serveur.
 *
 * Remplace l'ancienne planification locale (alarmes Android), peu fiable :
 * sans permission d'alarme exacte les déclenchements sont différés en Doze,
 * et les surcouches constructeurs (MIUI, EMUI…) suppriment les alarmes des
 * apps force-stoppées. Un push FCM haute priorité est délivré par les Play
 * Services même app fermée — c'est le serveur (cron de quote-api) qui envoie.
 */
export function usePushNotifications() {

  const { getNotificationSettings, saveNotificationSettings, cancelNotifications } =
    useNotifications();

  /**
   * Attend le token FCM délivré par l'OS après PushNotifications.register().
   *
   * Les écouteurs sont attachés AVANT register() : lors d'un ré-enregistrement
   * (après une désactivation), FCM renvoie le token en cache quasi
   * instantanément et l'événement 'registration' peut survenir avant que
   * l'écouteur ne soit attaché — il serait alors perdu, provoquant un timeout
   * et l'impossibilité de réactiver les notifications.
   */
  const waitForRegistrationToken = async (): Promise<string> => {
    const handles: Array<{ remove: () => Promise<void> }> = [];
    const cleanup = () => handles.forEach((handle) => handle.remove());

    try {
      return await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Délai d'enregistrement push dépassé")),
          15000
        );

        Promise.all([
          PushNotifications.addListener('registration', (token) => {
            clearTimeout(timer);
            resolve(token.value);
          }),
          PushNotifications.addListener('registrationError', (err) => {
            clearTimeout(timer);
            reject(new Error(err.error));
          }),
        ])
          .then((added) => {
            handles.push(...added);
            // Écouteurs attachés : on peut déclencher l'enregistrement.
            return PushNotifications.register();
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    } finally {
      cleanup();
    }
  };

  /**
   * Demande la permission, récupère le token FCM et enregistre l'appareil
   * auprès de l'API avec la fréquence choisie. Retourne false si la
   * permission est refusée ou si l'enregistrement échoue.
   */
  const enablePush = async (frequency: 'daily' | 'weekly'): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Notifications push indisponibles hors plateforme native.');
      return false;
    }

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      console.warn('Permission de notification refusée, enregistrement push annulé.');
      return false;
    }

    try {
      const token = await waitForRegistrationToken();
      const { value: deviceId } = await Preferences.get({ key: 'user_uuid' });
      if (!deviceId) {
        console.warn('Aucun device_uuid : enregistrement push impossible.');
        return false;
      }

      await axios.post('/api/push/register', {
        device_id: deviceId,
        token,
        frequency,
        platform: Capacitor.getPlatform(),
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement push :", error);
      return false;
    }
  };

  /** Désinscrit l'appareil côté serveur et invalide le token local. */
  const disablePush = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { value: deviceId } = await Preferences.get({ key: 'user_uuid' });
      if (deviceId) {
        await axios.post('/api/push/unregister', { device_id: deviceId });
      }
      await PushNotifications.unregister();
    } catch (error) {
      console.error('Erreur lors de la désinscription push :', error);
    }
  };

  /**
   * Au démarrage de l'app : purge l'ancienne notification locale planifiée
   * (versions précédentes de l'app), puis :
   *  - si l'utilisateur a déjà un réglage, ré-enregistre le token auprès du
   *    serveur quand les notifications sont activées — le token FCM peut
   *    changer (mise à jour, restauration), le serveur doit avoir le dernier ;
   *  - au tout premier lancement (aucun réglage), les notifications sont
   *    activées par défaut en quotidien : on demande la permission et on
   *    enregistre. L'état réellement obtenu (accordé/refusé) est persisté pour
   *    ne pas redemander la permission à chaque lancement.
   */
  const restorePushRegistration = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await cancelNotifications();
    } catch {
      // L'absence de notification locale à annuler n'est pas une erreur
    }

    const settings = await getNotificationSettings();
    if (settings) {
      if (settings.enabled) {
        await enablePush(settings.frequency);
      }
      return;
    }

    // Premier lancement : opt-in par défaut (quotidien).
    const enabled = await enablePush('daily');
    await saveNotificationSettings({ enabled, frequency: 'daily' });
  };

  return {
    enablePush,
    disablePush,
    restorePushRegistration,
  };
}
