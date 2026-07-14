# 主题系统重设计（推倒重来）

- **日期**：2026-07-14
- **范围**：`src/styles/index.css`、`src/styles/theme.less`、`src/tokens/index.ts` 及全 `src` 下组件/页面的颜色/背景/阴影/边框来源
- **方案**：A —— shadcn 语义 token 为单一真相源，深浅对称，保留 `--color-*` 别名层向后兼容
- **是否改配色**：否。金/紫/深海军蓝/宣纸全部保留，只重构结构

---

## 1. 背景与问题诊断

### 1.1 现状

代码已约 90% 使用 CSS 变量——全 `src` 仅 12 处非阴影硬编码颜色字面量、14 处 `rgba(0,0,0,*)` 阴影、shadcn 原子组件全部走语义 token。问题不在"没适配"，而在**架构上叠了三套并行 token 系统**，手动调一个颜色要跨三跳：

```
Tailwind 工具类 (bg-primary)
  → @theme 别名 (--color-primary)
    → shadcn 语义 token (--primary)
      → 自定义 token (--color-gold)
        → hex 值 (#f0c060)
```

### 1.2 核心痛点（已核实）

1. **三套变量并存**：shadcn 语义层（`--primary`/`--card`/`--border`…）、Tailwind `@theme` 别名（`--color-primary`…）、自定义业务 token（`--color-gold`/`--color-text-body`…）。所有 `.less` 只用第三套，所有 shadcn 组件只用前两套，靠 `index.css` 一行行 alias 拼接。

2. **深色是"默认"、浅色是"覆盖补丁"**：`:root` 写全量深色，`[data-theme='light']` 重写每个自定义 token，再 + `theme.less` 里 8 条手工阴影补丁（深色阴影 alpha 太重，浅色要单独调）。改一个浅色阴影要去 `theme.less` 翻组件选择器。

3. **shadcn 组件留洞**：`--background`/`--foreground` 仍是 shadcn 默认的 `oklch(0.145 0 0)` / `oklch(0.985 0 0)` 灰（不是海军蓝 `#0a0a14` / 暖白 `#d8d0c0`）；`--destructive`、`--chart-1..5` 全是默认值。

4. **隐藏 bug**：`--color-danger`、`--color-quote` 被引用 8+ 处（`theme.less` / `AnnotationToolbar` / `ModalReader` / `AnnotationPanel` / `useNotesData.ts`）但**从未定义**——"疑问"/"引用"批注配色实际失效。`--color-text`（应为 `--color-text-body`）在 `ReadList.less:65` 悬空。

5. **`src/tokens/index.ts` 是死代码**：导出 `color`/`shadow`/`radius` 对象，全项目零引用。阴影 token（`--shadow-*`）定义了但 Tailwind `shadow-sm` 工具类不解析到它们；两处阴影硬编码与定义的 token 完全重复。

### 1.3 目标

- 把三套并行 token 压成一套单一真相源，深浅对称。
- 补齐 shadcn 语义层留洞，让 shadcn 原子组件真正适配主题。
- 补齐缺失 token（`--color-danger`/`--color-quote`），修复失效批注配色。
- 删除死代码（`tokens/index.ts`）和补丁文件（`theme.less`）。
- 配色完全保留，只动结构。

---

## 2. 方案选择

### 2.1 候选方案

| 方案 | 单一真相源 | 是否改配色 | 代价 |
|---|---|---|---|
| **A（选定）** | shadcn 语义 token | 否 | 需新增扩展语义 token；保留 `--color-*` 别名层做向后兼容 |
| B | 自定义 `--color-*` | 否 | 改动更小，但保留两层结构（自定义层 + shadcn alias 层），从"彻底能手动调"目标看不彻底 |
| C | 任一架构 | 是 | 先定视觉方向再落地，工作量最大，需单独视觉设计阶段 |

### 2.2 选 A 的理由

1. 真正痛点是"无从下手"——根源是三套变量 + 浅色靠补丁。A 把它压成一套语义 token、深浅对称，改色从"翻三文件+一条补丁"变"改一文件一行"。
2. shadcn 组件已全走语义 token，A 让 `--background`/`--foreground` 不再是默认灰，**顺手修掉"shadcn 原子组件没适配"**——实为语义层留洞，补洞即修复。
3. 保留 `--color-*` 别名层做向后兼容，现有 23 个 `.less` 零改动即可工作，可分批迁移，风险可控。
4. 配色完全保留，只动结构——符合"手动调整无从下手"主诉。配色将来单独调时，在 A 的结构下调一行即见全局效果，反而更易试。

