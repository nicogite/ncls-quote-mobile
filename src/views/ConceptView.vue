<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Le Concept</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <div v-if="loading" class="text-center">
          <ion-spinner name="crescent" />
        </div>
        <div v-else-if="error" class="text-error">
          {{ error }}
        </div>
        <div v-else class="content" v-html="conceptContent"></div>
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
  IonSpinner,
  IonButtons,
  IonMenuButton,
} from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { ensureContentLoaded, getContentValue, contentState } from '@/services/contentService'

const loading = ref(true)
const conceptContent = ref('')
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await ensureContentLoaded()
    conceptContent.value = getContentValue('concept')
    if (!conceptContent.value) {
      error.value = 'Impossible de charger le contenu du concept'
    }
  } catch (err) {
    console.error('Error loading concept content:', err)
    error.value = contentState.contentLoadError.value || 'Impossible de charger le contenu du concept'
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

.text-error {
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 8px;
}

.content {
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
  text-align: justify;
}

.content hr {
  border-top: 1px solid #999;
}
</style>
