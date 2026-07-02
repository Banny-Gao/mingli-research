# format-check Skill 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 `format-check` skill，对 `books/` 下 markdown 文章进行 15 条格式规则检查与修复，支持交互式/自动修复两种模式、单篇/按书两种范围，可选 LLM 深度分析。

**Architecture:** 采用与 `self-check` 一致的 skill 结构——SKILL.md 主入口做路由+引导，rules/ 定义规则契约，shared/ 存放共享引擎。15 条规则按严重度分 3 组（critical/warning/suggestion），scanner 逐文件扫描，fixer 按模式执行修复。

**Tech Stack:** Markdown（skill 文件均为 markdown 契约），无代码依赖。skill 由 Claude 主 agent 解析执行，规则检测逻辑用自然语言描述。

---

## 文件结构

```
.claude/skills/format-check/
├── SKILL.md              # 主入口，路由 + 4步引导
├── rules/
│   ├── critical.md       # R1, R2, R14 严重规则（检测逻辑+修复策略+交互模板）
│   ├── warning.md        # R3-R7, R15 警告规则
│   └── suggestion.md     # R8-R13 建议规则
└── shared/
    ├── entrypoint.md     # 4步引导式状态机
    ├── scanner.md        # 规则扫描引擎契约
    └── fixer.md          # 修复执行器契约
```

---

### Task 1: 创建目录结构和 SKILL.md 主入口

**Files:**
- Create: `.claude/skills/format-check/SKILL.md`

- [ ] **Step 1: 创建 SKILL.md 主入口**

```markdown
---
name: format-check
description: Markdown 格式规范检查与修复技能。覆盖 15 条格式规则，支持交互式/自动修复两种模式、单篇/按书两种范围，可选 LLM 深度分析。确保 books/ 下文章在 react-markdown 下渲染效果良好。
trigger: 格式检查|format-check|格式修复|排版检查|markdown格式|markdown排版|渲染检查
---

# format-check 格式检查技能（主入口）

本 skill 覆盖 15 条 markdown 格式规则。**主 SKILL.md 只做路由 + 4 步引导，不做实际扫描修复。**

## 15 条规则

| 严重度 | 规则编号 | 说明 |
|--------|----------|------|
| 🔴 严重 | R1 | 韵文/口诀换行丢失 |
| 🔴 严重 | R2 | 代码块内包含引用标记 `>` |
| 🔴 严重 | R14 | Mermaid 语法错误 |
| 🟡 警告 | R3 | 标题层级过浅 |
| 🟡 警告 | R4 | 同类条目无子标题 |
| 🟡 警告 | R5 | 标题跳级 |
| 🟡 警告 | R6 | 长引用块无内部结构 |
| 🟡 警告 | R7 | 引用块内部多段被挤成单段 |
| 🟡 警告 | R15 | 流程图可读性（含移动端适配） |
| 🔵 建议 | R8 | 可用表格未用 |
| 🔵 建议 | R9 | 缺少分节线 |
| 🔵 建议 | R10 | 连续空行冗余 |
| 🔵 建议 | R11 | 中英文间缺空格 |
| 🔵 建议 | R12 | 强调标记不一致 |
| 🔵 建议 | R13 | 行尾空白 |

完整规则定义见 `rules/critical.md`、`rules/warning.md`、`rules/suggestion.md`。

## 调用方式

| 命令 | 模式 | 范围 |
|------|------|------|
| `/format-check <file-path>` | 交互式 | 单篇 |
| `/format-check --book <slug>` | 交互式 | 按书 |
| `/format-check --fix <file-path>` | 自动修复 | 单篇 |
| `/format-check --fix --book <slug>` | 自动修复 | 按书 |
| `/format-check --analyze <file-path>` | 交互式 + LLM | 单篇 |
| `/format-check --analyze --book <slug>` | 交互式 + LLM | 按书 |

## 4 步引导式流程

详见 `shared/entrypoint.md`。主 SKILL.md 不重复实现，按 entrypoint.md 流程执行。

## 路由

Step 4 路由：主 agent 持有完整状态 `{scope, mode, files, llm_enabled}` 后，按 `shared/scanner.md` 契约逐文件扫描，按 `shared/fixer.md` 契约执行修复。

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 4 步引导式状态机 | `shared/entrypoint.md` |
| 规则扫描引擎 | `shared/scanner.md` |
| 修复执行器 | `shared/fixer.md` |
| 🔴 严重规则 | `rules/critical.md` |
| 🟡 警告规则 | `rules/warning.md` |
| 🔵 建议规则 | `rules/suggestion.md` |
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/SKILL.md
git commit -m "feat(format-check): add SKILL.md main entry with routing and 4-step flow"
```

