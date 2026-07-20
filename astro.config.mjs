// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://ghassanabdulkhaliq.github.io",
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
