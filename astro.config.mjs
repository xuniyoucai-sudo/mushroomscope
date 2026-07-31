import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mushroomscope.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404/'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
