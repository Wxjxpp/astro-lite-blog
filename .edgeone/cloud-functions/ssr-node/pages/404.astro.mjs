import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DOUEFYAw.mjs';
import { $ as $$GrokOrb } from '../chunks/GrokOrb_CMAYAmD7.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404 - \u9875\u9762\u672A\u627E\u5230", "noindex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="not-found"> ${renderComponent($$result2, "GrokOrb", $$GrokOrb, { "size": 240, "state": "confused", "mood": "hold", "follow": true, "class": "error-orb" })} <h1 class="error-http">HTTP 404 · NOT FOUND</h1> <p class="not-found-text">抱歉，你访问的页面不存在或已被移动。</p> <a href="/" class="btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
返回首页
</a> </div> </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/404.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
