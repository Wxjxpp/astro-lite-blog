import { b as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, r as renderComponent, a as renderTemplate } from './astro/server_CbsihVi2.mjs';
import 'piccolore';
import { f as formatDate } from './utils_CIyKFLQf.mjs';
import { $ as $$TagBadge } from './TagBadge_CLd_AhJg.mjs';

const $$Astro = createAstro("https://astro-lite-blog-cuajtqlb.edgeone.cool");
const $$PostCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PostCard;
  const { post } = Astro2.props;
  const postUrl = `/posts/${post.slug}`;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(postUrl, "href")} class="post-card"> <div class="post-card-header"> <span class="post-card-category">${post.category}</span> <time${addAttribute(post.pubDate.toISOString(), "datetime")}>${formatDate(post.pubDate)}</time> </div> <h2 class="post-card-title">${post.title}</h2> <p class="post-card-excerpt">${post.description}</p> ${post.tags.length > 0 && renderTemplate`<div class="post-card-footer"> <div class="post-card-tags"> ${post.tags.slice(0, 4).map((tag) => renderTemplate`${renderComponent($$result, "TagBadge", $$TagBadge, { "tag": tag, "link": false })}`)} </div> </div>`} </a>`;
}, "D:/git/Tencent/astro-lite-blog/src/components/PostCard.astro", void 0);

export { $$PostCard as $ };
