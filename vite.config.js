import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/bolao-copa-2026/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "/bolao-copa-2026/index.html",
      },
      manifest: {
        name: "Bolão Copa 2026",
        short_name: "Bolão 2026",
        description: "Bolão da Copa do Mundo 2026",
        theme_color: "#0A0E1A",
        background_color: "#0A0E1A",
        display: "standalone",
        start_url: "/bolao-copa-2026/",
        icons: [
          { src: "/bolao-copa-2026/icons/192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/bolao-copa-2026/icons/512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
