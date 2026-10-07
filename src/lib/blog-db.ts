import { kv } from '@vercel/kv';
import { MongoClient, type Collection, type Db } from 'mongodb';

export interface BlogPostDocument {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  category: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  author?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogDeletionDocument { slug: string; deletedAt: Date; }
type StoredPost = Omit<BlogPostDocument, 'pubDate' | 'updatedDate' | 'createdAt' | 'updatedAt'> & {
  pubDate: string; updatedDate?: string; createdAt: string; updatedAt: string;
};

const mongoUri = import.meta.env.BLOG_MONGODB_URI;
const dbName = import.meta.env.BLOG_MONGODB_DATABASE || 'astro_blog';
const kvUrl = import.meta.env.KV_REST_API_URL;
const kvToken = import.meta.env.KV_REST_API_TOKEN;
const useKv = Boolean(kvUrl && kvToken);
const POSTS_KEY = 'blog:posts:v1';
const DELETIONS_KEY = 'blog:deletions:v1';
const MIGRATION_KEY = 'blog:migration:mongo-to-kv:v1';
let clientPromise: Promise<MongoClient> | undefined;
let kvMigrationPromise: Promise<void> | undefined;

export const isBlogDatabaseConfigured = Boolean(mongoUri || useKv);

function getClient(): Promise<MongoClient> {
  if (!mongoUri) throw new Error('BLOG_MONGODB_URI is not configured');
  clientPromise ??= new MongoClient(mongoUri).connect();
  return clientPromise;
}
async function getBlogPostsCollection(): Promise<Collection<BlogPostDocument>> {
  const db: Db = (await getClient()).db(dbName);
  return db.collection<BlogPostDocument>('posts');
}
async function getDeletionsCollection(): Promise<Collection<BlogDeletionDocument>> {
  const db: Db = (await getClient()).db(dbName);
  return db.collection<BlogDeletionDocument>('post_deletions');
}

function toStored(post: BlogPostDocument): StoredPost {
  return { ...post, pubDate: post.pubDate.toISOString(), updatedDate: post.updatedDate?.toISOString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() };
}
function fromStored(post: StoredPost): BlogPostDocument {
  return { ...post, pubDate: new Date(post.pubDate), updatedDate: post.updatedDate ? new Date(post.updatedDate) : undefined, createdAt: new Date(post.createdAt), updatedAt: new Date(post.updatedAt) };
}

async function ensureKvMigration() {
  if (!useKv || kvMigrationPromise) return kvMigrationPromise;
  kvMigrationPromise = (async () => {
    if (await kv.get<boolean>(MIGRATION_KEY)) return;
    const posts = mongoUri ? await (await getBlogPostsCollection()).find({}).toArray() : [];
    const deletions = mongoUri ? await (await getDeletionsCollection()).find({}).toArray() : [];
    const postMap: Record<string, StoredPost> = {};
    for (const post of posts) postMap[post.slug] = toStored(post);
    await kv.set(POSTS_KEY, postMap);
    await kv.set(DELETIONS_KEY, deletions.map(item => item.slug));
    await kv.set(MIGRATION_KEY, true);
  })();
  return kvMigrationPromise;
}

async function readKvPosts(): Promise<Record<string, StoredPost>> {
  await ensureKvMigration();
  return (await kv.get<Record<string, StoredPost>>(POSTS_KEY)) || {};
}
async function readKvDeletions(): Promise<Set<string>> {
  await ensureKvMigration();
  return new Set((await kv.get<string[]>(DELETIONS_KEY)) || []);
}

export async function getDeletedSlugs(): Promise<Set<string>> {
  if (useKv) return readKvDeletions();
  const rows = await (await getDeletionsCollection()).find({}, { projection: { _id: 0, slug: 1 } }).toArray();
  return new Set(rows.map(row => row.slug));
}

export async function listBlogPosts() {
  if (useKv) {
    const deleted = await readKvDeletions();
    return Object.values(await readKvPosts()).filter(post => !deleted.has(post.slug)).map(fromStored).sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }
  const deleted = [...await getDeletedSlugs()];
  return (await getBlogPostsCollection()).find(deleted.length ? { slug: { $nin: deleted } } : {}).sort({ pubDate: -1 }).toArray();
}

export async function findBlogPost(slug: string) {
  if ((await getDeletedSlugs()).has(slug)) return null;
  if (useKv) {
    const post = (await readKvPosts())[slug];
    return post ? fromStored(post) : null;
  }
  return (await getBlogPostsCollection()).findOne({ slug });
}

export async function saveBlogPost(post: Omit<BlogPostDocument, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
  const now = new Date();
  const full = { ...post, createdAt: post.createdAt ?? now, updatedAt: now } as BlogPostDocument;
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
  await collection.updateOne({ slug: post.slug }, { $set: full, $setOnInsert: { createdAt: full.createdAt } }, { upsert: true });
  return collection.findOne({ slug: post.slug });
}

export async function deleteBlogPost(slug: string) {
  if (useKv) {
    const deleted = await readKvDeletions();
    deleted.add(slug);
    await kv.set(DELETIONS_KEY, [...deleted]);
    return { acknowledged: true, modifiedCount: 1 };
  }
  return (await getDeletionsCollection()).updateOne({ slug }, { $set: { slug, deletedAt: new Date() } }, { upsert: true });
}
