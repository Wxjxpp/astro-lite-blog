import type { APIRoute } from 'astro';
import { getAllPosts } from '@lib/posts';

/** Lightweight index for the client-side search dialog (fetched on first open). */
export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const body = {
    posts: posts.map(p => ({
      t: p.title,
      d: p.description,
      s: p.slug,
      c: p.category,
      g: p.tags,
      p: p.pubDate.toISOString(),
    })),
  };
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  });
};