---

### Task 2: 创建严重规则定义 (rules/critical.md)

**Files:**
- Create: `.claude/skills/format-check/rules/critical.md`

- [ ] **Step 1: 创建 rules/critical.md**

```markdown
# 🔴 严重规则（R1, R2, R14）

渲染结果不可逆损坏，`--fix` 下自动修复（R2 除外）。

---

## R1：韵文/口诀换行丢失

**检测逻辑：**
1. 扫描连续 3 行以上不含空行的短行文本（每行 < 40 字符）
2. 行内容不包含 markdown 标记（`#`, `-`, `>`, `|`, `*` 等）
3. 行内容以中文或标点结尾，非代码/表格
4. 判定为古典韵文/口诀，单换行在 CommonMark 下会被挤压

**修复策略（`--fix` 自动执行）：**
- 韵文类型（五言/七言诗、歌诀）：行尾添加两空格（硬换行 `  `）
- 口诀类型（句式不齐）：转为双换行（独立段落分隔）

**交互模板：**
```
检测到韵文/口诀区域（第 L1-L2 行），当前使用单换行分隔，在 react-markdown 中会被挤成连续文本。
建议：转为 [硬换行(行尾两空格) / 段落分隔(双换行)]。
[应用] [跳过] [查看原文]
```

---

## R2：代码块内包含引用标记 `>`

**检测逻辑：**
1. 定位 ` ``` ` 代码块区域
2. 块内每行均以 `> ` 开头
3. 或块内超过 50% 行以 `> ` 开头且内容为中文
4. 判定为引用内容被代码块误包裹，渲染为 `<pre><code>` 而非 `<blockquote>`

**修复策略（`--fix` 跳过，交互模式询问）：**
- 去外层 ` ``` ` 包裹，保留内层 `> ` 引用标记

**交互模板：**
```
检测到代码块（```）内包含引用标记（>），这段内容在渲染时会显示为等宽代码字体而非引用样式。
内容意图是否为"原文引用"？如是，建议移除代码块包裹，转为标准引用块（>）。
[转为引用块] [保留代码块] [跳过]
```

---

## R14：Mermaid 语法错误

**检测逻辑：**
1. 定位 ` ```mermaid` 代码块
2. 提取所有节点 ID（`字母+数字` 组合，如 `A`, `B1`, `K2`）
3. 对比节点定义侧（`ID[标签]`、`ID{标签}`、`ID(标签)`）与引用侧（`ID -->`、`--> ID`）
4. 检测：引用侧出现的 ID 未在定义侧出现 → 未定义节点引用
5. 检测：括号不闭合（`[` 无对应 `]`）
6. 检测：孤立节点（定义了但无任何连线引用）

**修复策略（`--fix` 尝试修复）：**
- 未定义节点 + 命名有规律（如 `D2`, `D3` 与已定义 `D1` 同类）：补全节点定义，标签填 `[待补充]`
- 括号不闭合：补全缺失的闭合括号
- 孤立节点：不自动删除，标记为警告

**交互模板：**
```
检测到 Mermaid 语法错误（第 L 行）：
- 节点 "D2" 被引用但未定义 → 图将渲染失败或显示异常
建议：补全节点定义 `D2[标签]`。
[自动补全] [手动修复] [跳过]
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/rules/critical.md
git commit -m "feat(format-check): add critical rules R1, R2, R14"
```

