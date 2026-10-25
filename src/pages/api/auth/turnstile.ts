import type { APIRoute } from 'astro';
import { createTurnstilePass } from '@lib/admin-auth';
import { isTurnstileConfigured, verifyTurnstile } from '@lib/turnstile';

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

/** Verify a Turnstile token with Cloudflare, then hand the browser a 2-minute pass cookie. */
export const POST: APIRoute = async ({ request }) => {
  if (!isTurnstileConfigured()) return json({ error: 'Turnstile 尚未配置' }, 503);
  let token = '';
  try { token = String((await request.json()).token || ''); } catch { /* fall through */ }
  if (!(await verifyTurnstile(token, request))) return json({ error: '人机验证未通过，请重试' }, 403);
  return json({ ok: true }, 200, { 'set-cookie': createTurnstilePass() });
};