---

## 3. Token 层级与单一真相源结构

三层结构，仅第 1 层是真相源，后两层为映射：

```
index.css
┌─────────────────────────────────────────────────────────────┐
│ 第 1 层【真相源】shadcn 语义 token = 直接持有 hex/oklch 值      │
│   :root        --primary: #f0c060;  --card: #101828;          │
│                 --border: #1f1f38;  --foreground: #d8d0c0; …  │
│   [data-theme  --primary: #9a7030;  --card: #faf7f0;  …       │
│    ='light']   （深浅完全对称，同语义 token 重写值）            │
├─────────────────────────────────────────────────────────────┤
│ 第 2 层【Tailwind 别名】@theme inline                          │
│   --color-primary: var(--primary);  --color-card: var(--card) │
│   （仅给 shadcn 组件的 bg-primary 等工具类用，纯映射，不持值）  │
├─────────────────────────────────────────────────────────────┤
│ 第 3 层【业务别名/兼容层】--color-* 指向第 1 层               │
│   --color-gold: var(--primary);        ← 不再持值，别名        │
│   --color-text-body: var(--foreground);                       │
│   --color-bg-card: var(--card);  --color-border: var(--border)│
│   （让现有 23 个 .less 零改动即跑；Mermaid.tsx / useNotesData  │
│    等 JS 侧读 CSS 变量也继续工作）                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 关键决策

- **决策 1.1（已定）**：业务专用色（发光/prose/mermaid/状态色）作为**扩展语义 token 直接定义在第 1 层**，和 `--primary`/`--card` 同层、深浅对称。不单独放第四层（否则又回"两套真相源"）。
- **决策 1.2（已定）**：第 3 层 `--color-*` 别名层**永久保留**，作为业务侧稳定 API。Mermaid.tsx 的 `readToken` 和 useNotesData 的 `TYPE_COLORS` 等 JS 侧读 CSS 变量的地方零改动。

### 3.2 三层职责

| 层 | 职责 | 谁写它 |
|---|---|---|
| 第 1 层 语义 token | **唯一真相源**，直接持值，深浅对称重写 | 调色时只动这层 |
| 第 2 层 Tailwind 别名 | `@theme inline`，纯映射给 `bg-primary` 等工具类 | 不用动 |
| 第 3 层 `--color-*` 业务别名 | 永久稳定 API，指向第 1 层 | `.less` 和 JS 侧读它，基本不用动 |

---

## 4. 语义 token 清单

### 4.1 shadcn 语义 token（第 1 层，直接持值）

将现"语义层 alias 到 `--color-*` 中间层"的间接关系改为**直接持值**，并补齐留洞的 4 项。深浅对称。

| 语义 token | 深色值 | 浅色值 | 现状 |
|---|---|---|---|
| `--background` | `#0a0a14` | `#f5f0e8` | ✗ 原默认灰，补齐 |
| `--foreground` | `#d8d0c0` | `#3a3028` | ✗ 原默认灰，补齐 |
| `--card` / `--card-foreground` | `#101828` / `#d8d0c0` | `#faf7f0` / `#3a3028` | ✓ |
| `--popover` / `--popover-foreground` | `#101828` / `#d8d0c0` | `#faf7f0` / `#3a3028` | ✓ |
| `--primary` / `--primary-foreground` | `#f0c060` / `#0a0a14` | `#9a7030` / `#f5f0e8` | ✓ |
| `--secondary` / `--secondary-foreground` | `#141e30` / `#d8d0c0` | `#f0ebe0` / `#3a3028` | ✓ |
| `--muted` / `--muted-foreground` | `#141e30` / `#8080a0` | `#f0ebe0` / `#8a8070` | ✓ |
| `--accent` / `--accent-foreground` | `#7a4faa` / `#b090e0` | `#5a3e7a` / `#7a5e9a` | ✓ |
| `--destructive` | `oklch(0.704 0.191 22.216)` | `oklch(0.577 0.245 27.325)` | ✓ shadcn 默认红，保留 |
| `--border` | `#1f1f38` | `#d8d0c0` | ✓ |
| `--input` | `#2a2a4a` | `#c0b8a8` | ✓ |
| `--ring` | `#b090e0` | `#5a3e7a` | ✓ |
| `--chart-1..5` | 金紫色阶（`#f0c060`/`#b090e0`/`#7a4faa`/`#c09040`/`#60a060`） | 同步 | ✗ 原默认灰阶，补齐 |
| `--radius` | `0.625rem` | `0.625rem` | ✓ |
| `--sidebar*` | 沿用现状逻辑（值直接写） | 同步 | ✓ |

