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

export async function listBlogPosts() {
  const collection = await getBlogPostsCollection();
  return collection.find({}).sort({ pubDate: -1 }).toArray();
}

export async function findBlogPost(slug: string) {
  const collection = await getBlogPostsCollection();
  return collection.findOne({ slug });
}

export async function saveBlogPost(post: Omit<BlogPostDocument, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }) {
  const collection = await getBlogPostsCollection();
  const now = new Date();
  await collection.updateOne(
    { slug: post.slug },
    { $set: { ...post, updatedAt: now }, $setOnInsert: { createdAt: post.createdAt ?? now } },
    { upsert: true },
  );
  return collection.findOne({ slug: post.slug });
}

export async function deleteBlogPost(slug: string) {
  const collection = await getBlogPostsCollection();
  return collection.deleteOne({ slug });
}
