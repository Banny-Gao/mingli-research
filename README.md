# 命理学术中心

基于《滴天髓阐微》《渊海子平》等正统子平经典，对经典著作进行系统性学术解读与配图注释，支持全文检索、笔记标注与进度追踪。

**在线访问**：https://banny-gao.github.io/mingli-research/

---

## 书籍

| 书籍 | 状态 |
|------|------|
| 《滴天髓阐微》 | 上篇·通神论 / 下篇·六亲论，持续解读中 |
| 《渊海子平》 | 整理中 |

---

## 功能特性

- **原文·解读·技能三栏阅读**：点击任一篇目，原文、解读、相关技能可切换查看
- **全文检索**：支持对所有已解读篇目进行模糊搜索，直接定位到具体段落
- **笔记标注**：选中任意文字添加「重点 / 疑问 / 引用」三类标注，统一管理
- **书签与进度**：自动追踪阅读进度、书签与连续学习天数
- **主题切换**：支持浅色 / 深色模式
- **键盘快捷键**：`J` / `K` 切换篇目，`B` 书签，`Escape` 关闭

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + React Router v7 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 4 + LESS 模块 |
| 搜索 | Fuse.js（前端模糊搜索） |
| 内容 | TypeScript 模块 + Marked（Markdown 渲染） |
| 测试 | Playwright E2E |

---

## 项目结构

```
src/
├── main.tsx              # 入口、路由、主题初始化
├── pages/
│   ├── Landing.tsx        # 首页（书库、统计、学习天数徽章）
│   ├── BookApp.tsx        # 书籍详情页（篇目列表 + 阅读器）
│   └── Notes.tsx          # 笔记中心（跨书标注管理、导出）
├── components/
│   ├── ModalReader.tsx    # 核心阅读器（原文/解读/技能三栏）
│   ├── ReadList.tsx       # 篇目分类列表
│   ├── SearchBar.tsx      # 全局搜索（Fuse.js 驱动）
│   ├── AnnotationToolbar.tsx  # 选中文本浮出标注工具
│   ├── AnnotationPanel.tsx    # 标注侧边栏
│   └── ui/                # shadcn/ui 基础组件
├── data/
│   ├── books.ts           # 书籍元数据（自动生成）
│   ├── registry.ts        # 动态模块加载器
│   └── ditiansui-site/    # 《滴天髓》数据
│       ├── interp/        # 解读内容（按篇目分文件）
│       ├── skill/         # 配套技能（按主题分文件）
│       └── source/        # 经典原文
├── hooks/
│   ├── useAnnotations.ts  # 标注 CRUD（localStorage）
│   ├── useProgress.ts     # 进度、书签、学习连续天数
│   └── useNotesData.ts    # 跨书籍笔记聚合
└── styles/                # LESS + Tailwind 样式模块
```

---

## 内容生成

`scripts/generate.js` 从 `books/*/catalog.md` 读取篇目信息与状态，解析 `articles/` 下的解读与技能 Markdown，生成 `src/data/` 下的 TypeScript 数据文件供 React 使用。

**更新内容后运行：**

```bash
pnpm generate   # 仅重新生成数据文件
pnpm build      # 构建生产版本
```

---

## 开发

```bash
pnpm dev        # 开发服务器
pnpm build      # 生产构建
pnpm preview    # 预览构建产物
pnpm test       # Playwright E2E 测试
```

---

## 部署

- **GitHub Pages**：push 到 `main` 分支自动部署
- 使用 Hash Router，URL 格式：`https://banny-gao.github.io/mingli-research/#/ditiansui-site`

---

## 学术准则

基于经典原文为唯一判准，禁止自创理论与传播网络伪论。详见 [SKILL-bazi-research-dispute.md](./SKILL-bazi-research-dispute.md)。