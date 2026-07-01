# source-create 模式 D 独立性改造 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `source-create` skill 模式 D（调脚本批量）从「命令转发」改为「站点分析 + 探查 + 决策 + 自生成」方法论契约，让 skill 独立于 `scripts/fetch-source.js` 工作。

**Architecture:** 重写 `shared/sources/script.md` 为方法论契约；新增 `probe.md`（探查方法论）与 `scratch-template.md`（自生成 prompt 模板）；SKILL.md 把 Step 3 模式 D 拆为 3.1-3.5；新建根目录 `.scratch/` 留底区。所有契约层不出现具体脚本路径。

**Tech Stack:** Markdown 契约 / Node 18+（仅作描述约束）/ gitignore

**Spec:** `docs/superpowers/specs/2026-07-01-source-create-mode-d-independence-design.md`

**前置说明：** 本次改造只触及契约 markdown 与 1 行 gitignore，**不**写任何运行时代码。每个任务的"测试"是契约自检（grep + 人工审），不是 unit test。

---

## File Structure（变更面一览）

| 操作 | 路径 | 责任 |
|---|---|---|
| 新建 | `.scratch/.gitkeep` | 留底目录占位 |
| 新建 | `.claude/skills/source-create/shared/sources/probe.md` | 探查现有抓取工具方法论 |
| 新建 | `.claude/skills/source-create/shared/sources/scratch-template.md` | 自生成抓取脚本 prompt 模板 |
| 重写 | `.claude/skills/source-create/shared/sources/script.md` | 模式 D 全流程契约 |
| 修改 | `.claude/skills/source-create/shared/strategy.md` | Step 2 模式 D 描述 + 移除脚本命令模板 |
| 修改 | `.claude/skills/source-create/SKILL.md` | Step 3 模式 D 拆 3.1-3.5 |
| 修改 | `.gitignore` | 加 1 行 `/.scratch/` |

**不动**：`scripts/fetch-source.js` / `scripts/fetch-source/` / `SPEC-source.md` / 模式 A/B/C 契约 / `scripts/lib/`。

---

## Task 1: 创建 .scratch/ 留底目录 + .gitignore

**Files:**
- Create: `.scratch/.gitkeep`
- Modify: `.gitignore`（追加 1 行）

- [ ] **Step 1: 创建 .scratch 目录**

```bash
mkdir -p .scratch
touch .scratch/.gitkeep
```

- [ ] **Step 2: 验证目录与占位文件存在**

```bash
ls -la .scratch/
```

Expected: 输出含 `.gitkeep` 文件（空文件，0 字节）。

- [ ] **Step 3: 在 .gitignore 追加 1 行**

读取 `.gitignore` 最后一行，确认有换行符后追加：

```
/.scratch/
```

完整追加命令：

```bash
printf '\n/.scratch/\n' >> .gitignore
```

- [ ] **Step 4: 验证 .gitignore 内容**

```bash
grep -n '^.scratch' .gitignore
```

Expected: 1 行命中，形如 `/.scratch/`。

- [ ] **Step 5: 验证 .scratch/ 不会被 git 跟踪**

```bash
git status --ignored --short | grep scratch
```

Expected: `.scratch/` 出现在 ignored 列表中（`!!` 前缀），但 `git status` 默认视图不显示。

- [ ] **Step 6: 提交**

```bash
git add .scratch/.gitkeep .gitignore
git commit -m "chore: 新建 .scratch/ 留底目录 + gitignore

为 source-create 模式 D 自生成临时抓取脚本提供留底区。
目录位于项目根（与 scripts/、books/ 平级），不属于 scripts/ 工具集。"
```

---

## Task 2: 新增 probe.md（探查方法论契约）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/probe.md`

- [ ] **Step 1: 写入 probe.md**

文件完整内容（与 spec §4.1 一致）：

