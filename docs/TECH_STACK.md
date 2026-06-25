# TECH_STACK - 技术栈文档

> 最后更新：2026-06-18
>
> 本文档详细记录项目使用的所有技术栈、依赖版本、配置信息及选型理由。
> 与 `package.json` 严格保持同步；版本变更时同步更新本文档。

---

## 1. 技术栈总览

| 层级        | 技术                                                                  | 用途                                |
| ----------- | --------------------------------------------------------------------- | ----------------------------------- |
| **框架**    | React 19 + React Router v7 + TypeScript 5                             | UI + 路由 + 类型系统                |
| **构建**    | Vite 6 + tsc + 自研 Vite 插件（rem-adapter）                          | 开发服务器 + 生产构建               |
| **样式**    | Tailwind CSS 4 + LESS 4 + shadcn/ui 4.7 + @base-ui/react              | 原子化 + 主题化 + 复杂交互组件      |
| **动效**    | tw-animate-css + GSAP 3 + hammerjs（page-flip 2 内部使用）             | 入场动画 + 翻书动效 + 触摸手势      |
| **内容渲染**| react-markdown + unified + rehype（highlight / slug / autolink / raw）+ remark-gfm + marked | Markdown 解析 + 链接锚点 + 代码高亮 |
| **图表**    | Mermaid 11                                                            | 命理关系图（十神生克、格局结构）     |
| **搜索**    | Fuse.js 7                                                             | 前端模糊搜索                         |
| **国际化**  | i18next 26 + react-i18next 17                                         | 多语言框架（当前仅 zh-CN，但已就绪） |
| **辅助库**  | highlight.js、opencc-js、lucide-react、vaul、@fontsource-variable/geist、@radix-ui/react-dialog | 代码高亮 / 繁简转换 / 图标 / 抽屉 / 字体 / 模态 |
| **样式工具**| clsx + tailwind-merge + class-variance-authority                       | 条件 className 合并 + shadcn 变体    |
| **测试**    | Vitest 2 + @testing-library/react + jsdom + Playwright 1.60           | 单元测试 + 组件测试 + E2E            |
| **Lint**    | ESLint 10 + typescript-eslint + eslint-plugin-react-hooks/refresh     | 静态检查 + 钩子规则 + HMR 兼容      |
| **格式化**  | Prettier                                                              | 代码风格统一                         |
| **包管理**  | pnpm 9                                                                | 依赖管理（lockfile 提交）            |
| **部署**    | GitHub Actions + GitHub Pages                                         | CI + 静态托管                        |
| **AI 能力** | @anthropic-ai/sdk 0.104                                               | 解读批量生成（CLI 入口）             |
| **代码索引**| GitNexus + CocoIndex Code（ccc）                                       | 代码搜索 / 影响分析 / 知识图谱        |

---

## 2. 核心依赖

### 2.1 React 生态

| 库                       | 版本    | 选型理由                                                          |
| ------------------------ | ------- | ----------------------------------------------------------------- |
| `react` / `react-dom`    | ^19.0.0 | React 19 稳定版，启用 `use` Hook、`useOptimistic` 等新能力         |
| `react-router-dom`       | ^7.0.0  | v7 框架无关模式 + `BrowserRouter` + `basename` 支持 GitHub Pages  |
| `react-helmet-async`     | ^3.0.0  | 并发模式下安全修改 `<head>`（v3 起支持 React 19）                  |
| `react-i18next`          | ^17.0.8 | 配合 i18next 主包                                                  |
| `react-markdown`         | ^10.1.0 | 配合 unified/remark/rehype 生态                                    |

**重要约束**：
- 不使用 React Server Components（`rsc: false` in `components.json`）
- 不使用 Next.js / Remix — 纯 SPA 部署到 GitHub Pages

### 2.2 路由

**v7 模式**（data router 不可用，本项目用框架无关 API）：

```ts
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
```

**路由表**（见 `src/main.tsx`）：

