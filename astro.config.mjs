import { defineConfig } from 'astro/config';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  integrations: [],
  vite: {
    plugins: [glsl()]
  }
});