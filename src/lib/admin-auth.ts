import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const sessionCookie = 'blog_admin_session';
const stateCookie = 'blog_oauth_state';
const sessionSecret = import.meta.env.BLOG_SESSION_SECRET || 'development-only-change-me';

export function getAdminPath() {
  return (import.meta.env.BLOG_ADMIN_PATH || 'manage-setup-required').replace(/^\/+|\/+$/g, '');
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

function encode(payload: object) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${value}.${sign(value)}`;
}

function decode<T>(token: string): T | null {
  const [value, signature] = token.split('.');
  if (!value || !signature) return null;
  const expected = sign(value);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T; } catch { return null; }
}

function cookies(request: Request) {
  return Object.fromEntries((request.headers.get('cookie') || '').split(';').map(x => x.trim().split('=' as const)).filter(x => x.length === 2));
}

export function isAdminAuthenticated(request: Request) {
  const token = cookies(request)[sessionCookie];
  const payload = token ? decode<{ login: string; exp: number }>(token) : null;
  return Boolean(payload && payload.login === (import.meta.env.GITHUB_ADMIN_LOGIN || 'Wxjxpp') && payload.exp > Date.now());
}

export function createOAuthState() {
  const state = randomBytes(24).toString('hex');
  return { state, cookie: `${stateCookie}=${encode({ state, exp: Date.now() + 10 * 60_000 })}; Path=/; HttpOnly; SameSite=Lax; Secure` };
}

export function verifyOAuthState(request: Request, state: string) {
  const token = cookies(request)[stateCookie];
  const payload = token ? decode<{ state: string; exp: number }>(token) : null;
  return Boolean(payload && payload.state === state && payload.exp > Date.now());
}

export function createSession(login: string) {
  const token = encode({ login, exp: Date.now() + 7 * 24 * 60 * 60_000 });
  return `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSession() {
  return `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export function getOAuthRedirectUri(request: Request) {
  const callbackPath = '/api/auth/callback';
  const configuredSite = import.meta.env.SITE_URL;
  if (configuredSite) return `${configuredSite.replace(/\/$/, '')}${callbackPath}`;
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) return `${protocol}://${host}${callbackPath}`;
  const url = new URL(request.url);
  return `${url.origin}${callbackPath}`;
}

export { sessionCookie, stateCookie };
