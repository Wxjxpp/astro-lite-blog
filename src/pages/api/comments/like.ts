import type { APIRoute } from 'astro';
import { likeComment } from '@lib/comments';
import type { ApiResponse } from '@types/index';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { postSlug, commentId } = body;
    if (!postSlug || !commentId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' } satisfies ApiResponse), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const likes = await likeComment(postSlug, commentId);
    return new Response(JSON.stringify({ success: true, data: { likes }, message: 'Comment liked' } satisfies ApiResponse), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Like comment error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to like comment' } satisfies ApiResponse), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
