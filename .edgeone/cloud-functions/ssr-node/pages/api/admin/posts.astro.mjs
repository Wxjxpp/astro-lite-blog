import { i as isAdminAuthenticated } from '../../../chunks/admin-auth_BWornRI-.mjs';
import { i as isBlogDatabaseConfigured, b as getAllPostRecords, s as saveBlogPost } from '../../../chunks/posts_B2Dt8GmW.mjs';
export { renderers } from '../../../renderers.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const forbidden = () => json({ error: "未登录或会话已过期" }, 401);
const GET = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return forbidden();
  if (!isBlogDatabaseConfigured) return json({ error: "博客存储尚未配置" }, 503);
  const records = await getAllPostRecords();
  return json(records.map((post) => ({
    slug: post.id,
    ...post.data,
    content: post.body ?? post.entry?.body ?? "",
    source: post.source
  })));
};
const POST = async ({ request }) => {
  if (!isAdminAuthenticated(request)) return forbidden();
  if (!isBlogDatabaseConfigured) return json({ error: "博客存储尚未配置" }, 503);
  const input = await request.json();
  const labels = { title: "标题", slug: "Slug", description: "摘要", category: "分类", content: "正文" };
  const required = Object.keys(labels);
  const missing = required.filter((key) => typeof input[key] !== "string" || !input[key].trim());
  if (missing.length) return json({ error: `请填写：${missing.map((key) => labels[key]).join("、")}`, missing }, 400);
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) return json({ error: "slug 无效" }, 400);
  const saved = await saveBlogPost({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    pubDate: new Date(input.pubDate || Date.now()),
    updatedDate: input.updatedDate ? new Date(input.updatedDate) : void 0,
    category: input.category.trim(),
    tags: Array.isArray(input.tags) ? input.tags.map(String).map((x) => x.trim()).filter(Boolean) : [],
    cover: input.cover?.trim() || void 0,
    draft: input.draft === true,
    author: input.author?.trim() || void 0,
    content: String(input.content)
  });
  return json(saved, 201);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
