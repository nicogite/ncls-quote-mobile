import { Capacitor } from '@capacitor/core';
import { Badge } from '@capawesome/capacitor-badge';

/**
 * Gestion de la pastille (badge) sur l'icône de l'application.
 *
 * Le serveur envoie `badge: 1` dans le payload APNs pour faire apparaître la
 * pastille rouge sur iOS. Cette valeur est absolue et ne se réinitialise pas
 * seule : on l'efface donc quand l'utilisateur ouvre l'app (démarrage à froid
 * et retour au premier plan), signe qu'il a « vu » la notification.
 */
export function useBadge() {
  const clearBadge = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Vérifie que le badge est autorisé avant d'agir (permission accordée
      // en même temps que la permission de notification push).
      const { isSupported } = await Badge.isSupported();
      if (!isSupported) return;

      await Badge.clear();
    } catch (error) {
      console.error('Erreur lors de la remise à zéro du badge :', error);
    }
  };

  return { clearBadge };
}
