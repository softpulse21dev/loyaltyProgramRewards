import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    API_URL: JSON.stringify("https://demo.shopiapps.in/loyalty/"),   //For Live build
  },
  server: {
    historyApiFallback: true,
  },
})
