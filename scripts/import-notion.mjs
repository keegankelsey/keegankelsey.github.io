#!/usr/bin/env node
// Turn Notion "Export → HTML" downloads into blog posts.
//
//   npm run post                 import everything in inbox/
//   npm run post -- --draft      import as drafts (visible only in `npm run dev`)
//   npm run post -- --force      overwrite a post that already exists
//   npm run post -- path/to/export.zip
//
// Each top-level page in the export becomes src/content/blog/<slug>/index.md, with its
// images copied alongside. Processed inputs are moved to inbox/processed/.
//
// Optional Notion page properties that are picked up: Date (or Published/Created),
// Tags, Slug, Description, Draft (checkbox).

import fs from 'node:fs';
import path from 'node:path';
import { unzipSync } from 'fflate';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import gfmPlugin from 'turndown-plugin-gfm';

const ROOT = path.resolve(import.meta.dirname, '..');
const INBOX = path.join(ROOT, 'inbox');
const PROCESSED = path.join(INBOX, 'processed');
const BLOG = path.join(ROOT, 'src/content/blog');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const inputs = args.filter((a) => !a.startsWith('--'));
const asDraft = flags.has('--draft');
const force = flags.has('--force');

main();

function main() {
  const sources = inputs.length ? inputs.map((p) => path.resolve(p)) : listInbox();
  if (!sources.length) {
    console.log('Nothing to import. Put a Notion HTML export (.zip) in inbox/ and run again.');
    return;
  }

  let failed = 0;
  for (const source of sources) {
    try {
      const files = loadFiles(source);
      const pages = topLevelPages(files);
      if (!pages.length) throw new Error('no HTML pages found');
      for (const page of pages) importPage(page, files);
      if (!inputs.length) archive(source);
    } catch (err) {
      failed++;
      console.error(`✗ ${path.basename(source)}: ${err.message}`);
    }
  }
  if (failed) process.exitCode = 1;
}

// ---------- Reading inputs ----------

function listInbox() {
  if (!fs.existsSync(INBOX)) return [];
  return fs
    .readdirSync(INBOX)
    .filter((f) => /\.(zip|html?)$/i.test(f))
    .map((f) => path.join(INBOX, f));
}

/** Returns a Map of posix path → bytes for everything in the export. */
function loadFiles(source) {
  const files = new Map();
  if (/\.zip$/i.test(source)) {
    addZip(files, fs.readFileSync(source));
  } else {
    // A loose .html file; its images live in a sibling folder with the same name.
    const dir = path.dirname(source);
    files.set(path.basename(source), fs.readFileSync(source));
    const assetDir = path.join(dir, path.basename(source).replace(/\.html?$/i, ''));
    if (fs.existsSync(assetDir)) addDir(files, assetDir, path.basename(assetDir));
  }
  return files;
}

function addZip(files, bytes, prefix = '') {
  for (const [name, data] of Object.entries(unzipSync(new Uint8Array(bytes)))) {
    if (name.endsWith('/') || name.startsWith('__MACOSX/')) continue;
    // Notion sometimes wraps exports in another zip ("Export-…-Part-1.zip").
    if (/\.zip$/i.test(name)) addZip(files, data, prefix);
    else files.set(prefix + name, data);
  }
}

function addDir(files, dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const key = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) addDir(files, full, key);
    else files.set(key, fs.readFileSync(full));
  }
}

/** Pages at the shallowest depth are posts; deeper pages are Notion sub-pages. */
function topLevelPages(files) {
  const html = [...files.keys()].filter((f) => /\.html?$/i.test(f));
  if (!html.length) return [];
  const depth = (f) => f.split('/').length;
  const min = Math.min(...html.map(depth));
  const skipped = html.filter((f) => depth(f) > min);
  if (skipped.length) console.warn(`  (skipping ${skipped.length} sub-page(s); only top-level pages are imported)`);
  return html.filter((f) => depth(f) === min);
}

