import type { APIRoute } from 'astro';
import { createSession, getAdminPath, getOAuthRedirectUri, verifyOAuthState } from '@lib/admin-auth';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || !verifyOAuthState(request, state)) return new Response('OAuth state 无效', { status: 400 });
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new Response('GitHub OAuth 尚未配置', { status: 503 });
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: getOAuthRedirectUri(request) }) });
  const token = await tokenResponse.json();
  if (!token.access_token) return new Response('GitHub 登录失败', { status: 401 });
  const userResponse = await fetch('https://api.github.com/user', { headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token.access_token}` } });
  const user = await userResponse.json();
  const allowed = (import.meta.env.GITHUB_ADMIN_LOGIN || 'Wxjxpp').toLowerCase();
  if (String(user.login || '').toLowerCase() !== allowed) return new Response('此 GitHub 账号没有博客管理权限', { status: 403 });
  return new Response(null, { status: 302, headers: { location: `/${getAdminPath()}`, 'set-cookie': createSession(user.login) } });
};
