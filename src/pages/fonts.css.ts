import type { APIRoute } from 'astro';
import { FONTS_CSS } from '@lib/fonts';

/** The CJK font slices live in their own file so they are never on the render-blocking path. */
export const GET: APIRoute = () =>
  new Response(FONTS_CSS, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable', // URL carries a content hash (?v=)
    },
  });
