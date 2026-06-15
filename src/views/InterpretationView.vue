<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/quote" text="" />
        </ion-buttons>
        <ion-title>Interprétation</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <div class="interpretation-container">
          <div class="quote-text">
            “{{ quote }}”
          </div>
          <div class="quote-author">
            — {{ author }}
            <a v-if="wiki_link" :href="wiki_link" target="_blank" rel="noopener noreferrer">
              <img src="/img/Wiki.png" alt="Wikipedia" class="wiki-icon" />
            </a>
          </div>

          <div class="interpretation-divider"></div>

          <div
            v-if="interpretation"
            class="interpretation-body"
            v-html="interpretation"
          ></div>
          <div v-else class="interpretation-empty">
            Aucune interprétation disponible pour cette citation.
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
  IonButtons,
  IonMenuButton,
  IonBackButton,
} from '@ionic/vue'
import { computed } from 'vue'
import { useQuoteStore } from '@/store/quote'

const quoteStore = useQuoteStore()

const quote = computed(() => quoteStore.currentQuote.text)
const author = computed(() => quoteStore.currentQuote.author || 'Inconnu')
const wiki_link = computed(() => quoteStore.currentQuote.wiki_link || '')
const interpretation = computed(() => quoteStore.currentQuote.interpretation || '')
</script>

<style scoped>
.interpretation-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.quote-text {
  font-size: 1.5rem;
  font-style: italic;
  font-family: garamond, serif;
  line-height: 1.8;
  margin: 2rem 0;
  margin-top: 1rem;
  color: var(--ion-text-color);
  text-align: center;
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

.interpretation-divider {
  height: 1px;
  background: var(--ion-color-step-150, #e0e0e0);
  margin: 2.5rem 0;
}

.interpretation-body {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--ion-text-color);
  text-align: left;
}

.interpretation-body :deep(p) {
  margin: 0 0 1rem;
}

.interpretation-empty {
  text-align: center;
  font-style: italic;
  color: var(--ion-text-color-step-250);
  margin-top: 2rem;
}
</style>
