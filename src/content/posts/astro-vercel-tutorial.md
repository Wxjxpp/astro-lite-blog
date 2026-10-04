---
title: "使用 Astro + Vercel 搭建个人博客的完整指南"
description: "从零开始，手把手教你使用 Astro 框架搭建一个高性能博客，并部署到 Vercel 平台。涵盖项目初始化、内容管理、评论系统集成等全部流程。"
pubDate: 2026-09-28
updatedDate: 2026-10-02
category: "技术"
tags: ["Astro", "Vercel", "博客", "部署", "教程"]
cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop"
author: "Blog Author"
---

## 为什么选择 Astro？

在众多静态站点生成器中，**Astro** 凭借其独特的**岛屿架构（Islands Architecture）**脱颖而出。

### 核心优势

1. **极致性能**：默认输出零 JavaScript，仅在需要交互的组件加载 JS
2. **内容优先**：内置 Content Collections，类型安全的 Markdown/MDX 管理
3. **框架无关**：支持 React、Vue、Svelte 等任意 UI 框架
4. **开发体验**：热更新、TypeScript 原生支持、丰富的集成生态

## 项目架构

本博客采用以下技术栈：

- **前端**：Astro 4.x SSR 模式
- **后端**：Astro Server Endpoints（API Routes）
- **数据存储**：Vercel KV（Redis）存储评论
- **图片存储**：Vercel Blob（可选）
- **身份认证**：GitHub OAuth 2.0
- **部署平台**：Vercel（Serverless 函数 + 边缘网络）

## 快速开始

### 1. 环境准备

确保你的开发环境已安装：

- **Node.js** >= 18.17.1
- **npm**（或 pnpm / yarn）
- **Git**

### 2. 安装依赖

```bash
git clone <your-repo-url>
cd blog
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

需要配置的关键变量：

| 变量名 | 说明 | 必填 |
|--------|------|:----:|
| `SITE_URL` | 博客完整域名 | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth 客户端 ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 客户端密钥 | ✅ |
| `SESSION_SECRET` | 会话加密密钥（至少32字符） | ✅ |
| `KV_REST_API_URL` | Vercel KV 地址（部署后自动注入） | 部署后 |
| `KV_REST_API_TOKEN` | Vercel KV 令牌（部署后自动注入） | 部署后 |

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:4321` 即可预览博客。

## 内容管理

### 文章目录结构

所有文章存放在 `src/content/posts/` 目录下，支持 `.md` 和 `.mdx` 两种格式。

### Frontmatter 规范

```yaml
---
title: "文章标题"
description: "文章摘要，用于 SEO 和列表展示"
pubDate: 2026-10-01
updatedDate: 2026-10-05
category: "技术"
tags: ["Astro", "教程"]
cover: "https://..."
draft: false
author: "作者名"
---
```

### 分类与标签

- **分类**：每篇文章只能属于一个分类，通过 `category` 字段指定
- **标签**：每篇文章可以有多个标签，通过 `tags` 数组指定
- 系统会自动生成分类页和标签云页

## GitHub OAuth 配置

1. 登录 GitHub，进入 [Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写信息：
   - **Application name**: 你的博客名称
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback`
4. 复制 **Client ID** 和 **Client Secret**
5. 将它们填入 Vercel 环境变量

## Vercel 部署

### 通过 Vercel Dashboard 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com)，点击 **Add New → Project**
3. 导入你的博客仓库
4. Framework Preset 选择 Astro（自动识别）
5. 在 **Environment Variables** 中添加所有必要的环境变量
6. 点击 **Deploy** 开始部署

### 添加 Vercel KV（评论存储）

1. 在 Vercel 项目页面，进入 **Storage** 标签
2. 点击 **Create Database**，选择 **KV**
3. 选择区域（建议 `hnd1` 东京节点）
4. 创建后环境变量会自动注入
5. 重新部署项目使配置生效

### 添加 Vercel Blob（图片上传，可选）

1. 在 **Storage** 标签点击 **Create Database**，选择 **Blob**
2. 创建后环境变量自动注入
3. 重新部署

### 自定义域名

1. 在 Vercel 项目 **Settings → Domains** 中添加你的域名
2. 按照提示在域名服务商处配置 DNS 解析
3. Vercel 会自动为你申请 SSL 证书

## 常用命令

```bash
npm run dev       # 开发模式
npm run build     # 生产构建
npm run preview   # 预览构建结果
```

## 性能优化

1. **图片懒加载**：所有文章图片使用原生 `loading="lazy"` + IntersectionObserver
2. **静态资源缓存**：Vercel 配置了长期缓存策略
3. **零 JS 默认**：Astro 岛屿架构，仅交互组件加载 JS
4. **CSS 压缩**：生产构建自动压缩 CSS
5. **代码分割**：按需加载页面和组件

## 常见问题

### Q: 如何添加新文章？

A: 在 `src/content/posts/` 目录下创建新的 `.md` 文件，按照 frontmatter 规范填写元数据即可。

### Q: 评论数据存在哪里？

A: 生产环境存储在 Vercel KV（Redis）中。本地开发时使用内存存储，重启后数据会清空。

### Q: 支持哪些 Markdown 扩展？

A: 支持 GFM（表格、任务列表、删除线）、数学公式（KaTeX）、代码高亮（highlight.js）、脚注等。

### Q: 如何修改主题颜色？

A: 编辑 `src/styles/global.css` 中的 CSS 变量（`:root` 和 `[data-theme='dark']`）。

## 总结

通过 Astro + Vercel 的组合，你可以获得：

- 🚀 极致的页面加载性能
- 📝 类型安全的内容管理
- 💬 完整的评论系统
- 🎨 美观的 UI 和深色模式
- 🔒 GitHub OAuth 安全登录
- 📦 一键部署到全球 CDN

现在就开始创建你的第一篇文章吧！
