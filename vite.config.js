import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
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