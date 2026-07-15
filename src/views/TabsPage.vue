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
          <ion-nav-link @click="goToContact" class="menu-item">
            Nous contacter
          </ion-nav-link>
        </ion-menu-toggle>
        <ion-menu-toggle>
          <ion-nav-link @click="goToLegal" class="menu-item">
            Mentions légales
          </ion-nav-link>
        </ion-menu-toggle>
      </div>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content" v-bind="$attrs">
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
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

const router = useRouter();
const route = useRoute();

const isOnQuoteOrWelcome = computed(() => {
  return route.path === '/tabs/welcome' || route.path === '/tabs/quote';
});

function goToConcept() {
  router.push('/tabs/intro')
}

function goToContact() {
  router.push('/tabs/contact')
}

function goToLegal() {
  router.push('/tabs/cgu')
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
