# DEVELOPMENT_GUIDE.md - 开发详细规范

> 本文件是 `CLAUDE.md` 的配套规范，编码细节以此为准。详细内容按需查询，禁止凭记忆编码。
>
> 最后更新：2026-06-18

---

## 0. 阅读顺序

1. **本文件**（开发规范）— 必读
2. [`TECH_STACK.md`](./TECH_STACK.md) — 技术栈、版本、配置
3. [`../README.md`](../README.md) — 项目概览、内容结构
4. [`../CLAUDE.md`](../CLAUDE.md) — 行为准则
5. [`./superpowers/specs/`](./superpowers/specs/) — 各专项规范（catalog / source / interpretation / self-check / mobile-reader）
6. `docs/superpowers/plans/` — 已落地的实施计划
7. `research-dispute/SPEC-*.md` — 五术研究项目强装载规范

---

## 1. 项目本质

**命理学术中心**：基于《滴天髓阐微》《子平真诠》《三命通会》《穷通宝鉴》等子平经典，对传统命学典籍进行系统性学术解读、配图注释与跨书关联的**纯前端 SPA**。

**核心特征**：
- 静态托管（GitHub Pages）— **无后端、无服务端 API**
- 内容驱动 — `books/<书>/` 人工维护的 Markdown + `scripts/generate.js` 产物
- 双模阅读器 — 桌面 Modal / 移动端独占路由
- LLM 辅助 — 解读（interpretation）由 Anthropic API 批量生成
- 强合规 — 五术研究规范 + 11 份 SPEC 文档强装载

**关键数字**（截至 2026-06-18）：
- 典籍 12 本（命学 4 主 + 八字 5 + 紫微 1 + 五行大义 1 + 命理探原 1）
- `src/` TS/TSX 文件 113 个
- GitNexus 索引：11462 symbols / 12111 relationships / 37 execution flows

---

## 2. 目录结构与职责

### 2.1 顶层

```
mingli-research/
├── books/                  # 内容（人工维护）
├── src/                    # 应用代码
├── scripts/                # Node 脚本（生成 / 抓取 / LLM）
├── plugins/                # 自研 Vite 插件
├── docs/                   # 规范 / 计划 / 文档（本目录）
├── issues/                 # 批次解读计划
├── public/                 # 静态资源
├── tests/                  # Vitest + Playwright
├── research-dispute/       # 五术研究规范（SPEC 系列）
├── dist/                   # 构建产物
├── .claude/                # Claude Code skills / settings / hooks
├── .claude/skills/         # 项目级 skills
├── .github/workflows/      # CI + GitHub Pages 部署
└── （配置：package.json / vite.config.ts / tsconfig.json / eslint.config.js / vitest.config.ts / playwright.config.ts / components.json / tailwind.config.js）
```

### 2.2 `books/` — 内容层

```
books/
├── <书名>/
│   ├── catalog.md          # 元数据 + 篇目清单（必读，事实源）
│   ├── catalog.html        # 渲染版（用于跨书校对）
│   └── articles/<篇目>/
│       ├── source.md       # 经典原文
│       ├── interpretation.md  # 学术解读（LLM 生成）
│       └── skill.md        # 配套技能（可选）
```

**书名规范**：
- 用全名（不用 `dttsxm` 之类的 slug）
- 文件夹名与 `catalog.md` 一级标题一致
- `ArtSection` 类型枚举：`'山' | '医' | '命' | '相' | '卜'`

**catalog.md 关键字段**（参见 `research-dispute/SPEC-catalog.md`）：

```markdown
# 《书名》

> 作者：[朝代] 作者
> 版本：据 XXX 本
> 简介：一句话
> 术数：命
> 类别：八字
> 内容类型：source, interpretation, skill
> 字形策略：原文照录

> 审校存疑条目（如有）

## 上篇 / 卷一

| 编号 | 篇名 |
| ---- | ---- |
| 01 | 篇名 |
| 02 | 篇名 |
```

**catalog 状态判定**（`scripts/generate.js` 自动）：

| 存在                                       | 状态            |
| ------------------------------------------ | --------------- |
| `source.md`                                | `total` 计入    |
| `source.md` + `interpretation.md`          | `isDone: true`  |
| 三件齐全                                   | `hasSkill: true` |

