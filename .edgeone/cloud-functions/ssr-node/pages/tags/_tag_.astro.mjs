import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_C8NlbvFw.mjs';
import { $ as $$PostList } from '../../chunks/PostList_BlDTBLvK.mjs';
import { c as getAllPosts, l as getPostsByTag } from '../../chunks/posts_B2Dt8GmW.mjs';
import { a as extractTags, s as slugify, p as paginate, S as SITE_CONFIG } from '../../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$tag;
  const { tag } = Astro2.params;
  const allPosts = await getAllPosts();
  const tags = extractTags(allPosts);
  const matchedTag = tags.find((t) => slugify(t.name) === tag);
  const tagName = matchedTag?.name || tag;
  const tagPosts = await getPostsByTag(tagName);
  const page = Number(Astro2.url.searchParams.get("page")) || 1;
  const { items: posts, totalPages } = paginate(tagPosts, page, SITE_CONFIG.postsPerPage);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `#${tagName}`, "description": `\u6807\u7B7E ${tagName} \u4E0B\u7684\u6240\u6709\u6587\u7AE0` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page-header"> <a href="/tags" class="link-arrow">← 返回全部标签</a> <h1 class="page-title" style="margin-top:0.5rem;">#${tagName}</h1> <p class="page-description">共 ${tagPosts.length} 篇文章</p> </div> ${renderComponent($$result2, "PostList", $$PostList, { "posts": posts, "page": page, "totalPages": totalPages, "baseUrl": `/tags/${slugify(tagName)}`, "emptyMessage": "\u8BE5\u6807\u7B7E\u4E0B\u6682\u65E0\u6587\u7AE0" })} </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/tags/[tag].astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/tags/[tag].astro";
const $$url = "/tags/[tag]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$tag,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
