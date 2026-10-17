const SITE_CONFIG = {
  title: "Wxjxpp",
  description: "A full-featured Astro blog",
  url: "https://your-blog-domain.vercel.app",
  postsPerPage: 10};
const NAV_MENU = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "分类", href: "/categories" },
  { label: "标签", href: "/tags" },
  { label: "关于", href: "/about" }
];
const SOCIAL_LINKS = [
  { name: "GitHub", icon: "github", url: "https://github.com/Wxjxpp" },
  { name: "RSS", icon: "rss", url: "/rss.xml" }
];
function formatDate(date) {
  return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}
function extractCategories(posts) {
  const map = /* @__PURE__ */ new Map();
  for (const p of posts) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category).push(p);
  }
  return Array.from(map.entries()).map(([name, ps]) => ({ name, count: ps.length, posts: ps })).sort((a, b) => b.count - a.count);
}
function extractTags(posts) {
  const map = /* @__PURE__ */ new Map();
  for (const p of posts) for (const t of p.tags) {
    if (!map.has(t)) map.set(t, []);
    map.get(t).push(p);
  }
  return Array.from(map.entries()).map(([name, ps]) => ({ name, count: ps.length, posts: ps })).sort((a, b) => b.count - a.count);
}
function paginate(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize, totalPages };
}
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export { NAV_MENU as N, SITE_CONFIG as S, extractTags as a, SOCIAL_LINKS as b, extractCategories as e, formatDate as f, paginate as p, slugify as s };
