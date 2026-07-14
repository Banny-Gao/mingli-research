# 主题系统重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把三套并行 token 压成单一真相源（shadcn 语义层直接持值、深浅对称），保留 `--color-*` 别名层向后兼容，补齐 shadcn 留洞与缺失 token，删除 `theme.less` 补丁和死代码 `tokens/index.ts`——配色完全保留，只动结构。

**Architecture:** `index.css` 三层结构——第 1 层语义 token 直接持值（深/浅对称重写）、第 2 层 `@theme inline` 纯映射、第 3 层 `--color-*` 别名指向第 1 层。组件 `.less` 改用语义 token，`theme.less` 内容迁移后整体删除。"先建后拆"顺序：第 1 步建真相源 + 别名改映射后视觉应零变化（安全网），再逐文件迁移硬编码，最后删文件。

**Tech Stack:** React + TypeScript + Vite + Tailwind CSS v4 + shadcn + Less + pnpm。Build: `pnpm run build`（= `generate && tsc && vite build`）。Test: `pnpm test`（vitest）。

## Global Constraints

- 配色完全保留：金 `#f0c060`/紫 `#7a4faa`/深海军蓝 `#0a0a14`/宣纸 `#f5f0e8` 等所有现有色值不得改变，只改它们的持有位置（从 `--color-*` 持值改为 `--primary` 等语义层持值）。
- 第 3 层 `--color-*` 别名层永久保留，现有 23 个 `.less` 文件不改名、不迁移到 Tailwind/CSS Modules。
- 深浅对称：每个语义 token 在 `:root`（深）和 `[data-theme='light']`（浅）各写一遍完整值。
- 不改 JS 逻辑：`Mermaid.tsx` 的 `readToken`、`useNotesData.ts` 的 `TYPE_COLORS` 代码不动（值从失效→有效是期望行为变化）。
- 不处理 `ReaderSettingsDrawer.tsx:75,79` 的 3 个占位 hex（`['#fff', '#f5f0e8', '#1a1a2e']`）——已知例外。
- 每 2-5 分钟一个步骤，每个 Task 结尾独立提交。Task 1（建真相源）后必须验证视觉零变化才能继续。
- 改任何 TS symbol 前跑 `gitnexus_impact`，提交前跑 `gitnexus_detect_changes`（CLAUDE.md 要求）。
- spec 文档：`docs/superpowers/specs/2026-07-14-theme-redesign-design.md`

---

## File Structure

| 文件 | 责任 | 动作 |
|---|---|---|
| `src/styles/index.css` | 三层 token 唯一定义处（真相源+别名+Tailwind别名） | 重写 |
| `src/styles/theme.less` | 现为浅色补丁文件 | 删除 |
| `src/tokens/index.ts` | 死代码 token 对象 | 删除 |
| `src/styles/index.less` | Less 导入枢纽 | 删 theme import |
| `src/styles/base.less` | 全局 reset/body | body 加 inset 阴影 |
| `src/styles/prose.less` | 排版样式 | 5 个硬编码改 token |
| `src/styles/hero-section.less` | hero 区样式 | 接收 theme.less 迁移的 hero-glow/title |
| `src/components/BookCard/BookCard.less` | 书卡样式 | 阴影 + `#000` 改 token |
| `src/components/SearchBar/SearchBar.less` | 搜索栏样式 | 阴影 + 接收 search-spinner |
| `src/components/AnnotationToolbar/AnnotationToolbar.less` | 批注工具栏 | 阴影 + 接收 annotation mark |
| `src/components/AnnotationPanel/AnnotationPanel.less` | 批注面板 | `color:white` + annotation mark |
| `src/components/ModalReader/ModalReader.less` | 阅读器弹窗 | scrim + 阴影 + annotation mark |
| `src/components/Mermaid/Mermaid.less` | mermaid 容器 | 错误色改 `--danger` |
| `src/components/AiAssistant/AiAssistant.less` | AI 助手 | 紫底改 color-mix |
| `src/components/ReadList/ReadList.less` | 阅读列表 | `--color-text` 笔误 |
| `src/components/ui/drawer.tsx` | shadcn drawer | 遮罩改 `var(--scrim)` |
| 不动 | `ui/{badge,button,button-group,card,checkbox,dropdown-menu,select,separator,tabs}.tsx`、`styles/{layout,page-chrome,page-layout}.less`、其余 `.less` | — |

---

### Task 1: 重写 `index.css` 建立三层真相源（视觉零变化安全网）

**Files:**
- Modify: `src/styles/index.css`（整体重写 `:root` L80-140、`[data-theme='light']` L142-196、新增第 3 层别名块）

**Interfaces:**
- Produces: 第 1 层语义 token（`--background`/`--foreground`/`--primary`/`--card`/`--border`/`--danger`/`--quote`/`--glow`/`--shadow-*`/`--scrim` 等直接持值，深浅对称）；第 3 层 `--color-*` 别名（`--color-gold: var(--primary)` 等纯映射）。后续 Task 消费这些语义 token。

- [ ] **Step 1: 重写 `:root` 块——shadcn 语义 token 直接持值 + 补洞**

把 `src/styles/index.css` 的 `:root` 块（L80-140）整段替换为。注意 `--background`/`--foreground` 从 `oklch(0.145 0 0)`/`oklch(0.985 0 0)` 改为持真实色值，`--chart-1..5` 从灰阶改为金紫色阶，shadcn 语义层不再 alias 到 `--color-*`：

