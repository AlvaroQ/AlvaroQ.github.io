// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { ANTI_FOUC } from './src/scripts/anti-fouc.mjs';
import { cspHash } from './scripts/csp-hash.mjs';
import pruneMasters from './scripts/prune-masters.mjs';
import { CHAT_API_URL } from './src/data/site.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://alvaroq.github.io',
  // Strict CSP as a <meta> (static hosting): Astro hashes its bundled scripts and styles; the
  // anti-FOUC snippet is the one inline script we add, hashed from the same source text.
  // Inline event handlers are already blocked: script-src carries hashes and no 'unsafe-inline'
  // (script-src-attr is not among the directives Astro accepts).
  security: {
    csp: {
      directives: [
        "default-src 'none'",
        "img-src 'self'",
        "font-src 'self'",
        `connect-src ${new URL(CHAT_API_URL).origin}`,
        "base-uri 'none'",
        "object-src 'none'",
        "form-action 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: { hashes: [cspHash(ANTI_FOUC)] },
    },
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    pruneMasters(),
    sitemap({
      // Build date as lastmod: the site is a single page per locale rebuilt on every deploy.
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
        },
      },
    })
  ]
});