### 2.3 `src/` — 应用层

```
src/
├── main.tsx                # 入口、路由、Suspense、Provider
├── pages/                  # 页面级组件（landing / book / notes / reader）
├── components/             # UI 组件（按业务聚合）
│   ├── <业务组件>/         # 业务组件（含 .tsx + .less + index.ts）
│   ├── ui/                 # shadcn 基础组件
│   └── index.ts            # 桶导出
├── hooks/                  # 自定义 Hook
│   └── __tests__/          # Hook 单元测试
├── data/                   # ⛔ 自动生成（勿手编）
│   ├── books.ts            # 书籍元数据
│   ├── book-types.ts       # 类型定义
│   ├── registry.ts         # 动态加载器
│   ├── index.ts            # 桶导出
│   └── <书名>/
│       ├── content.ts      # 全文 + 摘要
│       ├── assoc.ts        # 跨书关联
│       └── index.ts        # 桶导出
├── lib/                    # 工具 / 常量
│   ├── utils.ts            # cn() 等
│   └── constants.ts        # localStorage key
├── tokens/                 # 设计 token
├── styles/                 # 全局 + 组件样式
│   ├── index.css           # Tailwind 入口
│   ├── index.less          # LESS 入口
│   └── components/         # 业务 LESS
├── utils/                  # 高级工具（注入批注等）
└── types/                  # 全局类型（mermaid.d.ts 等）
```

### 2.4 `scripts/` — 工具层

```
scripts/
├── generate.js             # catalog.md → src/data/*（必经）
├── dev.js                  # watch books/ + Vite
├── generate-interpretations.js  # 批量生成解读（CLI 入口 B）
├── fetch-sources.js        # 通用原文抓取
├── fetch-wikisource.js     # 维基文库抓取（紫微）
├── t2s.js                  # 繁简转换
├── self-check-fingerprint.py   # 规范指纹校验
├── lib/                    # 共享库
│   ├── llm-batch.js        # LLM 调 SDK + 落盘
│   ├── pipeline.js         # 9 步 prompt 装订
│   ├── condition-check.js  # 强装载条件
│   ├── self-check-lite.js  # 落盘前合规扫描
│   ├── spec-bundle.js      # 5 份规范加载
│   ├── interpretation-rules.js  # 反元规则 + 5/4/3 分制
│   ├── env.js              # 环境变量
│   ├── generate-interpretations-cli.js  # CLI 参数
│   ├── condition-check.js  # 条件检查
│   ├── utils.js            # 通用工具
│   └── __tests__/          # 脚本测试
└── setup/                  # 环境配置脚本（ccc / claude / gitnexus / mcp / skills）
```

### 2.5 `docs/` — 规范层

```
docs/
├── TECH_STACK.md           # 技术栈（本仓库）
├── DEVELOPMENT_GUIDE.md    # 开发规范（本文件）
├── superpowers/
│   ├── plans/              # 已落地的实施计划
│   └── specs/              # 5 份 SPEC（book-create / source-create / interpretation-create / self-check / mobile-reader-modes）
└── （历史：解读日志.md / 解语日志.md）
```

---

## 3. 开发流程

### 3.1 标准流程（CLAUDE.md §5.1）

```
需求/分析 → 设计 → 文档化 → 编码 → 验证 → 提交
```

### 3.2 复杂任务（CLAUDE.md §5.2）

| 阶段 | 工具 |
| ---- | ---- |
| 拆解 | `sequential-thinking` MCP |
| 执行 | `superpowers write-plan` 生成计划 |
| 审查 | `superpowers code-reviewer` |
| 测试 | `superpowers TDD` 能力 |

### 3.3 启动开发服务器

```bash
pnpm dev
```

`scripts/dev.js` 行为：
1. 首次执行 `pnpm run generate`（数据预生成）
2. 启动 Vite（端口 5173，basename=`/mingli-research`）
3. 监听 `books/**/*.md` 变动，300ms debounce 后自动重生成

### 3.4 内容变更后

```bash
pnpm generate         # 仅重生成 src/data/*
pnpm all              # generate + build（提交前必跑）
```

**重要**：纯前端代码修改不需要重 generate；只有 `books/**` 变化才需要。

---

