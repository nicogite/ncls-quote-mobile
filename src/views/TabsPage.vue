<template>
  <ion-menu content-id="main-content" ref="menuLink">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="menu-links">
        <ion-menu-toggle>
          <ion-nav-link @click="goToConcept" class="menu-item">
            Le concept
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="goToLegal" class="menu-item">
            Mentions légales
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="simulateFirstLaunch" class="menu-item">
            Simuler premier lancement
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="simulateFirstQuoteOfTheDay" class="menu-item">
            Simuler première citation
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="simulateNewReturn" class="menu-item">
            Simuler un nouveau retour
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="testNotification" class="menu-item">
            Test notification (5s)
          </ion-nav-link>
        </ion-menu-toggle>
      </div>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content">
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/quote" :selected="isOnQuoteOrWelcome">
          <ion-icon aria-hidden="true" :icon="bulbOutline" />
          <ion-label>Ma citation</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/history">
          <ion-icon aria-hidden="true" :icon="menu" />
          <ion-label>Mon historique</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/params">
          <ion-icon aria-hidden="true" :icon="notifications" />
          <ion-label>Notifications</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonNavLink,
  IonPage,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonMenuToggle
} from '@ionic/vue';
import { notifications, bulbOutline, menu } from 'ionicons/icons';
import { useRouter, useRoute } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import axios from '@/services/api';
import { computed } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

const router = useRouter();
const route = useRoute();
const { scheduleSimpleNotification } = useNotifications();

const isOnQuoteOrWelcome = computed(() => {
  return route.path === '/tabs/welcome' || route.path === '/tabs/quote';
});

function goToConcept() {
  router.push('/tabs/intro')
}

function goToLegal() {
  router.push('/tabs/cgu')
}

async function simulateFirstQuoteOfTheDay() {
  try {
    // Récupérer le device_uuid
    const { value: deviceId } = await Preferences.get({ key: 'user_uuid' });
    
    if (deviceId) {
      // Appeler l'API pour supprimer l'entrée de la date du jour
      await axios.delete('/api/today-quote-view', {
        params: { device_id: deviceId }
      });
    }
    
    // Supprimer la préférence locale
    await Preferences.remove({ key: 'last_quote_view' });
    
    // Rediriger
    window.location.href = import.meta.env.BASE_URL || '/';
  } catch (error) {
    console.error('Error simulating first quote of the day:', error);
    window.location.href = import.meta.env.BASE_URL || '/';
  }
}

async function simulateNewReturn() {
  window.location.href = import.meta.env.BASE_URL || '/';
}

async function simulateFirstLaunch() {
  try {
    // Récupérer le device_uuid
    const { value: deviceId } = await Preferences.get({ key: 'user_uuid' });
    
    if (deviceId) {
      // Appeler l'API pour supprimer l'entrée de la date du jour
      await axios.delete('/api/today-quote-view', {
        params: { device_id: deviceId }
      });
    }
    
    // Supprimer les préférences locales
    await Preferences.remove({ key: 'first_launch' });
    await Preferences.remove({ key: 'last_quote_view' });
    await Preferences.remove({ key: 'user_uuid' });
    
    // Rediriger
    window.location.href = import.meta.env.BASE_URL || '/';
  } catch (error) {
    console.error('Error simulating first launch:', error);
    window.location.href = import.meta.env.BASE_URL || '/';
  }
}

async function testNotification() {
  try {
    await scheduleSimpleNotification();
  } catch (error) {
    console.error('Erreur lors du test de notification:', error);
  }
}
</script>

<style scoped>

.menu-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.2s;
  font-size:1.15rem;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

</style>