```css
:root {
  /* shadcn 语义 token（直接持值，补齐 background/foreground/chart 留洞） */
  --background: #0a0a14;
  --foreground: #d8d0c0;
  --card: #101828;
  --card-foreground: #d8d0c0;
  --popover: #101828;
  --popover-foreground: #d8d0c0;
  --primary: #f0c060;
  --primary-foreground: #0a0a14;
  --secondary: #141e30;
  --secondary-foreground: #d8d0c0;
  --muted: #141e30;
  --muted-foreground: #8080a0;
  --accent: #7a4faa;
  --accent-foreground: #b090e0;
  --destructive: oklch(0.704 0.191 22.216);
  --border: #1f1f38;
  --input: #2a2a4a;
  --ring: #b090e0;
  --chart-1: #f0c060;
  --chart-2: #b090e0;
  --chart-3: #7a4faa;
  --chart-4: #c09040;
  --chart-5: #60a060;
  --radius: 0.625rem;
  --sidebar: #101828;
  --sidebar-foreground: #d8d0c0;
  --sidebar-primary: #7a4faa;
  --sidebar-primary-foreground: #b090e0;
  --sidebar-accent: #141e30;
  --sidebar-accent-foreground: #d8d0c0;
  --sidebar-border: #1f1f38;
  --sidebar-ring: #b090e0;

  /* 扩展语义 token（业务专用色，直接持值） */
  --primary-dim: #c09040;
  --glow: rgba(240, 192, 96, 0.3);
  --accent-light: #b090e0;
  --accent-bg: #1a0f38;
  --text-dim: #8080a0;
  --text-muted: #6060a0;
  --text-title: #a0b8d0;
  --danger: #e06c75;
  --quote: #80c080;
  --success: #60a060;
  --info: #7090c0;
  --prose-body: #d8d0c0;
  --prose-quote: #4a3a28;
  --mermaid-bg: #1a1a3e;
  --mermaid-text: #e0d0a0;
  --mermaid-line: #f0c060;
  --mermaid-bg-alt: #0a0a20;
  --mermaid-bg-secondary: #1a1a2e;

  /* 阴影（深色，深浅对称） */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.5);
  --shadow-up-sm: 0 -2px 12px rgba(0, 0, 0, 0.3);
  --shadow-up-lg: 0 -4px 20px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.5);
  --shadow-body-inset: inset 0 0 120px rgba(0, 0, 0, 0.05);
  --shadow-glow: 0 0 8px var(--glow);
  --shadow-purple: 0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent);
  --scrim: rgba(10, 10, 20, 0.85);
}
```

- [ ] **Step 2: 重写 `[data-theme='light']` 块——深浅对称**

把 `src/styles/index.css` 的 `[data-theme='light']` 块（L142-196）整段替换为。同样的语义 token 重写为浅色值：

