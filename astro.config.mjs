import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel"; 
import tailwind from "@astrojs/tailwind";
import 'dotenv/config';


export default defineConfig({
  adapter: vercel(),
  integrations: [tailwind()],
});
