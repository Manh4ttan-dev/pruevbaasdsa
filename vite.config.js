import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/audit": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    allowedHosts: ["wally-orthorhombic-daisey.ngrok-free.dev"],
  },
});
