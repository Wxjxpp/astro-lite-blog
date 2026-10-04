import type { SessionUser, GitHubUser } from '@types/index';
import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'blog_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  return secret;
}

export function generateSessionToken(): string { return crypto.randomBytes(32).toString('hex'); }

function sign(data: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(data).digest('hex');
}

export function createSessionCookie(user: SessionUser): string {
  const payload = { user, exp: Date.now() + SESSION_DURATION };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function verifySessionCookie(cookieValue: string): SessionUser | null {
  try {
    const [data, signature] = cookieValue.split('.');
    if (!data || !signature) return null;
    const expected = sign(data);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return null;
    return payload.user as SessionUser;
  } catch { return null; }
}

export function getCurrentUser(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => { const [k, ...v] = c.trim().split('='); return [k, v.join('=')]; }));
  const sessionCookie = cookies[SESSION_COOKIE_NAME];
  if (!sessionCookie) return null;
  return verifySessionCookie(sessionCookie);
}

export function setSessionCookie(response: Response, user: SessionUser): Response {
  response.headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=${createSessionCookie(user)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION / 1000}`);
  return response;
}

export function clearSessionCookie(response: Response): Response {
  response.headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return response;
}

export function githubUserToSessionUser(githubUser: GitHubUser): SessionUser {
  return { id: String(githubUser.id), username: githubUser.login, displayName: githubUser.name || githubUser.login, avatarUrl: githubUser.avatar_url, githubUrl: githubUser.html_url };
}

export function getGitHubAuthUrl(state: string): string {
  const params = new URLSearchParams({ client_id: import.meta.env.GITHUB_CLIENT_ID, redirect_uri: import.meta.env.GITHUB_REDIRECT_URI, state, scope: 'read:user user:email', allow_signup: 'true' });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id: import.meta.env.GITHUB_CLIENT_ID, client_secret: import.meta.env.GITHUB_CLIENT_SECRET, code }),
  });
  const data = await response.json();
  if (data.error) throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  return data.access_token;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', { headers: { 'Authorization': `token ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' } });
  if (!response.ok) throw new Error('Failed to fetch GitHub user info');
  return response.json();
}
