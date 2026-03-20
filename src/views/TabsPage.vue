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
          <ion-nav-link @click="clearLastQuoteView" class="menu-item">
            Vider le local storage
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



// const conceptComponent = markRaw(concept);
// const menuLink = useTemplateRef('menuLink');
const router = useRouter();

function goToConcept() {
  //menuLink.value?.toggle()
  router.push('/tabs/concept')
}

function goToLegal() {
  //menuLink.value?.toggle()
  router.push('/tabs/cgu')
}

async function clearLastQuoteView() {
  await Preferences.remove({ key: 'last_quote_view' })
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
