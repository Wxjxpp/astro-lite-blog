import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_CONFIG } from '@lib/utils';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || SITE_CONFIG.url;
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/posts', priority: '0.9', changefreq: 'daily' },
    { url: '/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/tags', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
  ];

  const postUrls = posts.map(post => ({
    url: `/posts/${post.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: (post.data.updatedDate || post.data.pubDate).toISOString().split('T')[0],
  }));

  const allUrls = [...staticPages, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    item => `  <url>
    <loc>${baseUrl}${item.url}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
};