function archive(source) {
  fs.mkdirSync(PROCESSED, { recursive: true });
  fs.renameSync(source, path.join(PROCESSED, path.basename(source)));
  const assetDir = source.replace(/\.html?$/i, '');
  if (assetDir !== source && fs.existsSync(assetDir)) {
    fs.renameSync(assetDir, path.join(PROCESSED, path.basename(assetDir)));
  }
}

// ---------- Converting a page ----------

function importPage(pagePath, files) {
  const $ = cheerio.load(new TextDecoder().decode(files.get(pagePath)));
  const props = readProperties($);

  const title = ($('h1.page-title').first().text() || $('title').text() || 'Untitled').trim();
  const slug = slugify(props.slug || title);
  const outDir = path.join(BLOG, slug);
  if (fs.existsSync(outDir) && !force) {
    throw new Error(`src/content/blog/${slug}/ already exists (use --force to overwrite)`);
  }

  const body = $('.page-body').first();
  if (!body.length) throw new Error(`${pagePath}: not a Notion page export (no .page-body)`);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const images = copyImages($, body, pagePath, files, outDir);
  const cover = copyCover($, pagePath, files, outDir);
  cleanNotionHtml($, body);
  let markdown = toMarkdown(body.html() ?? '');

  const description = props.description || $('p.page-description').first().text().trim() || firstSentence(markdown);
  const frontmatter = {
    title,
    date: props.date || today(),
    description,
    tags: props.tags,
    cover,
    draft: asDraft || props.draft,
  };

  fs.writeFileSync(path.join(outDir, 'index.md'), `${yaml(frontmatter)}\n${markdown.trim()}\n`);
  console.log(`✓ ${title}\n    → src/content/blog/${slug}/index.md${images ? ` (+${images} image${images > 1 ? 's' : ''})` : ''}`);
}

