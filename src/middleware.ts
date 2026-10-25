import { defineMiddleware } from 'astro:middleware';
import { getAdminPath } from '@lib/admin-auth';

/* Public pages are cacheable at the edge for a short time (stale-while-revalidate
   hides regeneration). Anything personal, admin, auth or API is never cached. */
const NEVER_CACHE = [/^\/api\//, /^\/cms/, /^\/admin/, /^\/404/, /^\/500/];
const ADMIN_COOKIE = 'blog_admin_session';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  if (path === '/cms-internal' || path.startsWith('/cms-internal/')) {
    return new Response('Not Found', { status: 404 });
  }

  const response = await next();

  if (context.request.method !== 'GET' || response.status !== 200) return response;
  if (NEVER_CACHE.some(re => re.test(path)) || path.replace(/^\/+|\/+$/g, '') === getAdminPath()) return response;
  if (response.headers.has('set-cookie') || response.headers.has('cache-control')) return response;
  if ((context.request.headers.get('cookie') || '').includes(ADMIN_COOKIE)) {
    response.headers.set('cache-control', 'private, no-store'); // logged-in admin always sees fresh content
    return response;
  }
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  response.headers.set('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return response;
});
