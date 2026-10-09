import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/recharts/") || id.includes("/node_modules/d3-")) return "charts";
          if (/\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)) return "vendor";
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
