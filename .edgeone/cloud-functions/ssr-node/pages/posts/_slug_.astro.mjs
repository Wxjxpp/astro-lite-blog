import { b as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, r as renderComponent, F as Fragment, a as renderTemplate, d as renderScript, u as unescapeHTML } from '../../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_DOUEFYAw.mjs';
import { $ as $$TagBadge } from '../../chunks/TagBadge_CBOr_2Ha.mjs';
import { $ as $$GrokOrb } from '../../chunks/GrokOrb_CMAYAmD7.mjs';
import { g as getPostBySlug, j as getRelatedPosts, k as getPrevNextPosts } from '../../chunks/posts_CFHJMtSw.mjs';
import { s as slugify, f as formatDate } from '../../chunks/utils_CLDqqa5S.mjs';
import { r as renderEntry } from '../../chunks/_astro_content_oeYHbLl8.mjs';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro("https://www.wxjxpp.online");
const $$CommentSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CommentSection;
  const { term } = Astro2.props;
  const envId = undefined                                    ;
  const isConfigured = Boolean(envId);
  return renderTemplate`${maybeRenderHead()}<section class="comments-section" id="comments"> <div class="comments-header"> <h2 class="comments-title">Comments</h2> <span class="label">Powered by Twikoo</span> </div> <div class="comments-shell" id="commentsShell"${addAttribute("", "data-env")}${addAttribute(term || "", "data-path")}${addAttribute(Astro2.url.searchParams.get("twikoo-admin") === "1" ? "true" : void 0, "data-admin-mode")}> <div class="comments-mascot"> ${renderComponent($$result, "GrokOrb", $$GrokOrb, { "size": 72, "mood": "hold", "state": isConfigured ? "loading" : "curious", "follow": true })} </div> <div class="comments-stage"> ${isConfigured ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate` <div id="twikoo"></div> <div class="comments-loader" id="commentsLoader"> <span class="comments-spinner" aria-hidden="true"></span> <span class="comments-loader-text" id="commentsLoaderText">
正在加载评论…
</span> </div> ` })}` : renderTemplate`<div class="comments-config-hint"> <p>
评论功能尚未配置。请在部署时为环境变量 <code>PUBLIC_TWIKOO_ENV_ID</code> 赋值后重新部署：
</p> <p>
该变量是 Twikoo 云函数的访问地址（形如 <code>https://xxx.vercel.app</code>
）。云函数需要单独建一个 Vercel 项目部署（官方 <code>templates/vercel-min</code>），并绑定
              MongoDB Atlas。
</p> </div>`} </div> </div> </section> ${renderScript($$result, "D:/git/Tencent/astro-lite-blog/src/components/CommentSection.astro?astro&type=script&index=0&lang.ts")} `;
}, "D:/git/Tencent/astro-lite-blog/src/components/CommentSection.astro", void 0);

const $$Astro = createAstro("https://www.wxjxpp.online");
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const post = slug ? await getPostBySlug(slug) : void 0;
  if (!post) {
    return Astro2.redirect("/404");
  }
  const Content = post.source === "file" && post.entry ? (await renderEntry(post.entry)).Content : void 0;
  const data = post.data;
  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = lang?.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_+-]/g, "");
        const highlighted = language && hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : hljs.highlightAuto(text).value;
        const languageClass = language ? ` class="hljs language-${language}"` : ' class="hljs"';
        return `<pre><code${languageClass}>${highlighted}</code></pre>`;
      }
    }
  });
  const databaseHtml = post.source === "database" ? await marked.parse(post.body || "") : "";
  const relatedPosts = await getRelatedPosts(post.id, 4);
  const { prev, next } = await getPrevNextPosts(post.id);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": data.title, "description": data.description, "image": data.cover, "type": "article" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="container-narrow"> <!-- 文章头部 --> <header class="post-header"> <a${addAttribute(`/categories/${slugify(data.category)}`, "href")} class="post-card-category">${data.category}</a> <h1 class="post-title">${data.title}</h1> <div class="post-meta"> <span class="post-meta-item"> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line> </svg> ${formatDate(data.pubDate)} </span> ${data.updatedDate && renderTemplate`<span class="post-meta-item"> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M1 4v6h6"></path> <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path> </svg>
更新于 ${formatDate(data.updatedDate)} </span>`} ${data.author && renderTemplate`<span class="post-meta-item"> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path> <circle cx="12" cy="7" r="4"></circle> </svg> ${data.author} </span>`} </div> </header> <!-- 封面图 --> ${data.cover && renderTemplate`<img${addAttribute(data.cover, "src")}${addAttribute(data.title, "alt")} class="post-cover" loading="eager" decoding="async" fetchpriority="high">`} <!-- 文章正文 --> <div class="markdown-content post-body"> ${Content ? renderTemplate`${renderComponent($$result2, "Content", Content, {})}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${unescapeHTML(databaseHtml)}` })}`} </div> <!-- 文章标签 --> ${data.tags.length > 0 && renderTemplate`<div class="post-tags-row"> <span class="label">标签</span> ${data.tags.map((tag) => renderTemplate`${renderComponent($$result2, "TagBadge", $$TagBadge, { "tag": tag, "size": "md" })}`)} </div>`} <!-- 上一篇/下一篇 --> ${(prev || next) && renderTemplate`<nav${addAttribute(["post-nav", { "post-nav-single": !(prev && next) }], "class:list")}> ${prev && renderTemplate`<a${addAttribute(`/posts/${prev.slug}`, "href")} class="post-nav-card"> <div class="post-nav-label">← 上一篇</div> <div class="post-nav-title">${prev.title}</div> </a>`} ${next && renderTemplate`<a${addAttribute(`/posts/${next.slug}`, "href")} class="post-nav-card next"> <div class="post-nav-label">下一篇 →</div> <div class="post-nav-title">${next.title}</div> </a>`} </nav>`} <!-- 相关文章 --> ${relatedPosts.length > 0 && renderTemplate`<section style="margin-top: var(--space-3xl);"> <h2 class="post-section-title">相关文章</h2> <div class="related-grid"> ${relatedPosts.map((rp) => renderTemplate`<a${addAttribute(`/posts/${rp.slug}`, "href")} class="related-card"> <span class="post-card-category">${rp.category}</span> <div class="related-title">${rp.title}</div> <div class="related-date">${formatDate(rp.pubDate)}</div> </a>`)} </div> </section>`} <!-- 评论区 --> ${renderComponent($$result2, "CommentSection", $$CommentSection, { "term": post.id })} </article> ` })} ${renderScript($$result, "D:/git/Tencent/astro-lite-blog/src/pages/posts/[slug].astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/git/Tencent/astro-lite-blog/src/pages/posts/[slug].astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/posts/[slug].astro";
const $$url = "/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
