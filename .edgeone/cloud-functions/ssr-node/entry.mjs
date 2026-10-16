import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BvUE8-Dv.mjs';
import { manifest } from './manifest_BlW3XyzQ.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/500.astro.mjs');
const _page3 = () => import('./pages/about.astro.mjs');
const _page4 = () => import('./pages/api/admin/posts/_slug_.astro.mjs');
const _page5 = () => import('./pages/api/admin/posts.astro.mjs');
const _page6 = () => import('./pages/api/admin/upload.astro.mjs');
const _page7 = () => import('./pages/api/auth/callback.astro.mjs');
const _page8 = () => import('./pages/api/auth/github/callback.astro.mjs');
const _page9 = () => import('./pages/api/auth/github.astro.mjs');
const _page10 = () => import('./pages/api/auth/logout.astro.mjs');
const _page11 = () => import('./pages/api/twikoo.astro.mjs');
const _page12 = () => import('./pages/categories/_category_.astro.mjs');
const _page13 = () => import('./pages/categories.astro.mjs');
const _page14 = () => import('./pages/posts/_slug_.astro.mjs');
const _page15 = () => import('./pages/posts.astro.mjs');
const _page16 = () => import('./pages/rss.xml.astro.mjs');
const _page17 = () => import('./pages/sitemap.xml.astro.mjs');
const _page18 = () => import('./pages/tags/_tag_.astro.mjs');
const _page19 = () => import('./pages/tags.astro.mjs');
const _page20 = () => import('./pages/index.astro.mjs');
const _page21 = () => import('./pages/_---cms_.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/500.astro", _page2],
    ["src/pages/about.astro", _page3],
    ["src/pages/api/admin/posts/[slug].ts", _page4],
    ["src/pages/api/admin/posts.ts", _page5],
    ["src/pages/api/admin/upload.ts", _page6],
    ["src/pages/api/auth/callback.ts", _page7],
    ["src/pages/api/auth/github/callback.ts", _page8],
    ["src/pages/api/auth/github.ts", _page9],
    ["src/pages/api/auth/logout.ts", _page10],
    ["src/pages/api/twikoo.ts", _page11],
    ["src/pages/categories/[category].astro", _page12],
    ["src/pages/categories/index.astro", _page13],
    ["src/pages/posts/[slug].astro", _page14],
    ["src/pages/posts/index.astro", _page15],
    ["src/pages/rss.xml.ts", _page16],
    ["src/pages/sitemap.xml.ts", _page17],
    ["src/pages/tags/[tag].astro", _page18],
    ["src/pages/tags/index.astro", _page19],
    ["src/pages/index.astro", _page20],
    ["src/pages/[...cms].astro", _page21]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