| 路径                                              | 组件        | 备注                       |
| ------------------------------------------------- | ----------- | -------------------------- |
| `/`                                               | `Landing`   | 首页（书籍列表）            |
| `/notes`                                          | `Notes`     | 跨书笔记聚合                |
| `/books/:section/:slug`                           | `BookApp`   | 书籍详情（桌面走 Modal）    |
| `/books/:section/:slug/read/:type/:key`           | `Reader`    | 移动端独占（push 历史栈）   |
| `/:slug`                                          | `BookApp`   | 短链（兼容旧分享）          |
| `/:slug/read/:type/:key`                          | `Reader`    | 短链 + 阅读                  |
| `*`                                               | `Navigate`  | 重定向到 `/`                |

**桌面 / 移动双模**：
- 桌面端：Modal 浮层（URL 不变）
- 移动端：独占路由（系统返回键可关闭）
- 切换判断：`useMediaQuery('(max-width: 640px)')` + `useReaderRoute` Hook

### 2.3 TypeScript 5

**配置**（`tsconfig.json`）：

```json
{
  "target": "ES2020",
  "module": "ESNext",
  "moduleResolution": "bundler",
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "paths": { "@/*": ["./src/*"] }
}
```

**约束**：
- `noEmit: true` — 纯类型检查，不生成 JS
- `allowImportingTsExtensions: true` — 允许 `.ts` 扩展名导入
- `isolatedModules: true` — 每个文件必须可独立编译（Vite 必需）
- 使用 `verbatimModuleSyntax` 不启用，允许 `import type` 显式声明类型导入

### 2.4 Vite 6

**核心配置**（`vite.config.ts`）：

```ts
{
  base: '/mingli-research/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'page-flip': resolve(__dirname, 'node_modules/.pnpm/page-flip@2.0.7/node_modules/page-flip/dist/js/page-flip.module.js'),
    },
  },
  server: { fs: { allow: [resolve(__dirname, '..')] } },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    assetsDir: 'assets',
    ssrManifest: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@base-ui/react', 'lucide-react'],
        },
      },
    },
  },
}
```

**关键点**：
- `base` 必须为 `/mingli-research/`（GitHub Pages 子路径）
- `page-flip` 显式指定 ESM 入口（绕过 pnpm 默认解析）
- `manualChunks` 拆 react / ui 供应商，提升缓存命中
- 插件链：`remAdapter()` → `react()` → `tailwindcss()`

### 2.5 自研 Vite 插件：rem-adapter

**位置**：`plugins/rem-adapter.ts`

**原理**：移动端（≤768px）通过 CSS 动态设置 `html` 的 `font-size`，使所有 `rem` 单位随视口宽度等比缩放（基于 375px 设计稿）。

```css
@media (max-width: 768px) {
  html {
    font-size: clamp(12px, calc(100vw / 375 * 16), 22px);
  }
}
```

PC 端（>768px）保持浏览器默认 `16px`，不影响桌面布局。

### 2.6 Tailwind CSS 4 + LESS

**双层样式系统**：

| 层级       | 用途                                              | 文件                        |
| ---------- | ------------------------------------------------- | --------------------------- |
| Tailwind   | 原子化工具类（布局、间距、配色）                   | `src/styles/index.css`      |
| LESS       | 复杂组件样式（伪类、嵌套、媒体查询、动效关键帧）   | `src/styles/**/*.less`      |
| Design Token | CSS 变量 + TS 常量双源（`@/*/tokens` ↔ CSS var） | `src/tokens/index.ts` + `index.css` |

**Tailwind 4 配置**（`src/styles/index.css`）：

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@plugin "@tailwindcss/typography";
@source "../pages/";
@source "../components/";
@source "../main.tsx";

