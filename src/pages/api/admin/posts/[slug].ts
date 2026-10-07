import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { deleteBlogPost, findBlogPost, isBlogDatabaseConfigured } from '@lib/blog-db';
import { getPostBySlug } from '@lib/posts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  const post = await findBlogPost(params.slug || '') ?? await getPostBySlug(params.slug || '');
  if (!post) return json({ error: '文章不存在或已删除' }, 404);
  return json({
    slug: post.id ?? post.slug,
    ...('data' in post ? post.data : post),
    content: 'body' in post ? (post.body ?? '') : post.content,
    source: 'source' in post ? post.source : 'database',
  });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  const slug = params.slug || '';
  if (!slug) return json({ error: '缺少文章 slug' }, 400);
  await deleteBlogPost(slug);
  return json({ ok: true, slug, message: '文章已隐藏；原始内容仍保留在数据库中，可恢复' });
};
