import type { APIRoute } from 'astro';
import { isAdminAuthenticated } from '@lib/admin-auth';
import { isBlogDatabaseConfigured } from '@lib/blog-db';
import { getAboutPage, resetAboutPage, saveAboutPage } from '@lib/about';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const guard = (request: Request) => !isAdminAuthenticated(request) ? json({ error: '未登录或会话已过期' }, 401) : !isBlogDatabaseConfigured ? json({ error: '博客存储尚未配置' }, 503) : null;

export const GET: APIRoute = async ({ request }) => guard(request) ?? json(await getAboutPage());

export const PUT: APIRoute = async ({ request }) => {
  const denied = guard(request);
  if (denied) return denied;
  let input: { title?: unknown; content?: unknown } = {};
  try { input = await request.json(); } catch { /* validated below */ }
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const content = typeof input.content === 'string' ? input.content : '';
  if (!title || !content.trim()) return json({ error: '请填写：标题、正文' }, 400);
  await saveAboutPage(title.slice(0, 120), content);
  return json({ ok: true });
};

/** Restore the built-in default text. */
export const DELETE: APIRoute = async ({ request }) => {
  const denied = guard(request);
  return denied ?? (await resetAboutPage(), json({ ok: true }));
};
