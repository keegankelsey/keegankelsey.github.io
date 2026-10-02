#!/usr/bin/env node
// Post-build check: every HTML page in dist/ must include the Google tag.
// Runs as part of `npm run build` (and so in CI), failing the build if any page is missing it.

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const config = fs.readFileSync(path.resolve(import.meta.dirname, '../src/site.config.ts'), 'utf8');
const id = config.match(/googleAnalyticsId:\s*'([^']+)'/)?.[1];

if (!id) {
  console.log('analytics check: no googleAnalyticsId set in src/site.config.ts — skipping.');
  process.exit(0);
}

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(DIST);

const tag = `googletagmanager.com/gtag/js?id=${id}`;
const missing = pages.filter((p) => !fs.readFileSync(p, 'utf8').includes(tag));

if (missing.length) {
  console.error(`✗ analytics check: ${missing.length} page(s) missing the Google tag (${id}):`);
  for (const p of missing) console.error(`    ${path.relative(DIST, p)}`);
  process.exit(1);
}
console.log(`✓ analytics check: Google tag (${id}) present on all ${pages.length} pages`);
