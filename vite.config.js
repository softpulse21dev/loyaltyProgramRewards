import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    API_URL: JSON.stringify("https://demo.shopiapps.in/loyalty/"), // For Live build
  },
  server: {
    historyApiFallback: true,
  },
})