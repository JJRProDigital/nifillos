import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { cuadrillaWatcherPlugin } from "./src/plugin/cuadrillaWatcher";

export default defineConfig({
  plugins: [react(), cuadrillaWatcherPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
