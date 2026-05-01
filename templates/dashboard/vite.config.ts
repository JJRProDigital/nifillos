import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { cuadrillaWatcherPlugin } from "./src/plugin/cuadrillaWatcher";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const metricsTarget = env.NIFILLOS_METRICS_API || process.env.NIFILLOS_METRICS_API;

  return {
    plugins: [react(), cuadrillaWatcherPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: metricsTarget
        ? {
            "/__cuadrillas_api": {
              target: metricsTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
