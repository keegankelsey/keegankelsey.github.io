import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { site, url } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.blogTitle} · ${site.name}`,
    description: site.description,
    site: new URL(url('/'), context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: url(`blog/${post.id}/`),
      categories: post.data.tags,
    })),
  });
}
