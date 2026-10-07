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
| 内容管理 | Content Collections (Markdown/MDX) + MongoDB Content Studio |
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
| `BLOG_MONGODB_URI` | 博客独立 MongoDB 连接串，不要复用 Twikoo 数据库名 | 后台必填 |
| `BLOG_MONGODB_DATABASE` | 博客数据库名，默认 `astro_blog` | 否 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis 连接配置；两项同时存在时博客优先使用 KV | 否 |
| `BLOG_ADMIN_PATH` | 随机管理路径，不要使用 `/admin` | 后台必填 |
| `BLOG_SESSION_SECRET` | 用于签名后台会话的随机长字符串 | 后台必填 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth 应用凭据 | 后台必填 |
| `GITHUB_ADMIN_LOGIN` | 允许登录的 GitHub 用户名，默认 `Wxjxpp` | 否 |

### 部署 Twikoo 评论

评论与仓库彻底解耦，云函数单独部署、数据存在你自己的 MongoDB：

1. **申请 MongoDB**：注册 [MongoDB Atlas](https://www.mongodb.com/atlas) 免费集群，创建数据库用户并允许访问，复制连接字符串（`mongodb+srv://...`）
2. **部署云函数**：把官方 [`templates/vercel-min`](https://github.com/twikoojs/twikoo/tree/main/templates/vercel-min) 作为**一个独立的 Vercel 项目**导入并部署
3. 在该 Vercel 项目的环境变量里设置 `MONGODB_URI` 为上一步的连接字符串，重新部署
4. 把该项目的访问地址（形如 `https://xxx.vercel.app`）填入本博客的 `PUBLIC_TWIKOO_ENV_ID`，重新部署

未配置时，评论区会显示配置提示而不会报错。Twikoo 前端脚本已本地化到 `public/twikoo/twikoo.min.js`，不依赖公共 CDN。

### 评论邮件通知

Twikoo 云函数原生支持两类邮件提醒，并会在邮件中带上文章、评论内容和回复上下文：

- 新用户评论：发送给站长邮箱
- 站长或其他用户回复：发送给被回复评论留下的邮箱

在公开评论页追加 `?twikoo-admin=1`，点击评论区右下角的管理入口并输入 Twikoo 管理密码，然后进入“配置管理 → 邮件通知”填写 SMTP 配置。常用配置项包括：

`BLOGGER_EMAIL`（站长收件箱）、`SENDER_EMAIL`、`SENDER_NAME`、`SMTP_SERVICE`、`SMTP_USER`、`SMTP_PASS`。

SMTP 密码或邮箱授权码只在 Twikoo 管理面板中填写，不要提交到 GitHub 或博客环境变量。保存后可在管理面板发送测试邮件；测试通过后，新评论和回复会自动按上下文通知对应收件人。

## ☁️ Vercel 部署

1. 推送代码到 GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → 导入仓库
3. Framework 选 Astro（自动识别），添加环境变量
4. Deploy

> 博客内容数据库与 Twikoo 的 MongoDB 数据库/集合分开，避免评论系统和文章系统互相影响。配置 KV 后，博客内容优先存储在 KV，MongoDB 保留为迁移备份。

## 📝 写作指南

配置 MongoDB 和 GitHub OAuth 后，访问随机的 `BLOG_ADMIN_PATH` 即可打开 Content Studio。后台使用 GitHub OAuth 白名单、HttpOnly 会话和随机路径保护，不把 `/admin` 当作安全措施。文章正文、草稿和元数据保存在博客自己的 MongoDB 数据库中。

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
