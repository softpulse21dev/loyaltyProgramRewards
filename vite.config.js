import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/loyalty/',
  define: {
    API_URL: JSON.stringify("https://demo.shopiapps.in/loyalty/"), // For Live build
  },
  server: {
    historyApiFallback: true,
    hmr: {
      host: "30eab73b1845.ngrok-free.app",
      protocol: "wss",
    },
  },
})