import axios from 'axios'

// Configuration de l'URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

axios.defaults.baseURL = API_URL

export default axios
