import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { PostItem, PostFrontmatter } from '@types/index';
import { findBlogPost, getBlogPostStats, getDeletedSlugs, isBlogDatabaseConfigured, listBlogPosts } from '@lib/blog-db';

export interface PostRecord {
  id: string;
  data: PostFrontmatter;
  body?: string;
  source: 'file' | 'database';
  entry?: CollectionEntry<'posts'>;
}

function fromFile(entry: CollectionEntry<'posts'>): PostRecord {
  return { id: entry.id, data: entry.data as PostFrontmatter, source: 'file', entry };
}

function fromDatabase(post: Awaited<ReturnType<typeof findBlogPost>>): PostRecord | undefined {
  if (!post) return undefined;
  return {
    id: post.slug,
    source: 'database',
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
      author: post.author,
    },
  };
}

async function getDatabaseRecords(): Promise<PostRecord[]> {
  if (!isBlogDatabaseConfigured) return [];
  try {
    const posts = await listBlogPosts();
    // 注意：草稿过滤逻辑保留，但建议去掉 import.meta.env.PROD 限制，确保后台能拿到全部数据
    return posts.map(post => fromDatabase(post)!).filter(Boolean);
  } catch (error: any) {
    console.error('[Blog DB] 读取 TiDB 崩溃了！', error);
    // 修复把错误抛出去，让 API 返回 500，这样你能在浏览器 Network 里直接看到原因
    throw new Error(`TiDB 读取失败: ${error.message || error}`);
  }
}

export async function getAllPostRecords(): Promise<PostRecord[]> {
  const files = await getCollection('posts', ({ data }) => import.meta.env.PROD ? data.draft !== true : true);
  const deleted = isBlogDatabaseConfigured ? await getDeletedSlugs() : new Set<string>();
  const records = files.filter(entry => !deleted.has(entry.id)).map(fromFile);
  const database = await getDatabaseRecords();
  const bySlug = new Map(records.map(post => [post.id, post]));
  for (const post of database) bySlug.set(post.id, post);
  return [...bySlug.values()].sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
}

export async function getAllPosts(): Promise<PostItem[]> {
  const records = await getAllPostRecords();
  let stats: Awaited<ReturnType<typeof getBlogPostStats>> = {};
  try {
    stats = await getBlogPostStats(records.map(post => post.id));
  } catch (error) {
    console.error('[Blog stats] unable to read MongoDB post_stats collection', error);
  }
  return records.map(post => {
    const stat = stats[post.id];
    return { slug: post.id, ...post.data, tags: post.data.tags || [], pinned: stat?.pinned || false, viewCount: stat?.viewCount || 0 };
  });
}

export async function getPostBySlug(slug: string): Promise<PostRecord | undefined> {
  if (isBlogDatabaseConfigured) {
    if ((await getDeletedSlugs()).has(slug)) return undefined;
    try {
      const databasePost = fromDatabase(await findBlogPost(slug));
      if (databasePost && (import.meta.env.PROD ? databasePost.data.draft !== true : true)) return databasePost;
    } catch (error) {
      console.error('[Blog DB] failed to load post', error);
    }
  }
  const entry = await getEntry('posts', slug);
  if (!entry || (import.meta.env.PROD && entry.data.draft === true)) return undefined;
  return fromFile(entry);
}

function pinnedFirst(posts: PostItem[]): PostItem[] {
  return posts.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export async function getPostsByCategory(category: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  return pinnedFirst(allPosts.filter(p => p.category.toLowerCase() === category.toLowerCase()));
}

export async function getPostsByTag(tag: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  return pinnedFirst(allPosts.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase())));
}

export async function getRelatedPosts(currentSlug: string, limit = 5): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  const current = allPosts.find(p => p.slug === currentSlug);
  if (!current) return [];
  const currentTags = new Set(current.tags);
  return allPosts
    .filter(p => p.slug !== currentSlug)
    .map(p => ({ post: p, score: p.tags.filter(t => currentTags.has(t)).length + (p.category === current.category ? 2 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

export async function getPrevNextPosts(currentSlug: string): Promise<{ prev: PostItem | null; next: PostItem | null }> {
  const allPosts = await getAllPosts();
  const index = allPosts.findIndex(p => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return { prev: index < allPosts.length - 1 ? allPosts[index + 1] : null, next: index > 0 ? allPosts[index - 1] : null };
}

export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.map(p => p.category))].sort();
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.flatMap(p => p.tags))].sort();
}

export async function searchPosts(query: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  const lowerQuery = query.toLowerCase();
  return allPosts.filter(p => p.title.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery) || p.tags.some(t => t.toLowerCase().includes(lowerQuery)) || p.category.toLowerCase().includes(lowerQuery));
}
