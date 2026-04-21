import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daliacordeiro.art',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'pt',
        locales: { pt: 'pt-PT', en: 'en' },
      },
    }),
  ],
});
