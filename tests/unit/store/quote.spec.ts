import { describe, beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuoteStore } from '@/store/quote'

describe('useQuoteStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initialise avec un état vide', () => {
    const store = useQuoteStore()
    expect(store.currentQuote.id).toBeNull()
    expect(store.currentQuote.text).toBe('')
    expect(store.currentQuote.author).toBe('')
  })

  it('setQuote met à jour la citation courante', () => {
    const store = useQuoteStore()
    store.setQuote({ id: 1, text: 'Soyez vous-même.', author: 'Oscar Wilde' })
    expect(store.currentQuote.id).toBe(1)
    expect(store.currentQuote.text).toBe('Soyez vous-même.')
    expect(store.currentQuote.author).toBe('Oscar Wilde')
  })

  it('setQuote conserve les champs optionnels', () => {
    const store = useQuoteStore()
    store.setQuote({
      id: 2,
      text: 'Hello',
      author: 'World',
      wiki_link: 'https://example.com',
      nb_views: 42,
      rating: 5,
    })
    expect(store.currentQuote.wiki_link).toBe('https://example.com')
    expect(store.currentQuote.nb_views).toBe(42)
    expect(store.currentQuote.rating).toBe(5)
  })

  it('clearQuote remet l\'état à zéro', () => {
    const store = useQuoteStore()
    store.setQuote({ id: 1, text: 'Soyez vous-même.', author: 'Oscar Wilde' })
    store.clearQuote()
    expect(store.currentQuote.id).toBeNull()
    expect(store.currentQuote.text).toBe('')
    expect(store.currentQuote.author).toBe('')
  })

  it('deux stores partagent le même état dans la même pinia', () => {
    const store1 = useQuoteStore()
    const store2 = useQuoteStore()
    store1.setQuote({ id: 99, text: 'Test', author: 'Auteur' })
    expect(store2.currentQuote.id).toBe(99)
  })
})