```markdown
# 探查现有抓取工具（模式 D 内部）

## 目标

模式 D 进入后，主 agent **不知道也不假设**项目内有哪些抓取工具，
要在 `scripts/` 子树做一次运行时探查，找能覆盖目标站点的现成工具。

## 探查方法（运行时执行，不预设路径）

1. 用 Bash 工具扫 `scripts/` 下所有 `.js` 文件
   （如 `find scripts/ -name '*.js' -type f`）
2. 用 Read/grep 抽查每个候选文件的文件头注释，识别：
   - 文件名/注释含 `fetch/scrape/crawl/source` 关键字
   - 注释或代码含明确站点名 / extractor 列表
3. 对每个候选，查找是否声明覆盖目标站点
4. 形成候选清单：`[{name, path, covers: [站点列表], runner: 调命令模板}]`

## 决策路由（探查完成后）

| 探查结果 | skill 动作 |
|---|---|
| 探到 1+ 候选且覆盖目标站点 | 告知用户工具名 + runner 命令，让用户决定执行权（用户自跑 / AI 经确认后跑） |
| 探到 0 个候选 | 进入自生成临时脚本流程（见 scratch-template.md） |
| 探到但都不覆盖 | 告知用户候选清单 + 推荐用户在工具内补 extractor（**skill 不做**补 extractor） |

## 红线

- 不预设任何脚本路径
- 不修改任何已有抓取工具
- 不在探查过程中执行任何抓取
```

- [ ] **Step 2: 验证 probe.md 不预设任何脚本路径**

```bash
grep -n 'scripts/fetch-source' .claude/skills/source-create/shared/sources/probe.md
```

Expected: 0 命中。

- [ ] **Step 3: 验证 probe.md 含三决策路由**

```bash
grep -c '^|' .claude/skills/source-create/shared/sources/probe.md
```

Expected: `4`（决策表 4 行：表头 + 分隔 + 3 决策）。

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/source-create/shared/sources/probe.md
git commit -m "feat(source-create): 新增 probe.md 探查现有抓取工具方法论

模式 D 进入时先做运行时探查，不预设 scripts/fetch-source.js 路径。
决策路由:复用现有工具 / 自生成临时脚本 / 建议补 extractor 三选一。"
```

---

## Task 3: 新增 scratch-template.md（自生成 prompt 模板契约）

**Files:**
- Create: `.claude/skills/source-create/shared/sources/scratch-template.md`

- [ ] **Step 1: 写入 scratch-template.md**

文件完整内容（与 spec §4.2 一致）：

```markdown
# 自生成临时抓取脚本 prompt 模板

skill 在模式 D 进入自生成流程时，按本模板构造 prompt，调用 LLM 生成
一次性 Node 脚本。脚本**必须**遵守 SPEC-source.md §五 红线 5 条产 source.md。

## 输入

| 字段 | 来源 |
|---|---|
| slug | 用户输入 |
| chapterList | catalog.md 篇章列表 |
| siteType / urlPattern / isSSR | Step 3.1 站点分析产物 |
| skeletonRedLines | shared/skeleton.md 红线 5 条 |
| formatSpec | source.md H1 + 正文 + `> 【注家名】` 块引用 |

## Prompt 模板（注入到 LLM 调用）

你是一个 Node.js 抓取脚本生成器。任务：生成**一次性**脚本，
落盘到 `.scratch/<slug>-<YYYYMMDD>.js`，
从 `<siteType>` 站点批量抓取 `<chapterList>` 各篇章原文，
并按 SPEC-source.md §五 红线 5 条产 source.md。

【严字不改】
- 不修改任何字形（含异体字、避讳字、繁简差异）
- 不混入解读
- 不分段处理长段
- 不加非 `> 【注家名】` 块引用之外的标记
- 段与段之间用单空行分隔

【输出格式】
- 每篇一个 `books/<slug>/articles/<篇名>/source.md`
- H1 标题 = 裸篇名（无编号前缀）
- 注家以 `> 【{注家名}】` 块引用包裹

