<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-center">Ma citation du jour</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="intro-slider">
        <!-- Couche de contenu : gère le fondu en 3 temps (fadeOut → vide → fadeIn) -->
        <div class="slide-overlay" :class="phase">
          <div class="ion-padding">
            <div class="slide-container">
              <div class="slide-text" v-html="displayContent"></div>
              <ion-button
                v-if="displayIndex === slidesCount - 1"
                class="reveal-quote-button"
                @click="handleClick"
              >Votre citation du jour</ion-button>
            </div>
          </div>
        </div>

        <!-- Couche Swiper : capte le geste de swipe, le clavier et la pagination -->
        <swiper-container ref="swiperRef" class="gesture-layer" init="false">
          <swiper-slide v-for="i in slidesCount" :key="i"></swiper-slide>
        </swiper-container>
      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButton, onIonViewWillEnter, useIonRouter } from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { ensureContentLoaded, getContentValue } from '@/services/contentService';

const ionRouter = useIonRouter();
const slidesContent = ref<string[]>(['', '', '', '', '']);
const slidesCount = slidesContent.value.length;

// Index de la slide actuellement affichée par la couche de contenu
const displayIndex = ref(0);
const displayContent = computed(() => slidesContent.value[displayIndex.value] ?? '');

// Phase du fondu : '' (visible) | 'fade-out' | 'blank' (vide) | 'fade-in'
const phase = ref<'' | 'fade-out' | 'blank' | 'fade-in'>('');
let animating = false;

// Référence vers le web component <swiper-container>
const swiperRef = ref<(HTMLElement & { initialize: () => void; swiper: any }) | null>(null);

// Durées (ms) — doivent rester synchronisées avec la transition CSS
const FADE = 1000;
const VOID = 500;

const runTransition = (target: number) => {
  if (target === displayIndex.value) return;
  animating = true;
  const swiper = swiperRef.value?.swiper;
  if (swiper) swiper.allowTouchMove = false;

  // 1. FadeOut de la slide courante (1s)
  phase.value = 'fade-out';
  setTimeout(() => {
    // 2. Vide : on échange le contenu pendant que tout est invisible (1s)
    displayIndex.value = target;
    phase.value = 'blank';
    setTimeout(() => {
      // 3. FadeIn de la nouvelle slide (1s)
      phase.value = 'fade-in';
      setTimeout(() => {
        phase.value = '';
        animating = false;
        if (swiper) swiper.allowTouchMove = true;
      }, FADE);
    }, VOID);
  }, FADE);
};

const onSlideChange = (swiper: any) => {
  const target = swiper.activeIndex;
  if (target === displayIndex.value) return;
  // Swipe pendant une transition en cours : on annule le déplacement
  if (animating) {
    swiper.slideTo(displayIndex.value, 0);
    return;
  }
  runTransition(target);
};

const handleClick = () => {
  ionRouter.push('/tabs/quote');
};

onMounted(() => {
  if (!swiperRef.value) return;

  Object.assign(swiperRef.value, {
    speed: 0,           // changement d'index instantané (le fondu est géré par la couche de contenu)
    followFinger: false, // pas de glissement sous le doigt : la slide bascule au relâchement
    grabCursor: true,
    pagination: { clickable: true },
    keyboard: { enabled: true },
    on: { slideChange: onSlideChange },
  });
  swiperRef.value.initialize();

  // Fondu d'entrée initial
  phase.value = 'blank';
  requestAnimationFrame(() => { phase.value = 'fade-in'; });
  setTimeout(() => { if (!animating) phase.value = ''; }, FADE);
});

onIonViewWillEnter(async () => {
  await ensureContentLoaded();
  slidesContent.value = [
    getContentValue('intro_1'),
    getContentValue('intro_2'),
    getContentValue('intro_3'),
    getContentValue('intro_4'),
    getContentValue('intro_5'),
  ];
});
</script>

<style scoped>
.intro-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* Pagination native Swiper : vert iconique de l'app */
  --swiper-pagination-color: var(--ion-color-primary);
  --swiper-pagination-bullet-inactive-color: var(--ion-color-primary);
  --swiper-pagination-bullet-inactive-opacity: 0.35;
  --swiper-pagination-bullet-size: 13px;
  --swiper-pagination-bullet-horizontal-gap: 6px;
  --swiper-pagination-bottom: 30px;
}

/* Couche Swiper en dessous : capte les gestes (slides vides) */
.gesture-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Couche de contenu au-dessus : laisse passer le swipe (sauf le bouton) */
.slide-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 80px; /* Espace pour la pagination */
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}

.slide-overlay.fade-out {
  opacity: 0;
}

.slide-overlay.blank {
  opacity: 0;
  transition: none; /* maintien à vide, sans animation */
}

.slide-overlay.fade-in {
  opacity: 1;
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
  flex-direction: column;
  align-items: stretch;
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
  pointer-events: auto; /* le bouton reste cliquable malgré l'overlay transparent au geste */
}
</style>
