<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button 
            :disabled="currentSlide <= 0 || isTransitioning"
            :class="{ 'invisible': currentSlide <= 0 || isTransitioning }"
            @click="prevSlide"
            aria-label="Slide précédente"
          >
            <ion-icon slot="icon-only" :icon="chevronBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Ma citation du jour</ion-title>
        <ion-buttons slot="end">
          <ion-button 
            :disabled="currentSlide >= 2 || isTransitioning"
            :class="{ 'invisible': currentSlide >= 2 || isTransitioning }"
            @click="nextSlide"
            aria-label="Slide suivante"
          >
            <ion-icon slot="icon-only" :icon="chevronForward"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="intro-slider">
        <!-- Slide 1 -->
        <div 
          class="slide"
          :class="getSlideClass(0)"
          v-if="shouldShowSlide(0)"
        >
          <div class="ion-padding">
            <div class="slide-container">
              <div class="slide-text" v-html="slide1Content"></div>
            </div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div 
          class="slide"
          :class="getSlideClass(1)"
          v-if="shouldShowSlide(1)"
        >
          <div class="ion-padding">
            <div class="slide-container">
              <div class="slide-text" v-html="slide2Content"></div>
            </div>
          </div>
        </div>

        <!-- Slide 3 -->
        <div 
          class="slide"
          :class="getSlideClass(2)"
          v-if="shouldShowSlide(2)"
        >
          <div class="ion-padding">
            <div class="slide-container">
              <div class="slide-text" v-html="slide3Content"></div>
              <ion-button class="reveal-quote-button" @click="handleClick">Votre citation du jour</ion-button>
            </div>
          </div>
        </div>

        <!-- Pagination dots -->
        <div class="pagination">
          <span 
            v-for="i in 3" 
            :key="i"
            class="pagination-dot"
            :class="{ active: currentSlide === i - 1 }"
            @click="goToSlide(i - 1)"
          ></span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, onIonViewWillEnter, useIonRouter } from '@ionic/vue'; 
import { ref, onMounted, onUnmounted } from 'vue';
import { ensureContentLoaded, getContentValue } from '@/services/contentService';
import { chevronBack, chevronForward } from 'ionicons/icons';

const ionRouter = useIonRouter();
const slide1Content = ref('');
const slide2Content = ref('');
const slide3Content = ref('');
const currentSlide = ref(0);
const isTransitioning = ref(false);
const transitionPhase = ref<'fade-out' | 'fade-in' | null>(null);
const nextSlideIndex = ref(-1);
const isInitialLoad = ref(true);

const shouldShowSlide = (index: number) => {
  if (!isTransitioning.value) {
    // Mode normal : afficher seulement la slide actuelle
    return index === currentSlide.value;
  }
  
  // En transition
  if (transitionPhase.value === 'fade-out') {
    // Phase fadeOut : afficher seulement la slide qui disparaît
    return index === currentSlide.value;
  } else if (transitionPhase.value === 'fade-in') {
    // Phase fadeIn : afficher seulement la nouvelle slide qui apparaît
    return index === nextSlideIndex.value;
  }
  
  return false;
};

const getSlideClass = (index: number) => {
  // Animation initiale pour la première slide
  if (isInitialLoad.value && index === 0) {
    return 'fade-in';
  }
  
  if (isTransitioning.value) {
    // Phase fadeOut : afficher la slide actuelle en fadeOut
    if (transitionPhase.value === 'fade-out' && index === currentSlide.value) {
      return 'fade-out';
    }
    // Phase fadeIn : afficher la nouvelle slide en fadeIn
    if (transitionPhase.value === 'fade-in' && index === nextSlideIndex.value) {
      return 'fade-in';
    }
  }
  return index === currentSlide.value ? 'active' : '';
};

const nextSlide = () => {
  if (isTransitioning.value || currentSlide.value >= 2) return;
  changeSlide(currentSlide.value + 1);
};

const prevSlide = () => {
  if (isTransitioning.value || currentSlide.value <= 0) return;
  changeSlide(currentSlide.value - 1);
};

const goToSlide = (index: number) => {
  if (isTransitioning.value || index === currentSlide.value) return;
  changeSlide(index);
};

const changeSlide = (newIndex: number) => {
  isTransitioning.value = true;
  nextSlideIndex.value = newIndex;
  transitionPhase.value = 'fade-out';
  
  // Phase 1: FadeOut de la slide actuelle (1.5s)
  setTimeout(() => {
    // La slide actuelle a disparu, on change de slide
    currentSlide.value = newIndex;
    transitionPhase.value = 'fade-in';
    
    // Phase 2: FadeIn de la nouvelle slide (1.5s)
    setTimeout(() => {
      isTransitioning.value = false;
      transitionPhase.value = null;
      nextSlideIndex.value = -1;
    }, 1500); // fade-in duration
  }, 1500); // fade-out duration
};

const handleKeyboard = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    nextSlide();
  } else if (event.key === 'ArrowLeft') {
    prevSlide();
  }
};

const handleClick = () => {
  ionRouter.push('/tabs/quote');
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyboard);
  
  // Déclencher la fin de l'animation initiale après 1.5s
  setTimeout(() => {
    isInitialLoad.value = false;
  }, 1500);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
});

onIonViewWillEnter(async () => {
  await ensureContentLoaded();
  slide1Content.value = getContentValue('intro_1');
  slide2Content.value = getContentValue('intro_2');
  slide3Content.value = getContentValue('intro_3');
});
</script>

<style scoped>
.invisible {
  opacity: 0;
  pointer-events: none;
}

.intro-slider {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 80px; /* Espace pour la pagination */
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.slide.fade-out {
  animation: fadeOut 1.5s ease-in-out forwards;
  z-index: 2;
}

.slide.fade-in {
  animation: fadeIn 1.5s ease-in-out forwards;
  z-index: 3;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.slide-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
  padding: 40px;
}

.slide-text {
  font-size: 1.4rem;
  font-style: italic;
  font-family: garamond, serif;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--ion-text-color);
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.reveal-quote-button {
  margin-top: 3rem;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  --background: var(--ion-color-primary);
}

/* Pagination dots */
.pagination {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-dot.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.pagination-dot:hover {
  background: rgba(255, 255, 255, 0.6);
}
</style>