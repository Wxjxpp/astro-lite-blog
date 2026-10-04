import type { Comment, PaginatedResult } from '@types/index';
import { kv } from '@vercel/kv';

const COMMENTS_KEY_PREFIX = 'comments:';
const COMMENT_ID_KEY = 'comment:id_counter';
const memoryStore = new Map<string, Comment[]>();
let memoryIdCounter = 0;

function hasKV(): boolean { return Boolean(import.meta.env.KV_REST_API_URL && import.meta.env.KV_REST_API_TOKEN); }
function getCommentsKey(postSlug: string): string { return `${COMMENTS_KEY_PREFIX}${postSlug}`; }

async function generateCommentId(): Promise<string> {
  if (hasKV()) { const id = await kv.incr(COMMENT_ID_KEY); return `c_${id}`; }
  memoryIdCounter++; return `c_${memoryIdCounter}`;
}

export async function createComment(postSlug: string, userId: string, username: string, avatarUrl: string, content: string, parentId?: string): Promise<Comment> {
  const id = await generateCommentId();
  const comment: Comment = { id, postSlug, userId, username, avatarUrl, content, createdAt: Date.now(), parentId, likes: 0 };
  const key = getCommentsKey(postSlug);
  if (hasKV()) { await kv.lpush(key, JSON.stringify(comment)); }
  else { const list = memoryStore.get(key) || []; list.unshift(comment); memoryStore.set(key, list); }
  return comment;
}

export async function getComments(postSlug: string, page = 1, pageSize = 20): Promise<PaginatedResult<Comment>> {
  const key = getCommentsKey(postSlug);
  let allComments: Comment[] = [];
  if (hasKV()) { const raw = await kv.lrange(key, 0, -1); allComments = raw.map((c: string) => JSON.parse(c) as Comment); }
  else { allComments = memoryStore.get(key) || []; }
  allComments.sort((a, b) => b.createdAt - a.createdAt);
  const total = allComments.length; const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { items: allComments.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

export async function getCommentCount(postSlug: string): Promise<number> {
  const key = getCommentsKey(postSlug);
  if (hasKV()) return kv.llen(key);
  return (memoryStore.get(key) || []).length;
}

export async function deleteComment(postSlug: string, commentId: string, userId: string): Promise<boolean> {
  const key = getCommentsKey(postSlug);
  let allComments: Comment[] = [];
  if (hasKV()) { const raw = await kv.lrange(key, 0, -1); allComments = raw.map((c: string) => JSON.parse(c) as Comment); }
  else { allComments = memoryStore.get(key) || []; }
  const idx = allComments.findIndex(c => c.id === commentId);
  if (idx === -1 || allComments[idx].userId !== userId) return false;
  allComments.splice(idx, 1);
  if (hasKV()) { await kv.del(key); if (allComments.length > 0) await kv.rpush(key, ...allComments.map(c => JSON.stringify(c))); }
  else { memoryStore.set(key, allComments); }
  return true;
}

export async function likeComment(postSlug: string, commentId: string): Promise<number> {
  const key = getCommentsKey(postSlug);
  let allComments: Comment[] = [];
  if (hasKV()) { const raw = await kv.lrange(key, 0, -1); allComments = raw.map((c: string) => JSON.parse(c) as Comment); }
  else { allComments = memoryStore.get(key) || []; }
  const comment = allComments.find(c => c.id === commentId);
  if (!comment) return 0;
  comment.likes = (comment.likes || 0) + 1;
  if (hasKV()) { await kv.del(key); await kv.rpush(key, ...allComments.map(c => JSON.stringify(c))); }
  else { memoryStore.set(key, allComments); }
  return comment.likes;
}