---

### Task 3: 创建警告规则定义 (rules/warning.md)

**Files:**
- Create: `.claude/skills/format-check/rules/warning.md`

- [ ] **Step 1: 创建 rules/warning.md**

```markdown
# 🟡 警告规则（R3-R7, R15）

影响阅读体验和导航结构，`--fix` 自动修复确定性规则，LLM 规则需 `--analyze`。

---

## R3：标题层级过浅

**检测逻辑：**
1. 文件存在 `#` 一级标题
2. 文件总行数 > 30 行
3. 全文无 `##` 或 `###` 子标题
4. 判定为长文无视觉锚点

**修复策略（需 LLM）：**
- LLM 分析全文内容，识别逻辑分段，生成 `##` 子标题建议
- 用户确认后写入

**交互模板：**
```
检测到文章仅有 # 一级标题，全文 N 行无子标题。react-markdown 已配置 rehypeSlug + rehypeAutolinkHeadings，无子标题则无锚点可点。
[启用 LLM 分析生成子标题] [跳过]
```

---

## R4：同类条目无子标题

**检测逻辑：**
1. 扫描连续出现 5 个以上的 `【xxx】` 模式（中文方括号标记）
2. 或连续出现 5 个以上以 `> ` 开头的独立引用块，每个块内容 < 5 行
3. 判定为同类条目平铺，缺乏分区标题

**修复策略（需 LLM）：**
- LLM 分析每条目的主题，为每个条目生成 `###` 标题
- 用户确认后写入

**交互模板：**
```
检测到 N 个同类条目（如神煞/命造）仅靠【】标记区分，无 ### 分区标题。
[启用 LLM 分析为每个条目生成子标题] [跳过]
```

---

## R5：标题跳级

**检测逻辑：**
1. 检测到 `#` 一级标题后直接出现 `###` 三级标题
2. 中间无 `##` 二级标题
3. 判定为大纲树跳级

**修复策略（`--fix` 自动执行）：**
- 将 `###` 降级为 `##`（减一个 `#`）
- 后续标题相应调整层级

**交互模板：**
```
检测到标题跳级：# 后直接出现 ###（第 L 行），缺少 ## 层级。
建议：将 ### 降级为 ##。
[降级] [保留] [跳过]
```

---

## R6：长引用块无内部结构

**检测逻辑：**
1. 定位连续 `> ` 开头的引用块
2. 块的总行数 > 15 行
3. 块内无空行分隔（所有 `> ` 行连续）
4. 块内无 `**粗体**` 标记或列表标记
5. 判定为引用块文字墙

**修复策略（`--fix` 自动执行）：**
- 在语义断点处（句号、分号后）插入空行（`>` 单独一行）分隔
- 对明显的术语（如"用神"、"格局"、"日主"）添加 `**粗体**`

**交互模板：**
```
检测到长引用块（第 L1-L2 行，N 行），内部无分段/加粗/列表，阅读体验差。
建议：插入空行分段 + 关键术语加粗。
[自动优化] [手动调整] [跳过]
```

---

## R7：引用块内部多段内容被挤成单段

**检测逻辑：**
1. 定位 `> ` 开头的引用块
2. 块内有多个语义段落，但仅用单换行分隔（无空 `>` 行）
3. 单换行在 CommonMark 下渲染为空格，多段合并
4. 判定为引用块内部分段丢失

**修复策略（`--fix` 自动执行）：**
- 在语义段落之间插入 `>`（空引用行），使各段独立渲染

**交互模板：**
```
检测到引用块内多段内容被挤成单段（第 L1-L2 行），渲染后会合并。
建议：在段间插入空行分隔。
[自动分隔] [跳过]
```

---

## R15：流程图可读性（含移动端适配）

**检测逻辑（7 子项）：**

