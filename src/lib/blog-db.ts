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

interface BlogDeletionDocument {
  slug: string;
  deletedAt: Date;
}

const uri = import.meta.env.BLOG_MONGODB_URI;
const dbName = import.meta.env.BLOG_MONGODB_DATABASE || 'astro_blog';
let clientPromise: Promise<MongoClient> | undefined;

export const isBlogDatabaseConfigured = Boolean(uri);

function getClient(): Promise<MongoClient> {
  if (!uri) throw new Error('BLOG_MONGODB_URI is not configured');
  clientPromise ??= new MongoClient(uri).connect();
  return clientPromise;
}

export async function getBlogPostsCollection(): Promise<Collection<BlogPostDocument>> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  return db.collection<BlogPostDocument>('posts');
}

async function getDeletionsCollection(): Promise<Collection<BlogDeletionDocument>> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  return db.collection<BlogDeletionDocument>('post_deletions');
}

export async function getDeletedSlugs(): Promise<Set<string>> {
  const collection = await getDeletionsCollection();
  const rows = await collection.find({}, { projection: { _id: 0, slug: 1 } }).toArray();
  return new Set(rows.map(row => row.slug));
}

export async function listBlogPosts() {
  const collection = await getBlogPostsCollection();
  const deleted = [...await getDeletedSlugs()];
  const filter = deleted.length ? { slug: { $nin: deleted } } : {};
  return collection.find(filter).sort({ pubDate: -1 }).toArray();
}

export async function findBlogPost(slug: string) {
  if ((await getDeletedSlugs()).has(slug)) return null;
  const collection = await getBlogPostsCollection();
  return collection.findOne({ slug });
}

export async function saveBlogPost(post: Omit<BlogPostDocument, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
  const collection = await getBlogPostsCollection();
  const now = new Date();
  const deletions = await getDeletionsCollection();
  await deletions.deleteOne({ slug: post.slug });
  await collection.updateOne(
    { slug: post.slug },
    { $set: { ...post, updatedAt: now }, $setOnInsert: { createdAt: post.createdAt ?? now } },
    { upsert: true },
  );
  return collection.findOne({ slug: post.slug });
}

/**
 * Keep the database copy as a recoverable backup and write a tombstone.
 * The tombstone also hides a same-slug Markdown file, which prevents the
 * public reader from falling back to the legacy file after deletion.
 */
export async function deleteBlogPost(slug: string) {
  const collection = await getDeletionsCollection();
  return collection.updateOne(
    { slug },
    { $set: { slug, deletedAt: new Date() } },
    { upsert: true },
  );
}