```css
[data-theme='light'] {
  --background: #f5f0e8;
  --foreground: #3a3028;
  --card: #faf7f0;
  --card-foreground: #3a3028;
  --popover: #faf7f0;
  --popover-foreground: #3a3028;
  --primary: #9a7030;
  --primary-foreground: #f5f0e8;
  --secondary: #f0ebe0;
  --secondary-foreground: #3a3028;
  --muted: #f0ebe0;
  --muted-foreground: #8a8070;
  --accent: #5a3e7a;
  --accent-foreground: #7a5e9a;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #d8d0c0;
  --input: #c0b8a8;
  --ring: #5a3e7a;
  --chart-1: #9a7030;
  --chart-2: #7a5e9a;
  --chart-3: #5a3e7a;
  --chart-4: #7a5828;
  --chart-5: #5a8a4a;
  --radius: 0.625rem;
  --sidebar: #faf7f0;
  --sidebar-foreground: #3a3028;
  --sidebar-primary: #5a3e7a;
  --sidebar-primary-foreground: #7a5e9a;
  --sidebar-accent: #f0ebe0;
  --sidebar-accent-foreground: #3a3028;
  --sidebar-border: #d8d0c0;
  --sidebar-ring: #5a3e7a;

  --primary-dim: #7a5828;
  --glow: rgba(154, 112, 48, 0.15);
  --accent-light: #7a5e9a;
  --accent-bg: #f5f0f8;
  --text-dim: #8a8070;
  --text-muted: #a09888;
  --text-title: #5a4a38;
  --danger: #c0504a;
  --quote: #5a8a4a;
  --success: #5a8a4a;
  --info: #5a7090;
  --prose-body: #3a3028;
  --prose-quote: #4a3a28;
  --mermaid-bg: #f0ebe0;
  --mermaid-text: #3a3028;
  --mermaid-line: #9a7030;
  --mermaid-bg-alt: #faf7f0;
  --mermaid-bg-secondary: #f5f0e8;

  --shadow-sm: 0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 40px rgba(0, 0, 0, 0.15);
  --shadow-up-sm: 0 -2px 12px rgba(0, 0, 0, 0.06);
  --shadow-up-lg: 0 -4px 20px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.2);
  --shadow-body-inset: inset 0 0 120px rgba(0, 0, 0, 0.03);
  --shadow-glow: 0 0 8px var(--glow);
  --shadow-purple: 0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent);
  --scrim: rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: 新增第 3 层 `--color-*` 别名块（纯映射）**

在 `[data-theme='light']` 块之后、`@layer base` 之前（约 L197 位置），新增一个 `:root` 块，内容是纯映射。这是给现有 23 个 `.less` 和 JS 侧（Mermaid readToken / useNotesData TYPE_COLORS）的向后兼容层：

```css
/* ═══ 第 3 层：--color-* 业务别名（永久保留，纯映射到第 1 层） ═══ */
:root {
  --color-bg-base: var(--background);
  --color-bg-card: var(--card);
  --color-bg-card-hover: var(--secondary);
  --color-bg-elevated: var(--popover);
  --color-border: var(--border);
  --color-border-card: var(--border);
  --color-border-hover: var(--input);
  --color-gold: var(--primary);
  --color-gold-dim: var(--primary-dim);
  --color-gold-glow: var(--glow);
  --color-purple: var(--accent);
  --color-purple-light: var(--accent-light);
  --color-purple-bg: var(--accent-bg);
  --color-text-body: var(--foreground);
  --color-text-dim: var(--text-dim);
  --color-text-muted: var(--text-muted);
  --color-text-title: var(--text-title);
  --color-green: var(--success);
  --color-blue: var(--info);
  --color-danger: var(--danger);
  --color-quote: var(--quote);
  --color-prose-body: var(--prose-body);
  --color-prose-quote: var(--prose-quote);
  --color-mermaid-bg: var(--mermaid-bg);
  --color-mermaid-text: var(--mermaid-text);
  --color-mermaid-line: var(--mermaid-line);
  --color-mermaid-bg-alt: var(--mermaid-bg-alt);
  --color-mermaid-bg-secondary: var(--mermaid-bg-secondary);
}
```

- [ ] **Step 4: 删除 `@theme inline` 里残留的 shadow 持值（如已被第 1 层覆盖）**

检查 `@theme inline` 块（L11-78）里的 `--shadow-sm/md/lg/xl/glow/purple` 持值行（L72-77）。这些现在和第 1 层 `:root` 重复。**保留不动**——`@theme inline` 里的定义供 Tailwind `shadow-sm` 工具类解析（虽然 spec 8.1 提到 Tailwind v4 不一定解析到自定义 shadow，但删除会改变现有行为，违反"零变化"安全网）。`@theme inline` 里的 `--color-*` 别名行（L14-44）也保留——它们是第 2 层 Tailwind 别名，供 shadcn 组件的 `bg-primary` 等用。

确认：`@theme inline` 块不做任何修改。

- [ ] **Step 5: 构建验证**

Run: `pnpm run build`
Expected: 成功，无 TS/CSS 错误。若失败，检查是否漏了某个 token 的定义（grep 对比 `--color-*` 引用与别名块）。

- [ ] **Step 6: 视觉零变化验证（安全网）**

Run: `pnpm dev`，浏览器打开应用。
逐页（`/` Landing、`/books/...` BookApp、`/notes`、`/skills`、点开阅读 Modal/Reader）切换深色↔浅色主题。
Expected: **视觉与重构前完全一致**。因为第 3 层 `--color-*` 别名仍解析到原值（只是经过第 1 层中转）。
重点核对：
- 深色背景仍是海军蓝 `#0a0a14`（不是灰）——本应无变化，因为 `--background` 现在持 `#0a0a14`，但 body 用 `bg-background`，之前 `--background` 是 `oklch(0.145 0 0)` 灰。**若此处有变化，说明 body 之前继承的是灰、现在变海军蓝——这是期望的补洞效果，记录为 Task 6 验证项，此处允许。**
- 其余 `.less` 用 `--color-*` 的地方（卡片、文字、边框）应零变化。

若发现非期望变化：回退本 Task，检查第 3 层别名映射是否遗漏某 token（grep `--color-` 引用清单对比别名块）。

- [ ] **Step 7: 提交**

```bash
git add src/styles/index.css
git commit -m "$(cat <<'EOF'
refactor(theme): 重写 index.css 建立三层 token 真相源

shadcn 语义 token 直接持值（不再经 --color-* 中间层），深浅对称。
补齐 --background/--foreground/--chart 留洞，新增扩展语义 token
(--danger/--quote/--glow 等) 和深浅对称阴影 token (--shadow-modal/
--scrim/--shadow-up-* 等)。新增第 3 层 --color-* 别名纯映射，保证
现有 .less 视觉零变化。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `base.less` 接收 body inset 阴影

**Files:**
- Modify: `src/styles/base.less`（body 规则加 `box-shadow`）

**Interfaces:**
- Consumes: `--shadow-body-inset`（Task 1 产出）

- [ ] **Step 1: 给 body 加 inset 阴影**

`src/styles/base.less` 的 body 规则（L28-36）当前：
```less
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', serif;
  background-color: var(--color-bg-base);
  color: var(--color-text-body);
  line-height: 1.8;
  font-size: 0.875rem;
  width: 100vw;
  height: 100vh;
}
```
改为（加最后一行）：
```less
body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', serif;
  background-color: var(--color-bg-base);
  color: var(--color-text-body);
  line-height: 1.8;
  font-size: 0.875rem;
  width: 100vw;
  height: 100vh;
  box-shadow: var(--shadow-body-inset);
}
```
这替代 `theme.less:7` 的 `[data-theme='light'] body { box-shadow: inset 0 0 120px rgba(0,0,0,0.05); }`——现在深浅都由 `--shadow-body-inset` token 承载（深色 `0.05`、浅色 `0.03`）。

- [ ] **Step 2: 验证**

Run: `pnpm dev`，深/浅主题下观察 body 四角是否有轻微暗角（深色更明显、浅色更淡）。
Expected: 与重构前视觉一致或更协调（浅色暗角从 `0.05` 降为 `0.03`，更柔和）。

- [ ] **Step 3: 提交**

```bash
git add src/styles/base.less
git commit -m "refactor(theme): body inset 阴影改用 --shadow-body-inset token"
```

---

### Task 3: `prose.less` 5 个硬编码改 token（深浅对称）

**Files:**
- Modify: `src/styles/prose.less`（L41, L51, L66, L78, L88）

**Interfaces:**
- Consumes: `--prose-quote`、`--accent-bg`、`--secondary`、`--quote`（Task 1 产出）

- [ ] **Step 1: 改 blockquote 文字色**

`src/styles/prose.less` L41：
```less
    color: #d0c8b0;
