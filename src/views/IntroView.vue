<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <swiper 
        class="intro-swiper"
        :modules="modules" 
        :navigation="navigationConfig"
        :keyboard="true" 
        :pagination="paginationConfig"
        :watchSlidesProgress="true"
        :scrollbar="scrollbarConfig"
        :effect="'fade'"
        :fadeEffect="fadeOptions"
        :spaceBetween="300"
      >
        <swiper-slide>
          <div class="ion-padding">
            <div class="slide-container ready">
              <div class="slide-text" v-html="slide1Content"></div>
            </div>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="ion-padding">
            <div class="slide-container ready">
              <div class="slide-text" v-html="slide2Content"></div>
            </div>
          </div>
        </swiper-slide>
        <swiper-slide>
          <div class="ion-padding">
            <div class="slide-container ready">
              <div class="slide-text" v-html="slide3Content"></div>
              <div class="reveal-quote-button" @click="handleClick">Découvrez votre citation</div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { EffectFade, Keyboard, Pagination, Scrollbar, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { IonContent, IonPage, onIonViewWillEnter, useIonRouter } from '@ionic/vue'; 
import { ref } from 'vue';
import { ensureContentLoaded, getContentValue } from '@/services/contentService';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-fade';
import '@ionic/vue/css/ionic-swiper.css';

const ionRouter = useIonRouter();
const modules = [EffectFade, Keyboard, Pagination, Navigation, Scrollbar];
const slide1Content = ref('');
const slide2Content = ref('');
const slide3Content = ref('');

const navigationConfig = {
  enabled: true,
};

const paginationConfig = {
  enabled: true,
};

const fadeOptions = {
  crossFade: true,
};

const scrollbarConfig = {
  hide: false,
  draggable: true,
};

console.log('IntroView component setup, initializing content refs and modules.');

const handleClick = () => {
  ionRouter.push('/tabs/quote');
};

onIonViewWillEnter(async () => {
  await ensureContentLoaded();
  slide1Content.value = getContentValue('intro_1');
  slide2Content.value = getContentValue('intro_2');
  slide3Content.value = getContentValue('intro_3');
  console.log("Loaded content for slides:", {
    slide1: slide1Content.value,
    slide2: slide2Content.value,
    slide3: slide3Content.value
  });
});
</script>

<style scoped>
.intro-swiper {
  width: 100%;
  height: 100%;
}

.slide-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
  opacity: 0;
  transition: opacity 2s ease-out;
  padding: 40px;
}

.slide-container.ready {
  opacity: 1;
}

.slide-text {
  font-size: 1.5rem;
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
  font-size: 1.5rem;
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-weight: bold;
}
</style>