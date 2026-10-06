import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  if (path === '/cms-internal' || path.startsWith('/cms-internal/')) {
    return new Response('Not Found', { status: 404 });
  }
  return next();
});
