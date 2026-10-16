import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_C8NlbvFw.mjs';
import { $ as $$PostList } from '../../chunks/PostList_BlDTBLvK.mjs';
import { c as getAllPosts, d as getPostsByCategory } from '../../chunks/posts_B2Dt8GmW.mjs';
import { e as extractCategories, s as slugify, p as paginate, S as SITE_CONFIG } from '../../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$category = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$category;
  const { category } = Astro2.params;
  const allPosts = await getAllPosts();
  const categories = extractCategories(allPosts);
  const matchedCategory = categories.find((c) => slugify(c.name) === category);
  const categoryName = matchedCategory?.name || category;
  const categoryPosts = await getPostsByCategory(categoryName);
  const page = Number(Astro2.url.searchParams.get("page")) || 1;
  const { items: posts, totalPages } = paginate(categoryPosts, page, SITE_CONFIG.postsPerPage);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": categoryName, "description": `${categoryName} \u5206\u7C7B\u4E0B\u7684\u6240\u6709\u6587\u7AE0` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page-header"> <a href="/categories" class="link-arrow">← 返回全部分类</a> <h1 class="page-title" style="margin-top:0.5rem;">${categoryName}</h1> <p class="page-description">共 ${categoryPosts.length} 篇文章</p> </div> ${renderComponent($$result2, "PostList", $$PostList, { "posts": posts, "page": page, "totalPages": totalPages, "baseUrl": `/categories/${slugify(categoryName)}`, "emptyMessage": "\u8BE5\u5206\u7C7B\u4E0B\u6682\u65E0\u6587\u7AE0" })} </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/categories/[category].astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/categories/[category].astro";
const $$url = "/categories/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$category,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
