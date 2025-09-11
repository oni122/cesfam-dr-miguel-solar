import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel"; 
import tailwind from "@astrojs/tailwind";


export default defineConfig({
  adapter: vercel(),
  integrations: [tailwind()],
});