**关键变化**：`--background`/`--foreground` 从默认灰改为海军蓝/暖白——直接修掉"shadcn 组件没适配"（它们用 `bg-background`/`text-foreground`，补洞后显示主题色而非灰）。

### 4.2 扩展语义 token（第 1 层，业务专用色）

shadcn 无对应、项目需要的色。直接定义在第 1 层，深浅对称，命名**不带 `--color-` 前缀**（真相源，非别名）：

| 扩展语义 token | 深色 | 浅色 | 用途 | 现状来源 |
|---|---|---|---|---|
| `--primary-dim` | `#c09040` | `#7a5828` | 暗金（h3/h4 标题） | `--color-gold-dim` |
| `--glow` | `rgba(240,192,96,0.3)` | `rgba(154,112,48,0.15)` | 金色发光 | `--color-gold-glow` |
| `--accent-light` | `#b090e0` | `#7a5e9a` | 浅紫（作独立色） | `--color-purple-light` |
| `--accent-bg` | `#1a0f38` | `#f5f0f8` | 紫色块背景 | `--color-purple-bg` |
| `--text-dim` | `#8080a0` | `#8a8070` | 次要文字 | `--color-text-dim` |
| `--text-muted` | `#6060a0` | `#a09888` | 更弱文字 | `--color-text-muted` |
| `--text-title` | `#a0b8d0` | `#5a4a38` | 标题文字 | `--color-text-title` |
| `--danger` | `#e06c75` | `#c0504a` | 危险/疑问批注 | ✗ `--color-danger` 原未定义，新增 |
| `--quote` | `#80c080` | `#5a8a4a` | 引用批注 | ✗ `--color-quote` 原未定义，新增 |
| `--success` | `#60a060` | `#5a8a4a` | 成功状态 | `--color-green` |
| `--info` | `#7090c0` | `#5a7090` | 链接/信息 | `--color-blue` |
| `--prose-body` | `#d8d0c0` | `#3a3028` | 正文文字 | `--color-prose-body` |
| `--prose-quote` | `#4a3a28` | `#4a3a28` | 引文文字 | `--color-prose-quote` |
| `--mermaid-bg` 等 5 项 | 沿用 | 沿用 | mermaid 图表 | `--color-mermaid-*` |

### 4.3 缺失 token 补法

- **`--color-danger`** → 第 1 层新增 `--danger`（深 `#e06c75` / 浅 `#c0504a`），第 3 层别名 `--color-danger: var(--danger)`。One-Dark 红与 Mermaid 错误色统一，浅色降饱和。
- **`--color-quote`** → 第 1 层新增 `--quote`（深 `#80c080` / 浅 `#5a8a4a`），绿色系与"引用"语义一致（沿用 prose.less 的 em 色）。
- **`--color-text`**（`ReadList.less:65` 悬空）→ 笔误，直接改 `.less` 引用为 `--color-text-body`，不新增 token。

### 4.4 第 3 层别名层（永久保留）

现有 `--color-*` 全保留，从"持值"改为"指向第 1 层"。一对一映射，现有 23 个 `.less` 和 JS 侧零改动即工作：

```css
:root {
  --color-bg-base: var(--background);
  --color-bg-card: var(--card);
  --color-bg-card-hover: var(--secondary);
  --color-border: var(--border);
  --color-border-card: var(--border);   /* 见 4.5 注 */
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
  /* ... 其余 mermaid-* 别名同理 ... */
}
```

### 4.5 已定决策：`--color-border-card`

`--color-border-card` 现状深色 `#7a4faa66`（带紫半透明）、浅色 `#d0c8b8`（不透明灰）——深浅不对称、语义模糊。