@custom-variant dark (&:is(.dark *));
```

- 使用 Tailwind 4 的 `@theme inline` 语法（无 `tailwind.config.js` 内容依赖）
- 暗色策略：默认暗色，`[data-theme='light']` 切换
- `components.json` 配置 shadcn 风格：`base-nova` + 中性色 + Lucide 图标

**LESS 入口**（`src/styles/index.less`）：

```less
@import './base.less';
@import './layout.less';
@import './prose.less';
@import './components/landing.less';
@import './components/book.less';
@import './components/notes.less';
@import '../components/SectionHeader/SectionHeader.less';
@import './theme.less';
```

> 组件级 LESS 与组件同目录（`*.less` 与 `*.tsx` 并列），由 Vite 自动处理。

### 2.7 组件库策略

| 场景                  | 选型                                | 原因                              |
| --------------------- | ----------------------------------- | --------------------------------- |
| 基础原子组件（Button / Card / Tabs / Select / Dropdown / Drawer / Checkbox / Separator / Badge / ButtonGroup）| shadcn/ui 4.7（本地化到 `src/components/ui/`）| 完全可控源码 + Tailwind 主题       |
| 模态对话框              | @radix-ui/react-dialog              | 无障碍焦点管理 + 复杂动画支持       |
| 复杂交互（Combobox / Popover / Menu）| @base-ui/react 1.4                | 跨框架稳定 API + 无样式约束        |
| 抽屉                  | vaul                                | 移动端底部抽屉                      |
| 图标                  | lucide-react                        | 一致性高 + Tree-shake 友好          |

**shadcn 本地化**：通过 `pnpm dlx shadcn@4.7 add <name>` 添加，源码落入 `src/components/ui/`。

### 2.8 Markdown 内容渲染

**管线**：

```
source.md / interpretation.md
  ↓ react-markdown
remark-parse → remark-gfm → remark-stringify
  ↓
rehype-raw → rehype-slug → rehype-autolink-headings → rehype-highlight
  ↓
highlight.js (atom-one-dark.css) → DOM
```

**Mermaid 支持**（见 `src/components/Mermaid/`）：扫描 Markdown 中的 ` ```mermaid ` 围栏，运行时懒加载 `mermaid` 库。

### 2.9 状态管理

**无 Redux / Zustand**。仅用 React Context + Hook：

| Context / Hook        | 职责                       |
| --------------------- | -------------------------- |
| `ReaderProvider`      | 阅读器 Modal / 路由状态     |
| `useReader`           | 打开/关闭/导航阅读器       |
| `useAnnotations`      | 文本标注（localStorage）   |
| `useProgress`         | 阅读进度 + 全局进度        |
| `useNotesData`        | 跨书笔记聚合               |
| `useMediaQuery`       | 响应式断点                  |
| `useReaderMode`       | 阅读模式（interp / skill / source）|
| `useReaderRoute`      | 阅读路由路径解析            |

**持久化**：所有用户数据存 `localStorage`，Key 前缀 `mingli_`（见 `src/lib/constants.ts`）。

### 2.10 搜索（Fuse.js 7）

**索引范围**：每本书的 `chapters[].name` + 每篇 `source.md` / `interpretation.md` 截断前 3000 字符。

**配置**：默认权重（title 2x, content 1x）+ 中文分词（`tokenize` 留空，使用字符串匹配）。

### 2.11 动画与交互

| 库                  | 用途                              | 触发场景                       |
| ------------------- | --------------------------------- | ------------------------------ |
| `tw-animate-css`    | Tailwind 预设动效（fade / slide）  | 模态进出 / 列表项进场           |
| `gsap`              | 复杂时间线动画                     | 翻书动效 / 主题切换过渡         |
| `hammerjs`          | 触摸手势（page-flip 内部依赖）     | 翻页 / 双指缩放                 |
| `page-flip` 2.0.7   | 真实翻书效果                       | 移动端阅读模式                   |
| `mermaid`           | 关系图渲染                         | 命理结构图（十神生克、格局）     |

### 2.12 测试栈

| 维度       | 工具                                          | 配置文件                |
| ---------- | --------------------------------------------- | ----------------------- |
| 单元测试   | Vitest 2 + jsdom + @testing-library/react     | `vitest.config.ts`      |
| E2E 测试   | Playwright 1.60（chromium 单浏览器）           | `playwright.config.ts`  |
| 覆盖率     | `@vitest/ui`                                  | —                        |

**E2E 启动**：`webServer.command = 'pnpm dev'`（自动拉起 Vite，端口 5173）。

---

## 3. 工具链

### 3.1 ESLint 10

**配置**（`eslint.config.js`）：

```js
tsEslint.config(
  { ignores: ['dist', 'src/data/**/*', 'scripts/*', '**/*.raw.ts'] },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  }
)
```

