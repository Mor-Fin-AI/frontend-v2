import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // Source static files (favicon, images). Not used as Vercel output.
  publicDir: "static-assets",
  build: {
    // Must match Vercel Project Settings / vercel.json outputDirectory.
    outDir: "public",
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