**决定**：统一映射 `var(--border)`，与其他 border token 一致。实现时 grep 所有 `--color-border-card` 使用点（`BookCard.less`、`ReadList.less`、`Notes.less`、`SearchBar.less`、`prose.less` td 边框等），逐处验证：若某处确需"紫边"效果，在该处就地改用 `color-mix(in srgb, var(--accent), transparent)` 显式表达，而非依赖一个语义模糊的 token。验证结果记录在实现计划的对应步骤里。

---

## 5. 阴影与 `theme.less` 的处理

### 5.1 现状阴影问题

14 处硬编码 `rgba(0,0,0,*)` 阴影，三类：

| 类别 | 位置 | 问题 |
|---|---|---|
| A. 重复定义 | `AnnotationToolbar.less:11`（=`--shadow-lg`）、`SearchBar.less:47`（=`--shadow-xl`） | 定义 token 却没用，硬编码重复 |
| B. 深色默认阴影 | `BookCard.less:20,40,109`、`AnnotationToolbar.less:79` | 深色用 `rgba(0,0,0,0.2~0.5)`，无对应浅色版，浅色靠 theme.less 补丁 |
| C. 浅色补丁阴影 | `theme.less:7,44,47,55,60,63,67,100` 共 8 条 | 深色阴影 alpha 太重，浅色单独写一套低 alpha——theme.less 存在唯一原因 |

根因：**现有 `--shadow-sm/md/lg/xl` 只有一套值**（深色 alpha），浅色无法直接用，故 theme.less 给每个组件选择器重写阴影。

### 5.2 方案：阴影 token 深浅对称

```css
:root {
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.2);
  --shadow-md:  0 4px 16px rgba(0,0,0,0.3);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.4);
  --shadow-xl:  0 16px 40px rgba(0,0,0,0.5);
}
[data-theme='light'] {
  --shadow-sm:  0 2px 12px rgba(0,0,0,0.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl:  0 16px 40px rgba(0,0,0,0.15);
}
```

阴影深浅对称——组件写一次 `box-shadow: var(--shadow-lg)`，深浅自动切。浅色 alpha 取自原 theme.less 补丁值（已验证观感）。

### 5.3 特殊阴影处理

| 特殊阴影 | 现状 | 处理 |
|---|---|---|
| 向上阴影 `0 -4px 20px`（移动端工具栏） | `AnnotationToolbar.less:79`、`theme.less:100` | 新增 `--shadow-up-sm`/`--shadow-up-lg`，深浅对称 |
| inset 发光 `inset 0 0 120px rgba(0,0,0,0.05)` body | `theme.less:7` | 新增 `--shadow-body-inset`，深浅对称（浅色 `rgba(0,0,0,0.03)`） |
| modal 卡片大阴影 `0 20px 60px` | `theme.less:55` | 新增 `--shadow-modal`，深浅对称 |
| 金色发光 `0 0 8px var(--glow)` | `--shadow-glow` token 定义但 0 引用 | 保留 token，BookCard 等的 text/box-shadow 改用它 |
| 紫色发光 `0 4px 16px rgba(122,79,170,0.4)` | `--shadow-purple` | 保留，改 `color-mix(in srgb, var(--accent) 40%, transparent)`，浅色自动跟随 |
| modal scrim `rgba(10,10,20,0.85)` / `rgba(0,0,0,0.4)` | `ModalReader.less:5` + `theme.less:52` | 新增 `--scrim`，深浅对称 |

### 5.4 阴影 token 清单（完整，第 1 层）

| token | 用途 | 深浅对称 |
|---|---|---|
| `--shadow-sm/md/lg/xl` | 标准四档 elevation | ✓ 各一套 |
| `--shadow-up-sm`、`--shadow-up-lg` | 向上阴影 | ✓ 各一套 |
| `--shadow-modal` | modal 卡片大阴影 | ✓ |
| `--shadow-body-inset` | body inset 暗角 | ✓ |
| `--shadow-glow` | 金色发光 | ✓ 经 `--glow` 自动跟随 |
| `--shadow-purple` | 紫色发光 | ✓ 改 color-mix 后自动跟随 |
| `--scrim` | modal 遮罩 | ✓ |

