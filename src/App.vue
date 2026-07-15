<template>
  <ion-app>
    <div v-if="isBootstrapping" class="app-splash-screen">
      <div class="app-splash-content">
        <img src="/img/splash-screen.jpg" class="app-splash-logo" />
      </div>
    </div>
    <ion-router-outlet v-show="!isBootstrapping" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { initializeUser } from '@/services/deviceService';
import { ensureContentLoaded } from '@/services/contentService';
import axios from '@/services/api';
import { useQuoteStore } from '@/store/quote';
import { usePushNotifications } from '@/composables/usePushNotifications';
import { useBadge } from '@/composables/useBadge';

const isBootstrapping = ref(true)
const MIN_SPLASH_DURATION_MS = 5000
const router = useRouter()
const { restorePushRegistration } = usePushNotifications();
const { clearBadge } = useBadge();

// Efface la pastille de l'icône quand l'app revient au premier plan.
let appStateListener: PluginListenerHandle | null = null

// Précharger la texture de fond pour les autres pages
function preloadTexture(): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // Résoudre même en cas d'erreur pour ne pas bloquer l'app
    img.src = '/img/paper-bgd-2.png'
  })
}

function getTodayFormatted(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

onMounted(async () => {
  try {
    const quoteStore = useQuoteStore()
    const [deviceId] = await Promise.all([
      initializeUser(),
      ensureContentLoaded(),
      preloadTexture(),
      new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DURATION_MS))
    ])

    // Ré-enregistrer le token push auprès du serveur (et purger l'ancienne
    // notification locale planifiée par les versions précédentes)
    await restorePushRegistration();

    // Effacer la pastille au démarrage (l'utilisateur ouvre l'app), puis à
    // chaque retour au premier plan.
    await clearBadge();
    appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) clearBadge();
    });

    // Vérifier si c'est le premier lancement
    const { value: firstLaunch } = await Preferences.get({ key: 'first_launch' });
    if (firstLaunch === null) {
      // Première visite : définir la variable et rediriger vers /intro
      await Preferences.set({ key: 'first_launch', value: 'false' });
      router.push('/intro');
    } else {
      // Vérifier si la citation a déjà été vue aujourd'hui
      const { value: lastQuoteView } = await Preferences.get({ key: 'last_quote_view' })
      if (lastQuoteView === getTodayFormatted()) {
        // Citation déjà vue aujourd'hui : récupérer la citation et rediriger vers /tabs/quote
        try {
          const response = await axios.get('/api/quoteoftheday', {
            params: {
              geolocalisation: 'FR',
              deviceId: deviceId
            }
          })
          if (response.status === 200 && response.data.text) {
            quoteStore.setQuote({
              id: response.data.id,
              text: response.data.text,
              author: response.data.author || 'Inconnu',
              wiki_link: response.data.wiki_link || '',
              interpretation: response.data.interpretation || '',
              viewed_at: response.data.viewed_at,
              nb_quotes: response.data.nb_quotes
            })
          }
        } catch (error) {
          console.error('Error fetching quote:', error);
        }
        router.push('/tabs/quote');
      } else {
        // Application déjà lancée, citation pas encore vue : rediriger vers /tabs/welcome
        router.push('/tabs/welcome');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation de l’application:', error)
  } finally {
    isBootstrapping.value = false
  }
});

onUnmounted(() => {
  appStateListener?.remove()
});
</script>

<style>

ion-app ion-content {
  --background: url('/img/paper-bgd-2.png') center/cover no-repeat;
  background-size: cover;
}

#background-content {
  --background: none;
}

.app-splash-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  z-index: 9999;
  overflow: hidden;
}

.app-splash-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-splash-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-splash-content h1 {
  margin: 0;
  font-size: 1.8rem;
}

.app-splash-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

</style>