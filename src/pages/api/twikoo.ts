import type { APIRoute } from 'astro';

const twikooUrl = import.meta.env.PUBLIC_TWIKOO_ENV_ID?.replace(/\/+$/, '');
// Optional shared secret (server-side only, do NOT prefix with PUBLIC_). Set the same value
// on the Twikoo project so it only trusts the visitor IP forwarded by this proxy.
const proxySecret = import.meta.env.TWIKOO_PROXY_SECRET || process.env.TWIKOO_PROXY_SECRET || '';

/** Real visitor IP as seen by this site (Cloudflare > Vercel/Astro > plain proxy headers). */
const visitorIp = (request: Request, clientAddress?: string) => {
  const h = request.headers;
  const first = (v: string | null) => (v ? v.split(',')[0].trim() : '');
  return (
    first(h.get('cf-connecting-ip')) ||
    first(h.get('x-vercel-forwarded-for')) ||
    first(h.get('x-real-ip')) ||
    first(h.get('x-forwarded-for')) ||
    clientAddress ||
    ''
  );
};

export const POST: APIRoute = async context => {
  const { request } = context;
  if (!twikooUrl) {
    return new Response(JSON.stringify({ code: -1, message: 'Twikoo backend is not configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  let adapterIp = '';
  try {
    adapterIp = context.clientAddress || '';
  } catch {
    /* adapter cannot tell: fall back to headers */
  }
  const ip = visitorIp(request, adapterIp);

  try {
    const upstream = await fetch(twikooUrl, {
      method: 'POST',
      headers: {
        'content-type': request.headers.get('content-type') || 'application/json',
        accept: 'application/json',
        // Without this Twikoo only ever sees this server's IP (e.g. "Tokyo / Amazon").
        // The Twikoo side must read it back, see the api/index.js wrapper shipped with this change.
        ...(ip ? { 'x-twikoo-client-ip': ip } : {}),
        ...(proxySecret ? { 'x-twikoo-proxy-secret': proxySecret } : {}),
      },
      body: await request.text(),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Twikoo proxy] upstream request failed', error);
    /* return new Response(JSON.stringify({ code: -1, message: 'Twikoo backend request failed' }), { */
    return new Response(JSON.stringify({ code: -1, message: error }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
