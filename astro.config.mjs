// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ghassanstudio.github.io",
  base: "/portfolio",
  output: "static",
  build: {
    format: "directory",
  },
  vite: {
    css: {
      transformer: "lightningcss",
    },
  },
});