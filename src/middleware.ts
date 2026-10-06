import { defineMiddleware } from 'astro:middleware';
import { getAdminPath } from '@lib/admin-auth';

const internalPrefix = '/cms-internal';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const adminPath = `/${getAdminPath()}`;
  if (url.pathname === internalPrefix || url.pathname.startsWith(`${internalPrefix}/`)) {
    return url.searchParams.get('_cms') === '1' ? next() : new Response('Not Found', { status: 404 });
  }
  if (url.pathname === adminPath || url.pathname.startsWith(`${adminPath}/`)) {
    const rewritten = new URL(`${internalPrefix}${url.pathname.slice(adminPath.length) || '/'}`, url);
    rewritten.search = url.search;
    rewritten.searchParams.set('_cms', '1');
    return context.rewrite(rewritten);
  }
  return next();
});
