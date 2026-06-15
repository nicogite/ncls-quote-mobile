<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/quote"></ion-back-button>
        </ion-buttons>
        <ion-title>Notez cette citation</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Citation -->
        <div class="quote-container">
          <div class="quote-text">{{ citation }}</div>
          <div class="quote-author">— {{ author }}</div>

          <!-- Rating Section -->
          <div class="rating-section">
            <p class="rating-title">Cette citation vous a plu ?</p>
            <p class="rating-subtitle">Donnez une note de 1 à 5 étoiles</p>
            
            <div class="stars">
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

            <p v-if="rating > 0" class="rating-feedback">
              {{ getRatingText(rating) }}
            </p>
          </div>

          <!-- Submit Button -->
          <ion-button 
            expand="block" 
            class="ion-margin-top submit-button"
            :disabled="rating === 0"
            @click="submitRating"
          >
            {{ rating === 0 ? 'Sélectionnez une note' : 'Valider ma notation' }}
          </ion-button>

          <!-- Back Link -->
          <div class="back-link ion-margin-top">
            <ion-button fill="clear" router-link="/tabs/quote">
              Retour à la citation
            </ion-button>
          </div>
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
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  toastController
} from '@ionic/vue'
import { star, starOutline } from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/services/api'
import { initializeUser } from '@/services/deviceService'

const router = useRouter()
const citation = ref('')
const author = ref('')
const quoteId = ref<number | null>(null)
const rating = ref(0)
const hoverRating = ref(0)

function setRating(starValue: number) {
  rating.value = starValue
}

function getRatingText(ratingValue: number): string {
  const texts = [
    '',
    '⭐ Pas terrible',
    '⭐⭐ Bof',
    '⭐⭐⭐ Pas mal',
    '⭐⭐⭐⭐ Très bien !',
    '⭐⭐⭐⭐⭐ Excellent !'
  ]
  return texts[ratingValue] || ''
}

async function submitRating() {
  if (rating.value === 0) return

  try {
    const deviceId = await initializeUser()
    
    // Envoyer la notation au backend
    await axios.post('/api/ratings', {
      quoteId: quoteId.value,
      deviceId: deviceId,
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

onMounted(async () => {
  try {
    const geo = 'FR'
    const deviceId = await initializeUser()
    const response = await axios.get('/api/quoteoftheday', {
      params: {
        geolocalisation: geo,
        deviceId: deviceId
      }
    })
    
    if (response.status === 200 && response.data.text) {
      citation.value = response.data.text
      author.value = response.data.author || 'Inconnu'
      quoteId.value = response.data.id
    } else {
      citation.value = "Le hasard c'est Dieu qui se balade incognito"
      author.value = 'Albert Einstein'
    }
  } catch (e) {
    console.log(e)
    citation.value = "Le hasard c'est Dieu qui se balade incognito"
    author.value = 'Albert Einstein'
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
  color: var(--ion-color-medium);
}

.rating-section {
  margin-top: 3rem;
  padding: 2rem;
  background-color: var(--ion-color-light);
  border-radius: 12px;
}

.rating-title {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.rating-subtitle {
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: var(--ion-color-medium);
}

.stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.stars ion-icon {
  font-size: 3rem;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stars ion-icon.active {
  color: var(--mcdj-gold-500);
  transform: scale(1.1);
}

.stars ion-icon.hover {
  color: var(--mcdj-gold-500);
  opacity: 0.7;
}

.stars ion-icon:hover {
  transform: scale(1.2);
}

.rating-feedback {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--ion-color-primary);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submit-button {
  margin-top: 2rem;
  --background: var(--ion-color-primary);
  font-weight: 600;
}

.submit-button[disabled] {
  --background: var(--ion-color-medium);
  opacity: 0.5;
}

.back-link {
  text-align: center;
}

.back-link ion-button {
  --color: var(--ion-color-medium);
}
</style>
