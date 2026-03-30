<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Historique</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Chargement -->
        <div v-if="loading" class="text-center">
          <ion-spinner name="crescent" />
          <p>Chargement de votre historique...</p>
        </div>

        <!-- Message si vide -->
        <div v-else-if="history.length === 0" class="empty-state">
          <ion-icon :icon="bookOutline" size="large" />
          <h2>Aucune citation</h2>
          <p>Commencez à découvrir des citations pour construire votre historique !</p>
          <ion-button class="reveal-quote-button" router-link="/tabs/quote" expand="block">
            Découvrir une citation
          </ion-button>
        </div>

        <!-- Liste des citations -->
        <div v-else>
          <p class="history-count">{{ history.length }} citation{{ history.length > 1 ? 's' : '' }}</p>
          
          <ion-card v-for="item in history" :key="item.quote_id" class="quote-card">
            <ion-card-content>
              <p class="quote-text">"{{ item.quote_text }}"</p>
              <p class="quote-author">— {{ item.quote_author || 'Inconnu' }}</p>
              
              <div class="rating-display">
                <ion-icon
                  v-for="starNum in 5"
                  :key="starNum"
                  :icon="starNum <= item.rating ? star : starOutline"
                  :class="{ active: starNum <= item.rating }"
                />
              </div>
              
              <p class="viewed-date">{{ formatDate(item.viewed_at) }}</p>
              
              <ion-icon 
                :icon="trashOutline" 
                class="delete-icon"
                @click="confirmDelete(item)"
              />
            </ion-card-content>
          </ion-card>
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
  IonSpinner,
  IonCard,
  IonCardContent,
  IonButton,
  IonMenuButton,
  IonIcon,
  alertController,
  toastController,
  onIonViewWillEnter
} from '@ionic/vue'
import { star, starOutline, trashOutline, bookOutline } from 'ionicons/icons'
import { ref } from 'vue'
import axios from '@/services/api'
import { initializeUser } from '@/services/deviceService'

interface HistoryItem {
  quote_id: number
  quote_text: string
  quote_author: string
  rating: number
  viewed_at: string
}

const loading = ref(true)
const history = ref<HistoryItem[]>([])

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
  const day = date.getDate()
  const month = date.toLocaleDateString('fr-FR', { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `Vu le ${dayName} ${day} ${month} ${year} à ${hours}h${minutes}`
}

async function loadHistory() {
  loading.value = true
  try {
    const deviceId = await initializeUser()
    const response = await axios.get('/api/history', {
      params: { device_id: deviceId }
    })
    
    if (response.status === 200 && response.data.data) {
      history.value = response.data.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
    
    const toast = await toastController.create({
      message: 'Erreur lors du chargement de l\'historique',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

async function confirmDelete(item: HistoryItem) {
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message: `Voulez-vous vraiment supprimer cette citation de votre historique ?`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          deleteHistoryItem(item)
        }
      }
    ]
  })

  await alert.present()
}

async function deleteHistoryItem(item: HistoryItem) {
  try {
    const deviceId = await initializeUser()
    
    // Appeler l'API pour supprimer l'entrée
    await axios.delete(`/api/ratings/${item.quote_id}`, {
      params: { device_id: deviceId }
    })
    
    // Retirer l'élément de la liste locale
    history.value = history.value.filter(h => h.quote_id !== item.quote_id)
    
    const toast = await toastController.create({
      message: 'Citation supprimée de l\'historique',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    
    const toast = await toastController.create({
      message: 'Erreur lors de la suppression',
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    })
    await toast.present()
  }
}

onIonViewWillEnter(() => {
  loadHistory()
})
</script>

<style scoped>
.text-center {
  text-align: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h2 {
  margin: 1rem 0;
  color: var(--ion-text-color);
}

.empty-state p {
  margin-bottom: 2rem;
}

.history-count {
  text-align: center;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.quote-card {
  margin-bottom: 1rem;
  position: relative;
}

.quote-card ion-card-content {
  padding-bottom: 3rem;
}

.quote-text {
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--ion-text-color);
}

.quote-author {
  text-align: right;
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.rating-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.rating-display ion-icon {
  font-size: 1.2rem;
  color: #ccc;
}

.rating-display ion-icon.active {
  color: #FFD700;
}

.viewed-date {
  position: absolute;
  bottom: 12px;
  left: 16px;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 0;
}

.delete-icon {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 1.5rem;
  color: var(--ion-color-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.delete-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.delete-icon:active {
  transform: scale(0.95);
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
