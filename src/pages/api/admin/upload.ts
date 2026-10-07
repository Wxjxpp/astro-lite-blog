import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { isAdminAuthenticated } from '@lib/admin-auth';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const MAX_SIZE = 10 * 1024 * 1024;
const allowed = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']);

export const POST: APIRoute = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return json({ error: '未登录或会话已过期' }, 401);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: '图片存储尚未配置：请在 Vercel 项目连接 Blob，并注入 BLOB_READ_WRITE_TOKEN' }, 503);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: '请选择图片文件' }, 400);
  if (!allowed.has(file.type)) return json({ error: '只支持 JPG、PNG、GIF、WebP、AVIF 或 SVG 图片' }, 415);
  if (file.size > MAX_SIZE) return json({ error: '图片不能超过 10MB' }, 413);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
  const blob = await put(`blog/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: true });
  return json({ url: blob.url, markdown: `![${file.name.replace(/\.[^.]+$/, '')}](${blob.url})` }, 201);
};