### 5.5 `theme.less` 去留（逐条）

| theme.less 内容 | 去留 |
|---|---|
| L7 body inset 阴影 | 删 → `base.less` body 用 `var(--shadow-body-inset)` |
| L11-26 prose 浅色覆盖（th/pre/blockquote/tr） | 删 → `prose.less` 深浅对称后覆盖冗余 |
| L29-37 annotation 浅色覆盖（emphasis/question/quote mark） | 迁移 → 使用它的组件 `.less`，用 `color-mix(var(--danger)/var(--quote)...)`，深浅对称 |
| L40-43 浮层背景浅色覆盖 | 删 → 已走 `var(--color-bg-card)`，浅色自动切，冗余 |
| L44,47,55,60,63,67,100 阴影补丁（7 条） | 删 → 组件用 `var(--shadow-*)`，深浅自动切 |
| L52 modal scrim | 删 → ModalReader 用 `var(--scrim)` |
| L72-79 hero-glow 浅色 | 保留 → 迁到 `hero-section.less`，用 `color-mix(var(--accent) 8%, transparent)` 深浅表达 |
| L80-84 hero-title 浅色 text-shadow | 保留 → 迁到 `hero-section.less` |
| L87-91 top-actions 浅色 | 审查 → 删冗余一条 |
| L94-95 progress-fill 浅色 glow | 保留 → 迁到 `BookCard.less` |
| L99-100 mobile toolbar 阴影 | 删 → AnnotationToolbar 用 `var(--shadow-up-*)` |
| L102-104 search-spinner 浅色 | 迁移 → `SearchBar.less` |

**结论**：`theme.less` **整体删除**。内容三去向——删除（阴影补丁、prose 覆盖、冗余背景覆盖）/ 迁移到使用它的组件 `.less`（annotation mark、hero glow、progress glow、search-spinner）/ 删 `index.less` 里的 `@import './theme.less'`。实现时逐条验证每个"删"无视觉损失。

### 5.6 组件 `.less` 阴影迁移（14 处逐条）

| 位置 | 改成 |
|---|---|
| `AnnotationToolbar.less:11` | `var(--shadow-lg)` |
| `AnnotationToolbar.less:79` | `var(--shadow-up-lg)` |
| `SearchBar.less:47` | `var(--shadow-xl)` |
| `BookCard.less:20` | `var(--shadow-md)` |
| `BookCard.less:40` | `var(--shadow-xl)` |
| `BookCard.less:109` | `var(--shadow-md)` + 内层金边 color-mix |
| `ModalReader.less:22` | `var(--shadow-modal)` |
| `ModalReader.less:5` scrim | `var(--scrim)` |
| `theme.less` 全部 8 条 | 删除，组件层已用 token |

---

## 6. shadcn 组件适配与硬编码清理

### 6.1 shadcn 组件（零改动，靠补洞自动适配）

10 个 ui 组件（badge/button/card/checkbox/drawer/dropdown/select/separator/tabs/button-group）全用语义 token 类，**零硬编码色值**（唯一例外：`drawer.tsx:38` 的 `bg-black/10` 遮罩）。补洞连锁效果：

| 补洞 | 影响组件 | 效果 |
|---|---|---|
| `--background` → `#0a0a14` | button(outline)、card、tabs(active)、全局 body | 深色背景终为海军蓝 |
| `--foreground` → `#d8d0c0` | 全局文字、tabs 触发、drawer 标题 | 深色文字为暖白 |
| `--chart-1..5` → 金紫色阶 | chart 少用，补齐不留洞 | - |

