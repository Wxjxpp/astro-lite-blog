import type { APIRoute } from 'astro';

const twikooUrl = import.meta.env.PUBLIC_TWIKOO_ENV_ID?.replace(/\/+$/, '');

export const POST: APIRoute = async ({ request }) => {
  if (!twikooUrl) {
    return new Response(JSON.stringify({ code: -1, message: 'Twikoo backend is not configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  try {
    const upstream = await fetch(twikooUrl, {
      method: 'POST',
      headers: {
        'content-type': request.headers.get('content-type') || 'application/json',
        accept: 'application/json',
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
    return new Response(JSON.stringify({ code: -1, message: 'Twikoo backend request failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
