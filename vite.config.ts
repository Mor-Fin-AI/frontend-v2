import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // Source static files (favicon, images). Not used as Vercel output.
  publicDir: "static-assets",
  build: {
    // Dedicated output dir — avoids Vercel Project Settings conflict with "public"
    // and gitignore filtering of "dist".
    outDir: "web",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["wagmi", "@wagmi/core", "@wagmi/connectors", "viem"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