**不改任何 ui/*.tsx**——它们引用语义 token，补洞后自动适配。此即方案 A 核心收益。

### 6.2 drawer 遮罩（`drawer.tsx:38`）

`bg-black/10` 改 `bg-[var(--scrim)]`，与 modal scrim 统一语义，深浅对称。

### 6.3 prose.less 的 5 个硬编码

| 行 | 现值 | 用途 | 改成 |
|---|---|---|---|
| L41 | `color: #d0c8b0` | blockquote 文字 | `var(--prose-quote)` |
| L51 | `background: #0f1628` | pre/code 背景 | `var(--accent-bg)`（紫系深底，与 th 一致） |
| L66 | `background: #2a1f5e` | th 表头背景 | `var(--accent-bg)` |
| L78 | `background: #141e38` | tr 偶数行 | `var(--secondary)` |
| L88 | `color: #80c080` | em 强调 | `var(--quote)` |

prose.less 直接用语义 token 重写，**深浅对称**——深色用 token 持值，浅色同 token 自动切。theme.less 对应 4 条 prose 覆盖（L11-26）随之删除。

### 6.4 Mermaid 错误色（`Mermaid.less:2,4`）

`#e06c75` 改 `var(--danger)`（文字）、`color-mix(in srgb, var(--danger) 27%, transparent)`（边框）。与批注"疑问"色统一走 `--danger`，浅色自动切。图表色（`--color-mermaid-*`）已 token 化，不动。

### 6.5 ReaderSettingsDrawer 色板（`ReaderSettingsDrawer.tsx:75,79`）

3 个硬编码 hex（`['#fff', '#f5f0e8', '#1a1a2e']`）是"即将推出"主题切换色板，禁用态（opacity-30）。**保留不动**——占位 UI，值代表未来主题色相预览，不属当前 token 体系。spec 标记为"已知例外，不处理"。

### 6.6 其余零散硬编码

| 位置 | 现值 | 处理 |
|---|---|---|
| `AiAssistant.less:26` | `rgba(122,79,170,0.08)` | `color-mix(in srgb, var(--accent) 8%, transparent)` |
| `AnnotationPanel.less:143` | `color: white` | `var(--primary-foreground)`（金底深色前景） |
| `BookCard.less:129` | `color-mix(var(--accent) 80%, #000)` | `#000` 改 `var(--background)` |
| `ReadList.less:65` | `var(--color-text)` | 笔误改 `var(--color-text-body)` |

### 6.7 清理汇总

| 类别 | 数量 | 处理 |
|---|---|---|
| shadcn 留洞（background/foreground/chart） | 4 | 第 1 层补洞，组件零改动 |
| drawer 遮罩 | 1 | `var(--scrim)` |
| prose.less 硬编码 | 5 | token 重写，删 theme.less 4 条 prose 覆盖 |
| Mermaid 错误色 | 2 | `var(--danger)` |
| ReaderSettingsDrawer 色板 | 3 | **保留不动**（占位例外） |
| 零散（AiAssistant/AnnotationPanel/BookCard/ReadList/ModalReader） | 5 | 逐条改 token |
| 阴影硬编码 | 14 | 第 5.6 节 |

---

## 7. `index.css` 重构与 `.less` 文件组织

### 7.1 重构后 `index.css` 骨架

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
@plugin "@tailwindcss/typography";
@source "../pages/";
@source "../components/";
@source "../main.tsx";

@custom-variant dark (&:where(:root:not([data-theme='light']) *));

/* ═══ 第 2 层：Tailwind 别名（@theme inline，纯映射） ═══ */
@theme inline {
  --font-sans: 'PingFang SC', 'Microsoft YaHei', serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... 其余 --color-* 别名同现状 ... */
  --radius-sm: calc(var(--radius) * 0.6);
  /* ... radius / text / space 别名照旧 ... */
}

/* ═══ 第 1 层：语义 token = 唯一真相源（深色默认） ═══ */
:root {
  /* shadcn 语义色（直接持值，补齐 background/foreground/chart） */
  --background: #0a0a14;
  --foreground: #d8d0c0;
  --card: #101828;
  /* ... 全部直接持值 ... */
  --chart-1: #f0c060;  --chart-2: #b090e0; /* ... */

  /* 扩展语义色 */
  --primary-dim: #c09040;
  --glow: rgba(240,192,96,0.3);
  --danger: #e06c75;
  --quote: #80c080;
  /* ... 扩展语义色清单 ... */

  /* 阴影（深色） */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  /* ... 全部阴影 token ... */
  --scrim: rgba(10,10,20,0.85);
}

/* ═══ 第 1 层：浅色（深浅对称重写） ═══ */
[data-theme='light'] {
  --background: #f5f0e8;
  /* ... 全部对称重写 ... */
  --shadow-sm: 0 2px 12px rgba(0,0,0,0.06);
  --scrim: rgba(0,0,0,0.4);
}

