import { b as createAstro, c as createComponent, m as maybeRenderHead, e as addAttribute, a as renderTemplate } from './astro/server_CbsihVi2.mjs';
import 'piccolore';
import 'clsx';
import { s as slugify } from './utils_CLDqqa5S.mjs';

const $$Astro = createAstro("https://www.wxjxpp.online");
const $$TagBadge = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TagBadge;
  const { tag, size = "sm", link = true } = Astro2.props;
  const cls = `tag-badge ${size === "md" ? "tag-badge-md" : ""}`;
  return renderTemplate`${link ? renderTemplate`${maybeRenderHead()}<a${addAttribute(`/tags/${slugify(tag)}`, "href")}${addAttribute(cls, "class")}>#${tag}</a>` : renderTemplate`<span${addAttribute(cls, "class")}>#${tag}</span>`}`;
}, "D:/git/Tencent/astro-lite-blog/src/components/TagBadge.astro", void 0);

export { $$TagBadge as $ };
