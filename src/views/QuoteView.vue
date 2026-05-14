<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ma Citation du Jour</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" @click="handleContentClick">
      <div class="ion-padding">
        <!-- Chargement -->
        <div v-if="loading" class="text-center">
          <ion-spinner name="crescent" />
          <p>Récupération de votre citation...</p>
        </div>

        <!-- Citation -->
        <div class="quote-container" :class="{ ready: isQuoteReady }">
          <div class="quote-date">Citation générée <b>pour vous</b> parmi {{ nbQuotes }} citations<br>{{ currentDateFrench }}</div>
          <div class="quote-text">
            “{{ quote }}”
          </div>
          <div class="quote-author">
            — {{ author }}
            <a v-if="wiki_link" :href="wiki_link" target="_blank" rel="noopener noreferrer">
              <img src="/img/Wiki.png" alt="Wikipedia" class="wiki-icon" />
            </a>
          </div>
          <div class="quote-comment">
            <p :class="{ visible: visibleParagraphs[0] }">Prenez un moment pour méditer sur votre citation.</p>
            <p :class="{ visible: visibleParagraphs[1] }">Si elle vous parle, n'hésitez pas à lui donner une note.</p>
            <p :class="{ visible: visibleParagraphs[2] }">Vous pouvez aussi la partager avec un de vos proches qu'elle peut concerner ou la copier.</p>
            <p :class="{ visible: visibleParagraphs[3] }">Et vous la retrouverez aussi dans votre Historique.</p>
          </div>
        </div>
      </div>
      
      <ion-fab vertical="bottom" horizontal="start" slot="fixed" @click.stop>
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
import { star, starOutline, shareSocial } from 'ionicons/icons'
import { Share } from '@capacitor/share'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/services/api'
import { initializeUser } from '@/services/deviceService';
import { Preferences } from '@capacitor/preferences';
import { useQuoteStore } from '@/store/quote';

const router = useRouter()
const quoteStore = useQuoteStore()
const loading = ref(true)
const quote = ref('')
const quoteId = ref('')
const author = ref('')
const wiki_link = ref('')
const viewedAt = ref<Date | null>(null)
const quotationRated = ref(false)
const rating = ref(0)
const hoverRating = ref(0)
const nbQuotes = ref(0)
const isQuoteReady = ref(false)
const visibleParagraphs = ref([false, false, false, false])

const currentDateFrench = computed(() => {
  const dateToFormat = viewedAt.value || new Date()
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  
  const dayName = days[dateToFormat.getDay()]
  const day = dateToFormat.getDate()
  const monthName = months[dateToFormat.getMonth()]
  const year = dateToFormat.getFullYear()
  const hour = dateToFormat.getHours()
  const minute = dateToFormat.getMinutes()
  const second = dateToFormat.getSeconds()
  
  return `${dayName} ${day} ${monthName} ${year} à ${hour.toString().padStart(2, '0')}h ${minute.toString().padStart(2, '0')}m ${second.toString().padStart(2, '0')}s`
})

function getTodayFormatted(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

function toggleLike() {
  quotationRated.value = true
}

function handleContentClick() {
  if (quotationRated.value) {
    quotationRated.value = false
    rating.value = 0
    hoverRating.value = 0
  }
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
      title: 'Ma citation du jour',
      text: `"${quote.value}" - ${author.value}`,
      dialogTitle: 'Partager cette citation'
    })
  } catch (error) {
    console.error('Erreur lors du partage:', error)
  }
}

onMounted(async () => {
  try {
    // Vérifier si la citation est déjà dans le store
    if (quoteStore.currentQuote.id !== null && quoteStore.currentQuote.text) {
      quoteId.value = String(quoteStore.currentQuote.id)
      quote.value = quoteStore.currentQuote.text
      author.value = quoteStore.currentQuote.author
      wiki_link.value = quoteStore.currentQuote.wiki_link || ''
      nbQuotes.value = quoteStore.currentQuote.nb_quotes || 0
      if (quoteStore.currentQuote.viewed_at) {
        viewedAt.value = new Date(quoteStore.currentQuote.viewed_at)
      }
    } else {
      // Récupérer la citation depuis le serveur
      const geo = 'FR'
      const deviceId = await initializeUser();
      const response = await axios.get('/api/quoteoftheday',
      {
        params: {
          geolocalisation: geo,
          deviceId: deviceId }
      })
      if (response.status === 200 && response.data.text) {
        quoteId.value = response.data.id
        quote.value = response.data.text
        author.value = response.data.author || 'Inconnu'
        wiki_link.value = response.data.wiki_link || ''
        nbQuotes.value = response.data.nb_quotes || 0
        if (response.data.viewed_at) {
          viewedAt.value = new Date(response.data.viewed_at)
        }
        
        // Sauvegarder dans le store
        quoteStore.setQuote({
          id: response.data.id,
          text: response.data.text,
          author: response.data.author || 'Inconnu',
          wiki_link: response.data.wiki_link || '',
          viewed_at: response.data.viewed_at,
          nb_quotes: response.data.nb_quotes
        })
      } else {
        quote.value = "Le hasard c'est Dieu qui se balade incognito"
        author.value = 'Albert Einstein'
      }
    }
  } catch (e) {
    console.log(e)
    quote.value = "Le hasard c'est Dieu qui se balade incognito"
    author.value = 'Albert Einstein'
  } finally {
    setTimeout(async () => {
      loading.value = false
      isQuoteReady.value = true
      await Preferences.set({
        key: 'last_quote_view',
        value: getTodayFormatted()
      })
      // Afficher les paragraphes un par un avec 2000ms d'intervalle
      setTimeout(() => {
        visibleParagraphs.value[0] = true
        setTimeout(() => {
          visibleParagraphs.value[1] = true
          setTimeout(() => {
            visibleParagraphs.value[2] = true
            setTimeout(() => {
              visibleParagraphs.value[3] = true
            }, 2000)
          }, 2000)
        }, 2000)
      }, 5000)
    }, 1500);
    
  }
})
</script>

<style scoped>
.quote-container {
  max-width: 600px;
  margin: 2rem auto;
  margin-top:0rem;
  text-align: center;
  opacity: 0;
  transition: opacity 2s ease-out;
  padding:20px;
}

.quote-container.ready{
  opacity: 1;
}

.quote-date {
  font-size: 1rem;
  color: var(--ion-text-color-step-250);
  margin-bottom: 1.5rem;
  /*text-transform: lowercase;*/
}

.quote-text {
  font-size: 1.5rem;
  font-style: italic;
  font-family: garamond, serif;
  line-height: 1.8;
  margin: 2rem 0;
  margin-top:3rem;
  color: var(--ion-text-color);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.quote-comment {
  margin-top: 3rem;
  font-size: 1rem;
  color: var(--ion-text-color-step-250);
  text-align: left;
  padding-left: 40px;
}

.quote-comment p {
  opacity: 0;
  transition: opacity 2s ease-in;
  text-align: right;
  font-style: italic;
}

.quote-comment p.visible {
  opacity: 1;
}

.quote-icon-left,
.quote-icon-right {
  width: 30px;
  height: 30px;
  opacity: 0.5;
  flex-shrink: 0;
}

.quote-icon-left {
  margin-top: -5px;
}

.quote-icon-right {
  align-self: flex-end;
  margin-bottom: -5px;
}

.quote-author {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  text-align: right;
  color: var(--ion-text-color-step-250);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.wiki-icon {
  width: 27px;
  height: 27px;
  vertical-align: middle;
  border: 1px solid #000;
  border-radius: 15%;
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
