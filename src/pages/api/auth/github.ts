import type { APIRoute } from 'astro';
import { clearTurnstilePass, createOAuthState, getAdminPath, getOAuthRedirectUri, hasTurnstilePass } from '@lib/admin-auth';
import { isTurnstileConfigured } from '@lib/turnstile';

export const GET: APIRoute = async ({ request, redirect }) => {
  // Turnstile gate: the browser must have passed the challenge moments ago (see /api/auth/turnstile).
  if (isTurnstileConfigured() && !hasTurnstilePass(request)) {
    return new Response(null, { status: 302, headers: { location: `/${getAdminPath()}?e=turnstile` } });
  }
  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  if (!clientId) return new Response('GITHUB_CLIENT_ID 尚未配置', { status: 503 });
  const { state, cookie } = createOAuthState();
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: getOAuthRedirectUri(request), scope: 'read:user', state });
  const headers = new Headers({ location: `https://github.com/login/oauth/authorize?${params}` });
  headers.append('set-cookie', cookie);
  headers.append('set-cookie', clearTurnstilePass()); // single use
  return new Response(null, { status: 302, headers });
};
