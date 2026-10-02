import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE and BASE_PATH are set by the GitHub Pages workflow (from actions/configure-pages),
// so the same code works as a project site (e.g. /my-repo) or at the root (/).
// Locally both fall back to serving from "/".
export default defineConfig({
  site: process.env.SITE || 'https://www.keegankelsey.io',
  base: process.env.BASE_PATH || '/',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // File events from macOS don't reliably reach a Docker container; poll instead (set in docker-compose.yml).
    server: { watch: process.env.WATCH_POLLING ? { usePolling: true, interval: 300 } : {} },
  },
});
