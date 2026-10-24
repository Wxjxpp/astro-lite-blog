import type { APIRoute } from 'astro';
import { incrementBlogPostViewCount } from '@lib/blog-db';
import { getPostBySlug } from '@lib/posts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export const POST: APIRoute = async ({ params }) => {
  const slug = params.slug || '';
  if (!slug || slug.length > 255) return json({ error: '文章地址无效' }, 400);

  try {
    const post = await getPostBySlug(slug);
    if (!post) return json({ error: '文章不存在' }, 404);
    await incrementBlogPostViewCount(slug);
    return json({ ok: true });
  } catch (error) {
    console.error('[Blog view count] failed', { slug, error });
    return json({ error: '浏览量暂时无法保存' }, 503);
  }
};
