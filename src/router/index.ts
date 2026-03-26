import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/intro',
    component: () => import('@/views/IntroView.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: 'welcome' },
      { path: 'welcome', component: () => import('@/views/WelcomeView.vue') },
      { path: 'quote', component: () => import('@/views/QuoteView.vue') },
      { path: 'a-demain', component: () => import('@/views/AdemainView.vue') },
      { path: 'inscription', component: () => import('@/views/SubscriptionView.vue') },
      { path: 'concept', component: () => import('@/views/ConceptView.vue') },
      { path: 'contact', component: () => import('@/views/ContactView.vue')  },
      { path: 'cgu', component: () => import('@/views/CguView.vue')  },
      { path: 'notation', component: () => import('@/views/NotationView.vue')  },
      { path: 'history', component: () => import('@/views/HistoryView.vue')  },
      { path: 'params', component: () => import('@/views/ParamsView.vue')  },
      { path: 'intro', component: () => import('@/views/IntroView.vue')  }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
