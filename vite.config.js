import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensure built assets resolve from the deployed sub-path so deep-link reloads work
  base: '/loyalty/',
  define: {
    API_URL: JSON.stringify("https://demo.shopiapps.in/loyalty/"), // For Live build
  },
  server: {
    historyApiFallback: true,
  },
})