| 子项 | 检测条件 | 严重度 |
|------|----------|--------|
| 节点过多 | 单 Mermaid 图节点 > 15 个 | 🟡 |
| 方向不当 | `graph LR` + 节点 > 8 个 | 🟡 |
| 缺少 subgraph | 有天然分组但未用 subgraph | 🟡 |
| 节点标签过长 | 单个节点文字 > 20 字 | 🟡 |
| 缺少图标题 | 图上方无 `**图X：xxx**` 描述 | 🟡 |
| 移动端横向溢出 | `graph LR` + 层级 > 4 层 | 🔴 提升为严重 |
| 移动端节点密度 | 总节点 > 10 且方向为 LR | 🟡 |

**检测方法：**
1. 定位 ` ```mermaid` 代码块
2. 解析 `graph TD/LR` 或 `flowchart TD/LR` 方向声明
3. 统计 `-->` 或 `---` 连线数量，估算节点数
4. 计算最大层级深度（从根节点到最深叶节点的跳数）
5. 检测 `subgraph` 关键字是否存在
6. 检测 `[` `]` 内标签文本长度
7. 检查图上方 3 行内是否有 `**图` 或 `**Fig` 模式的描述行

**修复策略（需 LLM）：**
- 节点过多：LLM 分析逻辑分组，建议拆分或加 subgraph
- 方向不当：建议 `LR` → `TD`
- 移动端横向溢出：强制建议 `LR` → `TD`
- 节点标签过长：LLM 缩短标签
- 缺少图标题：LLM 根据图内容生成标题
- 缺少 subgraph：LLM 识别分组并添加

**交互模板：**
```
检测到流程图可读性问题（第 L 行 mermaid 图）：
- 节点过多（N 个），建议拆分或加 subgraph
- 方向为 LR + 层级 5 层 → 移动端会横向溢出，建议改为 TD
- 缺少图标题
- 节点 "很长的标签文字..." 标签过长（M 字）
[启用 LLM 优化] [仅改方向为 TD] [跳过]
```

**移动端专用交互模板（检测到 LR + 层级 > 4）：**
```
⚠️ 检测到流程图使用 LR（横向）方向，层级深度 5 层。
在移动端阅读时必定横向溢出，用户需要左右滑动才能看全。
强烈建议改为 TD（纵向）方向。
[改为 TD] [保留 LR] [跳过]
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/rules/warning.md
git commit -m "feat(format-check): add warning rules R3-R7, R15 with mobile checks"
```

---

### Task 4: 创建建议规则定义 (rules/suggestion.md)

**Files:**
- Create: `.claude/skills/format-check/rules/suggestion.md`

- [ ] **Step 1: 创建 rules/suggestion.md**

```markdown
# 🔵 建议规则（R8-R13）

仅交互模式提示，`--fix` 不自动修复。

---

## R8：可用表格未用

**检测逻辑：**
1. 扫描连续 3 行以上含 `|` 或 `、` 分隔的对比性数据行
2. 行内容包含对照结构（如"命造X：... 命造Y：..."、"前者...后者..."）
3. 当前未使用 GFM 表格格式
4. 判定为可用表格优化

**交互模板：**
```
检测到对比性内容（第 L1-L2 行），当前用纯文本排列，可转为 GFM 表格提升可读性。
[转为表格] [跳过]
```

---

## R9：缺少分节线

**检测逻辑：**
1. 检测 `## ` 二级标题之间的内容区块 > 50 行
2. 两个大区块之间无 `---` 分隔
3. 判定为缺少视觉分节

**交互模板：**
```
检测到大章节之间缺少分节线（第 L 行前后），建议添加 --- 增强视觉分隔。
[添加 ---] [跳过]
```

---

## R10：连续空行冗余

**检测逻辑：**
1. 扫描连续 3 个以上的空行
2. 判定为空行冗余

**修复策略（交互模式可自动执行）：**
- 将 3+ 连续空行缩减为 2 个空行