/* ═══ 第 3 层：--color-* 业务别名（永久保留，纯映射） ═══ */
:root {
  --color-bg-base: var(--background);
  --color-gold: var(--primary);
  --color-text-body: var(--foreground);
  --color-danger: var(--danger);
  /* ... 全部 --color-* 映射（见 4.4） ... */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
```

**关键变化**：① shadcn 语义 token 从"alias 到 `--color-*`"反转为"直接持值"；② 补齐留洞；③ 新增扩展语义/阴影 token；④ 阴影深浅对称；⑤ 第 3 层 `--color-*` 从持值改纯映射，写在 `:root` 对所有主题生效（深浅切换由第 1 层负责）。

### 7.2 `.less` 文件组织与迁移

| 文件 | 动作 |
|---|---|
| `styles/index.css` | 重写（7.1 骨架） |
| `styles/index.less` | 删 `@import './theme.less'`，其余不变 |
| `styles/theme.less` | **删除整个文件** |
| `styles/base.less` | body 加 `box-shadow: var(--shadow-body-inset)`；其余不动 |
| `styles/prose.less` | 5 个硬编码改 token（6.3），深浅对称 |
| `styles/hero-section.less` | 接收 theme.less 迁移的 hero-glow/title 浅色（深浅对称重写） |
| `styles/layout.less`、`page-chrome.less`、`page-layout.less` | 不动（已全 token 化） |
| `components/*/[Name].less` | 阴影改 token、零散硬编码清理（6/5.6）；接收 theme.less 迁移的 annotation mark / progress glow / search-spinner |
| `components/ui/*.tsx` | 不动（靠 index.css 补洞自动适配）；仅 drawer 遮罩改 `var(--scrim)` |
| `tokens/index.ts` | **删除**（死代码，零引用） |

### 7.3 迁移策略（可回滚、可分批）

1. **先建第 1 层**：在 `index.css` 补齐/新增语义 token + 阴影深浅对称，第 3 层 `--color-*` 改映射。**此步后视觉应零变化**（别名层保证 `--color-*` 仍解析到原值）。
2. **验证零变化**：起 dev server，切深/浅主题，肉眼对照确认无差异。
3. **逐文件迁移硬编码**：按第 6 节清单改 `.less` 和 `drawer.tsx`，每改一处验证。
4. **删 theme.less**：内容已迁移后，删文件 + 删 import，验证。
5. **删 tokens/index.ts**：最后删死代码。

第 1 步"零变化验证"是安全网——保证重构不引入视觉回归。

---

## 8. 验证、风险与成功标准

### 8.1 验证手段

1. **构建验证**：`npm run build` 无错；lint 无错（CLAUDE.md 自检清单）。
2. **主题切换验证**：dev server 逐页（Landing/BookApp/Notes/Skills/Reader+Modal）深/浅色肉眼对照。重点查：
   - shadcn 组件（button outline、card、tabs、dropdown、select、drawer）深色背景变海军蓝（补洞可见效果）。
   - 失效的"疑问"批注（`--color-danger`）和"引用"批注（`--color-quote`）终显红/绿（补缺失 token 可见效果）。
   - 浅色阴影柔和（`--shadow-*` 深浅对称生效）。
3. **GitNexus 影响分析**：改 CSS 变量和 `.less` 不碰 TS 逻辑。对 `ReaderSettingsDrawer.tsx`（drawer 遮罩改动）和 `useNotesData.ts`（读 `--color-danger`，行为不变因值从失效→有效）跑 `gitnexus_impact` 确认。`tokens/index.ts` 删除应返回无调用方。
4. **commit 前跑 `gitnexus_detect_changes`** 确认只动预期文件。

**不做的验证**：不写自动化截图对比——项目无现成视觉回归设施，成本高于收益。肉眼 + 构建足够。

### 8.2 风险与缓解

| 风险 | 可能性 | 缓解 |
|---|---|---|
| 改 `--color-*` 为映射后，某处依赖其"持值"特性（如被 `color-mix` 二次混合） | 低 | 第 1 步零变化验证暴露；`color-mix(var(--color-gold) 8%, transparent)` 对映射后的 `var(--primary)` 同样有效 |
| `--background` 补洞后，依赖"默认灰"的组件视觉突变 | 中 | 第 1 步重点查；突变说明该处本应靠 token，是待修 bug 非回归 |
| 阴影深浅对称后，某组件浅色观感需微调 | 中 | 浅色值取自原 theme.less 补丁，已验证；微调在第 1 步即做 |
| 删 theme.less 后漏迁某条浅色覆盖 | 中 | 第 5.5 逐条清单 + 删后逐页验证；漏迁表现为浅色某处回到深色默认，肉眼可查 |
| 补 `--danger`/`--quote` 后"疑问"/"引用"批注突然变色（失效默认→红/绿） | 高（**期望修复**，非回归） | 文档标注为"已知行为变化" |
| GitNexus 索引 stale | 低 | PostToolUse hook commit 后自动 re-analyze |

### 8.3 成功标准（可验证）

| # | 标准 | 验证方式 |
|---|---|---|
| 1 | `npm run build` 成功，lint 无错 | 构建命令 |
| 2 | `index.css` 无持值的 `--color-*`（全为 `var(--*)` 映射） | `grep --color-:` |
| 3 | `--background`/`--foreground`/`--chart-*` 不再是 shadcn 默认灰 | grep 无 `oklch(0.145 0 0)`/`oklch(0.985 0 0)` |
| 4 | `--color-danger`/`--color-quote` 已定义（指向 `--danger`/`--quote`） | grep 确认 |
| 5 | `theme.less` 已删除，`index.less` 无其 import | 文件不存在 + grep |
| 6 | `tokens/index.ts` 已删除 | 文件不存在 |
| 7 | 非阴影硬编码色字面量仅剩 ReaderSettingsDrawer 3 个占位 hex | `grep -rn '#[0-9a-f]\{3,8\}'` |
| 8 | 深浅两主题逐页肉眼无回归（"疑问/引用"批注配色修复为期望变化） | dev server 逐页验证 |
| 9 | `gitnexus_detect_changes` 确认只动预期文件 | 提交前 |

### 8.4 范围边界（不做）

- **不重设配色**：金/紫/深海军蓝/宣纸全保留，只动结构。
- **不迁移 `.less` 到 CSS Modules / Tailwind**：现有 `.less` 架构保留，只改内容。
- **不迁移 `--color-*` 别名层**：第 3 层永久保留，现有 `.less` 不改名。
- **不处理 ReaderSettingsDrawer 占位色板**：明确例外。
- **不加新主题**：只重构现有深/浅两主题。
- **不改 JS 逻辑**：Mermaid readToken、useNotesData TYPE_COLORS 行为不变（值从失效变有效，代码不动）。

---

## 9. 涉及文件清单

**重写**：
- `src/styles/index.css`

**删除**：
- `src/styles/theme.less`
- `src/tokens/index.ts`

**修改（内容迁移/硬编码清理）**：
- `src/styles/index.less`（删 theme import）
- `src/styles/base.less`（body inset 阴影）
- `src/styles/prose.less`（5 个硬编码改 token）
- `src/styles/hero-section.less`（接收 hero-glow/title 浅色）
- `src/components/BookCard/BookCard.less`（阴影 + `#000` + progress glow）
- `src/components/SearchBar/SearchBar.less`（阴影 + search-spinner）
- `src/components/AnnotationToolbar/AnnotationToolbar.less`（阴影 + 向上阴影 + annotation mark）
- `src/components/AnnotationPanel/AnnotationPanel.less`（`color: white` + annotation mark）
- `src/components/ModalReader/ModalReader.less`（scrim + 阴影 + annotation mark）
- `src/components/Mermaid/Mermaid.less`（错误色改 `--danger`）
- `src/components/AiAssistant/AiAssistant.less`（紫底改 color-mix）
- `src/components/ReadList/ReadList.less`（`--color-text` 笔误）
- `src/components/ui/drawer.tsx`（遮罩改 `var(--scrim)`）

**不动**：
- `src/components/ui/{badge,button,button-group,card,checkbox,dropdown-menu,select,separator,tabs}.tsx`（靠补洞自动适配）
- `src/styles/{layout,page-chrome,page-layout}.less`（已全 token 化）
- 其余 `.less`（已无硬编码）
- `src/hooks/useNotesData.ts`、`src/components/Mermaid/Mermaid.tsx`（JS 侧读 CSS 变量，行为不变）
