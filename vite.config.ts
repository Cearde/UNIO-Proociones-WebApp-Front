import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'unio-promotion-web-back-ggcacvfac4bjfkap.canadacentral-01.azurewebsites.net',//'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