**交互模板：**
```
检测到 N 处连续空行冗余（3+ 空行），建议规范为 1-2 行。
[自动规范] [跳过]
```

---

## R11：中英文间缺空格

**检测逻辑：**
1. 扫描中文汉字后紧跟英文单词（`[\\u4e00-\\u9fff][A-Za-z]`）
2. 或英文单词后紧跟中文汉字（`[A-Za-z][\\u4e00-\\u9fff]`）
3. 判定为中英文间缺空格

**交互模板：**
```
检测到 N 处中英文间缺空格（如"甲木日主"与"react-markdown"混排），建议添加空格改善阅读体验。
[自动添加空格] [跳过]
```

---

## R12：强调标记不一致

**检测逻辑：**
1. 扫描全文中的关键术语（如"用神"、"格局"、"日主"、"食伤"等命理术语）
2. 统计每个术语的出现次数和加粗次数
3. 术语出现 3 次以上但仅部分加粗 → 标记不一致
4. 术语首次出现未加粗 → 建议首次加粗

**交互模板：**
```
检测到强调标记不一致：
- "用神" 出现 8 次，仅 3 次加粗
- "格局" 出现 5 次，首次出现未加粗
建议：统一加粗策略（首次出现 + 关键论断处）。
[统一加粗] [仅首次加粗] [跳过]
```

---

## R13：行尾空白

**检测逻辑：**
1. 扫描行尾存在空格或 Tab 字符的行
2. 判定为行尾空白（git diff 噪音）

**交互模板：**
```
检测到 N 处行尾空白，会在 git diff 中产生噪音。
[自动清除] [跳过]
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/rules/suggestion.md
git commit -m "feat(format-check): add suggestion rules R8-R13"
```

---

### Task 5: 创建引导式状态机 (shared/entrypoint.md)

**Files:**
- Create: `.claude/skills/format-check/shared/entrypoint.md`

- [ ] **Step 1: 创建 shared/entrypoint.md**

```markdown
# 引导式入口状态机契约

主 SKILL.md 实现 4 步引导式状态机。本片段是契约定义，scanner/fixer 不再重复。

## 4 步流程

```
[Step 1] 确定范围和模式 → 解析命令参数
[Step 2] 收集文件列表 → 单篇直读 / 按书 find
[Step 3] 逐文件扫描 → 按严重度收集问题
[Step 4] 模式分发执行 → 自动修复 / 交互确认 / LLM 分析
```

**状态变量：**

| 变量 | 类型 | 来源 |
|------|------|------|
| `scope` | `{file, book}` | Step 1 |
| `mode` | `{interactive, fix, analyze}` | Step 1 |
| `files` | `string[]` | Step 2 |
| `llm_enabled` | `boolean` | Step 1（`--analyze` 或交互下用户确认） |
| `issues` | `Issue[]` | Step 3 |
| `report` | `{total, fixed, skipped, pending}` | Step 4 |

## Step 1 — 确定范围和模式

- 触发：用户输入 `/format-check [--fix] [--analyze] [--book <slug>|<file-path>]`
- 解析规则：
  - 含 `--book <slug>` → scope=book, target=slug
  - 含文件路径（以 `books/` 开头或含 `.md`）→ scope=file, target=path
  - 两者皆无 → AskUserQuestion 询问范围
  - 含 `--fix` → mode=fix
  - 含 `--analyze` → mode=analyze, llm_enabled=true
  - 两者皆无 → mode=interactive
- 异常：`--fix` 和 `--analyze` 同时出现 → 报错"不能同时使用 --fix 和 --analyze"
- 异常：target 文件不存在 → 报错退出
- 异常：`--book` 的 slug 不存在于 books/ → 报错退出
- 状态写：`scope, mode, target, llm_enabled`

## Step 2 — 收集文件列表

- 分支：
  - scope=file：直接读取 target 文件，files=[target]
  - scope=book：Bash `find books/{slug}/articles -name "*.md" -type f`，结果排序
- 过滤：排除非 .md 文件
- 异常：files 为空 → 报错"未发现 markdown 文件"退出
- 状态写：`files = [...]`

## Step 3 — 逐文件扫描

详见 `shared/scanner.md`。

- 对每个 file in files：
  1. Read 文件全文
  2. 按 rules/critical.md → rules/warning.md → rules/suggestion.md 顺序应用规则
  3. 每条规则返回 Issue[]：`{rule_id, severity, line_start, line_end, description, suggestion, fix_type}`
  4. 按严重度分组收集
- 状态写：`issues = [...]`

## Step 4 — 模式分发执行

详见 `shared/fixer.md`。

- 分支：
  - mode=fix：自动修复 R1 + R3-R7 + R14（跳过 R2 + R8-R13 + R15 + LLM）
  - mode=interactive：逐 issue 展示（按严重度排序），AskUserQuestion 逐条确认
  - mode=analyze：同 interactive，但对 R3/R4/R15 额外触发 LLM 分析
- 输出报告：
  ```
  format-check 报告
  ━━━━━━━━━━━━━━━━
  范围：books/{slug}（N 个文件）
  模式：{interactive/fix/analyze}
  ━━━━━━━━━━━━━━━━
  🔴 严重：M 个（已修复 X，跳过 Y）
  🟡 警告：N 个（已修复 X，跳过 Y）
  🔵 建议：P 个（已应用 X，跳过 Y）
  ━━━━━━━━━━━━━━━━
  总计：T 个问题，已处理 H 个
  ```
- 状态写：`report = {total, fixed, skipped, pending}`
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/shared/entrypoint.md
git commit -m "feat(format-check): add 4-step guided state machine entrypoint"
```

