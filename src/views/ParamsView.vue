<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/welcome"></ion-back-button>
        </ion-buttons>
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding params-page">
      <ion-list>
        <!-- Toggle pour activer/désactiver les notifications -->
        <ion-item>
          <ion-label>Notifications</ion-label>
          <ion-toggle color="primary"
            v-model="notificationsEnabled"
            @ionChange="onNotificationsToggle"
          ></ion-toggle>
        </ion-item>

        <!-- Options de fréquence des notifications -->
        <ion-radio-group v-model="notificationFrequency" :disabled="!notificationsEnabled">
          <ion-list-header>
            <ion-label :class="{ disabled: !notificationsEnabled }">Fréquence des notifications</ion-label>
          </ion-list-header>

          <ion-item :disabled="!notificationsEnabled">
            <!--ion-label for="frequency">1 fois par jour</ion-label-->
            <ion-radio name="frequency" slot="start" value="daily" color="primary" label-placement="end">1 fois par jour</ion-radio>
          </ion-item>
          <!--p>A l'heure suivante :</p>
          <ion-datetime-button datetime="datetime"></ion-datetime-button>

          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="datetime"
              presentation="time"
              value="2023-11-02T01:22:00"
            ></ion-datetime>
          </ion-modal-->
          <ion-item :disabled="!notificationsEnabled">
            <ion-radio name="frequency" slot="start" value="weekly" color="primary" label-placement="end">Chaque semaine</ion-radio>
          </ion-item>

          <!--div id="weekly-options" style="display: flex; flex-wrap: wrap; margin-left: 40px; margin-top: 10px;">
            <ion-button class="weekly-option">Lun</ion-button>
            <ion-button class="weekly-option">Mar</ion-button>
            <ion-button class="weekly-option">Mer</ion-button>
            <ion-button class="weekly-option">Jeu</ion-button>
            <ion-button class="weekly-option">Ven</ion-button>
            <ion-button class="weekly-option">Sam</ion-button>
            <ion-button class="weekly-option">Dim</ion-button>
          </div-->

          <!--ion-item :disabled="!notificationsEnabled">
            <ion-radio name="frequency" slot="start" value="monthly" color="primary" label-placement="end">1 fois par mois</ion-radio>
          </ion-item-->

          
        </ion-radio-group>
      </ion-list>
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
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonRadioGroup,
  IonRadio,
  IonListHeader,
  IonButtons,
  IonBackButton,
  /*IonDatetime, 
  IonDatetimeButton,
  IonModal*/
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

// État des notifications
const notificationsEnabled = ref(true);
const notificationFrequency = ref<'daily' | 'weekly'>('daily');

const { scheduleUserRhythm } = useNotifications();

// Charger les préférences sauvegardées (à implémenter avec Capacitor Preferences)
// TODO: Charger depuis le stockage local

// Gérer le changement du toggle des notifications
const onNotificationsToggle = async () => {
  // TODO: Sauvegarder la préférence
  console.log('Notifications enabled:', notificationsEnabled.value);
  if (notificationsEnabled.value) {
    await scheduleUserRhythm(notificationFrequency.value);
    console.log('Notification frequency:', notificationFrequency.value);
  }
};

// Observer les changements de fréquence
watch(notificationFrequency, async (newValue) => {
  if (notificationsEnabled.value) {
    // TODO: Sauvegarder la préférence
    await scheduleUserRhythm(newValue);
    console.log('Notification frequency:', newValue);
  }
});
</script>

<style scoped>
ion-item[disabled] {
  opacity: 0.5;
}

ion-list-header {
  margin-top: 20px;
}

ion-label.disabled {
  opacity: 0.5;
  /*color: var(--ion-color-medium);*/
}

.list-md, .list-ios {
  background: none;
}

.item.md, .item.ios {
  background: none;
}

ion-label {
  font-size: 1.15rem;
}

/*button.weekly-option {
  padding-inline: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 8px;
  margin-inline: 2px;
  margin-top: 0px;
  margin-bottom: 5px;
  position: relative;
  transition: color 150ms ease-in-out;
  border: medium;
  background: var(--ion-color-step-300, var(--ion-background-color-step-300, #edeef0));
  color: var(--ion-text-color, #000);
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  overflow: hidden;
  appearance: none;
}*/

</style>

<style>
/* Styles non-scoped pour les variables CSS Ionic */
.params-page ion-item {
  --inner-border-width: 0px;
  --background: transparent;
}
</style>