**忽略目录**：
- `dist` — 构建产物
- `src/data/**` — 自动生成，禁止手编（也禁止 lint）
- `scripts/*` — Node 脚本，环境与浏览器不同
- `**/*.raw.ts` — 调试用的原始 TS

### 3.2 Prettier

**配置**（`.prettierrc`）：

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "tabWidth": 2,
  "useTabs": false
}
```

**Markdown 特别处理**（`.editorconfig`）：保留尾部空白（中文段尾空格有意义）。

### 3.3 EditorConfig

```ini
[*]
indent_style = space
indent_size = 2
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## 4. 包管理

### 4.1 pnpm

**版本**：pnpm 9（CI 固定 `pnpm/action-setup@v4` with `version: 9`）。

**Lockfile**：`pnpm-lock.yaml` 提交到仓库。

**关键命令**：

```bash
pnpm install              # 安装依赖
pnpm add <pkg>            # 添加运行时依赖
pnpm add -D <pkg>         # 添加开发依赖
pnpm dlx shadcn@4.7 add   # shadcn 组件添加
pnpm patch <pkg>          # 给依赖打补丁（patches/ 目录）
```

### 4.2 Node 版本

**固定 Node 22**（CI `setup-node` v4 with `node-version: 22`）。

**本地建议**：`nvm use 22` 或 `volta pin node@22`。

### 4.3 环境变量

**位置**：`/Users/gaozhipeng/Desktop/mingli-research/.env`（已 gitignore）

**复制**：`cp .env.example .env`

**当前键值**：

| 键                    | 必填 | 用途                              |
| --------------------- | ---- | --------------------------------- |
| `ANTHROPIC_API_KEY`   | ✅    | 批量生成 interpretation 用        |
| `ANTHROPIC_BASE_URL`  | ❌    | 自定义网关 / 代理                  |
| `ANTHROPIC_MODEL`     | ❌    | 默认 `claude-opus-4-8`            |

**重要**：
- `.env` 已加入 `.gitignore`（`.env*` 通配 + `!.env.example` 例外）
- 不在仓库中提交任何 API Key
- 批量入口 B 必须带 `--env-file=.env`（否则 `ConfigError`，详见用户记忆）

---

## 5. 构建产物

### 5.1 Vite 构建

**输出**：`dist/`

**结构**：

```
dist/
├── index.html
├── 404.html              # index.html 副本（SPA fallback）
├── assets/
│   ├── index-[hash].js   # 主入口
│   ├── react-vendor-[hash].js  # 手动分块
│   ├── ui-vendor-[hash].js
│   └── ...
└── favicon.ico
```

**复制 404.html**：构建脚本最后一行 `node -e "require('fs').copyFileSync('dist/index.html', 'dist/404.html')"`，实现 GitHub Pages 的 SPA 路由 fallback。

### 5.2 数据生成（scripts/generate.js）

**输入**：`books/<书>/catalog.md` + `articles/<篇目>/{source,interpretation,skill}.md`

**输出**：`src/data/`

```
src/data/
├── books.ts          # 书籍元数据（自动生成）
├── registry.ts       # 动态加载器（自动生成）
├── index.ts          # 类型导出（自动生成）
├── book-types.ts     # 类型定义（自动生成）
└── <书名>/
    ├── content.ts    # 全文 + 摘要
    ├── assoc.ts      # 跨书关联
    └── index.ts      # 桶导出
```

**禁止手编 `src/data/**`**（见 `.gitignore` + 各文件首行注释）。

### 5.3 CI 流水线

**PR 检查**（`.github/workflows/ci.yml`）：

```
pnpm install
  ↓
pnpm run generate   # 数据生成
  ↓
tsc --noEmit        # 类型检查
  ↓
pnpm run build      # 完整构建
```

**主分支部署**（`.github/workflows/github-pages.yml`）：

```
push to main
  ↓
pnpm install → generate → build
  ↓
upload-pages-artifact@v3
  ↓
deploy-pages@v4 → GitHub Pages
```

**Node**：22（action-setup-node v4）
**pnpm**：9（action-setup v4）
**OS**：ubuntu-latest

