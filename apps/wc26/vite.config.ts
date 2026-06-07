import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { viteSingleFile } from "vite-plugin-singlefile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const singleFile = process.env.SINGLE_FILE === "1";

export default defineConfig({
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  server: { port: 5173 },
  build: {
    target: "es2020",
    sourcemap: !singleFile,
    cssCodeSplit: !singleFile,
    assetsInlineLimit: singleFile ? Infinity : 4096,
  },
});
