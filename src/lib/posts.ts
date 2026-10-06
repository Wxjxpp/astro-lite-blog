import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { PostItem, PostFrontmatter } from '@types/index';

// 获取所有已发布文章
export async function getAllPosts(): Promise<PostItem[]> {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts
    .map((entry: CollectionEntry<'posts'>) => {
      const data = entry.data as PostFrontmatter;
      return {
        slug: entry.id,
        title: data.title,
        description: data.description,
        pubDate: data.pubDate,
        updatedDate: data.updatedDate,
        category: data.category,
        tags: data.tags || [],
        cover: data.cover,
        draft: data.draft,
        author: data.author,
      } as PostItem;
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

// 获取单篇文章
export async function getPostBySlug(slug: string): Promise<CollectionEntry<'posts'> | undefined> {
  // Astro 5 Content Layer：glob loader 以文件名（去扩展名）作为 id
  return getEntry('posts', slug);
}

// 按分类获取文章
export async function getPostsByCategory(category: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

// 按标签获取文章
export async function getPostsByTag(tag: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
}

// 获取相关文章
export async function getRelatedPosts(currentSlug: string, limit = 5): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  const current = allPosts.find(p => p.slug === currentSlug);
  if (!current) return [];

  const currentTags = new Set(current.tags);

  return allPosts
    .filter(p => p.slug !== currentSlug)
    .map(p => ({
      post: p,
      score: p.tags.filter(t => currentTags.has(t)).length + (p.category === current.category ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

// 获取上一篇和下一篇
export async function getPrevNextPosts(currentSlug: string): Promise<{ prev: PostItem | null; next: PostItem | null }> {
  const allPosts = await getAllPosts();
  const index = allPosts.findIndex(p => p.slug === currentSlug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < allPosts.length - 1 ? allPosts[index + 1] : null,
    next: index > 0 ? allPosts[index - 1] : null,
  };
}

// 获取所有分类
export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.map(p => p.category))].sort();
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  return [...new Set(allPosts.flatMap(p => p.tags))].sort();
}

// 搜索文章
export async function searchPosts(query: string): Promise<PostItem[]> {
  const allPosts = await getAllPosts();
  const lowerQuery = query.toLowerCase();
  return allPosts.filter(
    p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