---

### Task 6: 创建规则扫描引擎 (shared/scanner.md)

**Files:**
- Create: `.claude/skills/format-check/shared/scanner.md`

- [ ] **Step 1: 创建 shared/scanner.md**

```markdown
# 规则扫描引擎契约

主 agent 对每个文件顺序执行 15 条规则的检测逻辑。

## 扫描顺序

```
R1 → R2 → R14  (critical，检测渲染阻断)
R5 → R7 → R6 → R3 → R4 → R15  (warning，检测结构/可读性)
R10 → R13 → R11 → R12 → R8 → R9  (suggestion，检测优化建议)
```

扫描顺序设计原则：
- 先检测渲染阻断问题（critical），后检测结构问题（warning），最后检测优化建议（suggestion）
- warning 中先检测确定性问题（R5 标题跳级、R7 引用挤段）再检测需要 LLM 的问题（R3、R4、R15）

## Issue 数据结构

每条规则检测后返回 Issue 列表：

```
Issue {
  rule_id: "R1".."R15",
  severity: "critical" | "warning" | "suggestion",
  file: string,           // 文件路径
  line_start: number,     // 问题起始行
  line_end: number,       // 问题结束行
  description: string,    // 问题描述（中文，一句话）
  suggestion: string,     // 修复建议（中文）
  fix_type: "auto" | "llm" | "manual",  // 修复类型
  context: string,        // 问题上下文（前后各 2 行，用于交互展示）
}
```

## 扫描性能约束

- 单文件扫描应一次性完成 15 条规则，避免多次 Read
- 规则间有依赖的（如 R3 需要知道全文标题分布），先收集元信息再判
- 大文件（>500 行）不额外限制，全量扫描

## 去重规则

- 同一行范围内同一 rule_id 只报告一次
- R10（连续空行）合并相邻空行块为一个 Issue

## 与 fixer 的接口

scanner 输出 `Issue[]` 交给 fixer。fixer 按 `fix_type` 分派：

| fix_type | 处理方式 |
|----------|----------|
| auto | fixer 直接应用修复策略 |
| llm | 仅 llm_enabled=true 时，主 agent 进行 LLM 分析后 fixer 应用 |
| manual | 仅交互模式提示，不自动修复 |
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/shared/scanner.md
git commit -m "feat(format-check): add scanner engine contract"
```

