import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: true, // Permite exponer el servidor en todas las interfaces de red
  },
  define: {
    // Inyectar la URL de la API del backend para entornos Docker
    // Usar global para evitar problemas con process.env
    '__API_URL__': JSON.stringify('http://localhost:8080')
  }
})