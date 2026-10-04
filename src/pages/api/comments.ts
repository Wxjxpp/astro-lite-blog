import type { APIRoute } from 'astro';
import { getComments, createComment, deleteComment, getCommentCount } from '@lib/comments';
import { getCurrentUser } from '@lib/auth';
import type { ApiResponse } from '@types/index';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ url }) => {
  const postSlug = url.searchParams.get('slug');
  const page = Number(url.searchParams.get('page')) || 1;
  const pageSize = Number(url.searchParams.get('pageSize')) || 20;
  if (!postSlug) return json({ success: false, error: 'Missing slug parameter' } satisfies ApiResponse, 400);
  try {
    const result = await getComments(postSlug, page, pageSize);
    const count = await getCommentCount(postSlug);
    return json({ success: true, data: { ...result, totalCount: count } } satisfies ApiResponse);
  } catch (error) { console.error('Get comments error:', error); return json({ success: false, error: 'Failed to fetch comments' } satisfies ApiResponse, 500); }
};

export const POST: APIRoute = async ({ request }) => {
  const user = getCurrentUser(request);
  if (!user) return json({ success: false, error: 'Authentication required' } satisfies ApiResponse, 401);
  try {
    const body = await request.json();
    const { postSlug, content, parentId } = body;
    if (!postSlug || !content?.trim()) return json({ success: false, error: 'Missing required fields' } satisfies ApiResponse, 400);
    if (content.length > 2000) return json({ success: false, error: 'Comment too long (max 2000 characters)' } satisfies ApiResponse, 400);
    const comment = await createComment(postSlug, user.id, user.username, user.avatarUrl, content.trim(), parentId);
    return json({ success: true, data: { comment }, message: 'Comment created successfully' } satisfies ApiResponse, 201);
  } catch (error) { console.error('Create comment error:', error); return json({ success: false, error: 'Failed to create comment' } satisfies ApiResponse, 500); }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const user = getCurrentUser(request);
  if (!user) return json({ success: false, error: 'Authentication required' } satisfies ApiResponse, 401);
  const postSlug = url.searchParams.get('slug');
  const commentId = url.searchParams.get('commentId');
  if (!postSlug || !commentId) return json({ success: false, error: 'Missing required parameters' } satisfies ApiResponse, 400);
  try {
    const success = await deleteComment(postSlug, commentId, user.id);
    if (!success) return json({ success: false, error: 'Comment not found or permission denied' } satisfies ApiResponse, 404);
    return json({ success: true, message: 'Comment deleted successfully' } satisfies ApiResponse);
  } catch (error) { console.error('Delete comment error:', error); return json({ success: false, error: 'Failed to delete comment' } satisfies ApiResponse, 500); }
};
