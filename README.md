# keegankelsey.io

Personal site — About, Projects, and Blog. Built with [Astro](https://astro.build) and Tailwind CSS,
deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Run it locally

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Node 22 — see below).

```sh
make dev       # http://localhost:4321, reloads as you edit
make preview   # production build, served exactly as it will be deployed
```

With Node 22 installed you can skip Docker: `npm install`, then `npm run dev` / `npm run post` / `npm run build`.

## Publish a post from Notion

1. In Notion, open the page → **•••** → **Export** → Format **HTML**, "Include subpages" off.
2. Move the downloaded `.zip` into `inbox/`.
3. Run `make post` (or `make draft` to import as a draft).
4. Check it at http://localhost:4321/blog/, then commit and push:
   ```sh
   git add src/content/blog && git commit -m "Post: <title>" && git push
   ```

The importer creates `src/content/blog/<slug>/index.md` plus the post's images, and moves the export
to `inbox/processed/`. You can tweak the generated Markdown freely before committing.

Optional Notion page properties it understands: **Date** (otherwise Created, otherwise today), **Tags**,
**Slug**, **Description** (otherwise the page description or first sentence), and **Draft** (checkbox).
Drafts show in `make dev` but are not published.

You can also write a post by hand: create `src/content/blog/my-post/index.md` with frontmatter
like `src/content/blog/hello-world/index.md`.

## Editing the rest of the site

| What | Where |
| --- | --- |
| Name, email, social links, Google Analytics ID | `src/site.config.ts` |
| Bio (About section) | `src/data/bio.md` |
| Education, experience, publications | `src/data/resume.ts` |
| Projects (one file each) | `src/content/projects/*.md` |
| Colors, fonts, link highlight | `src/styles/global.css` |

## Analytics

The Google tag (GA4 `googleAnalyticsId` in `src/site.config.ts`) is added to every page by the shared
layout, so new posts and projects get it automatically. It's left out of `make dev` so your own browsing
isn't counted. `npm run build` checks that every generated page includes it and fails otherwise.

## Deployment

`.github/workflows/deploy.yml` builds and deploys on push to `main`. One-time setup: in the repo's
**Settings → Pages**, set **Source** to **GitHub Actions**.

The site is served at https://www.keegankelsey.io (https://keegankelsey.github.io redirects there).
The custom domain is set under **Settings → Pages**. With Actions-based deploys it lives there, not in a
`CNAME` file. The base URL is detected automatically, so the same code also works as a project site.
