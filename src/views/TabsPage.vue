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
      </div>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content">
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/welcome">
          <ion-icon aria-hidden="true" :icon="bulbOutline" />
          <!--img src="/img/quote-icon-white.svg" alt="Logo" style="width: 22px; height: 22px;" /-->
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
import { useRouter } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import axios from '@/services/api';



// const conceptComponent = markRaw(concept);
// const menuLink = useTemplateRef('menuLink');
const router = useRouter();

function goToConcept() {
  //menuLink.value?.toggle()
  router.push('/tabs/intro')
}

function goToLegal() {
  //menuLink.value?.toggle()
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
  try {
    // Récupérer le device_uuid
    const { value: deviceId } = await Preferences.get({ key: 'user_uuid' });
    
    /*if (deviceId) {
      // Appeler l'API pour supprimer l'entrée de la date du jour
      await axios.delete('/api/today-quote-view', {
        params: { device_id: deviceId }
      });
    }
    
    // Supprimer la préférence locale
    await Preferences.remove({ key: 'last_quote_view' });*/
    
    // Rediriger
    window.location.href = import.meta.env.BASE_URL || '/';
  } catch (error) {
    console.error('Error simulating new return:', error);
    window.location.href = import.meta.env.BASE_URL || '/';
  }
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
    
    // Rediriger
    window.location.href = import.meta.env.BASE_URL || '/';
  } catch (error) {
    console.error('Error simulating first launch:', error);
    window.location.href = import.meta.env.BASE_URL || '/';
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
