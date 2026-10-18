import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_DOUEFYAw.mjs';
import { $ as $$PostCard } from '../chunks/PostCard_YizaGNIT.mjs';
import { $ as $$GrokOrb } from '../chunks/GrokOrb_CMAYAmD7.mjs';
import { c as getAllPosts, e as getAllCategories, h as getAllTags } from '../chunks/posts_CFHJMtSw.mjs';
import { S as SITE_CONFIG } from '../chunks/utils_CLDqqa5S.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getAllPosts();
  const allCategories = await getAllCategories();
  const allTags = await getAllTags();
  const recentPosts = allPosts.slice(0, 6);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u9996\u9875", "description": SITE_CONFIG.description }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <section class="hero-section"> <div class="hero-copy"> <h1 class="hero-title">${SITE_CONFIG.title}</h1> <div class="hero-stats"> <div class="hero-stat"><span class="hero-stat-number">${allPosts.length}</span><span class="hero-stat-label">篇文章</span></div> <div class="hero-stat"><span class="hero-stat-number">${allCategories.length}</span><span class="hero-stat-label">个分类</span></div> <div class="hero-stat"><span class="hero-stat-number">${allTags.length}</span><span class="hero-stat-label">个标签</span></div> </div> </div> <div class="hero-orb-wrap" aria-label="点击切换小球形状"> ${renderComponent($$result2, "GrokOrb", $$GrokOrb, { "size": 220, "state": "idle", "mood": "hold", "follow": true, "class": "hero-orb" })} </div> </section> <section> <div class="section-head"> <h2>最新文章</h2> <a href="/posts" class="link-arrow">查看全部 →</a> </div> <div class="posts-list"> ${recentPosts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post })}`)} </div> </section> </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/index.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
