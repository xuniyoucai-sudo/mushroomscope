import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mushroomscope.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    mdx(),
  ],
  vite: { plugins: [tailwindcss()] },
});