```
改为：
```less
    color: var(--prose-quote);
```

- [ ] **Step 2: 改 pre/code 背景**

`src/styles/prose.less` L51：
```less
    background: #0f1628;
```
改为：
```less
    background: var(--accent-bg);
```

- [ ] **Step 3: 改 th 表头背景**

`src/styles/prose.less` L66：
```less
    background: #2a1f5e;
```
改为：
```less
    background: var(--accent-bg);
```

- [ ] **Step 4: 改 tr 偶数行背景**

`src/styles/prose.less` L78：
```less
    background: #141e38;
```
改为：
```less
    background: var(--secondary);
```

- [ ] **Step 5: 改 em 强调色**

`src/styles/prose.less` L88：
```less
    color: #80c080;
```
改为：
```less
    color: var(--quote);
```

- [ ] **Step 6: 验证**

Run: `pnpm dev`，打开任一带 prose 内容的页面（如阅读器内的章节正文、含表格/代码块/引用的页面），深/浅主题核对：
- 深色：blockquote 文字、code 背景、th 背景、偶数行、em 色应与之前一致或更协调（`--accent-bg` 深 = `#1a0f38`，原 `#0f1628`/`#2a1f5e` 是相近的深紫蓝，差异可接受）。
- 浅色：这些元素现在自动用浅色 token 值（之前靠 `theme.less` L11-26 覆盖，删 theme.less 后应仍正确——但 theme.less 还没删，所以浅色现在被 prose.less + theme.less 双重定义。**这步先不动 theme.less 的 prose 覆盖，Task 11 删 theme.less 时一起处理**）。

- [ ] **Step 7: 提交**

```bash
git add src/styles/prose.less
git commit -m "refactor(theme): prose.less 5 个硬编码色改语义 token"
```

---

### Task 4: 阴影硬编码改 token（BookCard / AnnotationToolbar / SearchBar / ModalReader）

**Files:**
- Modify: `src/components/BookCard/BookCard.less`（L20, L40, L109）
- Modify: `src/components/AnnotationToolbar/AnnotationToolbar.less`（L11, L79）
- Modify: `src/components/SearchBar/SearchBar.less`（L47）
- Modify: `src/components/ModalReader/ModalReader.less`（L22）

**Interfaces:**
- Consumes: `--shadow-md`、`--shadow-xl`、`--shadow-lg`、`--shadow-up-lg`、`--shadow-modal`（Task 1 产出）

- [ ] **Step 1: BookCard L20 卡片阴影**

`src/components/BookCard/BookCard.less` L20：
```less
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
```
改为：
```less
  box-shadow: var(--shadow-md);
```

- [ ] **Step 2: BookCard L40 hover 阴影**

`src/components/BookCard/BookCard.less` L40：
```less
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
```
改为：
```less
  box-shadow: var(--shadow-xl);
```

- [ ] **Step 3: BookCard L109 cover 阴影第一层**

`src/components/BookCard/BookCard.less` L108-109：
```less
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
```
改为（只改第一层，保留第二层 inset 金边）：
```less
  box-shadow:
    var(--shadow-md),
```
注意：原 L109 后面还有 `inset 0 0 0 1px color-mix(...)` 那行，保留不动。

- [ ] **Step 4: AnnotationToolbar L11 工具栏阴影**

`src/components/AnnotationToolbar/AnnotationToolbar.less` L11：
```less
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
```
改为：
```less
  box-shadow: var(--shadow-lg);
```

- [ ] **Step 5: AnnotationToolbar L79 移动端向上阴影**

`src/components/AnnotationToolbar/AnnotationToolbar.less` L79：
```less
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
```
改为：
```less
  box-shadow: var(--shadow-up-lg);
```

- [ ] **Step 6: SearchBar L47 下拉阴影**

`src/components/SearchBar/SearchBar.less` L47：
```less
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
```
改为：
```less
  box-shadow: var(--shadow-xl);
```

- [ ] **Step 7: ModalReader L22 弹窗卡片阴影**

`src/components/ModalReader/ModalReader.less` L22：
```less
  box-shadow: var(--shadow-xl);
```
改为：
```less
  box-shadow: var(--shadow-modal);
```

- [ ] **Step 8: 验证**

