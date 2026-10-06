import type { APIRoute } from 'astro';
import { createOAuthState, getOAuthRedirectUri } from '@lib/admin-auth';

export const GET: APIRoute = async ({ request, redirect }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  if (!clientId) return new Response('GITHUB_CLIENT_ID 尚未配置', { status: 503 });
  const { state, cookie } = createOAuthState();
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: getOAuthRedirectUri(request), scope: 'read:user', state });
  return new Response(null, { status: 302, headers: { location: `https://github.com/login/oauth/authorize?${params}`, 'set-cookie': cookie } });
};
