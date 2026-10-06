# Astro Lite Blog

一个基于 **Astro 5** 构建的极简博客系统，部署在 **Vercel** 平台。

界面采用**极简黑白配色**、**暗黑优先**、**巨大等宽字体**的 xAI 式设计语言；评论基于 **Giscus**（GitHub Discussions），无需任何自建后端。

## ✨ 功能特性

- 🖤 **极简黑白设计**：纯黑纯白配色，无渐变、无圆角、无阴影，只用 1px 边框构建层级
- 🌙 **暗黑优先**：默认深色主题，可一键切换浅色，选择会本地记忆
- 🔠 **等宽字体排版**：标题、导航、元信息统一使用等宽字体，超大字号展示
- 📝 **完整 Markdown 支持**：GFM、数学公式（KaTeX）、单色代码高亮、脚注
- 💬 **Giscus 评论**：基于 GitHub Discussions，自带登录 / 退出，零后端
- 📂 **分类与标签**：每篇文章一个分类 + 多个标签，自动生成分类页和标签云
- 🖼️ **图片懒加载**：原生 lazy loading + IntersectionObserver，点击放大灯箱
- 📱 **响应式设计**：适配桌面、平板、手机
- 🔍 **SEO 优化**：Open Graph、Twitter Card、Sitemap、RSS 订阅
- ☁️ **Vercel 部署**：纯静态/边缘渲染，无需数据库

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Astro 5 |
| 内容管理 | Content Collections (Markdown/MDX) |
| Markdown 增强 | remark-gfm, remark-math, rehype-katex, rehype-highlight |
| 评论系统 | Giscus (GitHub Discussions) |
| 字体 | Geist / Geist Mono |
| 部署平台 | Vercel |
| 开发语言 | TypeScript |

## 🚀 快速开始

### 本地开发

```bash
npm install
cp .env.example .env
# 编辑 .env 填入配置
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
| `PUBLIC_GISCUS_REPO` | GitHub 仓库，格式 `owner/repo` | ✅ |
| `PUBLIC_GISCUS_REPO_ID` | 仓库 ID | ✅ |
| `PUBLIC_GISCUS_CATEGORY` | Discussions 分类名 | ✅ |
| `PUBLIC_GISCUS_CATEGORY_ID` | Discussions 分类 ID | ✅ |
| `PUBLIC_GISCUS_MAPPING` | 页面与讨论的映射方式，默认 `pathname` | 可选 |

### 配置 Giscus 评论

Giscus 把每条评论存到 GitHub Discussions，因此需要一个**公开仓库**：

1. 在 GitHub 上创建一个公开仓库（或用现有仓库），并在 **Settings → General → Features** 中开启 **Discussions**
2. 安装 [giscus App](https://github.com/apps/giscus) 并授权该仓库
3. 打开 [giscus.app](https://giscus.app)，填入仓库名，选择 Discussion 分类（如 `Announcements`）
4. 复制页面生成的 `data-repo`、`data-repo-id`、`data-category`、`data-category-id`，填入上面的环境变量
5. 重新部署即可

未配置时，评论区会显示配置提示而不会报错。

## ☁️ Vercel 部署

1. 推送代码到 GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → 导入仓库
3. Framework 选 Astro（自动识别），添加环境变量
4. Deploy

> Giscus 为纯前端组件，**无需数据库或 Serverless 函数**，因此在 Vercel 上开箱即用。

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

支持 GFM 表格、任务列表、KaTeX 数学公式、单色代码高亮、脚注。

## 🎨 自定义

- 设计变量（颜色 / 字体 / 间距）：`src/styles/global.css` 顶部的 CSS 变量
- 站点信息：`src/lib/utils.ts` 的 `SITE_CONFIG`
- 导航菜单：`src/lib/utils.ts` 的 `NAV_MENU`

## 📁 项目结构

```
src/
├── components/     # Header, Footer, PostCard, CommentSection(Giscus) 等
├── content/posts/  # Markdown/MDX 博客文章
├── layouts/        # BaseLayout
├── lib/            # posts, utils
├── pages/          # 页面路由
├── styles/         # global.css
└── types/          # TypeScript 类型
```

## 📄 License

MIT License