## 4. 编码规范

### 4.1 通用

- **TypeScript 严格模式**（`strict: true` + `noUnusedLocals` + `noUnusedParameters`）
- **不写注释解释 what**（代码即文档）；仅解释 why
- **修改代码时**：不"优化"相邻代码、注释或格式；不重构没坏的东西
- **匹配现有风格**：单引号、无分号、2 空格缩进、LF 行尾
- **不添加需求之外的功能**；不为单次使用创建抽象

### 4.2 路径别名

**唯一别名**：`@/*` → `src/*`（见 `tsconfig.json` paths + Vite resolve.alias）

**禁止**新增其他别名（如 `~/`、`@components/` 等），统一 `@/components/...`、`@/hooks/...`。

### 4.3 导入顺序

参考 `src/main.tsx`：

```ts
// 1. Node / 浏览器标准库
// 2. 第三方库
// 3. 共享库（书籍数据）
// 4. 内部模块（hooks / components / utils）
// 5. 相对路径
// 6. 样式
import './styles/index.css'
import './styles/index.less'
```

**不要**手动分块/分组，依赖 Prettier + ESLint。

### 4.4 Hook 规则

- 仅在组件或自定义 Hook 顶层调用
- 依赖列表必须完整（`exhaustive-deps` 警告需处理）
- `useEffect` 中避免 setState（`react-hooks/set-state-in-effect` 警告）
- 自定义 Hook 命名以 `use` 开头

### 4.5 组件

- 业务组件目录结构：

```
<ComponentName>/
├── <ComponentName>.tsx     # 主文件
├── <ComponentName>.less    # 组件样式（可选）
└── index.ts                 # 桶导出（避免直接导入 .tsx）
```

- **统一从 `index.ts` 导入**业务组件：

```ts
import ModalReader from '@/components/ModalReader'  // ✅
import { ModalReader } from '@/components/ModalReader/ModalReader'  // ❌
```

- shadcn 基础组件直接用：`@/components/ui/button`

### 4.6 样式

**双层规则**：

| 场景               | 工具                                |
| ------------------ | ----------------------------------- |
| 布局、间距、配色     | Tailwind 原子类                       |
| 复杂组件样式（伪类 / 嵌套 / 关键帧） | LESS 模块（与组件同目录） |
| 主题颜色            | CSS 变量（`var(--color-*)`）         |
| 全局样式            | `src/styles/*.less`                  |

**禁止**：
- 在 LESS 中硬编码颜色（必须用 `var(--color-*)`）
- 写内联 `style={{ color: 'red' }}`（用 className + Token）
- 在组件 `.less` 中写全局规则

**className 合并**：

```ts
import { cn } from '@/lib/utils'
// cn = twMerge(clsx(...))
className={cn('base-class', condition && 'active', className)}
```

### 4.7 状态管理

**无 Redux / Zustand**。仅用 React Context + Hook + localStorage。

**localStorage Key 规范**：

| Key                              | 用途               | 定义位置                |
| -------------------------------- | ------------------ | ----------------------- |
| `mingli_theme`                   | 主题               | `src/main.tsx`          |
| `mingli_annotations`             | 批注（含派生 key） | `src/lib/constants.ts`  |
| `mingli_bookmarks`               | 书签               | `src/lib/constants.ts`  |
| `mingli_search_history`          | 搜索历史           | `src/lib/constants.ts`  |
| `mingli_read_progress_<slug>`    | 阅读进度           | `useProgress` 派生      |

**派生 Key 模式**：

```ts
const ANN_KEY = 'mingli_annotations'
function makeKey(slug: string, chapter: string, isSource?: boolean) {
  return `${ANN_KEY}_${slug}_${chapter}${isSource ? '__source' : ''}`
}
```

### 4.8 性能

- 路由级懒加载（`React.lazy` + `Suspense`）
- ModalReader：CSS 先加载（`highlight.js/atom-one-dark.css`），再异步加载组件
- Vite 拆包：`react-vendor` / `ui-vendor`
- 避免大列表不虚拟化（Markdown 渲染按需）

---

## 5. 关键架构模式

### 5.1 双模阅读器（桌面 Modal / 移动端路由）

**判断**：`useMediaQuery('(max-width: 640px)')`

