import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  base: "./", // ✅ Correct for static hosting (GitHub Pages, Netlify, etc.)

  plugins: [
    react({
      jsxRuntime: "automatic",
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
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
    open: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