---

## 6. 内容生成管道（scripts/）

### 6.1 离线脚本

| 脚本                                  | 用途                                                |
| ------------------------------------- | --------------------------------------------------- |
| `generate.js`                         | `catalog.md` → `src/data/*` 数据生成（必经）          |
| `dev.js`                              | 监听 `books/**/*.md` 自动重生成 + 启动 Vite           |
| `fetch-source.js`                     | 通用原文抓取（HTML / 文本）+ 维基文库抓取（run / wiki subcommand）  |
| `t2s.js`                              | 繁简转换（基于 opencc-js）                            |
| `rebuild-ziwei-source.js`             | 紫微斗数全书原文重建                                  |
| `verify-ziwei-source.js`              | 紫微斗数全书原文校验                                  |
| `fix-wxdgy.js`                        | 五行大义修复                                          |
| `self-check-fingerprint.py`           | 内容指纹自检（Python）                                |
| `setup-*.cjs`                         | 各种环境配置 / hook 安装                              |

### 6.2 在线 LLM 脚本（双轨）

| 入口                       | 调用方                | 场景                       |
| -------------------------- | --------------------- | -------------------------- |
| A: subagent 派发           | Claude Code agent      | 交互式 / 中等规模            |
| B: `generate-interpretations.js` CLI | 脚本 / 批处理        | 大规模批处理                |

**核心库**（`scripts/lib/`）：

| 文件                              | 职责                                    |
| --------------------------------- | --------------------------------------- |
| `llm-batch.js`                    | 调 Anthropic SDK + 落盘 + self-check 门  |
| `pipeline.js`                     | 9 步主体流水线 prompt 装订               |
| `condition-check.js`              | 强装载条件校验（5 份规范通读）            |
| `self-check-lite.js`              | 落盘前合规扫描                            |
| `spec-bundle.js`                  | 加载 5 份规范（SPEC-interpretation 等）  |
| `interpretation-rules.js`         | 反元规则 + 评分量表（5/4/3 分制）        |
| `env.js`                          | 环境变量解析                              |
| `generate-interpretations-cli.js` | CLI 参数解析                              |
| `utils.js`                        | 通用工具（进度条 / 时长格式化）            |

**相关 skill**：`interpretation-create`（在 `.claude/skills/interpretation-create/`）

---

## 7. 部署

### 7.1 GitHub Pages

**环境 URL**：`https://banny-gao.github.io/mingli-research/`

**触发**：`push to main` → `.github/workflows/github-pages.yml`

**路由策略**：
- `BrowserRouter` + `basename="/mingli-research"`
- `404.html` 副本：所有未匹配路径回退到 `index.html`（SPA fallback）
- 短链：`/:slug` 兼容旧分享 URL

### 7.2 浏览器要求

- 现代浏览器（Chrome 100+ / Safari 15+ / Firefox 100+）
- ES2020 全支持
- 不支持 IE

### 7.3 性能预算

- 入口 JS gzip < 200KB（Vite 拆包 + esbuild minify）
- 单篇 Markdown 渲染 < 50ms
- 搜索响应 < 100ms
- 翻书动效 60fps

---

## 8. 工具集成

### 8.1 Claude Code Skills

**项目级**（`.claude/skills/`）：

| 技能                            | 用途                                    |
| ------------------------------- | --------------------------------------- |
| `book-create`                   | 创建新典籍（HTML / URL / 文本 / 图片）   |
| `source-create`                 | 录入原文（4 源模式 + 5 步状态机）        |
| `interpretation-create`         | 解读生成（单点 / 批量 + 6 步状态机）     |
| `self-check`                    | 五术研究项目自检（4 类管道）              |
| `commit`                        | 交互式 Git 提交流程                      |
| `coding-compliance`             | 前端代码合规检查                          |
| `ccc`                           | CocoIndex Code 语义搜索                  |
| `gitnexus/*`                    | 代码图谱 / 影响分析                       |

**插件级**（`superpowers-marketplace`）：提供 brainstorming / TDD / debugging / subagent-driven-development 等流程类技能。

### 8.2 MCP 服务器

