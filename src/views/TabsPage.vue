<template>
  <ion-menu content-id="main-content" ref="menu">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="menu-links">
        <ion-nav-link @click="goToConcept" class="menu-item">
          Le concept
        </ion-nav-link> 
        <ion-nav-link @click="goToLegal" class="menu-item">
          Mentions légales
        </ion-nav-link>
      </div>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content">
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/welcome">
          <ion-icon aria-hidden="true" :icon="triangle" />
          <ion-label>Ma citation</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/history">
          <ion-icon aria-hidden="true" :icon="ellipse" />
          <ion-label>Mon historique</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/settings">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>Paramètres</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonNavLink, IonPage, IonRouterOutlet } from '@ionic/vue';
import { ellipse, square, triangle } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';



// const conceptComponent = markRaw(concept);
const menu = ref();
const router = useRouter();

function goToConcept() {
  menu.value.toggle()
  router.push('/tabs/concept')
}

function goToLegal() {
  menu.value.toggle()
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
  font-size:1.15rem
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

</style>
