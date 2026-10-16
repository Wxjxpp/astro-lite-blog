import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C8NlbvFw.mjs';
import { $ as $$PostList } from '../chunks/PostList_BlDTBLvK.mjs';
import { c as getAllPosts } from '../chunks/posts_B2Dt8GmW.mjs';
import { p as paginate, S as SITE_CONFIG } from '../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const allPosts = await getAllPosts();
  const page = Number(Astro2.url.searchParams.get("page")) || 1;
  const { items: posts, totalPages } = paginate(allPosts, page, SITE_CONFIG.postsPerPage);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u6587\u7AE0", "description": "\u6240\u6709\u535A\u5BA2\u6587\u7AE0\u5217\u8868" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page-header"><h1 class="page-title">所有文章</h1><p class="page-description">共 ${allPosts.length} 篇文章</p></div> ${renderComponent($$result2, "PostList", $$PostList, { "posts": posts, "page": page, "totalPages": totalPages, "baseUrl": "/posts", "emptyMessage": "\u8FD8\u6CA1\u6709\u53D1\u5E03\u4EFB\u4F55\u6587\u7AE0" })} </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/posts/index.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/posts/index.astro";
const $$url = "/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