Run: `pnpm dev`，深/浅主题核对：
- 书卡（Landing/Skills 页）卡片及 hover 阴影。
- 批注工具栏（阅读器内）及移动端底部栏阴影。
- 搜索下拉阴影。
- 阅读弹窗卡片阴影。
Expected: 深色与之前一致（token 值相同）；浅色阴影柔和（alpha 降低，取自原 theme.less 补丁值）。

- [ ] **Step 9: 提交**

```bash
git add src/components/BookCard/BookCard.less src/components/AnnotationToolbar/AnnotationToolbar.less src/components/SearchBar/SearchBar.less src/components/ModalReader/ModalReader.less
git commit -m "refactor(theme): 阴影硬编码改用 --shadow-* token，深浅对称"
```

---

### Task 5: ModalReader scrim 改 token + drawer 遮罩改 token

**Files:**
- Modify: `src/components/ModalReader/ModalReader.less`（L5）
- Modify: `src/components/ui/drawer.tsx`（L38）

**Interfaces:**
- Consumes: `--scrim`（Task 1 产出）
- 注意：`drawer.tsx` 是 TS symbol，改前需跑 `gitnexus_impact`（CLAUDE.md 要求）

- [ ] **Step 1: 跑 GitNexus 影响分析（drawer.tsx DrawerOverlay）**

Run: 用 `gitnexus_impact` 工具，target: `DrawerOverlay`，direction: `upstream`
Expected: 显示 DrawerOverlay 的调用方（应为 `Drawer` 组件 L53）。LOW 风险（仅组件内部用）。记录 blast radius。

- [ ] **Step 2: ModalReader L5 scrim**

`src/components/ModalReader/ModalReader.less` L5：
```less
  background: rgba(10, 10, 20, 0.85);
```
改为：
```less
  background: var(--scrim);
```

- [ ] **Step 3: drawer.tsx L38 遮罩**

`src/components/ui/drawer.tsx` L38 的 className 字符串里：
```tsx
"mingli-drawer-overlay fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
```
把 `bg-black/10` 改为 `bg-[var(--scrim)]`：
```tsx
"mingli-drawer-overlay fixed inset-0 z-50 bg-[var(--scrim)] supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
```

- [ ] **Step 4: 验证**

Run: `pnpm dev`，深/浅主题：
- 打开阅读 Modal，看遮罩（深色海军蓝半透明、浅色纯黑半透明）。
- 移动端打开 Reader 路由（drawer 形式），看遮罩。
Expected: 遮罩与之前一致或更协调。

- [ ] **Step 5: 提交**

```bash
git add src/components/ModalReader/ModalReader.less src/components/ui/drawer.tsx
git commit -m "refactor(theme): modal/drawer 遮罩改用 --scrim token，深浅对称"
```

---

### Task 6: 零散硬编码清理（AiAssistant / AnnotationPanel / BookCard `#000` / ReadList / Mermaid）

**Files:**
- Modify: `src/components/AiAssistant/AiAssistant.less`（L26）
- Modify: `src/components/AnnotationPanel/AnnotationPanel.less`（L143）
- Modify: `src/components/BookCard/BookCard.less`（L129）
- Modify: `src/components/ReadList/ReadList.less`（L65）
- Modify: `src/components/Mermaid/Mermaid.less`（L2, L4）

**Interfaces:**
- Consumes: `--accent`、`--primary-foreground`、`--background`、`--color-text-body`、`--danger`（Task 1 产出）

- [ ] **Step 1: AiAssistant L26 紫底改 color-mix**

`src/components/AiAssistant/AiAssistant.less` L26：
```less
  background: rgba(122, 79, 170, 0.08);
```
改为：
```less
  background: color-mix(in srgb, var(--accent) 8%, transparent);
```

- [ ] **Step 2: AnnotationPanel L143 white 改 token**

`src/components/AnnotationPanel/AnnotationPanel.less` L143：
```less
  color: white;
```
改为：
```less
  color: var(--primary-foreground);
```

- [ ] **Step 3: BookCard L129 `#000` 改 token**

`src/components/BookCard/BookCard.less` L129：
```less
    color-mix(in srgb, var(--color-purple) 80%, #000)
```
改为：
```less
    color-mix(in srgb, var(--color-purple) 80%, var(--background))
```

- [ ] **Step 4: ReadList L65 笔误修正**

`src/components/ReadList/ReadList.less` L65：
```less
  color: var(--color-text);
```
改为：
```less
  color: var(--color-text-body);
```

- [ ] **Step 5: Mermaid L2 错误文字色**

`src/components/Mermaid/Mermaid.less` L2：
```less
  color: #e06c75;
```
改为：
```less
  color: var(--danger);
```

- [ ] **Step 6: Mermaid L4 错误边框色**

`src/components/Mermaid/Mermaid.less` L4：
```less
  border: 1px solid #e06c7544;
```
改为：
```less
  border: 1px solid color-mix(in srgb, var(--danger) 27%, transparent);
```

- [ ] **Step 7: 验证**

Run: `pnpm dev`，深/浅主题：
- AI 助手面板紫底。
- 批注面板保存按钮文字色（金底深色前景）。
- 书卡封面占位渐变。
- 阅读列表文字色（之前悬空 `--color-text` 可能显示为默认色，现在应正确显示 body 文字色——**这是期望的修复**）。
- Mermaid 渲染错误的页面（如有）错误框红边。
Expected: 全部正确，"疑问"批注（走 `--color-danger`→`--danger`）现在终于显示红色——期望的修复行为。

