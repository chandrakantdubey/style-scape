import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  // Static-host friendly base path (works on GitHub Pages, Netlify, etc.).
  base: "./",

  plugins: [
    react({ jsxRuntime: "automatic" }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,
    open: false,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/pages/HomePage")) return "home";
          if (id.includes("/pages/GeneratorPage")) return "generator";
          if (id.includes("/pages/PatternDetailPage")) return "pattern-detail";
          return undefined;
        },
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  test: {
    environment: "happy-dom",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
    },
  },
});
