import { e as defineMiddleware, s as sequence } from './chunks/render-context_C76EjHDt.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CMEqKfY-.mjs';
import 'piccolore';
import './chunks/astro/server_CbsihVi2.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname;
  if (path === "/cms-internal" || path.startsWith("/cms-internal/")) {
    return new Response("Not Found", { status: 404 });
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
