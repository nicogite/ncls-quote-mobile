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
          <div ref="viewportRef" class="slide-viewport">
            <div ref="containerRef" class="slide-container">
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
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButton, onIonViewWillEnter, onIonViewDidEnter, useIonRouter } from '@ionic/vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
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

// Auto-ajustement : sur les écrans étroits/courts, on réduit la taille du texte
// jusqu'à ce que la slide tienne entièrement dans la zone visible (pas de scroll
// possible ici, la couche de contenu laisse passer les gestes au Swiper).
const viewportRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const MIN_FIT_SCALE = 0.55;
const FIT_STEP = 0.04;

const fitContent = () => {
  const viewport = viewportRef.value;
  const container = containerRef.value;
  if (!viewport || !container) return;

  let scale = 1;
  container.style.setProperty('--fit-scale', '1');

  const available = viewport.clientHeight;
  if (available <= 0) return; // page pas encore mesurable (masquée / en transition)

  // La lecture de scrollHeight force un reflow : la boucle voit bien chaque palier.
  while (scale > MIN_FIT_SCALE && container.scrollHeight > available) {
    scale = Math.max(MIN_FIT_SCALE, scale - FIT_STEP);
    container.style.setProperty('--fit-scale', String(scale));
  }
};

// Le contenu est échangé pendant la phase « blank » : on réajuste à ce moment-là,
// donc invisible pour l'utilisateur.
watch(displayContent, fitContent, { flush: 'post' });

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

  window.addEventListener('resize', fitContent);
  window.addEventListener('orientationchange', fitContent);
});

onUnmounted(() => {
  window.removeEventListener('resize', fitContent);
  window.removeEventListener('orientationchange', fitContent);
});

// À l'entrée dans la vue, les dimensions réelles sont connues : on (re)mesure.
onIonViewDidEnter(fitContent);

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
  flex-direction: column;
  /* Espace pour la pagination, réduit sur les écrans courts */
  padding-bottom: clamp(52px, 10vh, 80px);
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}

/* Zone utile bornée : c'est la hauteur de référence de l'auto-ajustement */
.slide-viewport {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 100%;
  text-align: center;
  /* Sur écran étroit, on récupère de la largeur pour gagner des lignes */
  padding: clamp(14px, 4vw, 40px);
  /* Taille de référence, mise à l'échelle par fitContent() si besoin */
  font-size: calc(1.4rem * var(--fit-scale, 1));
}

.slide-text {
  font-size: 1em; /* suit l'échelle du conteneur */
  font-style: italic;
  font-family: garamond, serif;
  line-height: 1.8;
  margin: clamp(0.5rem, 2vh, 2rem) 0;
  color: var(--ion-text-color);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(0.5em, 2.5vh, 1.6em);
}

/* Contenu injecté (v-html) : l'espacement vertical est porté par le gap */
.slide-text :deep(p) {
  margin: 0;
}

.reveal-quote-button {
  margin-top: clamp(1rem, 4vh, 3rem);
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  --background: var(--ion-color-primary);
  pointer-events: auto; /* le bouton reste cliquable malgré l'overlay transparent au geste */
}

/* Écrans très étroits : interlignage et espacements resserrés */
@media (max-width: 410px) {
  .slide-text {
    line-height: 1.55;
    gap: 0.45em;
  }
}
</style>
