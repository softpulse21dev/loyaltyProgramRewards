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
      host: "player-happened-guided-dicke.trycloudflare.com",
      protocol: "wss",
    },
  },
})