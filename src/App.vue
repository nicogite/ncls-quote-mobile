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
import { initializeUser } from '@/services/deviceService';
import { ensureContentLoaded } from '@/services/contentService';

const isBootstrapping = ref(true)
const MIN_SPLASH_DURATION_MS = 3000

onMounted(async () => {
  try {
    const [deviceId] = await Promise.all([
      initializeUser(),
      ensureContentLoaded(),
      new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_DURATION_MS))
    ])
    console.log('Device ID:', deviceId);
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
  --background: url('/img/water-ripples.jpg');
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