<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mentions légales</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mentions légales</ion-title>
          <ion-buttons slot="end">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <div v-if="loading" class="text-center">
          <ion-spinner name="crescent" />
        </div>
        <div v-else v-html="cgu" class="content"></div>
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
  IonSpinner
} from '@ionic/vue'
import { ref, onMounted } from 'vue'
import axios from '@/services/api'

const loading = ref(true)
const cgu = ref('')
const error = ref('')

onMounted(async () => {
  /*try {
    const response = await axios.get('/api/content/cgu')
    if (response.status === 200 && response.data.content) {
      cgu.value = response.data.content.value
      console.log('cgu value', cgu.value)
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }*/
  try {
    const response = await axios.get('/api/content/cgu')
    console.log('Response data:', response.data);
    if (response.status === 200 && response.data.value) {
      cgu.value = response.data.value
      console.log('Concept content set:', cgu.value);
    }
  } catch (err) {
    console.error('Error loading concept content:', err)
    error.value = 'Impossible de charger le contenu du concept'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.text-center {
  text-align: center;
  padding: 2rem;
}

.content {
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}
</style>
