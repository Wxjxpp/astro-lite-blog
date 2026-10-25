/** Cloudflare Turnstile server-side verification. Env: TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY. */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const getTurnstileSiteKey = () => String(import.meta.env.TURNSTILE_SITE_KEY || '');
const getSecret = () => String(import.meta.env.TURNSTILE_SECRET_KEY || '');

export const isTurnstileConfigured = () => Boolean(getTurnstileSiteKey() && getSecret());

export async function verifyTurnstile(token: string, request: Request): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token });
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error('[Turnstile] verification request failed', error);
    return false;
  }
}
