import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { findBlogPost, findBlogPostIncludingDeleted, getBlogPostStats, isBlogDatabaseConfigured, permanentlyDeleteBlogPost } from '@lib/blog-db';
import { extractBlogBlobUrls, permanentlyDeleteBlogBlobs } from '@lib/blob-storage';
import { getPostBySlug } from '@lib/posts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  const post = await findBlogPost(params.slug || '') ?? await getPostBySlug(params.slug || '');
  if (!post) return json({ error: '文章不存在或已删除' }, 404);
  const stats = await getBlogPostStats([params.slug || '']);
  return json({
    slug: post.id ?? post.slug,
    ...('data' in post ? post.data : post),
    pinned: stats[params.slug || '']?.pinned || false,
    viewCount: stats[params.slug || '']?.viewCount || 0,
    content: 'body' in post ? (post.body ?? '') : post.content,
    source: 'source' in post ? post.source : 'database',
  });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: 'BLOG_MONGODB_URI 尚未配置' }, 503);
  const slug = params.slug || '';
  if (!slug) return json({ error: '缺少文章 slug' }, 400);

  const databasePost = await findBlogPostIncludingDeleted(slug);
  if (!databasePost) {
    const filePost = await getPostBySlug(slug);
    if (filePost?.source === 'file') {
      return json({ error: '这是 GitHub 中的 Markdown 文章，不能从数据库后台永久删除；请从仓库删除对应 .md 文件后重新部署' }, 409);
    }
    return json({ error: '文章不存在' }, 404);
  }

  const blobUrls = extractBlogBlobUrls(databasePost.content, databasePost.cover);
  try {
    await permanentlyDeleteBlogPost(slug);
    let deletedImages = 0;
    if (blobUrls.length) {
      deletedImages = (await permanentlyDeleteBlogBlobs(blobUrls)).deleted;
    }
    return json({ ok: true, slug, deletedImages, message: '文章已永久删除，正文和关联的 Vercel Blob 图片已清理，无法恢复' });
  } catch (error) {
    console.error('[Blog permanent delete] failed', { slug, error });
    return json({ error: '文章删除失败；为避免数据不一致，请检查 Vercel Blob 配置后重试' }, 502);
  }
};
