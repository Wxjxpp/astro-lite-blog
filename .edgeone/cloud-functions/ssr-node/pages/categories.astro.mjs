import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C8NlbvFw.mjs';
import { c as getAllPosts } from '../chunks/posts_B2Dt8GmW.mjs';
import { e as extractCategories } from '../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getAllPosts();
  const categories = extractCategories(allPosts);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u5206\u7C7B", "description": "\u6D4F\u89C8\u6240\u6709\u6587\u7AE0\u5206\u7C7B" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page-header"><h1 class="page-title">文章分类</h1><p class="page-description">共 ${categories.length} 个分类</p></div> <div class="category-grid"> ${categories.map((cat) => renderTemplate`<a${addAttribute(`/categories/${cat.name.toLowerCase()}`, "href")} class="category-card"> <div class="category-card-name">${cat.name}</div> <div class="category-card-count">${cat.count} 篇文章</div> </a>`)} </div> </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/categories/index.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/categories/index.astro";
const $$url = "/categories";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
