import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { isBlogDatabaseConfigured, saveBlogPost } from '@lib/blog-db';
import { getAllPostRecords } from '@lib/posts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const forbidden = () => json({ error: '未登录或会话已过期' }, 401);

export const GET: APIRoute = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return forbidden();
  if (!isBlogDatabaseConfigured) return json({ error: '博客存储尚未配置' }, 503);
  const records = await getAllPostRecords();
  return json(records.map(post => ({
    slug: post.id,
    ...post.data,
    content: post.body ?? post.entry?.body ?? '',
    source: post.source,
  })));
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return forbidden();
  if (!isBlogDatabaseConfigured) return json({ error: '博客存储尚未配置' }, 503);
  const input = await request.json();
  const labels: Record<string, string> = { title: '标题', slug: 'Slug', description: '摘要', category: '分类', content: '正文' };
  const required = Object.keys(labels);
  const missing = required.filter(key => typeof input[key] !== 'string' || !input[key].trim());
  if (missing.length) return json({ error: `请填写：${missing.map(key => labels[key]).join('、')}`, missing }, 400);
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) return json({ error: 'slug 无效' }, 400);
  const saved = await saveBlogPost({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    pubDate: new Date(input.pubDate || Date.now()),
    updatedDate: input.updatedDate ? new Date(input.updatedDate) : undefined,
    category: input.category.trim(),
    tags: Array.isArray(input.tags) ? input.tags.map(String).map((x: string) => x.trim()).filter(Boolean) : [],
    cover: input.cover?.trim() || undefined,
    draft: input.draft === true,
    author: input.author?.trim() || undefined,
    content: String(input.content),
  });
  return json(saved, 201);
};
