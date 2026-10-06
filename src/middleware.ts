import { defineMiddleware } from 'astro:middleware';

// The CMS uses an Astro catch-all route that checks BLOG_ADMIN_PATH server-side.
// Keep this middleware so the project can add request-level protections later.
export const onRequest = defineMiddleware(async (_, next) => next());
