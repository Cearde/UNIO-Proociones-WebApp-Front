import axios from 'axios';

const api = axios.create({
  // Vite seleccionará automáticamente localhost en desarrollo o la URL de Azure en producción
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': 'TU_API_KEY_AQUI' // Si utilizas autenticación por API Key
  }
});

export default api;