import { defineMiddleware } from 'astro:middleware';
import { getAdminPath } from '@lib/admin-auth';

const internalPrefix = '/cms-internal';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const adminPath = `/${getAdminPath()}`;
  const locals = context.locals as Record<string, unknown>;
  if (url.pathname === internalPrefix || url.pathname.startsWith(`${internalPrefix}/`)) {
    return locals.cmsRewrite === true ? next() : new Response('Not Found', { status: 404 });
  }
  if (url.pathname === adminPath || url.pathname.startsWith(`${adminPath}/`)) {
    const rewritten = new URL(`${internalPrefix}${url.pathname.slice(adminPath.length) || '/'}`, url);
    rewritten.search = url.search;
    locals.cmsRewrite = true;
    return context.rewrite(rewritten);
  }
  return next();
});
