import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import edgeone from '@edgeone/astro'; // 正确的包名

// https://astro.build/config
export default defineConfig({
  site: 'https://www.wxjxpp.online', // 建议改为你的 EdgeOne 域名
  output: 'server', // 保持 server 模式
  adapter: edgeone(), // 使用正确的适配器
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