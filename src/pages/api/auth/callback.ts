import type { APIRoute } from 'astro';
import { exchangeGitHubCode, getGitHubUser, githubUserToSessionUser, setSessionCookie } from '@lib/auth';

export const GET: APIRoute = async ({ request, url, redirect }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) return new Response(JSON.stringify({ error: 'Missing authorization code' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => { const [k, ...v] = c.trim().split('='); return [k, v.join('=')]; }));
  if (!state || state !== cookies['oauth_state']) {
    return new Response(JSON.stringify({ error: 'Invalid state parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const accessToken = await exchangeGitHubCode(code);
    const githubUser = await getGitHubUser(accessToken);
    const sessionUser = githubUserToSessionUser(githubUser);
    const response = redirect('/');
    setSessionCookie(response, sessionUser);
    response.headers.append('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return response;
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed', message: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
