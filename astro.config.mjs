// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { BASE_PATH, SITE_URL } from './src/data/site.ts';

// Static pages served by GitHub Pages: on GitHub's address (a sub-folder) until the client's domain is set - SITE_URL.
export default defineConfig({
  site: new URL(SITE_URL).origin,
  base: BASE_PATH || '/',
  trailingSlash: 'always',
  // the sample installations (shown only until the first real one) stay out of search engines
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') && !page.includes('/projects/sample-') })],
  redirects: { '/guides/': '/news/' },
});
