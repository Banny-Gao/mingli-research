# 命理学术中心

基于《滴天髓阐微》《子平真诠》《三命通会》《穷通宝鉴》等子平经典，对传统命学典籍进行系统性学术解读、配图注释与跨书关联，支持全文检索、笔记标注、进度追踪与多书笔记聚合。

**在线访问**：https://banny-gao.github.io/mingli-research/

---

## 典籍

### 命学四书（八字体系核心）

| 典籍         | 作者                            | 体例                                             | 状态         |
| ------------ | ------------------------------- | ------------------------------------------------ | ------------ |
| 《滴天髓阐微》 | [明] 刘基 撰 / [清] 任铁樵 注   | 60 篇专题，上篇·通神论 + 下篇·六亲论            | 持续解读     |
| 《子平真诠》   | [清] 沈孝瞻 撰 / [民国] 徐乐吾 评注 | 49 篇，体系严密，专论用神·格局·宫分六亲        | 持续解读     |
| 《三命通会》   | [明] 万民英                      | 380 篇 / 12 卷，汇辑大成                         | 持续解读     |
| 《穷通宝鉴》   | [清] 余春台                      | 109 篇，按天干×月份论调候用神                   | 持续解读     |

### 八字其他典籍

| 典籍         | 作者            | 体例                                | 状态     |
| ------------ | --------------- | ----------------------------------- | -------- |
| 《渊海子平》 | [宋] 徐大升     | 约 190 篇，赋文诗诀汇编             | 持续解读 |
| 《千里命稿》 | [民国] 韦千里   | 22 篇，现代命书格式雏形             | 持续解读 |

### 紫微斗数

| 典籍             | 作者      | 体例                                | 状态   |
| ---------------- | --------- | ----------------------------------- | ------ |
| 《紫微斗数全书》 | [宋] 陈抟 | 约 90 篇，太微赋 / 骨髓赋 / 十二宫 | 整理中 |

> 项目覆盖范围以五术中的**命**（八字、紫微斗数）为主，逐步向「山医相卜」扩展。
> `ArtSection` 类型枚举：'山' | '医' | '命' | '相' | '卜'。

---

## 功能特性

- **三栏阅读器**：原文、解读、配套技能并列对照（桌面 Modal，移动端走 `/read/...` 路由）
- **跨书笔记**：选中文本添加「重点 / 疑问 / 引用」三类标注，统一管理多书笔记
- **全文检索**：基于 Fuse.js 的前端模糊搜索，可定位到具体段落
- **进度与书签**：自动追踪阅读进度、收藏、连续学习天数
- **主题切换**：浅色 / 深色 / 跟随系统，记忆化存储
- **图表配文**：Mermaid 渲染命理关系图（十神生克、格局结构等）
- **繁简转换**：基于 OpenCC，原文与解读支持简繁切换
- **键盘快捷键**：`J` / `K` 切换篇目，`B` 书签，`/` 搜索，`Esc` 关闭
- **响应式**：桌面端 Modal 浮层；移动端独占路由 + 系统返回键关闭

---

## 技术栈

| 层级         | 技术                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 框架         | React 19 + React Router v7 + TypeScript 5                             |
| 构建         | Vite 6 + tsc                                                          |
| 样式         | Tailwind CSS 4 + LESS + shadcn/ui 4.7 + @base-ui/react + tw-animate-css |
| 内容渲染     | react-markdown + rehype（highlight / slug / autolink / raw）+ marked   |
| 搜索         | Fuse.js                                                               |
| 图表 / 动效  | Mermaid 11 + GSAP 3                                                   |
| 国际化       | i18next + react-i18next                                               |
| 辅助库       | highlight.js、opencc-js、lucide-react、tailwind-merge、clsx、cva      |
| 测试         | Vitest + Playwright E2E                                               |

---

## 项目结构

