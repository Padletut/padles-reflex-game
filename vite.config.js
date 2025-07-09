import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/padles-reflex-game/", // GitHub Pages subdirectory
  plugins: [react(), tailwindcss()],
});

