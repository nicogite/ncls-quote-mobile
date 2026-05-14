import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Quote {
  id: number | null
  text: string
  author: string
  nb_views?: number
  rating?: number
  created_at?: string
  wiki_link?: string
  viewed_at?: string
  nb_quotes?: number
}

export const useQuoteStore = defineStore('quote', () => {
  const currentQuote = ref<Quote>({
    id: null,
    text: '',
    author: ''
  })

  function setQuote(quote: Quote) {
    currentQuote.value = quote
  }

  function clearQuote() {
    currentQuote.value = {
      id: null,
      text: '',
      author: ''
    }
  }

  return {
    currentQuote,
    setQuote,
    clearQuote
  }
})