**桌面**（≥641px）：Modal 浮层，URL 不变。`GlobalModal` 组件挂载在 `main.tsx` 顶层。

**移动端**（≤640px）：独占路由 `/books/:section/:slug/read/:type/:key`，系统返回键可关闭。

**避免双层挂载**：

```ts
// main.tsx GlobalModal
if (isMobile) return null  // 移动端不渲染 modal
if (!state.modalType) return null  // 无状态不渲染
```

### 5.2 数据驱动 + 动态加载

**`src/data/registry.ts` 自动生成**：

```ts
// Auto-generated
import * as _book0 from './三命通会';
// ...
const registry: Record<string, any> = {
  '三命通会': _book0,
  // ...
};
export function getBook(slug: string) { return registry[slug] ?? {}; }
```

**加载示例**（`src/components/ModalReader/ModalReader.tsx`）：

```ts
import { getBook } from '../../data/registry'
const book = getBook(bookSlug)
const content = book.content
```

**新增典籍流程**：
1. `books/<书>/catalog.md` 创建
2. `pnpm run generate`（自动扫描 + 生成数据）
3. `books/<书>/articles/<篇>/source.md` 录入
4. （可选）`pnpm run generate-interpretations` 生成解读

或直接用 skill `book-create`（推荐，参见 `.claude/skills/book-create/SKILL.md`）。

### 5.3 主题切换（暗色默认 + 浅色 + 跟随系统）

**实现**：

1. `localStorage.mingli_theme` 持久化
2. `[data-theme='light']` 切换 CSS 变量
3. FOUC 防护：React 渲染前应用主题

```ts
// main.tsx
const initTheme = () => {
  try {
    const saved = localStorage.getItem('mingli_theme')
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light')
  } catch { /* ignore */ }
}
initTheme()
```

**Token 同步**：见 `src/tokens/index.ts` 与 `src/styles/index.css` 双源。

### 5.4 批注系统

**类型**：`'emphasis' | 'question' | 'quote'`

**存储**：派生 localStorage key（`mingli_annotations_<slug>_<chapter>[__source]`）

**渲染**：`utils/injectAnnotations.ts` 在 Markdown 渲染后注入 `<mark>` 标签。

**关键时序**：
- 打开 modal → 从 localStorage 读取批注 → 注入 DOM
- 添加批注 → 立即写入 localStorage（debounced 或即时）
- 关闭 modal → 清理

### 5.5 LLM 解读生成（双轨入口）

| 入口       | 触发                         | 场景               |
| ---------- | ---------------------------- | ------------------ |
| A: subagent | Claude Code agent 派发       | 交互式 / 中等规模  |
| B: CLI     | `node scripts/generate-interpretations.js <slug> [chapters]` | 大规模批处理 |

**入口 B 必带 `--env-file=.env`**（否则 `ConfigError`）。

**9 步主体流水线**（`scripts/lib/pipeline.js` 装订）：

1. 强装载 5 份规范（SPEC-interpretation / general / 术数专项 / 原始 + 启发）
2. 元信息（书名 / 篇目 / 类别）
3. 字形策略（如「原文照录」/「规范化用字」）
4. 反元规则（5/4/3 分制）
5. 原文逐句拆解
6. 体例分块
7. 解读主体
8. 配套技能（如适用）
9. 自评（5/4/3 分 + 反思）

**落盘前合规门**：`scripts/lib/self-check-lite.js`（与 `self-check` skill 共享数据源）。

---

## 6. 常用任务

### 6.1 新增典籍

**手动流程**：

```bash
mkdir -p books/<书名>/articles
# 1. 编辑 books/<书名>/catalog.md
# 2. 编辑 books/<书名>/articles/<篇名>/source.md
# 3. 跑 generate
pnpm run generate
# 4. （可选）批量生成解读
node --env-file=.env scripts/generate-interpretations.js <书名>
# 5. 验证
pnpm dev
```

**skill 流程**（推荐）：`/book-create`（参见 `.claude/skills/book-create/SKILL.md`）

### 6.2 新增篇目

```bash
# 1. 在 books/<书>/articles/<新篇名>/source.md 写原文
# 2. （可选）跑 LLM 生成解读
# 3. 跑 generate
pnpm run generate
```

### 6.3 修改内容

