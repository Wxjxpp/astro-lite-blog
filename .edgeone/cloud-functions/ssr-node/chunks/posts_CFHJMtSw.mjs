import { g as getCollection, a as getEntry } from './_astro_content_oeYHbLl8.mjs';
import { createClient } from '@vercel/kv';
import 'mongodb';
import { connect } from '@tidbcloud/serverless';

const host = undefined                         ;
const port = undefined                         ;
const username = undefined                         ;
const password = undefined                             ;
const database = undefined                             ;
const hasTidbParts = Boolean(host);
const isTiDbConfigured = Boolean(hasTidbParts);
let connection;
function getTiDbConnection() {
  if (!isTiDbConfigured) throw new Error("TiDB connection variables are not configured");
  connection ??= connect({ host, port, username, password, database, fullResult: true });
  return connection;
}
async function ensureTiDbSchema() {
  return void 0;
}
async function tidbQuery(sql, args = []) {
  const result = await getTiDbConnection().execute(sql, args);
  return result.rows || [];
}
async function tidbExecute(sql, args = []) {
  return getTiDbConnection().execute(sql, args);
}

const mongoUri = undefined                                ;
const dbName = "astro_blog";
const kvUrl = undefined                                      ;
const kvToken = undefined                                        ;
const useKv = Boolean(kvUrl);
const kv = useKv ? createClient({ url: kvUrl, token: kvToken }) : void 0;
const POSTS_KEY = "blog:posts:v1";
const DELETIONS_KEY = "blog:deletions:v1";
const MIGRATION_KEY = "blog:migration:mongo-to-kv:v1";
let kvMigrationPromise;
const isBlogDatabaseConfigured = Boolean(isTiDbConfigured || mongoUri || useKv);
function getClient() {
  throw new Error("BLOG_MONGODB_URI is not configured");
}
async function getBlogPostsCollection() {
  const db = (await getClient()).db(dbName);
  return db.collection("posts");
}
async function getDeletionsCollection() {
  const db = (await getClient()).db(dbName);
  return db.collection("post_deletions");
}
function toStored(post) {
  return { ...post, pubDate: post.pubDate.toISOString(), updatedDate: post.updatedDate?.toISOString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() };
}
function fromStored(post) {
  return { ...post, pubDate: new Date(post.pubDate), updatedDate: post.updatedDate ? new Date(post.updatedDate) : void 0, createdAt: new Date(post.createdAt), updatedAt: new Date(post.updatedAt) };
}
function parseTags(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    try {
      const parsed = JSON.parse(value.replace(/[\u0000-\u001f]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`));
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  }
}
function fromTiDb(row) {
  return {
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    pubDate: new Date(String(row.pub_date)),
    updatedDate: row.updated_date ? new Date(String(row.updated_date)) : void 0,
    category: String(row.category),
    tags: parseTags(row.tags),
    cover: row.cover ? String(row.cover) : void 0,
    draft: Boolean(row.draft),
    author: row.author ? String(row.author) : void 0,
    content: String(row.content),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at))
  };
}
async function ensureKvMigration() {
  if (!useKv || kvMigrationPromise) return kvMigrationPromise;
  kvMigrationPromise = (async () => {
    if (await kv.get(MIGRATION_KEY)) return;
    const posts = [];
    const deletions = [];
    const postMap = {};
    for (const post of posts) postMap[post.slug] = toStored(post);
    await kv.set(POSTS_KEY, postMap);
    await kv.set(DELETIONS_KEY, deletions.map((item) => item.slug));
    await kv.set(MIGRATION_KEY, true);
  })();
  return kvMigrationPromise;
}
async function readKvPosts() {
  await ensureKvMigration();
  return await kv.get(POSTS_KEY) || {};
}
async function readKvDeletions() {
  await ensureKvMigration();
  return new Set(await kv.get(DELETIONS_KEY) || []);
}
async function getDeletedSlugs() {
  if (isTiDbConfigured) {
    const rows2 = await tidbQuery("SELECT slug FROM blog_post_deletions");
    return new Set(rows2.map((row) => row.slug));
  }
  if (useKv) return readKvDeletions();
  const rows = await (await getDeletionsCollection()).find({}, { projection: { _id: 0, slug: 1 } }).toArray();
  return new Set(rows.map((row) => row.slug));
}
async function listBlogPosts() {
  if (isTiDbConfigured) {
    const rows = await tidbQuery("SELECT slug,title,description,pub_date,updated_date,category,CAST(tags AS CHAR) AS tags,cover,draft,author,content,created_at,updated_at FROM blog_posts WHERE slug NOT IN (SELECT slug FROM blog_post_deletions) ORDER BY pub_date DESC");
    return rows.map(fromTiDb);
  }
  if (useKv) {
    const deleted2 = await readKvDeletions();
    return Object.values(await readKvPosts()).filter((post) => !deleted2.has(post.slug)).map(fromStored).sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }
  const deleted = [...await getDeletedSlugs()];
  return (await getBlogPostsCollection()).find(deleted.length ? { slug: { $nin: deleted } } : {}).sort({ pubDate: -1 }).toArray();
}
async function findBlogPost(slug) {
  if ((await getDeletedSlugs()).has(slug)) return null;
  return findBlogPostIncludingDeleted(slug);
}
async function findBlogPostIncludingDeleted(slug) {
  if (isTiDbConfigured) {
    const rows = await tidbQuery("SELECT slug,title,description,pub_date,updated_date,category,CAST(tags AS CHAR) AS tags,cover,draft,author,content,created_at,updated_at FROM blog_posts WHERE slug = ?", [slug]);
    return rows[0] ? fromTiDb(rows[0]) : null;
  }
  if (useKv) {
    const post = (await readKvPosts())[slug];
    return post ? fromStored(post) : null;
  }
  return (await getBlogPostsCollection()).findOne({ slug });
}
async function saveBlogPost(post) {
  const now = /* @__PURE__ */ new Date();
  const full = { ...post, createdAt: post.createdAt ?? now, updatedAt: now };
  if (isTiDbConfigured) {
    await ensureTiDbSchema();
    await tidbExecute(
      `INSERT INTO blog_posts (slug,title,description,pub_date,updated_date,category,tags,cover,draft,author,content,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), pub_date=VALUES(pub_date), updated_date=VALUES(updated_date), category=VALUES(category), tags=VALUES(tags), cover=VALUES(cover), draft=VALUES(draft), author=VALUES(author), content=VALUES(content), updated_at=VALUES(updated_at)`,
      [full.slug, full.title, full.description, full.pubDate.toISOString(), full.updatedDate?.toISOString() || null, full.category, JSON.stringify(full.tags), full.cover || null, full.draft, full.author || null, full.content, full.createdAt.toISOString(), full.updatedAt.toISOString()]
    );
    await tidbExecute("DELETE FROM blog_post_deletions WHERE slug = ?", [full.slug]);
    return full;
  }
  if (useKv) {
    const posts = await readKvPosts();
    posts[post.slug] = toStored(full);
    const deleted = await readKvDeletions();
    deleted.delete(post.slug);
    await Promise.all([kv.set(POSTS_KEY, posts), kv.set(DELETIONS_KEY, [...deleted])]);
    return full;
  }
  await (await getDeletionsCollection()).deleteOne({ slug: post.slug });
  const collection = await getBlogPostsCollection();
  const { createdAt, ...fields } = full;
  await collection.updateOne({ slug: post.slug }, { $set: fields, $setOnInsert: { createdAt } }, { upsert: true });
  return collection.findOne({ slug: post.slug });
}
async function permanentlyDeleteBlogPost(slug) {
  if (isTiDbConfigured) {
    const result = await tidbExecute("DELETE FROM blog_posts WHERE slug = ?", [slug]);
    await tidbExecute("DELETE FROM blog_post_deletions WHERE slug = ?", [slug]);
    return { acknowledged: true, deletedCount: Number(result.rowsAffected || 0) };
  }
  if (useKv) {
    const posts = await readKvPosts();
    const existed = Boolean(posts[slug]);
    delete posts[slug];
    const deleted = await readKvDeletions();
    deleted.delete(slug);
    await Promise.all([kv.set(POSTS_KEY, posts), kv.set(DELETIONS_KEY, [...deleted])]);
    return { acknowledged: true, deletedCount: existed ? 1 : 0 };
  }
  const [postResult, deletionResult] = await Promise.all([(await getBlogPostsCollection()).deleteOne({ slug }), (await getDeletionsCollection()).deleteOne({ slug })]);
  return { acknowledged: postResult.acknowledged && deletionResult.acknowledged, deletedCount: postResult.deletedCount };
}

function fromFile(entry) {
  return { id: entry.id, data: entry.data, source: "file", entry };
}
function fromDatabase(post) {
  if (!post) return void 0;
  return {
    id: post.slug,
    source: "database",
    body: post.content,
    data: {
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      updatedDate: post.updatedDate,
      category: post.category,
      tags: post.tags || [],
      cover: post.cover,
      draft: post.draft,
      author: post.author
    }
  };
}
async function getDatabaseRecords() {
  if (!isBlogDatabaseConfigured) return [];
  try {
    const posts = await listBlogPosts();
    return posts.filter((post) => true ? post.draft !== true : true).map((post) => fromDatabase(post)).filter(Boolean);
  } catch (error) {
    console.error("[Blog DB] failed to load posts; falling back to Markdown files", error);
    return [];
  }
}
async function getAllPostRecords() {
  const files = await getCollection("posts", ({ data }) => data.draft !== true );
  const deleted = isBlogDatabaseConfigured ? await getDeletedSlugs() : /* @__PURE__ */ new Set();
  const records = files.filter((entry) => !deleted.has(entry.id)).map(fromFile);
  const database = await getDatabaseRecords();
  const bySlug = new Map(records.map((post) => [post.id, post]));
  for (const post of database) bySlug.set(post.id, post);
  return [...bySlug.values()].sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
}
async function getAllPosts() {
  const posts = await getAllPostRecords();
  return posts.map((post) => ({ slug: post.id, ...post.data, tags: post.data.tags || [] }));
}
async function getPostBySlug(slug) {
  if (isBlogDatabaseConfigured) {
    if ((await getDeletedSlugs()).has(slug)) return void 0;
    try {
      const databasePost = fromDatabase(await findBlogPost(slug));
      if (databasePost && (true ? databasePost.data.draft !== true : true)) return databasePost;
    } catch (error) {
      console.error("[Blog DB] failed to load post", error);
    }
  }
  const entry = await getEntry("posts", slug);
  if (!entry || entry.data.draft === true) return void 0;
  return fromFile(entry);
}
async function getPostsByCategory(category) {
  const allPosts = await getAllPosts();
  return allPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}
async function getPostsByTag(tag) {
  const allPosts = await getAllPosts();
  return allPosts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
}
async function getRelatedPosts(currentSlug, limit = 5) {
  const allPosts = await getAllPosts();
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return [];
  const currentTags = new Set(current.tags);
  return allPosts.filter((p) => p.slug !== currentSlug).map((p) => ({ post: p, score: p.tags.filter((t) => currentTags.has(t)).length + (p.category === current.category ? 2 : 0) })).sort((a, b) => b.score - a.score).slice(0, limit).map((item) => item.post);
}
async function getPrevNextPosts(currentSlug) {
  const allPosts = await getAllPosts();
  const index = allPosts.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return { prev: index < allPosts.length - 1 ? allPosts[index + 1] : null, next: index > 0 ? allPosts[index - 1] : null };
}
async function getAllCategories() {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.map((p) => p.category))].sort();
}
async function getAllTags() {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.flatMap((p) => p.tags))].sort();
}

export { findBlogPost as a, getAllPostRecords as b, getAllPosts as c, getPostsByCategory as d, getAllCategories as e, findBlogPostIncludingDeleted as f, getPostBySlug as g, getAllTags as h, isBlogDatabaseConfigured as i, getRelatedPosts as j, getPrevNextPosts as k, getPostsByTag as l, permanentlyDeleteBlogPost as p, saveBlogPost as s };