【约束】
- 使用 Node 18+ 原生 fetch
- 内嵌 USER_AGENT / 限速 / 重试 3 次（429 / 5xx 退避）
- 使用项目 `scripts/lib/utils.js` 的 `stripHtml / progressBar / formatDuration`（已存在）
- 不引入新依赖
- 不修改 scripts/fetch-source/* 任何文件

【输出】
仅输出 Node 脚本完整代码（不解释过程、不输出 markdown 围栏外内容）。
```

- [ ] **Step 2: 验证 scratch-template.md 含红线 5 条**

```bash
grep -E '不修改任何字形|不混入解读|不分段处理长段|不加非|段与段之间用单空行' \
  .claude/skills/source-create/shared/sources/scratch-template.md | wc -l
```

Expected: `5`（命中 5 条红线）。

- [ ] **Step 3: 验证落盘路径是 .scratch/（非 scripts/.scratch/）**

```bash
grep -E '\.scratch/' .claude/skills/source-create/shared/sources/scratch-template.md
grep -E 'scripts/\.scratch' .claude/skills/source-create/shared/sources/scratch-template.md
```

Expected: 第一条命中（`.scratch/<slug>-<YYYYMMDD>.js`），第二条 0 命中。

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/source-create/shared/sources/scratch-template.md
git commit -m "feat(source-create): 新增 scratch-template.md 自生成抓取脚本 prompt 模板

skill 在模式 D 未探到现有工具时，按本模板构造 prompt 让 LLM 生成
一次性 Node 脚本，落盘 .scratch/<slug>-<YYYYMMDD>.js 留底。
脚本必须遵守 SPEC-source.md §五 红线 5 条。"
```

---

## Task 4: 重写 shared/sources/script.md（模式 D 全流程契约）

**Files:**
- Rewrite: `.claude/skills/source-create/shared/sources/script.md`

- [ ] **Step 1: 备份旧文件**

```bash
cp .claude/skills/source-create/shared/sources/script.md \
   .claude/skills/source-create/shared/sources/script.md.bak-20260701
```

- [ ] **Step 2: 写入新 script.md**

文件完整内容：

```markdown
# 模式 D：站点分析 + 抓取决策 + 自生成（方法论契约）

## 输入契约

- **必填：** 书 slug（与 `books/{slug}/` 一致）
- **必填：** `books/{slug}/catalog.md`（篇章列表来源）
- **推荐：** `books/{slug}/catalog.html`（Step 3.1 站点分析 URL 取样）
- **可选：** 篇章列表（逗号或空格分隔；缺省 = 整本所有未录篇章）

## 主 agent 流程

### Step 3.1 站点分析

读 catalog.html 中 1-2 篇 URL，用 LLM 推断：

- `siteType`：古籍站 / 文献库 / 博客 / 论坛 / 学术平台 / 未知
- `urlPattern`：URL 模板（如 `<base>/<book>/<chapter>.html`）
- `isSSR`：是否需要 JS 渲染（true 走 Playwright，否则 fetch 即可）
- `hasPagination`：是否分页（true 需遍历页码）

产物：`siteAnalysis = { siteType, urlPattern, isSSR, hasPagination }`

### Step 3.2 探查现有抓取工具

详见 `shared/sources/probe.md`。

运行时在 `scripts/` 子树扫 `.js` 文件，识别 fetch/scrape/crawl/source 类工具，
查是否覆盖目标站点。

产物：`probeResult = { existingTools: [...], uncovered: bool }`

### Step 3.3 决策路由

| 探查结果 | skill 动作 |
|---|---|
| 探到 1+ 候选且覆盖目标站点 | 告知用户工具名 + runner，等用户决定执行权 |
| 探到 0 个候选 | 进入 Step 3.4 自生成 |
| 探到但都不覆盖 | 告知候选清单 + 建议用户在工具内补 extractor（**skill 不做**） |

### Step 3.4 自生成临时脚本（仅未探到或用户明确选择时）

详见 `shared/sources/scratch-template.md`。

加载 prompt 模板 → 注入 siteAnalysis / chapterList / skeletonRedLines / formatSpec
→ LLM 生成一次性 Node 脚本 → 落 `.scratch/<slug>-<YYYYMMDD>.js`
→ 跑 `node --check <path>` 自检（语法错回退 Step 3.4 重生成，最多 3 次）

### Step 3.5 dry-run 合并 gate

AskUserQuestion 一次性呈现：

| 项 | 内容 |
|---|---|
| 范围 | slug + 篇章数 + 估算耗时 |
| 抓取方式 | 自生成 / 复用 X / 用户自跑 |
| 执行权 | AI 经确认后跑 / 用户自跑 |

### 执行

- **用户自跑**：skill 打印完整命令（自生成脚本路径 / 复用工具的 runner），等用户回报
- **AI 跑**：skill 跑进程 → 捕获 stdout/stderr → 回到 Step 5 红线复核

### Step 5 红线复核

详见 `shared/skeleton.md` 红线 5 条（不混解读 / 不改字 / 不加标记 / 不分段 / 不加空行外的任何内容）。

抽检：

- 抽 3-5 篇 source.md：注家块 / 字形 / 段长 / 空行 / 无解读
- 抽 1-2 篇含注家：`> 【XX】` 块引用完整
- 抽 1-2 篇长段：未被错误分段

`fatal > 0` → 不接受产出，提示手工修补或回 Step 2。

## 红线

1. **不绑定任何外部脚本路径**——probe.md 的探查方法不含具体路径
2. **不修改任何已有抓取工具**——`scripts/fetch-source.js` 视为外部工具实例之一
3. **不自动覆盖已有 source.md**——4 选项 gate（覆盖/备份/取消/退出）沿用

## 失败兜底

| 异常 | 处置 |
|---|---|
| 站点分析失败（catalog.html 缺失 / URL 不可达） | 报告 + 询问：改 URL 子模式 / 改源模式 / 取消 |
| 探查失败（`scripts/` 不存在 / 无 `.js`） | 视为"未探到"，进入自生成 |
| 探到但不覆盖 | 告知候选清单 + 建议补 extractor（skill 不做） |
| 自生成脚本语法错 | 回 Step 3.4 重新生成，最多 3 次 |
| 自生成脚本产出红线违规 | 报告违规项 + 不接受产出 + 让用户决定 |
| 用户取消 dry-run gate | 不写脚本、不跑，退出模式 D |
| 用户拒绝 AI 执行 | skill 打印命令，等用户回报 |
| 自生成脚本运行时网络失败 | 脚本内已重试 3 次；最终失败 → 非 0 退出 → skill 报告 stderr |
| 自生成脚本产物行数过短（< 100 字） | 报告可疑篇名 + 让用户决定 |

## 共享契约引用

| 契约 | 路径 |
|---|---|
| 探查方法论 | `shared/sources/probe.md` |
| 自生成 prompt 模板 | `shared/sources/scratch-template.md` |
| source.md 落盘规则 + 红线 | `shared/skeleton.md` |
| 字形策略 gate | `shared/gate.md` |
```

- [ ] **Step 3: 验证新 script.md 不绑定具体脚本路径**

```bash
grep -n 'node scripts/' .claude/skills/source-create/shared/sources/script.md
grep -n 'scripts/fetch-source.js' .claude/skills/source-create/shared/sources/script.md
```

Expected: 两条都 0 命中。

允许命中（需逐行确认是合理语境）：`scripts/fetch-source/` 作为外部工具实例引用（出现在「红线」「失败兜底」段说明 skill 不修改它）。

- [ ] **Step 4: 验证 script.md 引用 probe.md / scratch-template.md / skeleton.md**

```bash
grep -E 'probe\.md|scratch-template\.md|skeleton\.md' \
  .claude/skills/source-create/shared/sources/script.md | wc -l
```

Expected: ≥ 5（多次引用）。

- [ ] **Step 5: 验证 script.md 含 Step 3.1-3.5 五步骤**

```bash
grep -E '^### Step 3\.[1-5]' .claude/skills/source-create/shared/sources/script.md | wc -l
```

Expected: `5`。

- [ ] **Step 6: 备份文件保留做对照，不提交**

确认 `.bak-20260701` 文件**未**被 git 跟踪：

```bash
git status --ignored --short | grep script.md.bak
```

Expected: 出现 `!! .claude/skills/source-create/shared/sources/script.md.bak-20260701`（ignored 状态）。

若未 ignore，建议在 `.gitignore` 加 `*.bak-2026*` 后再重试（本计划暂不强制）。

- [ ] **Step 7: 提交**

```bash
git add .claude/skills/source-create/shared/sources/script.md
git commit -m "refactor(source-create): 重写模式 D 契约，从命令转发改为方法论

旧契约硬编码 scripts/fetch-source.js 命令模板；新契约改为：
- Step 3.1 站点分析（运行时推断站点类型与 URL 规律）
- Step 3.2 探查现有抓取工具（详见 probe.md）
- Step 3.3 决策路由（复用 / 建议补 extractor / 自生成）
- Step 3.4 自生成临时脚本（详见 scratch-template.md，落 .scratch/）
- Step 3.5 dry-run 合并 gate

scripts/fetch-source.js 不动，仍作为探查目标实例之一存在。"
```

---

## Task 5: 修改 shared/strategy.md（移除脚本命令模板）

**Files:**
- Modify: `.claude/skills/source-create/shared/strategy.md`

- [ ] **Step 1: 读取现状定位修改点**

```bash
grep -n 'scripts/fetch-source\|node scripts/\|批量脚本' \
  .claude/skills/source-create/shared/strategy.md
```

Expected: 命中若干行，包含「批量脚本调命令模板」整段。

- [ ] **Step 2: 修改 Step 2 模式 D 描述**

将 strategy.md 中模式 D 表格行从：

```
| D. 调脚本 | 已有 catalog.html + URL 模式整本 | `node scripts/fetch-source.js run` |
```

改为：

```
| D. 站点分析 + 自生成 | 用户给书 slug + 篇章列表（catalog.html 推荐） | 运行时探查 `scripts/` 子树；未覆盖则自生成临时脚本（详见 `sources/probe.md` + `sources/scratch-template.md`） |
```

文件实际编辑操作：

- 找到 "## Step 2：4 源模式" 下的表格
- 把模式 D 那行的工具列整行替换

- [ ] **Step 3: 删除「批量脚本调命令模板」整段**

找到 strategy.md 末尾附近的：

```
## 批量脚本调命令模板

\`\`\`bash
# dry-run 预览
node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force --dry-run

# 实跑
node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force
\`\`\`

> 注：v1 不动 fetch-source.js 内部代码；脚本是 data layer，skill 是 UI layer。
```

整段删除（含前后空行）。

- [ ] **Step 4: 在 strategy.md 末尾追加 1 行引用**

在文件末尾追加：

```
> 模式 D 不绑定任何外部脚本路径；详见 `shared/sources/probe.md` + `shared/sources/scratch-template.md`。
```

- [ ] **Step 5: 验证 strategy.md 不再含硬编码脚本路径**

```bash
grep -n 'scripts/fetch-source\|node scripts/' .claude/skills/source-create/shared/strategy.md
```

Expected: 0 命中。

- [ ] **Step 6: 验证 strategy.md 含新引用**

```bash
grep -E 'probe\.md|scratch-template\.md' .claude/skills/source-create/shared/strategy.md | wc -l
```

Expected: ≥ 1。

- [ ] **Step 7: 提交**

```bash
git add .claude/skills/source-create/shared/strategy.md
git commit -m "refactor(source-create): strategy.md 移除脚本命令模板 + 模式 D 描述更新

把模式 D 工具列从'调 scripts/fetch-source.js run'改为'运行时探查+自生成'。
删除'批量脚本调命令模板'整段。末尾追加 probe.md + scratch-template.md 引用。"
```

---

## Task 6: 修改 SKILL.md（Step 3 模式 D 拆 3.1-3.5）

**Files:**
- Modify: `.claude/skills/source-create/SKILL.md`

- [ ] **Step 1: 定位修改点**

```bash
grep -n 'Step 3\|模式 D\|D\. 调脚本' .claude/skills/source-create/SKILL.md
```

Expected: 命中若干行，重点找 Step 3 子章节标题。

- [ ] **Step 2: 修改 Step 3 状态机示意框**

在 SKILL.md 顶部状态机示意 ASCII 框中，找到：

```
[Step 1] 选模式 ──→ [Step 2] 选源模式 ──→ [Step 3] 收源+抓取 ──→ [Step 4] 字形 gate ──→ [Step 5] 落盘
   │ 2 选 1         │ 4 选 1              │ 按 mode 加载契约         │ 仅简体规范化时        │ 冲突 4 选项
   │ 单/批          │ URL/文本/图/脚本     │ 见 shared/sources/       │ v1 不自动 t2s        │ 覆盖/备份/取消/退
   └────────────────┴──────────────────────┴──────────────────────────┴───────────────────────┴────────────
   shortcut: /source-create {single|batch}    /source-create {A|B|C|D}
```

把「Step 3 收源+抓取」整列替换为：

```
[Step 3] 站点分析+抓取 ─→ [Step 4] 字形 gate ─→ [Step 5] 落盘
   │ 模式 D 拆 3.1-3.5   │ 仅简体规范化时     │ 冲突 4 选项
   │ 见 shared/sources/  │ v1 不自动 t2s     │ 覆盖/备份/取消/退
   └────────────────────┴───────────────────┴────────────
   shortcut: /source-create {single|batch}    /source-create {A|B|C|D}
```

并在文件末尾追加：

```
### Step 3 子步骤（模式 D 专用）

- **Step 3.1 站点分析**：读 catalog.html 1-2 篇 URL → LLM 推断 siteType / urlPattern / isSSR / hasPagination
- **Step 3.2 探查现有抓取工具**：扫 `scripts/` 子树 `.js` 文件，识别 fetch/scrape/crawl/source 类工具（详见 `shared/sources/probe.md`）
- **Step 3.3 决策路由**：复用 / 建议补 extractor / 自生成（三选一）
- **Step 3.4 自生成临时脚本**：加载 `shared/sources/scratch-template.md` prompt → LLM 生成一次性 Node 脚本 → 落 `.scratch/<slug>-<YYYYMMDD>.js` → `node --check` 自检
- **Step 3.5 dry-run 合并 gate**：AskUserQuestion 一次性确认范围 + 抓取方式 + 执行权
```

- [ ] **Step 3: 验证 SKILL.md 含 Step 3.1-3.5**

```bash
grep -E '^### Step 3\.[1-5]|^Step 3\.[1-5]' .claude/skills/source-create/SKILL.md | wc -l
```

Expected: ≥ 5。

- [ ] **Step 4: 验证 SKILL.md 不再含硬编码脚本命令**

```bash
grep -n 'scripts/fetch-source.js\|node scripts/' .claude/skills/source-create/SKILL.md
```

Expected: 0 命中（SKILL.md 是顶层入口，原本就不应直接出现命令模板）。

- [ ] **Step 5: 提交**

```bash
git add .claude/skills/source-create/SKILL.md
git commit -m "refactor(source-create): SKILL.md Step 3 模式 D 拆 3.1-3.5

旧 Step 3 模式 D 一句话'收 slug + 篇章列表（dry-run 后实跑）'；
新拆为 5 个子步骤:站点分析 / 探查 / 决策 / 自生成 / dry-run 合并 gate。
状态机示意框同步更新。文件末尾追加 Step 3 子步骤说明。"
```

---

## Task 7: 最终契约自检（spec §七 7.1 全项扫描）

**Files:**
- 无（纯验证任务）

- [ ] **Step 1: 验证 skill 契约层不出现硬编码脚本路径**

```bash
grep -rn 'scripts/fetch-source\|node scripts/' \
  .claude/skills/source-create/shared/sources/ \
  .claude/skills/source-create/SKILL.md \
  .claude/skills/source-create/shared/strategy.md
```

Expected: 0 命中（contract layer 范围内完全解耦）。

允许命中位置（仅作未来审计参考，本次不计入）：`shared/sources/script.md` 的「红线」段提及 `scripts/fetch-source.js` 作为外部工具实例。

- [ ] **Step 2: 验证 .scratch/ 已在 .gitignore**

```bash
grep -n '^.scratch' .gitignore
```

Expected: 1 行命中。

- [ ] **Step 3: 验证 Step 3 拆分语义完整**

```bash
grep -E '^### Step 3\.[1-5]' \
  .claude/skills/source-create/SKILL.md \
  .claude/skills/source-create/shared/sources/script.md | wc -l
```

Expected: ≥ 5（SKILL.md 至少 1 个 + script.md 5 个）。

- [ ] **Step 4: 验证 probe.md 不预设路径**

```bash
grep -n 'scripts/fetch-source' .claude/skills/source-create/shared/sources/probe.md
```

Expected: 0 命中。

- [ ] **Step 5: 验证 scratch-template.md 含红线 5 条**

```bash
grep -cE '不修改任何字形|不混入解读|不分段处理长段|不加非|段与段之间用单空行' \
  .claude/skills/source-create/shared/sources/scratch-template.md
```

Expected: `5`。

- [ ] **Step 6: 验证 .scratch/ 存在且 .gitkeep 在位**

```bash
ls -la .scratch/
```

Expected: 含 `.gitkeep` 文件。

- [ ] **Step 7: 验证 git 状态干净**

```bash
git status
```

Expected: `nothing to commit, working tree clean`。

若仍有未提交改动，按改动内容追加 commit。

- [ ] **Step 8: 提交验证报告（如有需要）**

若发现任何 spec §七 7.1 不达标项，先按需补 commit，再走：

```bash
git log --oneline -10
```

人工对照预期 6 个 commit（Task 1-6 各 1 个 + 本任务可能 0-1 个），确认无遗漏。

---

## Self-Review

### 1. Spec 覆盖

| Spec 章节 | 实施任务 |
|---|---|
| §一 目标（5 条驱动力 + 非目标） | Task 2-6（核心改造）+ Task 1（基础设施） |
| §二 最终结构 | Task 1（.scratch/）+ Task 2-6（契约文件） |
| §三 模式 D 数据流 | Task 4（script.md）+ Task 6（SKILL.md） |
| §四 关键契约内容草案 | Task 2（probe.md）+ Task 3（scratch-template.md）+ Task 4（script.md）+ Task 5（strategy.md）+ Task 6（SKILL.md） |
| §五 .scratch/ 约定 | Task 1 |
| §六 错误处理 | Task 4（失败兜底表） |
| §七 测试策略 | Task 7（7.1 自检全项扫描；7.2 演练路径留作计划外手动） |
| §八 变更总览 | 全部 Task 覆盖 |

无遗漏项。

### 2. Placeholder scan

- 0 个 TBD / TODO / "implement later"
- 0 个 "similar to Task N"
- 每个 Step 含完整命令 / 完整代码块 / 明确 Expected 输出

### 3. 类型/命名一致性

- 全程使用 `.scratch/<slug>-<YYYYMMDD>.js` 文件名约定（spec §五）
- 全程使用 `siteAnalysis` / `probeResult` 产物命名（spec §三）
- Step 3.1-3.5 编号在 SKILL.md / script.md / strategy.md / probe.md / scratch-template.md 全部一致