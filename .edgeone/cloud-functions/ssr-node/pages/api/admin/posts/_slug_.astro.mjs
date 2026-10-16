import { i as isAdminAuthenticated } from '../../../../chunks/admin-auth_BWornRI-.mjs';
import { i as isBlogDatabaseConfigured, f as findBlogPostIncludingDeleted, g as getPostBySlug, p as permanentlyDeleteBlogPost, a as findBlogPost } from '../../../../chunks/posts_B2Dt8GmW.mjs';
import { del } from '@vercel/blob';
export { renderers } from '../../../../renderers.mjs';

const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";
function extractBlogBlobUrls(...values) {
  const urls = /* @__PURE__ */ new Set();
  const pattern = /https?:\/\/[^\s<>()"']+/g;
  for (const value of values) {
    for (const raw of value?.match(pattern) ?? []) {
      const cleaned = raw.replace(/[),.;!?]+$/g, "");
      try {
        const url = new URL(cleaned);
        if (url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX)) {
          urls.add(url.toString());
        }
      } catch {
      }
    }
  }
  return [...urls];
}
async function permanentlyDeleteBlogBlobs(urls) {
  if (!urls.length) return { deleted: 0 };
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  await del(urls);
  return { deleted: urls.length };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const GET = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: "未登录或会话已过期" }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: "BLOG_MONGODB_URI 尚未配置" }, 503);
  const post = await findBlogPost(params.slug || "") ?? await getPostBySlug(params.slug || "");
  if (!post) return json({ error: "文章不存在或已删除" }, 404);
  return json({
    slug: post.id ?? post.slug,
    ..."data" in post ? post.data : post,
    content: "body" in post ? post.body ?? "" : post.content,
    source: "source" in post ? post.source : "database"
  });
};
const DELETE = async ({ request, params }) => {
  if (!isAdminAuthenticated(request)) return json({ error: "未登录或会话已过期" }, 401);
  if (!isBlogDatabaseConfigured) return json({ error: "BLOG_MONGODB_URI 尚未配置" }, 503);
  const slug = params.slug || "";
  if (!slug) return json({ error: "缺少文章 slug" }, 400);
  const databasePost = await findBlogPostIncludingDeleted(slug);
  if (!databasePost) {
    const filePost = await getPostBySlug(slug);
    if (filePost?.source === "file") {
      return json({ error: "这是 GitHub 中的 Markdown 文章，不能从数据库后台永久删除；请从仓库删除对应 .md 文件后重新部署" }, 409);
    }
    return json({ error: "文章不存在" }, 404);
  }
  const blobUrls = extractBlogBlobUrls(databasePost.content, databasePost.cover);
  try {
    await permanentlyDeleteBlogPost(slug);
    let deletedImages = 0;
    if (blobUrls.length) {
      deletedImages = (await permanentlyDeleteBlogBlobs(blobUrls)).deleted;
    }
    return json({ ok: true, slug, deletedImages, message: "文章已永久删除，正文和关联的 Vercel Blob 图片已清理，无法恢复" });
  } catch (error) {
    console.error("[Blog permanent delete] failed", { slug, error });
    return json({ error: "文章删除失败；为避免数据不一致，请检查 Vercel Blob 配置后重试" }, 502);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