**项目级**（`.claude/mcp.json`）：

| 服务器                | 用途                                |
| --------------------- | ----------------------------------- |
| `context7`            | 库文档查询（React / Vite / Tailwind 等）|
| `figma`               | 设计稿还原                            |
| `gitnexus`            | 代码图谱查询                          |
| `jira`                | 任务管理                              |
| `sequential-thinking` | 多步推理                              |
| `playwright`          | E2E 浏览器自动化                      |
| `yapi`                | API 文档生成                          |
| `drawio`              | 流程图绘制                            |
| `eslint`              | 代码 lint 集成                        |
| `cocoindex-code`      | 代码语义搜索                          |
| `MiniMax`             | 图片理解 / Web 搜索                   |
| `feishu`              | 飞书文档交互                          |

### 8.3 GitNexus 索引

**状态**：11462 symbols / 12111 relationships / 37 execution flows（持续更新）

**维护**：

```bash
npx gitnexus analyze            # 重新索引
npx gitnexus analyze --embeddings  # 含 embeddings
```

**PostToolUse Hook**：`git commit` / `git merge` 后自动重新索引（`npx gitnexus analyze` + embeddings 检测）。

### 8.4 CocoIndex Code（ccc）

**位置**：`.cocoindex_code/`（gitignored）

**功能**：语义化代码搜索，理解意图而非仅匹配关键字。

---

## 9. 设计 Token 系统

**双源同步**（`src/tokens/index.ts` ↔ `src/styles/index.css`）：

| 类别         | 名称                            | 范围                  |
| ------------ | ------------------------------- | --------------------- |
| 颜色         | `color.bg.*` / `color.text.*` / `color.gold` / `color.purple` | 主题色 + 文字色 + 强调色 |
| 排版         | `typography.xs` ... `typography.2xl` | 7 级字号             |
| 间距         | `spacing.1` ... `spacing.16`     | 4px 基础步进            |
| 圆角         | `radius.sm` ... `radius.4xl`     | 6 级                   |
| 阴影         | `shadow.sm` ... `shadow.purple`  | 5 级 + 2 主题阴影      |

**主题切换**：`document.documentElement.setAttribute('data-theme', 'light' | 'dark')`，CSS 变量重定义。

**FOUC 防护**（见 `src/main.tsx`）：在 React 渲染前从 localStorage 读取主题并应用。

---

## 10. 已知约束

### 10.1 内容侧

- **数据自动生成**：`src/data/**` 全为脚本产物，禁止手编
- **catalog.md 是单一事实源**：所有书籍元数据 / 篇目清单的唯一入口
- **生成式解读**：`interpretation.md` 由 LLM 批量生成，遵循 `SPEC-interpretation.md` 强装载 5 份规范

### 10.2 代码侧

- **无 RSC / SSR**：纯 SPA，GitHub Pages 静态托管
- **无状态管理库**：仅 React Context + localStorage
- **页面级懒加载**：`React.lazy` + `Suspense`（见 `src/main.tsx`）
- **ModalReader 特殊处理**：CSS（`highlight.js/atom-one-dark.css`）先加载，再异步加载组件

### 10.3 部署侧

- **GitHub Pages 子路径**：`base: '/mingli-research/'` 必须与仓库名一致
- **404.html 副本**：构建脚本最后一步必须执行
- **环境变量分离**：CI 使用 `secrets.ANTHROPIC_API_KEY`（仅在生成解读时使用，不在主构建流程）

---

## 11. 版本演进记录

| 日期       | 主要变更                                                                |
| ---------- | ----------------------------------------------------------------------- |
| 2026-06-18 | 本文档首次完整编写；React 19 / Vite 6 / Tailwind 4 / TypeScript 5         |
| —          | 历史变更见 `git log`                                                     |

---

## 12. 维护说明

**本文档必须保持与 `package.json` 严格同步。**

变更流程：
1. 修改 `package.json`（添加 / 升级 / 删除依赖）
2. `pnpm install` 验证 lockfile 更新
3. 同步更新本文档对应章节
4. 在 §11 追加版本记录
5. 提交时附 `docs(TECH_STACK): ...` 标记
