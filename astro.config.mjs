import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bucaramundial.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
