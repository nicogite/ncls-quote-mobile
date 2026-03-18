<template>
  <ion-app>
    <ion-router-outlet/>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { initializeUser } from '@/services/deviceService';

onMounted(async () => {
  const deviceId = await initializeUser();
  console.log('Device ID:', deviceId);
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

</style>