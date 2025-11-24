import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1"
  },
  root: "html",
  publicDir: "../public",
  build: {
    outDir: "../dist"
  },
  resolve: {
    alias: { 
        "/html": path.resolve(__dirname, "html"),
        "/src": path.resolve(__dirname, "src"),
    }
  },
});