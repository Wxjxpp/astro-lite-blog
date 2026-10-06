# Astro Lite Blog

一个基于 **Astro 5** 构建的极简博客系统，部署在 **Vercel** 平台。

界面采用**极简黑白配色**、**暗黑优先**、**巨大等宽字体**的 xAI 式设计语言；评论基于自托管的 **Twikoo** 云函数 + MongoDB，数据完全掌握在自己手里，**不依赖任何 Git 仓库**。

## ✨ 功能特性

- 🖤 **极简黑白设计**：纯黑纯白配色，无渐变、无圆角、无阴影，只用 1px 边框构建层级
- 🌙 **暗黑优先**：默认深色主题，可一键切换浅色，选择会本地记忆
- 🔠 **等宽字体排版**：标题、导航、元信息统一使用等宽字体，超大字号展示
- 📝 **完整 Markdown 支持**：GFM、数学公式（KaTeX）、单色代码高亮、脚注
- 💬 **Twikoo 评论**：自托管云函数 + MongoDB，数据自主可控，与仓库解耦；自带加载动画与防重复提交
- 🤖 **GrokBot 小球**：错误页与评论区内置 Grok Bot 角色动效，状态跟随页面行为变化
- 📂 **分类与标签**：每篇文章一个分类 + 多个标签，自动生成分类页和标签云
- 🖼️ **图片懒加载**：原生 lazy loading + IntersectionObserver，点击放大灯箱
- 📱 **响应式设计**：适配桌面、平板、手机
- 🔍 **SEO 优化**：Open Graph、Twitter Card、Sitemap、RSS 订阅
- ☁️ **Vercel 部署**：边缘渲染，评论云函数可独立部署

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Astro 5 |
| 内容管理 | Content Collections (Markdown/MDX) |
| Markdown 增强 | remark-gfm, remark-math, rehype-katex, rehype-highlight |
| 评论系统 | Twikoo（云函数 + MongoDB） |
| 角色动效 | Grok Bot 复刻引擎（本地化，`public/grok`） |
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
| `PUBLIC_TWIKOO_ENV_ID` | Twikoo 云函数地址，如 `https://my-twikoo.vercel.app` | 评论功能必填 |

### 部署 Twikoo 评论

评论与仓库彻底解耦，云函数单独部署、数据存在你自己的 MongoDB：

1. **申请 MongoDB**：注册 [MongoDB Atlas](https://www.mongodb.com/atlas) 免费集群，创建数据库用户并允许访问，复制连接字符串（`mongodb+srv://...`）
2. **部署云函数**：把官方 [`templates/vercel-min`](https://github.com/twikoojs/twikoo/tree/main/templates/vercel-min) 作为**一个独立的 Vercel 项目**导入并部署
3. 在该 Vercel 项目的环境变量里设置 `MONGODB_URI` 为上一步的连接字符串，重新部署
4. 把该项目的访问地址（形如 `https://xxx.vercel.app`）填入本博客的 `PUBLIC_TWIKOO_ENV_ID`，重新部署

未配置时，评论区会显示配置提示而不会报错。Twikoo 前端脚本已本地化到 `public/twikoo/twikoo.min.js`，不依赖公共 CDN。

## ☁️ Vercel 部署

1. 推送代码到 GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → 导入仓库
3. Framework 选 Astro（自动识别），添加环境变量
4. Deploy

> 博客本身无需数据库；评论的云函数与 MongoDB 是独立部署的第二步，两者互不影响。

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
├── components/     # Header, Footer, PostCard, CommentSection(Twikoo), GrokOrb 等
├── content/posts/  # Markdown/MDX 博客文章
├── layouts/        # BaseLayout
├── lib/            # posts, utils
├── pages/          # 页面路由
├── styles/         # global.css
└── types/          # TypeScript 类型
```

## 📄 License

MIT License