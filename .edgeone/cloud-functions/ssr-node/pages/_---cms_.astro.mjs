import { b as createAstro, c as createComponent, r as renderComponent, d as renderScript, a as renderTemplate, m as maybeRenderHead, F as Fragment } from '../chunks/astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_C8NlbvFw.mjs';
import { g as getAdminPath, i as isAdminAuthenticated } from '../chunks/admin-auth_BWornRI-.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const requestedPath = Array.isArray(Astro2.params.cms) ? Astro2.params.cms.join("/") : Astro2.params.cms || "";
  if (requestedPath !== getAdminPath()) return new Response("Not Found", { status: 404 });
  const loggedIn = isAdminAuthenticated(Astro2.request);
  Astro2.response.status = 200;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u535A\u5BA2\u7BA1\u7406", "description": "\u535A\u5BA2\u5185\u5BB9\u7BA1\u7406\u540E\u53F0", "transitions": false, "data-astro-cid-pwzc6vzu": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container-narrow cms-page" data-astro-cid-pwzc6vzu> ${loggedIn ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-pwzc6vzu": true }, { "default": async ($$result3) => renderTemplate` <header class="cms-header" data-astro-cid-pwzc6vzu><div data-astro-cid-pwzc6vzu><p class="label" data-astro-cid-pwzc6vzu>CONTENT STUDIO</p><h1 data-astro-cid-pwzc6vzu>文章管理</h1><p class="cms-hint" data-astro-cid-pwzc6vzu>先写正文，保存时系统会告诉你具体缺哪个字段。</p></div><a href="/api/auth/logout" data-astro-cid-pwzc6vzu>退出登录</a></header> <section class="cms-grid" data-astro-cid-pwzc6vzu> <aside class="cms-list" data-astro-cid-pwzc6vzu><button id="newPost" class="cms-button primary" data-astro-cid-pwzc6vzu>＋ 新建文章</button><div id="postList" data-astro-cid-pwzc6vzu>正在加载…</div></aside> <section class="cms-editor" data-astro-cid-pwzc6vzu> <form id="postForm" novalidate data-astro-cid-pwzc6vzu> <input type="hidden" id="originalSlug" data-astro-cid-pwzc6vzu> <label data-astro-cid-pwzc6vzu>标题 <span class="required-mark" data-astro-cid-pwzc6vzu>必填</span><input id="title" required data-astro-cid-pwzc6vzu></label> <div class="cms-two" data-astro-cid-pwzc6vzu><label data-astro-cid-pwzc6vzu>Slug <span class="required-mark" data-astro-cid-pwzc6vzu>必填，仅限英文、数字和连字符</span><input id="slug" required pattern="[a-z0-9-]+" data-astro-cid-pwzc6vzu></label><label data-astro-cid-pwzc6vzu>分类 <span class="required-mark" data-astro-cid-pwzc6vzu>必填</span><input id="category" required data-astro-cid-pwzc6vzu></label></div> <label data-astro-cid-pwzc6vzu>摘要 <span class="required-mark" data-astro-cid-pwzc6vzu>必填</span><textarea id="description" rows="2" required data-astro-cid-pwzc6vzu></textarea></label> <div class="cms-two" data-astro-cid-pwzc6vzu><label data-astro-cid-pwzc6vzu>发布日期 <span class="required-mark" data-astro-cid-pwzc6vzu>必填</span><input id="pubDate" type="date" required data-astro-cid-pwzc6vzu></label><label data-astro-cid-pwzc6vzu>作者<input id="author" data-astro-cid-pwzc6vzu></label></div> <label data-astro-cid-pwzc6vzu>封面 URL<input id="cover" type="url" placeholder="https://…" data-astro-cid-pwzc6vzu></label> <label data-astro-cid-pwzc6vzu>标签（逗号分隔）<input id="tags" placeholder="Astro, 教程" data-astro-cid-pwzc6vzu></label> <label data-astro-cid-pwzc6vzu>正文 Markdown <span class="required-mark" data-astro-cid-pwzc6vzu>必填</span><textarea id="content" rows="18" required placeholder="在这里写 Markdown 正文…" data-astro-cid-pwzc6vzu></textarea></label> <div class="cms-upload" data-astro-cid-pwzc6vzu><div data-astro-cid-pwzc6vzu><strong data-astro-cid-pwzc6vzu>插入图片</strong><small data-astro-cid-pwzc6vzu>支持 JPG、PNG、WebP、AVIF；超过 4MB 自动压缩。SVG、GIF 不压缩，需 ≤4MB</small></div><input id="imageUpload" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml" data-astro-cid-pwzc6vzu><button class="cms-button" type="button" id="uploadButton" data-astro-cid-pwzc6vzu>上传并插入正文</button></div> <label class="cms-check" data-astro-cid-pwzc6vzu><input id="draft" type="checkbox" data-astro-cid-pwzc6vzu> 保存为草稿</label> <div class="cms-actions" data-astro-cid-pwzc6vzu><button class="cms-button primary" type="submit" id="saveButton" data-astro-cid-pwzc6vzu>保存文章</button><button class="cms-button" type="button" id="previewButton" data-astro-cid-pwzc6vzu>预览</button><button class="cms-button danger" type="button" id="deleteButton" data-astro-cid-pwzc6vzu>删除</button></div> <p id="status" class="cms-status" role="status" data-astro-cid-pwzc6vzu></p> </form> <article id="preview" class="markdown-content cms-preview" hidden data-astro-cid-pwzc6vzu></article> </section> </section> ` })}` : renderTemplate`<section class="cms-login" data-astro-cid-pwzc6vzu><p class="label" data-astro-cid-pwzc6vzu>PRIVATE CONTENT STUDIO</p><h1 data-astro-cid-pwzc6vzu>博客管理</h1><p data-astro-cid-pwzc6vzu>管理入口不是安全边界，登录仍需 GitHub OAuth 和账号白名单。</p><a class="cms-button primary" href="/api/auth/github" data-astro-cid-pwzc6vzu>使用 GitHub 登录</a></section>`} </main> ` })} ${loggedIn && renderTemplate`${renderScript($$result, "D:/git/Tencent/astro-lite-blog/src/pages/[...cms].astro?astro&type=script&index=0&lang.ts")}`} `;
}, "D:/git/Tencent/astro-lite-blog/src/pages/[...cms].astro", void 0);

const $$file = "D:/git/Tencent/astro-lite-blog/src/pages/[...cms].astro";
const $$url = "/[...cms]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
