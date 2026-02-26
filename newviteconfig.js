import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const TUNNEL_HOST = 'marshall-palestinian-therapist-nsw.trycloudflare.com';
const useTunnel = process.env.VITE_TUNNEL === "1";

export default defineConfig({
  plugins: [react()],
  base: "/loyalty/",
  define: {
    API_URL: JSON.stringify("https://demo.shopiapps.in/loyalty/"),
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    // ✅ Vite already supports SPA routing, no need for historyApiFallback (that's webpack)
    hmr: useTunnel
      ? {
        host: TUNNEL_HOST,
        protocol: "wss",
        clientPort: 443, // ✅ important for cloudflare (wss on 443)
      }
      : true, // ✅ localhost HMR
  },
});