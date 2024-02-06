import { defineConfig } from 'astro/config';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  build: {
    format: 'file'
  },
  vite: {
    plugins: [glsl()]
  }
});