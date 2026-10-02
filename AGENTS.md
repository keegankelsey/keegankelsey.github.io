# keegankelsey.io

Static personal site: Astro 7 + Tailwind CSS v4, deployed to GitHub Pages via `.github/workflows/deploy.yml`.
See README.md for the day-to-day workflow.

## Commands

Node isn't assumed on the host; everything runs in Docker via the Makefile:
`make dev` (port 4321), `make post`, `make build`, `make preview`, `make install` (after changing deps).
With Node 22: `npm run dev|post|build|preview`.

## Layout

- `src/site.config.ts` — name, email, social links, and `url()` for base-aware internal links
- `src/pages/` — `index.astro` (About, the home page), `projects.astro`, `blog/index.astro`, `blog/[slug].astro`, `rss.xml.ts`, `404.astro`
- `src/content.config.ts` — `blog` (folder per post: `blog/<slug>/index.md` + images) and `projects` collections
- `src/data/` — `bio.md` and `resume.ts` (education, experience, publications)
- `src/styles/global.css` — color tokens (light + `[data-theme=dark]`), marker-link style, `.prose` for posts
- `scripts/import-notion.mjs` — converts Notion HTML exports in `inbox/` to blog posts

## Conventions

- The site may be served under a base path (e.g. a project site). Always build internal
  links with `url()` from `src/site.config.ts`, never hard-coded `/…` paths.
- Colors come from CSS variables in `global.css`, exposed to Tailwind as `bg`, `fg`, `muted`, `border`,
  `surface`, `accent`, `mark`. Don't hard-code hex values in components.
- Every page must render through `src/layouts/Base.astro`, which includes the Google tag
  (`GoogleAnalytics.astro`). `scripts/check-analytics.mjs` runs after `astro build` and fails if any page lacks it.
