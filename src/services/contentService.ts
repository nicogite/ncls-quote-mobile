import { readonly, ref } from 'vue'
import axios from '@/services/api'

export interface StaticContentItem {
  id: number
  key: string
  value: string
  description?: string
}

const contentMap = ref<Record<string, string>>({})
const isContentLoading = ref(false)
const isContentLoaded = ref(false)
const contentLoadError = ref('')

let loadPromise: Promise<Record<string, string>> | null = null

export async function loadAllContent(force = false): Promise<Record<string, string>> {
  if (isContentLoaded.value && !force) {
    return contentMap.value
  }

  if (isContentLoading.value && loadPromise) {
    return loadPromise
  }

  isContentLoading.value = true
  contentLoadError.value = ''

  loadPromise = (async () => {
    try {
      const response = await axios.get('/api/content')
      const items: StaticContentItem[] = Array.isArray(response.data) ? response.data : []
      const nextMap = items.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[item.key] = item.value
        return accumulator
      }, {})
      contentMap.value = nextMap
      isContentLoaded.value = true

      return nextMap
    } catch (error) {
      console.error('Erreur lors du chargement des contenus statiques:', error)
      contentLoadError.value = 'Impossible de charger les contenus de l’application'
      throw error
    } finally {
      isContentLoading.value = false
    }
  })()

  return loadPromise
}

export async function ensureContentLoaded(): Promise<Record<string, string>> {
  return loadAllContent(false)
}

export function getContentValue(key: string): string {
  return contentMap.value[key] || ''
}

export const contentState = {
  contentMap: readonly(contentMap),
  isContentLoading: readonly(isContentLoading),
  isContentLoaded: readonly(isContentLoaded),
  contentLoadError: readonly(contentLoadError)
}
