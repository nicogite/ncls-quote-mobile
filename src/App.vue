<template>
  <ion-app>
    <div v-if="isBootstrapping" class="app-splash-screen">
      <div class="app-splash-content">
        <img src="/img/quote-icon-white.svg" alt="The Quote" class="app-splash-logo" />
        <h1>Ma citation du jour</h1>
        <p>Préparation de l’application...</p>
      </div>
    </div>
    <ion-router-outlet v-show="!isBootstrapping" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import { initializeUser } from '@/services/deviceService';
import { ensureContentLoaded } from '@/services/contentService';
import axios from '@/services/api';
import { useQuoteStore } from '@/store/quote';

const isBootstrapping = ref(true)
const MIN_SPLASH_DURATION_MS = 3000
const router = useRouter()

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
      new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DURATION_MS))
    ])
    console.log('Device ID:', deviceId);

    // Vérifier si c'est le premier lancement
    const { value: firstLaunch } = await Preferences.get({ key: 'first_launch' });
    console.log('First launch value from preferences:', firstLaunch);
    if (firstLaunch === null) {
      // Première visite : définir la variable et rediriger vers /intro
      console.log('First launch detected, setting preference and redirecting to /intro');
      await Preferences.set({ key: 'first_launch', value: 'false' });
      router.push('/intro');
    } else {
      // Vérifier si la citation a déjà été vue aujourd'hui
      console.log('Checking if quote has already been viewed today...');
      const { value: lastQuoteView } = await Preferences.get({ key: 'last_quote_view' })
      if (lastQuoteView === getTodayFormatted()) {
        // Citation déjà vue aujourd'hui : récupérer la citation et rediriger vers /tabs/quote
        console.log('Quote has already been viewed today, fetching quote from server...');
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
              viewed_at: response.data.viewed_at
            })
            console.log('Quote fetched successfully:', response.data);
          }
        } catch (error) {
          console.error('Error fetching quote:', error);
        }
        router.push('/tabs/quote');
      } else {
        // Application déjà lancée, citation pas encore vue : rediriger vers /tabs/welcome
        console.log('Not first launch, quote not viewed yet, redirecting to /tabs/welcome');
        router.push('/tabs/welcome');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation de l’application:', error)
  } finally {
    isBootstrapping.value = false
  }
});
</script>

<style>
#app {
  --background: url('/img/water-ripples.jpg');
  /*background-size: cover;*/
}

ion-app ion-content {
  /*--background: url('/img/water-ripples.jpg');*/
  --background: url('/img/bgd-paper.jpg') center/cover no-repeat;
  background-size: cover;
  /*--background:none;*/
}

#background-content {
  --background: none;
  /*background-size: cover;*/
}

.app-splash-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(29, 53, 87, 0.92) 0%, rgba(69, 123, 157, 0.9) 100%), url('/img/water-ripples.jpg') center/cover no-repeat;
  z-index: 9999;
}

.app-splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: #fff;
}

.app-splash-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
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