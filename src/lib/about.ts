import { findBlogPost, isBlogDatabaseConfigured, permanentlyDeleteBlogPost, saveBlogPost } from '@lib/blog-db';
import { SITE_CONFIG } from '@lib/utils';

/** The About page is stored as a hidden record in the blog store; it never shows up as a post. */
export const ABOUT_SLUG = 'site-about-page';
export const DEFAULT_ABOUT_TITLE = '关于本站';

export const defaultAboutContent = () => `## 博客简介

欢迎来到 **${SITE_CONFIG.title}**。这里是一个基于 [Astro](https://astro.build) 构建的极简博客，部署在 [Vercel](https://vercel.com) 平台上。

站点坚持黑白、留白与等宽字体的表达方式，内容以 Markdown 为主，包含完整的 GFM、数学公式与代码高亮支持。

## 技术栈

- **前端框架：** Astro（Content Collections，类型安全的内容管理）
- **Markdown 增强：** GFM、KaTeX 数学公式、highlight.js 代码高亮
- **评论系统：** Twikoo（自托管云函数 + MongoDB，数据自主可控）
- **订阅与 SEO：** RSS、Sitemap、Open Graph
- **部署平台：** Vercel

## 功能特性

- 完整的 Markdown / MDX 支持，包含 GitHub 风格标记
- 文章分类与标签系统
- 黑白双主题（默认深色）
- 图片懒加载与点击放大
- 响应式设计，适配移动端
- 无需登录第三方平台的评论（Twikoo，自带加载动画与防重复提交）

## 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- GitHub：[@Wxjxpp](https://github.com/Wxjxpp)
`;

export interface AboutPage { title: string; content: string; custom: boolean }

export async function getAboutPage(): Promise<AboutPage> {
  if (isBlogDatabaseConfigured) {
    try {
      const saved = await findBlogPost(ABOUT_SLUG);
      if (saved?.content?.trim()) return { title: saved.title || DEFAULT_ABOUT_TITLE, content: saved.content, custom: true };
    } catch (error) {
      console.error('[About] failed to read saved page, using default', error);
    }
  }
  return { title: DEFAULT_ABOUT_TITLE, content: defaultAboutContent(), custom: false };
}

export const saveAboutPage = (title: string, content: string) =>
  saveBlogPost({ slug: ABOUT_SLUG, title, description: '站点页面：关于', pubDate: new Date(), category: 'page', tags: [], draft: false, content });

export const resetAboutPage = () => permanentlyDeleteBlogPost(ABOUT_SLUG);
