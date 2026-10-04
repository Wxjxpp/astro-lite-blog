import type { PostItem, CategoryInfo, TagInfo } from '@types/index';

export const SITE_CONFIG = {
  title: import.meta.env.SITE_NAME || 'Astro Lite Blog',
  description: import.meta.env.SITE_DESCRIPTION || 'A full-featured Astro blog',
  url: import.meta.env.SITE_URL || 'https://your-blog-domain.vercel.app',
  author: 'Blog Author', locale: 'zh-CN', postsPerPage: 10, commentsPerPage: 20,
};

export const NAV_MENU = [
  { label: '首页', href: '/' }, { label: '文章', href: '/posts' },
  { label: '分类', href: '/categories' }, { label: '标签', href: '/tags' },
  { label: '关于', href: '/about' },
];

export const SOCIAL_LINKS = [
  { name: 'GitHub', icon: 'github', url: 'https://github.com/yourusername' },
  { name: 'RSS', icon: 'rss', url: '/rss.xml' },
];

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateISO(date: Date | string): string { return new Date(date).toISOString(); }

export function timeAgo(date: Date | number | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000); const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24); const months = Math.floor(days / 30); const years = Math.floor(days / 365);
  if (years > 0) return `${years}年前`; if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`; if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`; return '刚刚';
}

export function calculateReadingTime(content: string): number {
  const cleanText = content.replace(/[#*`~\[\]()<>!-]/g, '').replace(/\s+/g, '');
  return Math.max(1, Math.ceil(cleanText.length / 300));
}

export function generateExcerpt(content: string, maxLength = 150): string {
  const clean = content.replace(/^#+\s.*$/gm, '').replace(/```[\s\S]*?```/g, '').replace(/[#*`~\[\]()<>!]/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
}

export function extractCategories(posts: PostItem[]): CategoryInfo[] {
  const map = new Map<string, PostItem[]>();
  for (const p of posts) { if (!map.has(p.category)) map.set(p.category, []); map.get(p.category)!.push(p); }
  return Array.from(map.entries()).map(([name, ps]) => ({ name, count: ps.length, posts: ps })).sort((a, b) => b.count - a.count);
}

export function extractTags(posts: PostItem[]): TagInfo[] {
  const map = new Map<string, PostItem[]>();
  for (const p of posts) for (const t of p.tags) { if (!map.has(t)) map.set(t, []); map.get(t)!.push(p); }
  return Array.from(map.entries()).map(([name, ps]) => ({ name, count: ps.length, posts: ps })).sort((a, b) => b.count - a.count);
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length; const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }) as T;
}
