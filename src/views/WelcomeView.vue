<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ma citation du jour</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">

      <div class="welcome-ctn ion-padding">
        
        <!-- Contenu chargé depuis la base de données -->
        <div v-if="welcomeContent" class="welcome-content">
          <div v-html="welcomeContent" class="stagger-wrapper" />
          <ion-button class="reveal-quote-button" @click="handleClick">Découvrez votre citation</ion-button>
        </div>
        
        <!-- État de chargement -->
        <div v-else-if="loading" class="text-center">
          <ion-spinner name="crescent" />
        </div>
        
        <!-- Erreur -->
        <div v-else-if="error" class="text-error">
          {{ error }}
        </div>
        
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
  IonButtons,
  IonMenuButton,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ensureContentLoaded, getContentValue, contentState } from '@/services/contentService'

const router = useRouter()
const welcomeContent = ref('')
const loading = ref(false)
const error = ref('')

async function loadWelcomeContent() {
  loading.value = true
  error.value = ''
  try {
    await ensureContentLoaded()
    welcomeContent.value = getContentValue('welcome')
    if (!welcomeContent.value) {
      error.value = 'Impossible de charger le contenu de bienvenue'
    }
  } catch (err) {
    console.error('Error loading welcome content:', err)
    error.value = contentState.contentLoadError.value || 'Impossible de charger le contenu de bienvenue'
  } finally {
    loading.value = false
  }
}

function handleClick() {
  const cookies = document.cookie
  if (cookies.includes('quote_of_the_day=true')) {
    router.push('/tabs/quote')
  } else {
    document.cookie = 'quote_of_the_day=true; path=/'
    router.push('/tabs/quote')
  }
}

onIonViewWillEnter(async () => {
  loadWelcomeContent()
})
</script>

<style scoped>

.welcome-ctn {
  display: flex;
  flex-direction: column;
  align-items: center;
  height:100%;
}

.welcome-content {
  font-size: 1.3rem;
  font-style: italic;
  font-family: garamond, serif;
  text-align:center;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--ion-text-color);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
}

.stagger-wrapper {
  font-style:italic;
}

.stagger-wrapper :deep(p) {
  opacity: 0;
  transform: translateY(10px);
  animation-name: fadeInUp;
  animation-duration: 1000ms;
  animation-fill-mode: forwards;
  animation-timing-function: ease;
  animation-delay: calc(var(--stagger-index, 0) * 0.3s);
  margin-bottom: 1rem;
  
}

.quote-button {
  margin-top: 3rem;
  font-size: 1.15rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-error {
  color: #d32f2f;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.text-center {
  text-align: center;
  padding: 2rem;
}

.reveal-quote-button {
  margin-top: 3rem;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  --background: var(--ion-color-primary);
  font-style:normal;
}
</style>
