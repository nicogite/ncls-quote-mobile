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
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ma citation du jour</ion-title>
          <ion-buttons slot="end">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <!-- Chargement -->
        <div v-if="loading" class="text-center">
          <ion-spinner name="crescent" />
          <p>Récupération de votre citation...</p>
        </div>

        <!-- Citation -->
        <div v-else class="quote-container">
          <div class="quote-text">{{ quote }}</div>
          <div class="quote-author">— {{ author }}</div>
        </div>
      </div>
      
      <ion-fab vertical="bottom" horizontal="start" slot="fixed">
        <ion-fab-button id="ratingButton" class="ion-margin-bottom quote-action-button" :class="{ rating: quotationRated }" @click="toggleLike">
          <ion-icon v-if="!quotationRated" :icon="starOutline" size="large" />
          <div class="stars" v-else>
            <ion-icon
              v-for="starNum in 5"
              :key="starNum"
              :icon="starNum <= rating ? star : starOutline"
              :class="{ active: starNum <= rating, hover: starNum <= hoverRating }"
              @click="setRating(starNum)"
              @mouseenter="hoverRating = starNum"
              @mouseleave="hoverRating = 0"
              size="large"
            />
          </div>
        </ion-fab-button>
        <ion-fab-button  class="ion-margin-bottom quote-action-button" @click="shareQuote">
          <ion-icon :icon="shareSocial" size="large" />
        </ion-fab-button>
      </ion-fab>
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
  IonIcon,
  IonFab,
  IonFabButton,
  toastController
} from '@ionic/vue'
import { star, starOutline, copyOutline, shareSocial } from 'ionicons/icons'
import { Clipboard } from '@capacitor/clipboard'
import { Share } from '@capacitor/share'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/services/api'
import { initializeUser } from '@/services/deviceService';

const router = useRouter()
const loading = ref(true)
const quote = ref('')
const quoteId = ref('')
const author = ref('')
const quotationRated = ref(false)
const rating = ref(0)
const hoverRating = ref(0)

async function copyToClipboard() {
  try {
    await Clipboard.write({
      string: `"${quote.value}" - ${author.value}`
    })
    const toast = await toastController.create({
      message: 'Citation copiée dans le presse-papier !',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
  }
}

function redirectToLike() {
  // Navigation vers la page de notation
  router.push('/tabs/notation')
}

function toggleLike() {
  quotationRated.value = true
}

async function setRating(starValue: number) {
  rating.value = starValue

  try {
    const deviceId = await initializeUser()
    
    // Envoyer la notation au backend
    await axios.post('/api/ratings', {
      quote_id: quoteId.value,
      device_id: deviceId,
      rating: rating.value
    })

    const toast = await toastController.create({
      message: `Merci pour votre notation de ${rating.value} étoile${rating.value > 1 ? 's' : ''} !`,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()

    // Rediriger vers la page principale après un délai
    setTimeout(() => {
      router.push('/tabs/quote')
    }, 1500)

  } catch (error) {
    console.error('Erreur lors de la soumission de la notation:', error)
    
    const toast = await toastController.create({
      message: 'Erreur lors de l\'enregistrement de votre notation',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  }
}

async function shareQuote() {
  try {
    await Share.share({
      title: 'Citation du jour',
      text: `"${quote.value}" - ${author.value}`,
      dialogTitle: 'Partager cette citation'
    })
  } catch (error) {
    console.error('Erreur lors du partage:', error)
  }
}

onMounted(async () => {
  try {
    const geo = 'FR'
    console.log('Get devide Id...');
    const deviceId = await initializeUser();
    console.log('deviceId', deviceId);
    const response = await axios.get('/api/quoteoftheday',
    {
      params: {
        geolocalisation: geo,
        deviceId: deviceId }
    })
    console.log('Quote of the day response:', response)
    if (response.status === 200 && response.data.text) {
      quoteId.value = response.data.id
      quote.value = response.data.text
      author.value = response.data.author || 'Inconnu'
    } else {
      quote.value = "Le hasard c'est Dieu qui se balade incognito"
      author.value = 'Albert Einstein'
    }
  } catch (e) {
    console.log(e)
    quote.value = "Le hasard c'est Dieu qui se balade incognito"
    author.value = 'Albert Einstein'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.quote-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}

.quote-text {
  font-size: 1.5rem;
  font-style: italic;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--ion-text-color);
}

.quote-author {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  text-align: right;
  /*color: var(--ion-color-medium);*/
  color: var(--ion-color-medium-shade);
}

.quote-action-button {
  --background: #fff;
  --color: var(--ion-color-medium-shade);
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

#ratingButton {
  transition: width 0.3s ease;
}

ion-fab-button.rating {
  width: 225px;
  height: 56px;
  --border-radius: 28px;
}





/*.action-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}*/

/*.action-button:active {
  transform: scale(0.95);
}*/

/*.action-button ion-icon {
  width: 60px;
  height: 60px;
  padding: 15px;
  border-radius: 50%;
  background-color: var(--ion-color-light);
  color: var(--ion-color-primary);
  transition: all 0.3s ease;
}

.action-button:hover ion-icon {
  background-color: var(--ion-color-primary);
  color: white;
}

.action-button ion-icon.liked {
  color: #FFD700;
  background-color: #FFF8DC;
}

.action-button span {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}*/

.rating-section {
  margin-top: 3rem;
}

.rating-section p {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.stars ion-icon {
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
}

.stars ion-icon.active {
  color: #FFD700;
}

.text-center {
  text-align: center;
  padding: 2rem;
}
</style>
