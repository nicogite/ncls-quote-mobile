<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inscrivez vous</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <form @submit.prevent="handleSubmit">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" required />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Téléphone</ion-label>
            <ion-input v-model="phone" type="tel" />
          </ion-item>

          <div class="frequency-section">
            <p>À quelle fréquence souhaitez-vous recevoir vos citations du jour :</p>
            <ion-radio-group v-model="frequency">
              <ion-item>
                <ion-label>Chaque jour</ion-label>
                <ion-radio slot="start" value="daily" />
              </ion-item>
              <ion-item>
                <ion-label>Chaque semaine</ion-label>
                <ion-radio slot="start" value="weekly" />
              </ion-item>
              <ion-item>
                <ion-label>Chaque mois</ion-label>
                <ion-radio slot="start" value="monthly" />
              </ion-item>
            </ion-radio-group>
          </div>

          <ion-item lines="none">
            <ion-checkbox v-model="cgu_approved" slot="start" required />
            <ion-label class="ion-text-wrap">
              J'accepte les <a href="/cgu" class="ion-color-primary">Conditions générales d'utilisation</a>
            </ion-label>
          </ion-item>

          <ion-button expand="block" type="submit" class="ion-margin-top">
            Je m'inscris
          </ion-button>
        </form>

        <ion-text v-if="message" color="success" class="ion-text-center">
          <p>{{ message }}</p>
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
  IonRadioGroup,
  IonRadio,
  IonCheckbox,
  IonButton,
  IonText
} from '@ionic/vue'
import { ref } from 'vue'
import axios from '@/services/api'

const email = ref('')
const phone = ref('')
const frequency = ref('daily')
const cgu_approved = ref(false)
const message = ref('')

async function handleSubmit() {
  try {
    await axios.post('/api/subscribe', {
      email: email.value,
      phone: phone.value,
      frequency: frequency.value,
      cgu_approved: cgu_approved.value,
    })
    message.value = "Inscription réussie !"
    email.value = ''
    phone.value = ''
    cgu_approved.value = false
  } catch (e) {
    console.log(e)
    message.value = "Erreur lors de l'inscription."
  }
}
</script>

<style scoped>
.frequency-section {
  margin: 1.5rem 0;
}

.frequency-section p {
  margin-bottom: 1rem;
  padding: 0 1rem;
}
</style>
