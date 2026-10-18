import { b as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, a as renderTemplate, r as renderComponent, F as Fragment } from './astro/server_CbsihVi2.mjs';
import 'piccolore';
import { $ as $$PostCard } from './PostCard_YizaGNIT.mjs';
import 'clsx';

const $$Astro$1 = createAstro("https://www.wxjxpp.online");
const $$Pagination = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Pagination;
  const { page, totalPages, baseUrl } = Astro2.props;
  function getPageNumbers(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [1];
    if (current > 3) pages.push("ellipsis");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("ellipsis");
    pages.push(total);
    return pages;
  }
  const pageNumbers = getPageNumbers(page, totalPages);
  const getPageUrl = (p) => p === 1 ? baseUrl : `${baseUrl}?page=${p}`;
  return renderTemplate`${totalPages > 1 && renderTemplate`${maybeRenderHead()}<nav class="pagination" aria-label="分页导航"><a${addAttribute(page > 1 ? getPageUrl(page - 1) : "#", "href")} class="pagination-btn" aria-label="上一页"${addAttribute(page === 1, "aria-disabled")}${addAttribute(page === 1 ? "pointer-events: none;" : "", "style")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></a>${pageNumbers.map(
    (p, idx) => p === "ellipsis" ? renderTemplate`<span${addAttribute(`e-${idx}`, "key")} class="pagination-ellipsis">...</span>` : renderTemplate`<a${addAttribute(p, "key")}${addAttribute(getPageUrl(p), "href")}${addAttribute(`pagination-btn ${p === page ? "active" : ""}`, "class")}${addAttribute(p === page ? "page" : void 0, "aria-current")}>${p}</a>`
  )}<a${addAttribute(page < totalPages ? getPageUrl(page + 1) : "#", "href")} class="pagination-btn" aria-label="下一页"${addAttribute(page === totalPages, "aria-disabled")}${addAttribute(page === totalPages ? "pointer-events: none;" : "", "style")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></a></nav>`}`;
}, "D:/git/Tencent/astro-lite-blog/src/components/Pagination.astro", void 0);

const $$Astro = createAstro("https://www.wxjxpp.online");
const $$PostList = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PostList;
  const { posts, page, totalPages, baseUrl, emptyMessage = "\u6682\u65E0\u6587\u7AE0" } = Astro2.props;
  return renderTemplate`${posts.length > 0 ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<div class="posts-list">${posts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post })}`)}</div>${renderComponent($$result2, "Pagination", $$Pagination, { "page": page, "totalPages": totalPages, "baseUrl": baseUrl })}` })}` : renderTemplate`<div class="empty-state">${emptyMessage}</div>`}`;
}, "D:/git/Tencent/astro-lite-blog/src/components/PostList.astro", void 0);

export { $$PostList as $ };
