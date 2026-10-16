import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import edgeone from '@edgeone/astro-adapter'; // 腾讯云 EdgeOne 适配器

// https://astro.build/config
export default defineConfig({
  site: 'https://your-blog-domain.vercel.app', // 建议改为你的腾讯云域名
  output: 'server', // 关键修改：从 static 改为 server
  adapter: edgeone(), // 添加腾讯云适配器
  security: {
    checkOrigin: false,
  },
  integrations: [
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypeKatex,
      [rehypeHighlight, { detect: true, ignoreMissing: true }],
    ],
  },
});
