import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C8NlbvFw.mjs';
import { c as getAllPosts } from '../chunks/posts_B2Dt8GmW.mjs';
import { a as extractTags, s as slugify } from '../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getAllPosts();
  const tags = extractTags(allPosts);
  const maxCount = Math.max(...tags.map((t) => t.count), 1);
  function getTagSize(count) {
    const r = count / maxCount;
    if (r > 0.75) return "1.25rem";
    if (r > 0.5) return "1.1rem";
    if (r > 0.25) return "1rem";
    return "0.9rem";
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u6807\u7B7E", "description": "\u6D4F\u89C8\u6240\u6709\u6587\u7AE0\u6807\u7B7E" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <div class="page-header"><h1 class="page-title">标签云</h1><p class="page-description">共 ${tags.length} 个标签</p></div> <div class="tag-cloud"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/tags/${slugify(tag.name)}`, "href")} class="tag-cloud-item"${addAttribute(`font-size:${getTagSize(tag.count)};`, "style")}>
#${tag.name}<span class="tag-cloud-count">${tag.count}</span> </a>`)} </div> </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/tags/index.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/tags/index.astro";
const $$url = "/tags";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