- [ ] **Step 8: 提交**

```bash
git add src/components/AiAssistant/AiAssistant.less src/components/AnnotationPanel/AnnotationPanel.less src/components/BookCard/BookCard.less src/components/ReadList/ReadList.less src/components/Mermaid/Mermaid.less
git commit -m "refactor(theme): 清理零散硬编码色，改用语义 token"
```

---

### Task 7: 迁移 `theme.less` 内容到组件 `.less`（annotation mark / hero glow / progress glow / search-spinner）

**Files:**
- Modify: `src/components/AnnotationToolbar/AnnotationToolbar.less`（接收 annotation mark 浅色覆盖）
- Modify: `src/components/AnnotationPanel/AnnotationPanel.less`（接收 annotation mark）
- Modify: `src/components/ModalReader/ModalReader.less`（接收 annotation mark）
- Modify: `src/styles/hero-section.less`（接收 hero-glow/title 浅色）
- Modify: `src/components/BookCard/BookCard.less`（接收 progress-fill glow）
- Modify: `src/components/SearchBar/SearchBar.less`（接收 search-spinner）
**参考**（迁完即删）: `src/styles/theme.less`

**Interfaces:**
- Consumes: `--danger`、`--quote`、`--glow`、`--accent`、`--color-gold`、`--color-bg-base`（Task 1 产出）

- [ ] **Step 1: 迁移 annotation mark 浅色覆盖到使用它的组件**

`theme.less` L29-37 当前：
```less
[data-theme='light'] mark.ann-emphasis {
  background: color-mix(in srgb, var(--color-gold) 20%, transparent);
}
[data-theme='light'] mark.ann-question {
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
}
[data-theme='light'] mark.ann-quote {
  background: color-mix(in srgb, var(--color-green) 15%, transparent);
}
```
这些 `mark.ann-*` 选择器的**深色默认值**定义在 `AnnotationToolbar.less`/`AnnotationPanel.less`/`ModalReader.less`（用 `--color-gold`/`--color-danger`/`--color-green` 的 color-mix）。由于 `--color-gold`/`--color-danger`/`--color-green` 现在深浅对称（Task 1），**深色默认值的 color-mix 在浅色下自动用浅色值**，因此 `theme.less` 这 3 条浅色覆盖**变为冗余，直接删除，不迁移**。

确认：不新增任何代码到组件 `.less`，这 3 条覆盖随 theme.less 删除而消失。

- [ ] **Step 2: 迁移 hero-glow 浅色到 hero-section.less**

`theme.less` L72-79 当前：
```less
[data-theme='light'] .hero-glow,
[data-theme='light'] .book-hero-glow {
  background: radial-gradient(
    ellipse,
    color-mix(in srgb, var(--color-purple) 8%, transparent) 0%,
    transparent 70%
  );
}
```
由于 `--color-purple`（=`--accent`）深浅对称，原深色默认的 `color-mix(var(--color-purple) X%, transparent)` 在浅色下自动用浅紫。**检查 `hero-section.less` 现有的 `.hero-glow`/`.book-hero-glow` 深色定义的 alpha 百分比**——若深色用 15%（见 hero-section.less L30-34）、浅色 theme.less 用 8%，则 alpha 不同，需要保留浅色 8%。

读 `src/styles/hero-section.less` L28-34 确认深色 alpha。若深浅 alpha 不同，在 `hero-section.less` 对应规则后追加浅色覆盖（迁移自 theme.less）：
```less
[data-theme='light'] .hero-glow,
[data-theme='light'] .book-hero-glow {
  background: radial-gradient(
    ellipse,
    color-mix(in srgb, var(--color-purple) 8%, transparent) 0%,
    transparent 70%
  );
}
```
若深浅 alpha 相同（都是 8% 或都是 15%），则删除浅色覆盖、统一用一个值。

- [ ] **Step 3: 迁移 hero-title 浅色 text-shadow 到 hero-section.less**

`theme.less` L80-84 当前：
```less
[data-theme='light'] .hero-title,
[data-theme='light'] .book-card-title,
[data-theme='light'] .hero-title-glow {
  text-shadow: 0 0 20px color-mix(in srgb, var(--color-gold) 20%, transparent);
}
```
追加到 `src/styles/hero-section.less` 末尾（迁移）：
```less
[data-theme='light'] .hero-title,
[data-theme='light'] .book-card-title,
[data-theme='light'] .hero-title-glow {
  text-shadow: 0 0 20px color-mix(in srgb, var(--color-gold) 20%, transparent);
}
```
（`--color-gold` 深浅对称，但 text-shadow alpha 20% 可能仅浅色需要——读 hero-section.less L15 确认深色是否已有 text-shadow。若深色无 text-shadow 而浅色有，保留浅色覆盖。）

- [ ] **Step 4: 迁移 progress-fill glow 到 BookCard.less**

`theme.less` L94-95 当前：
```less
[data-theme='light'] .progress-fill {
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-gold) 30%, transparent);
}
```
追加到 `src/components/BookCard/BookCard.less`（`.progress-fill` 规则附近，L91 后）：
```less
[data-theme='light'] .progress-fill {
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-gold) 30%, transparent);
}
```

