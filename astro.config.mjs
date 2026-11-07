// @ts-check
import { defineConfig } from 'astro/config';

// Static output — Vercel serves dist/ with zero config.
// Update `site` once the production domain is known (used for canonical + OG URLs).
export default defineConfig({
  site: 'https://aryannverse.vercel.app',
  build: { inlineStylesheets: 'auto' },
  // warm the next page on hover so the page transition starts instantly
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
