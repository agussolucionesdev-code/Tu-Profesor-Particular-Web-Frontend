import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ============================================================================
// CONFIGURATION: Vite Server and Proxy
// ============================================================================
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Set a clean, dedicated port for this specific project
    port: 3000,
    strictPort: true,

    // 2. Connect the frontend to your backend securely (Bypassing CORS)
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
