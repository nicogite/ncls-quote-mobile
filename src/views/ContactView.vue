<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Contact</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <form @submit.prevent="handleSubmit">
          <ion-item>
            <ion-label position="floating">Votre email</ion-label>
            <ion-input v-model="email" type="email" required />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Votre message</ion-label>
            <ion-textarea
              v-model="message"
              :rows="8"
              required
            />
          </ion-item>

          <ion-button expand="block" type="submit" class="ion-margin-top">
            Envoyer
          </ion-button>
        </form>

        <ion-text v-if="info" color="success" class="ion-text-center">
          <p>{{ info }}</p>
        </ion-text>
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
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonText
} from '@ionic/vue'
import { ref } from 'vue'
import axios from '@/services/api'

const email = ref('')
const message = ref('')
const info = ref('')

async function handleSubmit() {
  try {
    await axios.post('/api/contact', {
      email: email.value,
      message: message.value,
    })
    info.value = "Message envoyé !"
    email.value = ''
    message.value = ''
  } catch (e) {
    console.log(e)
    info.value = "Erreur lors de l'envoi du message."
  }
}
</script>

<style scoped>
ion-item {
  margin-bottom: 1rem;
}
</style>
