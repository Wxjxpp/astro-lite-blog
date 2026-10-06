---
title: "Markdown 语法完全指南：从基础到高级"
description: "本文详细介绍博客支持的所有 Markdown 语法，包括 GitHub Flavored Markdown、数学公式、代码高亮、文字样式定制等高级特性。"
pubDate: 2026-10-01
category: "技术"
tags: ["Markdown", "教程", "Astro", "写作"]
cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop"
author: "Blog Author"
---

## 前言

本博客基于 **Astro** 构建，支持完整的 Markdown 语法和多种高级标记。本文将逐一展示所有支持的语法特性，帮助你快速上手写作。

## 一、基础文本格式

### 1.1 强调文本

- **粗体文本**：使用 `**文本**` 或 `__文本__`
- *斜体文本*：使用 `*文本*` 或 `_文本_`
- ***粗斜体***：使用 `***文本***`
- ~~删除线~~：使用 `~~文本~~`

### 1.2 文字标色

通过 HTML 内联样式可以给文字设置任意颜色：

- <span style="color: #ef4444;">红色文字</span>
- <span style="color: #10b981;">绿色文字</span>
- <span style="color: #3b82f6;">蓝色文字</span>
- <span style="color: #f59e0b; font-weight: bold;">橙色加粗文字</span>
- <span style="background: linear-gradient(90deg, #6366f1, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">渐变色文字</span>

### 1.3 字号与字体调整

- <span style="font-size: 0.85rem;">小号文字</span>
- <span style="font-size: 1.1rem;">中号文字</span>
- <span style="font-size: 1.3rem; font-weight: 700;">大号加粗文字</span>
- <span style="font-family: 'Georgia', serif;">衬线字体文字</span>
- <span style="font-family: 'Courier New', monospace; background: var(--bg-soft); padding: 2px 8px; border-radius: 8px;">等宽字体文字</span>

## 二、标题层级

# 一级标题 H1
## 二级标题 H2
### 三级标题 H3
#### 四级标题 H4
##### 五级标题 H5
###### 六级标题 H6

## 三、列表

### 3.1 无序列表

- 苹果
- 香蕉
  - 小米蕉
  - 帝王蕉
- 橙子

### 3.2 有序列表

1. 第一步：准备材料
2. 第二步：混合搅拌
   1. 先加入液体
   2. 再加入粉末
3. 第三步：烘烤成型

### 3.3 任务列表（GFM）

- [x] 完成项目初始化
- [x] 实现文章管理
- [x] 集成评论系统
- [ ] 添加搜索功能
- [ ] 优化移动端体验

## 四、引用块

> 这是一段引用文字。引用块可以用来强调重要观点、引用他人言论或展示注释。
>
> 引用块支持多段落，每一行前面加上 `>` 符号即可。

> 引用块也支持嵌套：
> > 这是嵌套的第二层引用
> > > 这是第三层引用

## 五、代码

### 5.1 行内代码

在正文中使用 `const hello = "world";` 来标记行内代码。

### 5.2 代码块

支持 190+ 编程语言的语法高亮：

```javascript
// JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10)); // 输出: 55
```

```python
# Python 示例
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

```typescript
// TypeScript 示例
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

```bash
# Bash 命令示例
npm install
npm run dev
npm run build
```

```sql
SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2026-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 10;
```

## 六、表格（GFM）

| 功能 | 支持情况 | 说明 |
|------|:--------:|------|
| 基础 Markdown | ✅ | 标题、列表、引用等 |
| GFM 扩展 | ✅ | 表格、任务列表、删除线 |
| 数学公式 | ✅ | KaTeX 渲染 |
| 代码高亮 | ✅ | 190+ 语言 |
| 图片懒加载 | ✅ | IntersectionObserver |
| 评论系统 | ✅ | GitHub 登录 |

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  | 内容2    | 内容3  |

## 七、链接与图片

- 普通链接：[Astro 官网](https://astro.build)
- 带标题链接：[GitHub](https://github.com "全球最大的代码托管平台")

所有图片自动启用**懒加载**，点击可放大查看：

![示例图片 - 风景](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop "美丽的山脉风景")

## 八、数学公式（KaTeX）

### 8.1 行内公式

质能方程：$E = mc^2$，勾股定理：$a^2 + b^2 = c^2$。

### 8.2 块级公式

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

$$
A = \begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}
$$

$$
\int_0^{+\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

## 九、脚注

这是一个带有脚注的句子[^1]，脚注会在页面底部显示。

[^1]: 这是第一个脚注的详细说明内容。

## 十、水平线与分隔

---

使用 `---` 可以创建水平线。

## 十一、键盘按键

- 保存：<kbd>Ctrl</kbd> + <kbd>S</kbd>
- 复制：<kbd>Ctrl</kbd> + <kbd>C</kbd>
- 粘贴：<kbd>Ctrl</kbd> + <kbd>V</kbd>

## 十二、提示框（通过 HTML 实现）

<div style="padding: 1rem 1.25rem; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); border-left: 4px solid #3b82f6; border-radius: 18px; box-shadow: var(--shadow-sm); margin: 1.5rem 0;">
  <strong style="color: #60a5fa;">💡 提示</strong><br>
  这是一个信息提示框，可以用来展示重要提示或注意事项。
</div>

<div style="padding: 1rem 1.25rem; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); border-left: 4px solid #22c55e; border-radius: 18px; box-shadow: var(--shadow-sm); margin: 1.5rem 0;">
  <strong style="color: #4ade80;">✅ 成功</strong><br>
  操作已成功完成！
</div>

<div style="padding: 1rem 1.25rem; background: rgba(245,158,11,0.14); border: 1px solid rgba(245,158,11,0.32); border-left: 4px solid #f59e0b; border-radius: 18px; box-shadow: var(--shadow-sm); margin: 1.5rem 0;">
  <strong style="color: #fbbf24;">⚠️ 警告</strong><br>
  请注意以下事项。
</div>

<div style="padding: 1rem 1.25rem; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-left: 4px solid #ef4444; border-radius: 18px; box-shadow: var(--shadow-sm); margin: 1.5rem 0;">
  <strong style="color: #f87171;">❌ 错误</strong><br>
  发生了一个错误。
</div>

## 总结

以上就是本博客支持的全部 Markdown 语法特性。你可以：

1. 使用标准 Markdown 进行基础写作
2. 通过 GFM 扩展使用表格、任务列表等
3. 利用 KaTeX 编写数学公式
4. 通过 HTML 内联样式定制文字颜色、字号、字体
5. 所有图片自动懒加载，点击可放大
6. 使用代码块展示带语法高亮的代码

开始你的写作之旅吧！