---

### Task 7: 创建修复执行器 (shared/fixer.md)

**Files:**
- Create: `.claude/skills/format-check/shared/fixer.md`

- [ ] **Step 1: 创建 shared/fixer.md**

```markdown
# 修复执行器契约

主 agent 根据模式和 issue 的 fix_type 执行修复。

## 修复模式

### --fix 自动修复模式

直接应用修复，不询问用户。

**可自动修复的规则：**

| 规则 | 修复操作 | 使用的工具 |
|------|----------|-----------|
| R1 | 韵文行尾加 `  `（两空格）或转双换行 | Edit |
| R5 | `###` → `##`（去掉一个 #） | Edit |
| R6 | 引用块段间插入空 `>` 行 | Edit |
| R7 | 引用块段间插入空 `>` 行 | Edit |
| R10 | 3+ 空行 → 2 空行 | Edit |
| R13 | 删除行尾空格 | Edit |
| R14 | 补全缺失的节点定义 | Edit |

**跳过的规则：**
- R2（代码块包裹引用，` ``` ` 是合法语法，需用户确认意图）
- R3, R4, R15（需要 LLM 分析）
- R8, R9, R11, R12（建议类，不自动修）

### 交互模式

对每个 issue 按严重度排序展示：

1. 输出 issue 描述 + 上下文（前后 2 行）
2. AskUserQuestion：应用修复 / 跳过 / 查看完整上下文
3. 用户选择后执行

交互问题模板见各规则的 `rules/*.md` 中的"交互模板"。

### --analyze LLM 分析模式

对 R3, R4, R15 触发 LLM 深度分析：

**R3 LLM 流程：**
1. 主 agent 阅读全文
2. 识别内容的逻辑分段（按主题/论域切换点）
3. 为每段生成 5-15 字的 `##` 标题
4. 列出标题建议列表，AskUserQuestion 逐条确认
5. 确认后 Edit 写入文件

**R4 LLM 流程：**
1. 主 agent 阅读含 `【】` 标记或平铺引用块的区域
2. 识别每个条目的主题
3. 为每个条目生成 `###` 标题
4. 列出标题建议列表，AskUserQuestion 逐条确认
5. 确认后 Edit 写入文件

**R15 LLM 流程：**
1. 主 agent 阅读 Mermaid 图代码
2. 分析图的逻辑结构（分组、层级、方向）
3. 生成优化建议：
   - 方向调整（LR→TD）
   - subgraph 分组建议
   - 节点标签缩短建议
   - 图标题建议
4. AskUserQuestion 逐项确认
5. 确认后 Edit 写入文件

## 修复后验证

每条修复完成后：
1. 重新 Read 修复区域，确认修改正确
2. 如果是 Mermaid 修复（R14/R15），额外检查：`graph` 关键字存在、括号闭合、无孤立引用
3. 修复失败 → 回退该条修复，记录到 report.skipped

## 报告输出

```
format-check 报告
━━━━━━━━━━━━━━━━
范围：books/{slug}（N 个文件）
模式：{interactive/fix/analyze}
━━━━━━━━━━━━━━━━
🔴 严重：M 个
  - 已修复：X
  - 已跳过：Y
🟡 警告：N 个
  - 已修复：X
  - 已跳过：Y
🔵 建议：P 个
  - 已应用：X
  - 已跳过：Y
━━━━━━━━━━━━━━━━
总计：T 个问题，已处理 H 个，跳过 S 个
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/format-check/shared/fixer.md
git commit -m "feat(format-check): add fixer executor contract"
```

---

### Task 8: 集成验证与自检

**Files:**
- 无新建文件，验证已有文件

- [ ] **Step 1: 验证文件结构完整性**

```bash
find .claude/skills/format-check -type f | sort
```

预期输出：
```
.claude/skills/format-check/SKILL.md
.claude/skills/format-check/rules/critical.md
.claude/skills/format-check/rules/suggestion.md
.claude/skills/format-check/rules/warning.md
.claude/skills/format-check/shared/entrypoint.md
.claude/skills/format-check/shared/fixer.md
.claude/skills/format-check/shared/scanner.md
```

- [ ] **Step 2: 验证规则覆盖率**

确认 15 条规则全部有定义：
- R1-R2, R14 → critical.md ✓
- R3-R7, R15 → warning.md ✓
- R8-R13 → suggestion.md ✓

- [ ] **Step 3: 验证模式与规则矩阵一致**

| 规则 | --fix | 交互 | --analyze |
|------|-------|------|-----------|
| R1 | auto | ask | auto |
| R2 | skip | ask | ask |
| R3 | skip | ask+LLM | ask+LLM |
| R4 | skip | ask+LLM | ask+LLM |
| R5 | auto | ask | auto |
| R6 | auto | ask | auto |
| R7 | auto | ask | auto |
| R8 | skip | suggest | suggest |
| R9 | skip | suggest | suggest |
| R10 | auto | ask | auto |
| R11 | skip | suggest | suggest |
| R12 | skip | suggest | suggest |
| R13 | auto | ask | auto |
| R14 | auto | ask | auto |
| R15 | skip | ask+LLM | ask+LLM |

- [ ] **Step 4: 验证非目标约束**

确认 skill 内容不包含：
- 语法校验逻辑（不是 lint 工具）
- 内容质量审查（语义错误、逻辑矛盾）
- interpretation.md 解读内容修改
- source.md 原文内容修改

- [ ] **Step 5: 用抽样文章做干运行验证**

对 Step 1 的 5 篇抽样文章，逐篇对照规则表，确认每条规则的检测逻辑能命中预期问题：

| 文章 | 应命中规则 |
|------|-----------|
| 子平真诠/论宫分用神配六亲 | R2（代码块裹引用） |
| 滴天髓阐微/方局 | R15（流程图可读性，11 节点无 subgraph） |
| 三命通会/六戊日甲寅时断 | R1（韵文换行）、R3（标题过浅） |
| 三命通会/看命口诀三 | R3（标题过浅） |
| 神峰通考/凶神类 | R4（同类条目无标题）、R6（长引用块） |

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(format-check): add integration verification and self-check"
```

---

### Task 9: 最终自检与清理

- [ ] **Step 1: 搜索占位符**

```bash
grep -rn "TBD\|TODO\|FIXME\|待补充\|待定" .claude/skills/format-check/
```

预期：无输出（唯一"待补充"在 R14 补全节点标签中，是功能描述而非占位符）

- [ ] **Step 2: 确认所有交叉引用有效**

| 引用位置 | 引用目标 | 是否存在 |
|----------|----------|----------|
| SKILL.md → entrypoint.md | shared/entrypoint.md | ✓ |
| SKILL.md → scanner.md | shared/scanner.md | ✓ |
| SKILL.md → fixer.md | shared/fixer.md | ✓ |
| SKILL.md → critical.md | rules/critical.md | ✓ |
| SKILL.md → warning.md | rules/warning.md | ✓ |
| SKILL.md → suggestion.md | rules/suggestion.md | ✓ |
| entrypoint.md → scanner.md | shared/scanner.md | ✓ |
| entrypoint.md → fixer.md | shared/fixer.md | ✓ |

- [ ] **Step 3: 验证与 self-check skill 的结构一致性**

| self-check | format-check | 一致性 |
|-----------|-------------|--------|
| SKILL.md（路由+引导） | SKILL.md（路由+引导） | ✓ |
| shared/entrypoint.md | shared/entrypoint.md | ✓ |
| 子目录按类型分 | rules/ 按严重度分 | 模式一致 |
| 共享契约索引表 | 共享契约索引表 | ✓ |

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore(format-check): final self-check and cleanup"
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-07-02-format-check-skill.md
git commit -m "docs(format-check): add implementation plan"
```
