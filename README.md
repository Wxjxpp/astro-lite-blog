# Astro Lite Blog

一个基于 **Astro 4.x** 构建的全功能博客系统，部署在 **Vercel** 平台。支持完整 Markdown 语法、分类标签系统、GitHub 登录评论、图片懒加载、深色模式等特性。

## ✨ 功能特性

- 📝 **完整 Markdown 支持**：GFM、数学公式（KaTeX）、代码高亮（190+ 语言）、脚注
- 🎨 **文字样式定制**：支持标色、字号调整、字体切换（通过 HTML 内联样式）
- 🖼️ **图片懒加载**：原生 lazy loading + IntersectionObserver，点击放大灯箱
- 📂 **分类与标签**：每篇文章一个分类 + 多个标签，自动生成分类页和标签云
- 💬 **评论系统**：基于 GitHub OAuth 登录，支持点赞、删除、分页加载
- 🌙 **深色模式**：跟随系统偏好，一键切换，本地存储记忆
- 📱 **响应式设计**：完美适配桌面、平板、手机
- 🔍 **SEO 优化**：Open Graph、Twitter Card、Sitemap、RSS 订阅
- 🚀 **极致性能**：Astro 岛屿架构，默认零 JavaScript
- ☁️ **Vercel 部署**：Serverless 函数 + Vercel KV（Redis）+ Vercel Blob

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Astro 4.x |
| 内容管理 | Content Collections (Markdown/MDX) |
| Markdown 增强 | remark-gfm, remark-math, rehype-katex, rehype-highlight |
| 后端 | Astro Server Endpoints (API Routes) |
| 数据存储 | Vercel KV (Redis) |
| 文件存储 | Vercel Blob（可选） |
| 身份认证 | GitHub OAuth 2.0 |
| 部署平台 | Vercel (Serverless + Edge CDN) |
| 开发语言 | TypeScript |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.17.1
- npm >= 9.0.0

### 本地开发

```bash
npm install
cp .env.example .env
# 编辑 .env 文件填入配置
npm run dev
```

访问 `http://localhost:4321` 预览。

### 生产构建

```bash
npm run build
npm run preview
```

## ⚙️ 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|:----:|
| `SITE_URL` | 博客域名 | ✅ |
| `SITE_NAME` | 站点名称 | ✅ |
| `SITE_DESCRIPTION` | 站点描述 | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | ✅ |
| `GITHUB_REDIRECT_URI` | OAuth 回调地址 | ✅ |
| `SESSION_SECRET` | 会话密钥（≥32字符） | ✅ |
| `KV_REST_API_URL/TOKEN` | Vercel KV（自动注入） | 部署后 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob（可选） | 可选 |

生成密钥：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 🔐 GitHub OAuth

1. 进入 [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Homepage URL: `https://your-domain.vercel.app`
3. Callback URL: `https://your-domain.vercel.app/api/auth/callback`
4. 复制 Client ID 和 Secret 到 Vercel 环境变量

本地开发回调地址：`http://localhost:4321/api/auth/callback`

## ☁️ Vercel 部署

1. 推送代码到 GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → 导入仓库
3. Framework 选 Astro（自动识别），添加环境变量
4. **Storage → Create Database → KV**（评论存储，必须）
5. Deploy

可选添加 **Blob** 用于图片上传。自定义域名在 **Settings → Domains**。

## 📝 写作指南

在 `src/content/posts/` 创建 `.md` 或 `.mdx` 文件：

```yaml
---
title: "文章标题"              # 必填
description: "文章摘要"         # 必填
pubDate: 2026-10-01            # 必填
updatedDate: 2026-10-05        # 可选
category: "技术"                # 必填
tags: ["Astro", "教程"]         # 可选
cover: "https://..."            # 可选
draft: false                    # 可选，true 时不发布
author: "作者名"                # 可选
---
```

支持 GFM 表格、任务列表、KaTeX 数学公式、代码高亮、脚注，以及 `<span style="color:red;font-size:1.2rem;font-family:serif">文字样式定制</span>`。

## 🎨 自定义

- 颜色主题：`src/styles/global.css` CSS 变量
- 站点信息：`src/lib/utils.ts` 的 `SITE_CONFIG`
- 导航菜单：`src/lib/utils.ts` 的 `NAV_MENU`

## 📁 项目结构

```
src/
├── components/     # Header, Footer, PostCard, CommentSection 等
├── content/posts/  # Markdown/MDX 博客文章
├── layouts/        # BaseLayout
├── lib/            # posts, auth, comments, utils
├── pages/          # 页面路由 + api/ 后端接口
├── styles/         # global.css
└── types/          # TypeScript 类型
```

## 📄 License

MIT License
