import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @knowledge → root-level knowledge/ folder (one level above client/)
      "@knowledge": path.resolve(__dirname, "../knowledge"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
    allowedHosts: ["curious-engine.test", "curious-engine.local", "curious-engine.pro"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
});