```bash
# 1. 编辑 source.md / interpretation.md
# 2. dev 服务器自动重 generate（或手动 pnpm run generate）
# 3. 浏览器验证 HMR
```

### 6.4 添加 shadcn 组件

```bash
pnpm dlx shadcn@4.7 add <component-name>
# 组件落入 src/components/ui/
```

### 6.5 添加运行时依赖

```bash
pnpm add <pkg>
# 必须：同步更新 docs/TECH_STACK.md
```

### 6.6 提交前检查

```bash
pnpm test              # Vitest 单元测试
pnpm test:e2e          # Playwright E2E（需先起 dev server）
pnpm exec tsc --noEmit # 类型检查
pnpm run build         # 完整构建（验证 generate + tsc + vite build）
```

完整检查矩阵（CI 流水线一致）：

| 命令                              | 验证内容           |
| --------------------------------- | ------------------ |
| `pnpm install`                    | 依赖一致性          |
| `pnpm run generate`               | 数据生成无错        |
| `pnpm exec tsc --noEmit`          | TypeScript 严格通过  |
| `pnpm run build`                  | 完整构建（dist/ 生成）|
| `pnpm test`                       | 单元测试通过        |
| `pnpm test:e2e`                   | E2E 通过            |
| ESLint（编辑器内）                 | 无 error / warn     |

### 6.7 Git 提交流程

使用 `commit` skill：

```
/commit
```

自动分析变更、生成 commit 信息、勾选验证、确认提交。

### 6.8 影响分析（修改前必做）

```bash
# 用 GitNexus MCP
gitnexus_impact({ target: "symbolName", direction: "upstream" })
```

**规则**（CLAUDE.md / AGENTS.md）：
- 修改任何 symbol 前 MUST 跑 `gitnexus_impact`
- HIGH / CRITICAL 风险必须 warn 用户
- 提交前 MUST 跑 `gitnexus_detect_changes()`

---

## 7. 调试

### 7.1 通用流程

1. **定位**：用 `gitnexus_query({query: "<症状>"})` 找相关执行流
2. **上下文**：用 `gitnexus_context({name: "<函数>"})` 看 360° 关系
3. **追踪**：读 `gitnexus://repo/mingli-research/process/{name}` 全流程
4. **回滚**：`gitnexus_detect_changes({scope: "compare", base_ref: "main"})`

### 7.2 浏览器调试

- Vite HMR：编辑后浏览器自动刷新
- React DevTools：装扩展看组件树
- 性能面板：Performance tab

### 7.3 数据问题

`books/**/*.md` 改了但 UI 没更新？

```bash
# 1. 检查 generate 是否执行（看控制台）
pnpm run generate
# 2. 检查 src/data/ 是否更新
git status src/data/
# 3. 重启 dev
```

### 7.4 样式问题

- 检查 `data-theme` 属性（暗色 vs 浅色）
- 检查 `var(--color-*)` 是否定义
- 用浏览器 DevTools 查看 computed styles

### 7.5 GitNexus 索引陈旧

```bash
# 看提示
gitnexus_xxx  # 如果返回 "index is stale"

# 手动更新
npx gitnexus analyze
npx gitnexus analyze --embeddings  # 含 embeddings
```

**PostToolUse Hook** 会在 `git commit` / `git merge` 后自动跑。

---

## 8. 测试

### 8.1 单元测试（Vitest）

**位置**：
- `src/hooks/__tests__/*.test.ts`
- `src/**/*.test.{ts,tsx}`
- `tests/**/*.test.{ts,js}`

**运行**：

```bash
pnpm test            # 单次
pnpm test:watch      # watch 模式
```

**特殊**：
- `tests/setup-dom.ts` — 修复 Node 22 localStorage 缺失问题
- `vitest.config.ts` — jsdom + alias `@` → `src/`

### 8.2 E2E 测试（Playwright）

**位置**：`tests/e2e/*.spec.ts`

**运行**：

```bash
pnpm test:e2e        # headless
pnpm test:e2e:ui     # UI 模式
```

**自动拉起 dev server**（`webServer.command = 'pnpm dev'`）。

**单浏览器**：仅 chromium（生产环境用，足够验证）。

### 8.3 自检（self-check）