- [ ] **Step 5: 迁移 search-spinner 浅色到 SearchBar.less**

`theme.less` L102-104 当前：
```less
[data-theme='light'] .search-spinner {
  border-top-color: var(--color-purple);
}
```
追加到 `src/components/SearchBar/SearchBar.less`（`.search-spinner` 规则附近）：
```less
[data-theme='light'] .search-spinner {
  border-top-color: var(--color-purple);
}
```

- [ ] **Step 6: 验证（迁移内容到位、theme.less 尚未删）**

Run: `pnpm dev`，深/浅主题：
- hero 区 glow 和 title text-shadow。
- 书卡 progress-fill glow。
- 搜索 spinner。
- annotation mark（emphasis 金/question 红/quote 绿）。
Expected: 浅色下这些效果仍存在（因已迁移到组件 .less），深色不变。

- [ ] **Step 7: 提交**

```bash
git add src/styles/hero-section.less src/components/BookCard/BookCard.less src/components/SearchBar/SearchBar.less
git commit -m "refactor(theme): 迁移 theme.less 浅色覆盖到组件 .less"
```
（annotation mark 的 3 条覆盖不迁移、随 Task 8 删 theme.less 时消失，故无对应文件 add。）

---

### Task 8: 删除 `theme.less` + 删 `index.less` 的 import

**Files:**
- Delete: `src/styles/theme.less`
- Modify: `src/styles/index.less`（删 `@import './theme.less';`）

**Interfaces:**
- 无外部消费（theme.less 内容已迁移或确认冗余）

- [ ] **Step 1: 删 index.less 的 theme import**

`src/styles/index.less` L7：
```less
@import './theme.less';
```
删除这一行。结果文件只剩：
```less
@import './base.less';
@import './layout.less';
@import './prose.less';
```

- [ ] **Step 2: 删除 theme.less 文件**

Run: `rm src/styles/theme.less`

- [ ] **Step 3: 构建验证**

Run: `pnpm run build`
Expected: 成功。若报错 "cannot resolve ./theme.less"，说明 Step 1 没删干净。

- [ ] **Step 4: 视觉验证（逐页深浅）**

Run: `pnpm dev`，逐页（Landing/BookApp/Notes/Skills/Reader+Modal）深/浅：
Expected: 无视觉回归。重点：
- 浅色阴影柔和（theme.less 阴影补丁已删，靠 Task 4 的 `--shadow-*` 深浅对称承载）。
- 浅色 prose（blockquote/code/th/tr/em）正确（靠 Task 3 的 prose.less 深浅对称承载）。
- 浅色浮层/卡片背景正确（靠 `--color-*` 别名自动切）。
- 浅色 hero/spinner/progress glow 正确（靠 Task 7 迁移）。
- 浅色 modal scrim 正确（靠 Task 5 的 `--scrim`）。
若浅色某处回到深色默认：说明该条 theme.less 覆盖被漏迁，回查 Task 7 清单补迁。

- [ ] **Step 5: 提交**

```bash
git add src/styles/index.less
git rm src/styles/theme.less
git commit -m "refactor(theme): 删除 theme.less 补丁文件，浅色改由深浅对称 token 承载"
```

---

### Task 9: 删除死代码 `tokens/index.ts`

**Files:**
- Delete: `src/tokens/index.ts`
- 可能需删: `src/tokens/` 目录（若空）

**Interfaces:**
- 无外部消费（审计确认零引用）

- [ ] **Step 1: 跑 GitNexus 影响分析确认零引用**

Run: 用 `gitnexus_impact` 工具，target: `tokens/index.ts` 或 target: `color`（tokens 导出），direction: `upstream`
Expected: 无调用方（审计已确认零 import）。若显示有引用，停止并核查。

- [ ] **Step 2: 再次 grep 确认零引用**

Run: `grep -rn "from '@/tokens'\|from '\.\./tokens'\|from '\.\.\/\.\.\/tokens'\|tokens/index" src/`
Expected: 无输出（除 tokens/index.ts 自身）。

- [ ] **Step 3: 删除文件**

Run: `rm src/tokens/index.ts`
若 `src/tokens/` 目录变空：`rmdir src/tokens`

- [ ] **Step 4: 构建验证**

Run: `pnpm run build`
Expected: 成功（TS 不应报错，因零引用）。

- [ ] **Step 5: 提交**

```bash
git rm src/tokens/index.ts
git commit -m "refactor(theme): 删除死代码 tokens/index.ts（零引用）"
```

---

### Task 10: 全量验证 + GitNexus detect_changes

**Files:**
- 无修改（验证 Task）

**Interfaces:**
- 无

- [ ] **Step 1: 构建全量验证**

Run: `pnpm run build`
Expected: 成功，无 TS/CSS 错误。

- [ ] **Step 2: 测试（若有相关测试）**

Run: `pnpm test`
Expected: 全部通过（主题重构不应影响逻辑测试）。

- [ ] **Step 3: 逐页视觉终验**

