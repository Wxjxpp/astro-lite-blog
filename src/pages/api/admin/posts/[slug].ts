import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { deleteBlogPost, findBlogPost, isBlogDatabaseConfigured } from '@lib/blog-db';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  const post = await findBlogPost(params.slug || '');
  return post ? json(post) : json({ error: '文章不存在' }, 404);
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  await deleteBlogPost(params.slug || '');
  return json({ ok: true });
};