`/self-check` skill — 五术研究项目 4 类管道合规扫描（catalog / source / interpretation / skill）。

**规则**：见 `docs/superpowers/specs/2026-06-09-self-check-skill-design.md` + `research-dispute/` 下的 4 份 SPEC。

---

## 9. 部署

### 9.1 自动部署（push to main）

```bash
git push origin main
# 触发 .github/workflows/github-pages.yml
# → install → generate → build → upload-artifact → deploy
# → https://banny-gao.github.io/mingli-research/
```

### 9.2 手动验证

```bash
pnpm run build       # 生成 dist/
pnpm preview         # 本地预览生产产物（端口 4173）
```

### 9.3 部署相关约束

- **basename**：`/mingli-research/`（与仓库名一致）
- **404.html**：构建脚本最后一步复制 `dist/index.html` → `dist/404.html`
- **环境变量**：CI 用 `secrets.ANTHROPIC_API_KEY`（仅在需要 LLM 时）

### 9.4 故障排查

| 现象                        | 原因                          | 修复                            |
| --------------------------- | ----------------------------- | ------------------------------- |
| 路由 404                    | 缺 404.html 副本               | `cp dist/index.html dist/404.html` |
| 静态资源 404                | `base` 配置错误                | 检查 `vite.config.ts` base      |
| 生成式解读失败               | 缺 `ANTHROPIC_API_KEY`        | 配置 secrets                    |
| 页面空白                    | JS 报错                       | 看浏览器 console / CI 日志      |

---

## 10. 常见问题（FAQ）

### 10.1 为什么用 Vite 不用 Next.js？

- 纯静态 + GitHub Pages，无 SSR 需求
- Vite 构建快 + HMR 体验好
- 部署简单（dist/ 直接上传）

### 10.2 为什么不用 Redux / Zustand？

- 状态树简单：阅读器、批注、主题、笔记
- localStorage + Context 足够
- 减少依赖 = 减少 bundle size

### 10.3 `src/data/**` 为什么禁止手编？

- 脚本生成（一致性 + 减少人工错误）
- 修改应改 `books/**/*.md` + 重跑 `generate.js`
- ESLint 已 ignore 此目录

### 10.4 为什么 catalog.md 用全名（如 `滴天髓阐微`）不用 slug？

- 学术项目，保留中文原名增强识别
- 文件夹名与一级标题一致
- `data/registry.ts` 动态加载，避免硬编码

### 10.5 Tailwind 4 怎么用 `tailwind.config.js`？

- 本项目 Tailwind 4 走 `@theme inline` 语法（CSS 内）
- `tailwind.config.js` 仅声明 `content` 路径（Vite 必需）
- 实际主题配置在 `src/styles/index.css` 的 `@theme inline { }` 块

### 10.6 shadcn 组件和 base-ui 怎么选？

| 场景             | 选型               |
| ---------------- | ------------------ |
| 基础原子组件     | shadcn（本地化）   |
| 模态 / 抽屉 / 弹层 | @radix-ui/react-dialog / vaul |
| Combobox / Popover | @base-ui/react   |
| 简单按钮 / 卡片  | shadcn 即可         |

### 10.7 移动端 Modal 与路由如何选择？

**判断点**：

- 需要保留当前 URL？→ Modal
- 需要系统返回键关闭？→ 路由
- 需要 push 历史栈？→ 路由
- 需要保持桌面 / 移动体验一致？→ Modal

**当前规则**（见 `src/main.tsx` GlobalModal）：

- 桌面（≥641px）：Modal
- 移动（≤640px）：路由 `/read/...`

---

## 11. 项目特定约束

### 11.1 学术合规（强装载）

**五术研究项目所有内容必须遵循**：

```
research-dispute/
├── general.md                 # 通用规范
├── SPEC-catalog.md            # catalog 规范
├── SPEC-source.md             # 原文录入规范
├── SPEC-interpretation.md     # 解读生成规范
├── bazi.md                    # 八字专项
├── 紫微斗数专项.md             # 紫微专项
└── （其他专项）
```

**指纹校验**：`python3 scripts/self-check-fingerprint.py`

**反元规则**（5/4/3 分制）：见 `scripts/lib/interpretation-rules.js`。

### 11.2 数据流