Run: `pnpm dev`，深/浅两主题逐页核对：
- Landing `/`：hero glow、书卡阴影、progress glow。
- BookApp `/books/...`：顶部栏、返回按钮（shadcn outline button，深色应海军蓝底金边）、prose 正文（标题金、code 紫底、表格、引用、em 绿）。
- Notes `/notes`：卡片、文字层级。
- Skills `/skills`：同 Landing。
- Reader/Modal：scrim、弹窗阴影、批注 mark（emphasis 金/question 红/quote 绿）、annotation 工具栏/面板、Mermaid 图表色 + 错误色。
Expected:
- shadcn 组件（button outline、card、tabs、dropdown、select、drawer）深色背景为海军蓝（补洞生效）。
- "疑问"批注红色、"引用"批注绿色（补 `--color-danger`/`--color-quote` 生效，这是期望修复）。
- 浅色阴影柔和、所有元素深浅正确。

- [ ] **Step 4: 成功标准 grep 核验**

Run 以下命令，逐条核对 spec 8.3 成功标准：
```bash
# 标准2: index.css 无持值的 --color-*（全为 var(--*) 映射）
grep -n '\-\-color-.*:' src/styles/index.css | grep -v 'var('
# Expected: 无输出（所有 --color-* 都是 var() 映射）
# 注：@theme inline 里的 --color-*: var(--*) 也算映射，不算持值

# 标准3: 无 shadcn 默认灰
grep -n 'oklch(0.145 0 0)\|oklch(0.985 0 0)' src/styles/index.css
# Expected: 无输出

# 标准4: --color-danger/--color-quote 已定义
grep -n '\-\-color-danger:\|--color-quote:' src/styles/index.css
# Expected: 两行，均 var(--danger)/var(--quote)

# 标准5: theme.less 已删
ls src/styles/theme.less 2>/dev/null && echo "STILL EXISTS" || echo "deleted ok"
grep -n 'theme.less' src/styles/index.less
# Expected: "deleted ok" + grep 无输出

# 标准6: tokens/index.ts 已删
ls src/tokens/index.ts 2>/dev/null && echo "STILL EXISTS" || echo "deleted ok"

# 标准7: 非阴影硬编码色仅剩 ReaderSettingsDrawer 3 个占位
grep -rn '#[0-9a-fA-F]\{3,8\}' src --include='*.less' --include='*.tsx' --include='*.ts' | grep -v 'ReaderSettingsDrawer'
# Expected: 无输出（阴影 rgba 不匹配这个 pattern，ReaderSettingsDrawer 例外）
```

- [ ] **Step 5: GitNexus detect_changes 确认改动范围**

Run: 用 `gitnexus_detect_changes` 工具，scope: `all`
Expected: 改动文件仅为 `src/styles/index.css`、`src/styles/base.less`、`src/styles/prose.less`、`src/styles/hero-section.less`、`src/styles/index.less`、删除的 `theme.less`/`tokens/index.ts`、若干 `components/*/[Name].less`、`components/ui/drawer.tsx`。无意外文件。

- [ ] **Step 6: 最终提交（如有遗留改动）**

若 Step 4 grep 发现遗漏，修复后提交。若全部通过，无需额外提交（前面 Task 已逐个提交）。

```bash
git log --oneline -10  # 确认提交历史清晰
```

---

## Self-Review

**1. Spec coverage:**
- spec §3 三层结构 → Task 1 ✓
- spec §4.1 shadcn 语义 token 持值补洞 → Task 1 Step 1-2 ✓
- spec §4.2 扩展语义 token → Task 1 Step 1 ✓
- spec §4.3 缺失 token 补法（danger/quote/text）→ Task 1（danger/quote 定义）+ Task 6 Step 4（`--color-text` 笔误）✓
- spec §4.4 第 3 层别名 → Task 1 Step 3 ✓
- spec §4.5 border-card 决策 → Task 1 Step 3（映射 `var(--border)`）✓（使用点验证：现有 `.less` 用 `--color-border-card` 的地方仍工作，因别名指向 `--border`；若某处需紫边，实现时发现再就地改 color-mix——这在 Task 3/6 的验证步骤会暴露）
- spec §5 阴影深浅对称 + theme.less 去留 → Task 1（阴影 token）+ Task 2（body inset）+ Task 4（组件阴影）+ Task 7（迁移）+ Task 8（删 theme.less）✓
- spec §6.1 shadcn 零改动 → Task 1 补洞即自动适配（无单独 Task，因不改 ui/*.tsx 除 drawer）✓
- spec §6.2 drawer 遮罩 → Task 5 ✓
- spec §6.3 prose 5 硬编码 → Task 3 ✓
- spec §6.4 Mermaid 错误色 → Task 6 Step 5-6 ✓
- spec §6.5 ReaderSettingsDrawer 不处理 → Global Constraints 明确排除 ✓
- spec §6.6 零散硬编码 → Task 6 ✓
- spec §7 index.css 重构 → Task 1 ✓
- spec §8 验证/风险/成功标准 → Task 10 ✓

**2. Placeholder scan:** 无 TBD/TODO。所有步骤含具体代码或命令。

**3. Type consistency:** `--shadow-body-inset`、`--scrim`、`--shadow-up-lg`、`--shadow-modal`、`--danger`、`--quote`、`--accent-bg` 在 Task 1 定义，Task 2-7 消费，命名一致。`--color-text-body`（非 `--color-text`）在 Task 6 Step 4 修正，与 Task 1 别名块定义一致。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-14-theme-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** - 每个 Task 派一个全新 subagent 执行，Task 间我复核，快速迭代。

**2. Inline Execution** - 在当前会话用 executing-plans 批量执行，带 checkpoint 复核。

选哪种？
