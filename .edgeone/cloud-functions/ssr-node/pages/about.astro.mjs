import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C8NlbvFw.mjs';
import { S as SITE_CONFIG } from '../chunks/utils_CIyKFLQf.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$About = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u5173\u4E8E", "description": `\u5173\u4E8E ${SITE_CONFIG.title}` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container-narrow"> <div class="page-header"> <h1 class="page-title">关于本站</h1> <p class="page-description">${SITE_CONFIG.description}</p> </div> <div class="markdown-content"> <section class="about-section"> <h2>博客简介</h2> <p>欢迎来到 <strong>${SITE_CONFIG.title}</strong>。这里是一个基于 <a href="https://astro.build" target="_blank" rel="noopener">Astro</a> 构建的极简博客，部署在 <a href="https://vercel.com" target="_blank" rel="noopener">Vercel</a> 平台上。</p> <p>站点坚持黑白、留白与等宽字体的表达方式，内容以 Markdown 为主，包含完整的 GFM、数学公式与代码高亮支持。</p> </section> <section class="about-section"> <h2>技术栈</h2> <ul> <li><strong>前端框架：</strong>Astro（Content Collections，类型安全的内容管理）</li> <li><strong>Markdown 增强：</strong>GFM、KaTeX 数学公式、highlight.js 代码高亮</li> <li><strong>评论系统：</strong>Twikoo（自托管云函数 + MongoDB，数据自主可控）</li> <li><strong>订阅与 SEO：</strong>RSS、Sitemap、Open Graph</li> <li><strong>部署平台：</strong>Vercel</li> </ul> </section> <section class="about-section"> <h2>功能特性</h2> <ul> <li>完整的 Markdown / MDX 支持，包含 GitHub 风格标记</li> <li>文章分类与标签系统</li> <li>黑白双主题（默认深色）</li> <li>图片懒加载与点击放大</li> <li>响应式设计，适配移动端</li> <li>无需登录第三方平台的评论（Twikoo，自带加载动画与防重复提交）</li> </ul> </section> <section class="about-section"> <h2>联系方式</h2> <p>如有任何问题或建议，欢迎通过以下方式联系：</p> <ul> <li>GitHub：<a href="https://github.com/Wxjxpp" target="_blank" rel="noopener">@Wxjxpp</a></li> </ul> </section> </div> </div> ` })}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/about.astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
