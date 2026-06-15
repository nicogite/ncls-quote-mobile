<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nous contacter</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <ion-text>
          <p class="intro">
            Une question, une suggestion, une citation à proposer ?
            Écrivez-nous votre message, votre application mail s'ouvrira
            pour finaliser l'envoi.
          </p>
        </ion-text>

        <form @submit.prevent="handleSubmit">
          <ion-item>
            <ion-textarea
              v-model="message"
              placeholder="Votre message"
              :rows="8"
              required
            />
          </ion-item>

          <ion-button expand="block" type="submit" class="ion-margin-top">
            Ouvrir mon application mail
          </ion-button>
        </form>

        <ion-text v-if="info" :color="infoColor" class="ion-text-center">
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
  IonTextarea,
  IonButton,
  IonText,
  IonButtons,
  IonMenuButton
} from '@ionic/vue'
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { EmailComposer } from 'capacitor-email-composer'

const CONTACT_EMAIL = 'contact@arc-mediation.fr'
const SUBJECT = 'Ma Citation du Jour — Contact'

const message = ref('')
const info = ref('')
const infoColor = ref('success')

async function handleSubmit() {
  info.value = ''
  const body = message.value.trim()

  try {
    if (Capacitor.isNativePlatform()) {
      await EmailComposer.open({
        to: [CONTACT_EMAIL],
        subject: SUBJECT,
        body,
        isHtml: false,
      })
    } else {
      // Repli web : ouvre le client mail via mailto:
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`
      window.open(mailto, '_blank')
    }
    infoColor.value = 'success'
    info.value = 'Votre application mail va s\'ouvrir.'
    message.value = ''
  } catch (e) {
    console.error('Email composer error:', e)
    infoColor.value = 'danger'
    info.value = "Impossible d'ouvrir l'application mail. Écrivez-nous à " + CONTACT_EMAIL
  }
}
</script>

<style scoped>
.intro {
  line-height: 1.6;
  margin-bottom: 1rem;
}

ion-item {
  margin-bottom: 1rem;
  --background: #ffffff;
  --color: var(--ion-text-color);
  --border-radius: 8px;
}

ion-textarea {
  --color: var(--ion-text-color);
  --placeholder-color: var(--ion-text-color);
  --placeholder-opacity: 0.5;
}
</style>