```
books/<书>/catalog.md
  ↓ generate.js
src/data/books.ts + registry.ts
  ↓
src/data/<书>/content.ts (source + interpretation)
  ↓
pages/BookApp.tsx → components/ModalReader
  ↓
用户界面（桌面 Modal / 移动路由）
```

### 11.3 自动化边界

**机器做**：
- 解析 catalog.md
- 加载 Markdown → 渲染 HTML
- 注入批注
- 持久化 localStorage
- 调 LLM 批量生成解读
- 自检合规扫描

**人做**：
- 编写 catalog.md 元数据
- 审校原文
- 把关解读质量
- 决策设计方向

**禁止机器做**：
- 自动修改 `src/data/**`（脚本生成）
- 自动修改 catalog.md（强装载规范）
- 自动添加依赖（需 TECH_STACK 同步）
- 自动部署到主分支（PR 流程保护）

---

## 12. 贡献流程

### 12.1 修改代码

1. 开分支：`git checkout -b feat/<name>`
2. 编码 + 单元测试
3. 本地验证：`pnpm test && pnpm test:e2e`
4. 影响分析：`gitnexus_impact` + `gitnexus_detect_changes`
5. 提交：`/commit`（自动生成信息）
6. 推分支 + 开 PR
7. CI 通过 + 人工 review
8. 合入 main → 自动部署

### 12.2 修改内容（解读 / 原文）

1. 在 `issues/<批次>.md` 列计划
2. 编辑 `books/<书>/articles/<篇>/{source,interpretation,skill}.md`
3. `pnpm run generate`（自动更新数据）
4. `pnpm dev` 验证 UI
5. `/self-check` 扫合规
6. 提交 + 推 PR

### 12.3 新增典籍

1. 用 `/book-create` skill（推荐）
2. 或手动：`books/<书>/` 创建 + 编辑 catalog.md
3. 录入原文（部分或全部）
4. `/interpretation-create` 生成解读
5. `/self-check` 扫合规
6. 提交 + 推 PR

---

## 13. 工具快捷键

| 工具       | 触发             | 用途                       |
| ---------- | ---------------- | -------------------------- |
| `/commit`  | skill            | 交互式 Git 提交            |
| `/cr`      | skill            | 代码审查（PC）             |
| `/cr-h5`   | skill            | 代码审查（H5）             |
| `/self-check` | skill         | 五术研究项目自检           |
| `/book-create` | skill        | 创建新典籍                 |
| `/source-create` | skill      | 录入原文                   |
| `/interpretation-create` | skill | 生成解读                   |
| `/complex-task` | skill        | 复杂任务编排               |
| `/figma-design` | skill       | Figma 还原设计稿            |
| `/playwright-test` | skill    | E2E 测试                   |
| `/vitest`  | skill            | 单元测试                   |
| `/yapi-analyzer` | skill      | YAPI 类型生成              |
| `/requirement-analyzer` | skill | 需求拆解              |
| `/page-analyzer` | skill      | 页面分析                   |
| `/performance-analyzer` | skill | 性能分析                 |
| `/ai-efficiency-summary` | skill | 效率总结                |
| `/okr-assist` | skill         | OKR 制定                   |
| `/coding-compliance` | skill   | 前端合规检查                |
| `/prd`     | skill            | PRD 文档管理               |
| `/book-create` | skill        | 建书（已列入）              |

---

## 14. 自检清单（提交前）

- [ ] `pnpm exec tsc --noEmit` — 无类型错误
- [ ] `pnpm test` — 单元测试通过
- [ ] `pnpm test:e2e` — E2E 通过（如改动 UI）
- [ ] `pnpm run build` — 构建成功
- [ ] ESLint — 无 error / warn
- [ ] `gitnexus_impact` — 已评估风险
- [ ] `gitnexus_detect_changes` — 变更范围符合预期
- [ ] 无硬编码 API Key / 敏感信息
- [ ] diff 中无不必要的"优化"
- [ ] 必要处更新了 `docs/TECH_STACK.md` / 本文件
- [ ] 解读类改动跑过 `/self-check`
- [ ] commit 信息遵循 `commit` skill 模板

---

**最后：** 不确定时停下来问（CLAUDE.md §1）。不要假设，不要隐藏困惑。