```
mingli-research/
├── books/                              # 原始内容（人工维护）
│   ├── 滴天髓阐微/                      # 每本典籍一个目录
│   │   ├── catalog.md                  # 元数据 + 篇目清单（决定状态）
│   │   ├── catalog.html                # 渲染版（用于跨书校对）
│   │   └── articles/<篇目>/
│   │       ├── source.md               # 经典原文
│   │       ├── interpretation.md       # 学术解读
│   │       └── skill.md                # 配套技能
│   ├── 渊海子平/                        # 其他六本结构同上
│   ├── 三命通会/
│   ├── 子平真诠/
│   ├── 穷通宝鉴/
│   ├── 千里命稿/
│   └── 紫微斗数全书/
├── src/
│   ├── main.tsx                        # 入口、路由（basename=/mingli-research）
│   ├── pages/                          # Landing / BookApp / Notes / Reader
│   ├── components/
│   │   ├── ModalReader/                # 核心阅读器（桌面 Modal）
│   │   ├── ReadList/                   # 篇目分类列表
│   │   ├── SearchBar/                  # 全局搜索（Fuse.js）
│   │   ├── AnnotationToolbar/          # 选中文本浮出工具
│   │   ├── AnnotationPanel/            # 标注侧边栏
│   │   ├── ReadingTools/               # 字号 / 主题 / 繁简切换
│   │   ├── Mermaid/                    # Mermaid 图表渲染
│   │   ├── AiAssistant/                # 解读辅助
│   │   ├── ThemeToggle/                # 主题切换
│   │   ├── SectionHeader/              # 章节标题
│   │   ├── ActionBar/                  # 操作栏
│   │   └── ui/                         # shadcn 基础组件
│   ├── hooks/                          # useReader / useAnnotations / useProgress / useNotesData / useMediaQuery
│   ├── data/                           # generate.js 产物（**勿手编**）
│   │   ├── books.ts                    # 书籍元数据
│   │   ├── registry.ts                 # 动态加载器
│   │   ├── index.ts                    # 类型导出
│   │   └── <书名>/                     # 每书 content.ts / assoc.ts / index.ts
│   ├── lib/                            # 工具 / 常量
│   ├── tokens/                         # 设计 token
│   ├── styles/                         # 全局 + 组件样式（.less / .css）
│   └── types/                          # mermaid.d.ts 等
├── scripts/
│   ├── generate.js                     # catalog.md → src/data/*
│   ├── dev.js                          # 开发服务器包装
│   ├── fetch-source.js                 # 通用原文抓取 + 维基文库抓取（run/wiki subcommand）
│   ├── fetch-source/                   # 内部模块 (format / extractors / run / wiki)
│   ├── t2s.js                          # 繁简转换（opencc-js）
│   ├── self-check-fingerprint.py       # 内容指纹自检
│   └── lib/utils.js
├── docs/                               # 解读日志 / 计划 / 设计稿
│   ├── 解读日志.md
│   └── superpowers/                    # 规范 + 计划文档
│       ├── plans/
│       └── specs/
├── issues/                             # 批次解读计划（如 07-滴天髓阐微-18批次解读计划.md）
├── public/                             # 静态资源
└── CLAUDE.md / SKILL-*.md              # 行为准则与项目技能
```

---

## 内容生成

`scripts/generate.js` 从 `books/<书>/catalog.md` 读取元数据与篇目清单，扫描 `articles/<篇目>/` 下的 `source.md` / `interpretation.md` / `skill.md`，自动产出 `src/data/` 下的 TypeScript 数据文件。

**catalog.md 状态判定**（脚本读取 `articles/<篇目>/` 下文件存在性）：

| 文件存在                                  | 状态                                |
| ----------------------------------------- | ----------------------------------- |
| `source.md`                               | `total` 计入                        |
| `source.md` + `interpretation.md`         | 该篇标 `done`                       |
| `source.md` + `interpretation.md` + `skill.md` | `done` 且 `hasSkill`            |

**添加新典籍**使用 `book-create` 技能（参见 `docs/superpowers/specs/2026-06-10-book-create-skill-design.md`），能力包括：骨架自动生成、人工 gate 校验、策略建议模板、原文获取（模式 A HTML 片段 / 模式 B URL）。

**更新内容后运行：**

```bash
pnpm generate   # 仅重生成 src/data/*
pnpm all        # generate + build
```

---

## 开发

```bash
pnpm dev          # 开发服务器（Vite + HMR）
pnpm generate     # 重生成 src/data/*
pnpm build        # 生产构建（generate → tsc → vite build → 复制 404.html）
pnpm preview      # 预览生产产物
pnpm test         # Vitest 单元测试
pnpm test:e2e     # Playwright E2E 测试
pnpm test:e2e:ui  # Playwright UI 模式
```

---

## 部署

- **GitHub Pages**：push 到 `main` 自动部署
- **路由**：BrowserRouter + `basename="/mingli-research"`，通过 `404.html` 副本实现 SPA fallback
- **URL 形如**：`https://banny-gao.github.io/mingli-research/books/<section>/<slug>`
- **懒加载**：页面级（`lazy` + `Suspense`），ModalReader CSS 优先 + 组件后置

---

## 学术准则

基于经典原文为唯一判准，禁止自创理论与传播网络伪论。详见 [SKILL-bazi-research-dispute.md](./SKILL-bazi-research-dispute.md) 与 `docs/superpowers/specs/` 下各专项规范。
