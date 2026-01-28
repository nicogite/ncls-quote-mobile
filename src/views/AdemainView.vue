<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>À Demain</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">À Demain</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding ion-text-center">
        <p>Vous avez déjà consulté votre citation du jour. Revenez demain pour découvrir une nouvelle citation !</p>
        <p>
          Ou inscrivez vous
          <a href="/inscription" class="ion-color-primary">ici</a>
          pour recevoir régulièrement votre citation, à la fréquence que vous voulez
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/vue'
</script>

<style scoped>
p {
  margin: 1rem 0;
  line-height: 1.6;
}
</style>