function readProperties($) {
  const props = { tags: [], draft: false };
  $('table.properties tr').each((_, tr) => {
    const name = $(tr).find('th').text().trim().toLowerCase();
    const td = $(tr).find('td');
    const text = td.text().trim();
    if (['date', 'published', 'publish date', 'created', 'created time'].includes(name) && !props.date) {
      props.date = parseDate(td.find('time').first().text() || text);
    } else if (['tags', 'tag', 'topics'].includes(name)) {
      const values = td.find('.selected-value').map((_, el) => $(el).text().trim()).get();
      props.tags = values.length ? values : text.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (name === 'slug') {
      props.slug = text;
    } else if (['description', 'summary', 'excerpt'].includes(name)) {
      props.description = text;
    } else if (name === 'draft') {
      props.draft = td.find('.checkbox-on').length > 0;
    }
  });
  return props;
}

/** Notion's page cover becomes the post's banner image (frontmatter `cover`). */
function copyCover($, pagePath, files, outDir) {
  const src = $('img.page-cover-image').attr('src') ?? '';
  if (!src || /^(https?:|data:)/.test(src)) return undefined;
  const pageDir = path.posix.dirname(pagePath);
  const data = files.get(path.posix.normalize(path.posix.join(pageDir === '.' ? '' : pageDir, decodeURIComponent(src))));
  if (!data) return undefined;
  const name = `cover${path.extname(src).toLowerCase() || '.png'}`;
  fs.writeFileSync(path.join(outDir, name), data);
  return `./${name}`;
}

function copyImages($, body, pagePath, files, outDir) {
  const pageDir = path.posix.dirname(pagePath);
  const used = new Set();
  let count = 0;

  body.find('img').each((_, el) => {
    const img = $(el);
    const src = img.attr('src') ?? '';
    if (/^(https?:|data:)/.test(src)) return;

    const key = path.posix.normalize(path.posix.join(pageDir === '.' ? '' : pageDir, decodeURIComponent(src)));
    const data = files.get(key);
    if (!data) {
      console.warn(`  ! image not found in export: ${src}`);
      img.remove();
      return;
    }

    const ext = path.extname(key).toLowerCase() || '.png';
    const base = slugify(path.basename(key, path.extname(key))) || 'image';
    let name = `${base}${ext}`;
    for (let i = 2; used.has(name); i++) name = `${base}-${i}${ext}`;
    used.add(name);

    fs.writeFileSync(path.join(outDir, name), data);
    img.attr('src', `./${name}`);
    count++;
  });
  return count;
}

function cleanNotionHtml($, body) {
  // Page headings shift down one level: the post title is the page's only <h1>.
  body.find('h3').each((_, el) => void (el.tagName = 'h4'));
  body.find('h2').each((_, el) => void (el.tagName = 'h3'));
  body.find('h1').each((_, el) => void (el.tagName = 'h2'));

  // Images: <figure class="image"><a><img></a><figcaption>
  body.find('figure.image').each((_, el) => {
    const fig = $(el);
    const img = fig.find('img').first();
    if (!img.length) return fig.remove();
    const caption = fig.find('figcaption').text().trim();
    img.attr('alt', caption || img.attr('alt') || '');
    fig.replaceWith(`<p><img src="${img.attr('src')}" alt="${escapeAttr(img.attr('alt'))}">${caption ? `\n<em>${escapeHtml(caption)}</em>` : ''}</p>`);
  });

  // Callouts → <aside class="callout">
  body.find('figure.callout').each((_, el) => {
    const fig = $(el);
    const icon = fig.find('.icon').first().text().trim();
    const content = fig.children('div').last().html() ?? '';
    fig.replaceWith(
      `<aside class="callout">${icon ? `<span class="callout-icon" aria-hidden="true">${icon}</span>` : ''}<div>${content}</div></aside>`,
    );
  });

  // Toggles: <ul class="toggle"><li><details>…</details></li></ul> → <details>
  body.find('ul.toggle').each((_, el) => void $(el).replaceWith($(el).find('details').first()));

  // To-do lists → GFM task lists
  body.find('ul.to-do-list').each((_, el) => {
    $(el).find('> li').each((_, li) => {
      const checked = $(li).find('.checkbox-on').length > 0;
      const text = $(li).find('span').last().html() ?? $(li).text();
      $(li).attr('data-task', checked ? 'x' : ' ').html(text);
    });
  });

  // Bookmarks and links to other Notion pages
  body.find('figure').has('a.bookmark').each((_, el) => {
    const a = $(el).find('a.bookmark').first();
    const title = a.find('.bookmark-title').text().trim() || a.attr('href');
    $(el).replaceWith(`<p><a href="${a.attr('href')}">${escapeHtml(title)}</a></p>`);
  });
  // Links to other Notion pages don't resolve outside Notion.
  body.find('figure.link-to-page').remove();

  // Equations: keep the TeX source until math rendering is added.
  body.find('figure.equation').each((_, el) => {
    const tex = $(el).find('annotation[encoding="application/x-tex"]').text();
    $(el).replaceWith(`<pre><code class="language-tex">${escapeHtml(tex)}</code></pre>`);
  });
  body.find('.notion-text-equation-token').each((_, el) => {
    const tex = $(el).find('annotation[encoding="application/x-tex"]').text();
    $(el).replaceWith(`<code>${escapeHtml(tex)}</code>`);
  });

  // Code blocks: normalize Notion's language names ("Plain Text", "C++", …)
  body.find('pre code').each((_, el) => {
    const cls = $(el).attr('class') ?? '';
    const lang = (cls.match(/language-(\S+)/)?.[1] ?? '').toLowerCase();
    const map = { 'plain': 'text', 'plain-text': 'text', 'c++': 'cpp', 'c#': 'csharp', 'shell': 'sh', 'objective-c': 'objc' };
    $(el).attr('class', lang ? `language-${map[lang] ?? lang}` : null);
  });

  // Notion background highlights → <mark>; colored text (highlight-gray, …) → plain text
  body.find('mark').each((_, el) => {
    const color = $(el).attr('data-notion-highlight') ?? $(el).attr('class') ?? '';
    if (/_background/.test(color)) $(el).removeAttr('class').removeAttr('data-notion-highlight');
    else $(el).replaceWith($(el).contents());
  });

  // Notion splits styled text into adjacent runs (<em>a </em><em><a>b</a></em>), which turndown
  // renders as unparseable "_a_ _[b]()__". Merge touching runs of the same tag.
  for (const tag of ['em', 'strong', 'i', 'b', 's', 'del']) {
    body.find(tag).each((_, el) => {
      let next = el.nextSibling;
      while (next && next.type === 'tag' && next.tagName === tag) {
        $(el).append($(next).contents());
        const after = next.nextSibling;
        $(next).remove();
        next = after;
      }
    });
  }

  // Columns and other layout wrappers: keep their contents only
  body.find('.column-list, .column').each((_, el) => void $(el).replaceWith($(el).contents()));

  // Merge Notion's one-<ul>-per-item lists into real lists
  for (const sel of ['ul', 'ol']) {
    body.find(sel).each((_, el) => {
      let next = $(el).next();
      while (next.is(sel) && !next.hasClass('toggle')) {
        $(el).append(next.children());
        const after = next.next();
        next.remove();
        next = after;
      }
    });
  }

  // Strip Notion's ids, inline styles and classes (keeping the few we style)
  const keepClass = /^(callout|callout-icon|language-\S+)$/;
  body.find('*').each((_, el) => {
    const node = $(el);
    node.removeAttr('id').removeAttr('style');
    const kept = (node.attr('class') ?? '').split(/\s+/).filter((c) => keepClass.test(c));
    kept.length ? node.attr('class', kept.join(' ')) : node.removeAttr('class');
  });

  // Empty paragraphs Notion uses as spacing
  body.find('p').filter((_, el) => !$(el).text().trim() && !$(el).find('img').length).remove();
}

function toMarkdown(html) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    hr: '---',
  });
  td.use(gfmPlugin.gfm);
  td.keep(['aside', 'details', 'mark', 'sub', 'sup', 'u', 'video', 'iframe']);
  // To-do items are tagged with data-task in cleanNotionHtml.
  td.addRule('taskListItem', {
    filter: (node) => node.nodeName === 'LI' && node.hasAttribute('data-task'),
    replacement: (content, node) => `- [${node.getAttribute('data-task')}] ${content.trim()}\n`,
  });
  return td
    .turndown(html)
    .replace(/^(\s*)-   /gm, '$1- ') // turndown pads list markers; use the conventional single space
    .replace(/^(\s*)(\d+)\.  /gm, '$1$2. ')
    .replace(/\n{3,}/g, '\n\n');
}

// ---------- Helpers ----------

function parseDate(raw) {
  const text = raw.replace(/^@/, '').split('→')[0].trim();
  const d = new Date(text);
  return Number.isNaN(d.valueOf()) ? undefined : toIsoDate(d);
}

function today() {
  return toIsoDate(new Date());
}

function toIsoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(s, max = 60) {
  const slug = s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= max) return slug;
  // Too long: cut at the last word boundary that fits.
  const cut = slug.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf('-') > 0 ? cut.lastIndexOf('-') : max);
}

function firstSentence(markdown) {
  const para = markdown
    .split('\n\n')
    .find((p) => /^[A-Za-z0-9"'(]/.test(p.trim()));
  if (!para) return '';
  const plain = para.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  const sentence = plain.match(/^.{20,200}?[.!?](\s|$)/)?.[0] ?? plain.slice(0, 160);
  return sentence.trim();
}

/** Minimal YAML writer for flat frontmatter. JSON strings are valid YAML. */
function yaml(obj) {
  const lines = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${typeof v === 'string' && k !== 'date' ? JSON.stringify(v) : Array.isArray(v) ? JSON.stringify(v) : v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function escapeHtml(s = '') {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
}

function escapeAttr(s = '') {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
