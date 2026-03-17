import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Configuración exclusiva para compilar el index.html de prueba
export default defineConfig({
  plugins: [vue({ customElement: true })],
  build: {
    outDir: "dist-demo", // Genera la web de prueba en esta carpeta
    emptyOutDir: true, // Limpia la carpeta antes de cada build
  },
});
