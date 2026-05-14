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
            <ion-radio name="frequency" slot="start" value="daily" color="primary" label-placement="end">1 fois par jour</ion-radio>
          </ion-item>
          
          <ion-item :disabled="!notificationsEnabled">
            <ion-radio name="frequency" slot="start" value="weekly" color="primary" label-placement="end">Chaque semaine</ion-radio>
          </ion-item>
          
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
import { ref, watch, onMounted } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

// État des notifications
const notificationsEnabled = ref(true);
const notificationFrequency = ref<'daily' | 'weekly'>('daily');

const { 
  scheduleUserRhythm, 
  saveNotificationSettings, 
  getNotificationSettings, 
  cancelNotifications 
} = useNotifications();

// Charger les préférences sauvegardées
onMounted(async () => {
  const settings = await getNotificationSettings();
  if (settings) {
    notificationsEnabled.value = settings.enabled;
    notificationFrequency.value = settings.frequency;
  }
});

// Gérer le changement du toggle des notifications
const onNotificationsToggle = async () => {
  console.log('Notifications enabled:', notificationsEnabled.value);
  
  await saveNotificationSettings({
    enabled: notificationsEnabled.value,
    frequency: notificationFrequency.value
  });
  
  if (notificationsEnabled.value) {
    await scheduleUserRhythm(notificationFrequency.value);
    console.log('Notification frequency:', notificationFrequency.value);
  } else {
    await cancelNotifications();
  }
};

// Observer les changements de fréquence
watch(notificationFrequency, async (newValue) => {
  if (notificationsEnabled.value) {
    await saveNotificationSettings({
      enabled: notificationsEnabled.value,
      frequency: newValue
    });
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

</style>

<style>
/* Styles non-scoped pour les variables CSS Ionic */
.params-page ion-item {
  --inner-border-width: 0px;
  --background: transparent;
}
</style>
