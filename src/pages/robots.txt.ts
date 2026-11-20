import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

// Built with the site so the sitemap's address follows SITE_URL.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
