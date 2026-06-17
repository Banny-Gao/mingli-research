# skill-create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `skill-create` Claude Code skill that produces `books/{slug}/articles/{篇名}/skill.md` for the mingli-research project, following `research-dispute/SPEC-skill.md`.

**Architecture:** 6-step guided state machine (1a 选书 + 1b 选/沉淀篇 + 2 体检 + 3 写主体 + 4 self-check + 5 落盘 + 6 总结), with 3 manual gates (强装载 / 原文体检 / 落盘前), single-point interactive mode, main agent does the work (no subagent dispatch, no llm-batch.js script).

**Tech Stack:** Markdown skill files (Claude Code skill spec), existing shared fingerprint validator `scripts/self-check-fingerprint.py`, no new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-06-17-skill-create-design.md`

**Reference skills (for pattern reuse):**
- `.claude/skills/book-create/` — 6-step pattern + shared/ layout
- `.claude/skills/source-create/` — single-point + fingerprint pattern
- `.claude/skills/interpretation-create/` — 14 fingerprints + 6-step pipeline

---

## File Structure

```
.claude/skills/skill-create/        # NEW
├── SKILL.md                        # NEW: 6-step state machine body
└── shared/                         # NEW
    ├── spec-bundles.md            # NEW: 4 SPECs + 14 fingerprints
    ├── strategy.md                # NEW: single-point mode + 1a/1b logic
    ├── gate.md                    # NEW: 3 gates (load / exam / pre-write)
    ├── skeleton.md                # NEW: skill.md落盘规则
    └── sources/
        └── .gitkeep               # NEW: empty placeholder

docs/superpowers/plans/
└── 2026-06-17-skill-create.md     # THIS FILE
```

Each file: 单一职责。Total new: 5 markdown + 1 .gitkeep。

---

## Task 1: Create skill-create directory + .gitkeep placeholder

**Files:**
- Create: `.claude/skills/skill-create/shared/sources/.gitkeep`

- [ ] **Step 1: Create the directory structure**

Run:
```bash
mkdir -p .claude/skills/skill-create/shared/sources
```

Expected: command exits 0, directory created.

- [ ] **Step 2: Create empty .gitkeep file**

Run:
```bash
touch .claude/skills/skill-create/shared/sources/.gitkeep
```

Expected: command exits 0, file exists with size 0.

- [ ] **Step 3: Verify the directory tree**

Run:
```bash
find .claude/skills/skill-create -type d -o -type f | sort
```

Expected output:
```
.claude/skills/skill-create
.claude/skills/skill-create/shared
.claude/skills/skill-create/shared/sources
.claude/skills/skill-create/shared/sources/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/skill-create/
git commit -m "feat(skill-create): 创建 skill 目录骨架 + .gitkeep 占位"
```

---

## Task 2: Write spec-bundles.md (4 SPECs + 14 fingerprints)

**Files:**
- Create: `.claude/skills/skill-create/shared/spec-bundles.md`

- [ ] **Step 1: Write the file**

Write to `.claude/skills/skill-create/shared/spec-bundles.md` with the following content:

```markdown
# skill-create 规范包

## 必含规范（4 份）

| # | 规范 | 路径 | 用途 |
|---|------|------|------|
| 1 | SPEC-skill.md | `research-dispute/SPEC-skill.md` | skill.md 格式与原则（核心规范） |
| 2 | general.md | `research-dispute/general.md` | 通用红线 + 学术语体（含 14 条红线） |
| 3 | 术数专项 | `research-dispute/{术数}.md`（如 `bazi.md`）| 领域硬约束（按 `catalog.md` 术数字段动态加载）|
| 4 | source.md | `books/{slug}/articles/{篇名}/source.md` | 待沉淀的原文 |
| 5 | interpretation.md | `books/{slug}/articles/{篇名}/interpretation.md` | 上游解读 |

**任一缺失立即终止**（套 SPEC §五 Step 1.1）。

## 指纹校验（动态化）

不存死值。4 份规范的指纹在每次强装载时实时取，与"上次录入时的指纹"对比。

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-skill|general.md|bazi.md"
```

输出形如：
```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-skill.md 指纹: 200:abc123def456
research-dispute/bazi.md 指纹: 50:789ghi012jkl
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 v1 不走 subagent）。
```

- [ ] **Step 2: Verify file is created**

Run:
```bash
wc -l .claude/skills/skill-create/shared/spec-bundles.md
```

Expected: ~50 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/skill-create/shared/spec-bundles.md
git commit -m "feat(skill-create/shared): spec-bundles 4 份规范 + 14 指纹"
```

---

## Task 3: Write strategy.md (1a + 1b logic + 6 步概览)

**Files:**
- Create: `.claude/skills/skill-create/shared/strategy.md`

- [ ] **Step 1: Write the file**

Write to `.claude/skills/skill-create/shared/strategy.md` with the following content:

```markdown
# 模式选择 + 6 步流程总览

skill-create 仅支持**单点 interactive 模式**。主 agent 按本模板引导。

## Step 1a：选书

**AskUserQuestion：**

- Q: 「请选择书目 slug（books/ 下的目录名）」
- 列出 `books/*` 下的所有 slug（用 Glob 扫描）
- 选项：每个 slug 一项 + 「其他」兜底

输出：`slug`（如「滴天髓阐微」）。

## Step 1b：选/沉淀篇

如用户 `/skill-create {slug} {篇名}` 提供了篇名 → 跳过本步。

如未提供篇名 → 扫 `books/{slug}/articles/`，分三类列出：

| 类型 | 触发条件 | 提示语 |
|------|----------|--------|
| 已有 skill.md | `articles/{篇名}/skill.md` 存在 | 「本篇已有 skill.md，是否调整？」 |
| 未沉淀 skill | `articles/{篇名}/source.md` 存在但无 `skill.md` | 「本篇已录原文未沉淀技能，是否沉淀？」 |
| 全未录 | `articles/{篇名}/source.md` 不存在 | 「本篇尚未录原文，请先去 source-create」 |

**AskUserQuestion 选项：**

- A. 选已有 skill.md（列具体篇名）
- B. 选未沉淀篇（列具体篇名）
- C. 退出（先去 source-create）

输出：`篇名`。

## 6 步流程总览

| Step | 名称 | 门点 | 输出 |
|------|------|------|------|
| 1a | 选书 | — | slug |
| 1b | 选/沉淀篇 | — | 篇名 |
| 2 | 原文体检 | GATE 2 | 上游存在性确认 |
| 3 | 写 skill.md 主体 | — | 草稿（在上下文）|
| 4 | 自检 | GATE 3 | 14 指纹通过 |
| 5 | 落盘 | — | 写入文件 |
| 6 | 输出总结 | — | 用户报告 |

**GATE 1（强装载）** 在 Step 1a 之后、Step 1b 之前执行。详见 `gate.md`。
```

- [ ] **Step 2: Verify file is created**

Run:
```bash
wc -l .claude/skills/skill-create/shared/strategy.md
```

Expected: ~50 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/skill-create/shared/strategy.md
git commit -m "feat(skill-create/shared): strategy 1a+1b 选书选篇 + 6 步概览"
```

---

## Task 4: Write gate.md (3 gates + 4 options)

**Files:**
- Create: `.claude/skills/skill-create/shared/gate.md`

- [ ] **Step 1: Write the file**

Write to `.claude/skills/skill-create/shared/gate.md` with the following content:

```markdown
# skill-create 3 门点模板

## GATE 1: 强装载（Step 1a 之后）

**触发**：用户确认 `slug` 后，进入 Step 1b 之前。

**动作**：

1. Read `research-dispute/SPEC-skill.md` 全文
2. Read `research-dispute/general.md` 全文
3. Read `research-dispute/{术数}.md`（如 `bazi.md`，从 catalog.md 术数字段取）
4. Read `books/{slug}/catalog.md` 全文
5. 跑 `python3 scripts/self-check-fingerprint.py | grep -E "SPEC-skill|general.md|bazi.md"`
6. 把 14 条指纹打印到对话上下文

**不通过处置**：

- SPEC-skill.md 缺失 → 全阻断，提示「请先恢复 research-dispute/SPEC-skill.md」
- 14 指纹漂移 → 警告用户，让其选择「继续 / 重启流程」

## GATE 2: 原文体检（Step 2）

**触发**：用户确认 `篇名` 后，进入 Step 3 之前。

**动作**：

1. 检查 `books/{slug}/articles/{篇名}/source.md` 是否存在
2. 检查 `books/{slug}/articles/{篇名}/interpretation.md` 是否存在
3. 检查 `books/{slug}/catalog.md` 是否存在（软依赖，仅警告不阻断）

**不通过处置**：

| 缺失项 | 处置 |
|--------|------|
| source.md | 阻断，3 选项门：调 source-create / 取消 / 退出 |
| interpretation.md | 阻断，3 选项门：调 interpretation-create / 取消 / 退出 |
| catalog.md | 警告，继续（不阻断） |

## GATE 3: 落盘前（Step 4）

**触发**：Step 3 写完主体后，落盘之前。

**动作**：

1. 14 条指纹自检（详见 `spec-bundles.md`）
2. 跑 `cat -An books/{slug}/articles/{篇名}/skill.md` 自查行号/字符

**不通过处置 — 4 选项门**：

- A. **覆盖**：直接 Write 覆盖旧版
- B. **备份**：先 `cp skill.md skill.md.bak.{N}` 再 Write
- C. **取消**：保留草稿在上下文，不落盘
- D. **退出**：丢弃草稿，结束 skill-create

**全部通过 → 进入 Step 5 落盘。**

## 中断与重启

每个 Step 间允许用户输入 `/exit` 中断：

- 未落盘内容自动不保存
- 重新启动从 Step 1a 开始（**不续上次的进度**）
```

- [ ] **Step 2: Verify file is created**

Run:
```bash
wc -l .claude/skills/skill-create/shared/gate.md
```

Expected: ~70 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/skill-create/shared/gate.md
git commit -m "feat(skill-create/shared): gate 3 门点 + 4 选项冲突门"
```

---

## Task 5: Write skeleton.md (skill.md 落盘规则)

**Files:**
- Create: `.claude/skills/skill-create/shared/skeleton.md`

- [ ] **Step 1: Write the file**

Write to `.claude/skills/skill-create/shared/skeleton.md` with the following content:

```markdown
# skill.md 落盘规则

主 agent 在 Step 5 落盘时创建产物：`books/{slug}/articles/{篇名}/skill.md`

## 与 source.md / interpretation.md 的关键差异

| 维度 | source.md | interpretation.md | skill.md |
|------|-----------|-------------------|----------|
| 元信息 blockquote | 无 | 无 | **无**（同 source） |
| 一级标题 | `# {篇名}` 裸篇名 | 无 H1 | **无 H1**（避免与目录系统重复） |
| 块引用 | 仅 `> 【注家名】` | 多类 | **简单块引用**（仅 `> ` 标注文） |
| 表格 | 无 | 允许 | 允许 |
| Mermaid | 无 | 允许 | 允许（流程图用） |
| 二级标题 | 无 | 多 | 多（必备） |

## skill.md 模板（摘自 SPEC-skill.md §三）

```markdown
> 【技能】{技能名}
> 【适用】{适用场景 1 句话}
> 【依赖】{前置 skill.md 名（如有），或"无"}
> 【生成时间】{YYYY-MM-DD}

## 一、适用前提

{该技能生效需满足的硬条件，如"已录 source.md + interpretation.md"}

## 二、操作流程

### Step 1: {动作 1}
{详细操作步骤}

### Step 2: {动作 2}
{详细操作步骤}

## 三、判定准则

{如何判断操作成功的标准}

## 四、边界与例外

{该技能不适用的场景}
```

## 字段填充规则

- **无 H1**（裸篇名由目录系统推导）
- **必含 4 个 blockquote 元信息**：技能 / 适用 / 依赖 / 生成时间
- **必含 4 个二级章节**：适用前提 / 操作流程 / 判定准则 / 边界与例外
- 引文可 `>` 块引用 + 完整整句
- 引用 source.md / interpretation.md 内容时用 `见 source.md` / `见 interpretation.md` 简短指引，不复制粘贴

## 落盘前自检 14 指纹

| # | 指纹 | 验证方式 |
|---|------|----------|
| 1 | 4 blockquote 元信息完整 | grep `^> 【` 计数 = 4 |
| 2 | 无 H1 | grep `^# ` 计数 = 0 |
| 3 | 二级章节数 ≥ 4 | grep `^## ` 计数 ≥ 4 |
| 4 | 包含"适用前提" | grep `## 一、适用前提` |
| 5 | 包含"操作流程" | grep `## 二、操作流程` |
| 6 | 包含"判定准则" | grep `## 三、判定准则` |
| 7 | 包含"边界与例外" | grep `## 四、边界与例外` |
| 8 | 无元信息 blockquote（H1 之外） | grep -v `^> ` |
| 9 | 引用 source.md 不用 `> 【原文】` | grep `> 【原文】` 计数 = 0 |
| 10 | 引用 interpretation.md 不用 `> 【解读】` | grep `> 【解读】` 计数 = 0 |
| 11 | 表格行无空列 | 见 self-check 脚本 |
| 12 | Mermaid 块有 ` ```mermaid ` 头尾 | grep -c '```mermaid' |
| 13 | 操作流程 ≥ 2 步 | grep `^### Step` 计数 ≥ 2 |
| 14 | 学术语体（无 AI 自指） | grep -i "作为 AI\|我作为\|i am an ai" 计数 = 0 |

**任一指纹不通过 → 回 Step 3 修复。**
```

- [ ] **Step 2: Verify file is created**

Run:
```bash
wc -l .claude/skills/skill-create/shared/skeleton.md
```

Expected: ~90 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/skill-create/shared/skeleton.md
git commit -m "feat(skill-create/shared): skeleton 落盘规则 + 14 指纹清单"
```

---

## Task 6: Write SKILL.md (6-step state machine body)

**Files:**
- Create: `.claude/skills/skill-create/SKILL.md`

- [ ] **Step 1: Write the file frontmatter + intro**

Write to `.claude/skills/skill-create/SKILL.md` with the following content:

```markdown
---
name: skill-create
description: 技能文章生成技能。单点 + 6 步引导式状态机 + 3 门点（强装载 / 原文体检 / 落盘前），主 agent 亲自产出，按 SPEC-skill.md 严格生成 books/{slug}/articles/{篇名}/skill.md。
---

# skill-create 技能文章生成技能

为五术研究项目提供**将 source.md + interpretation.md 沉淀为"技能型文章"**的入口。

## 核心立场

- **单点 interactive 模式**（不批量、不派 subagent、不调 llm-batch.js）
- **6 步引导式状态机** + **3 门点**（强装载 / 原文体检 / 落盘前）
- **严格遵守** `research-dispute/SPEC-skill.md` + `research-dispute/general.md` + 术数专项（如 `bazi.md`）
- **产物**：`books/{slug}/articles/{篇名}/skill.md`

## 何时使用本 skill

- 用户输入 `/skill-create` 或自然语言「写技能文章 / 录技能 / 创建 skill.md / 沉淀 skill / 写技能手册」
- 已有 source.md + interpretation.md 存在，想进一步凝练为"AI 可执行的技能手册"

## 何时不要使用本 skill

- source.md 尚未录 → 去 source-create
- interpretation.md 尚未写 → 去 interpretation-create
- 想创建 `.claude/skills/` 下的 Claude Code skill（不是本 skill 的范围）

## 6 步流程

详见 `shared/strategy.md` 概览 + `shared/gate.md` 门点模板 + `shared/skeleton.md` 落盘规则。

| Step | 动作 | 详情 |
|------|------|------|
| 1a | 选书 | `shared/strategy.md` §Step 1a |
| 1b | 选/沉淀篇 | `shared/strategy.md` §Step 1b |
| 2 | 原文体检（GATE 2）| `shared/gate.md` §GATE 2 |
| 3 | 写 skill.md 主体 | `shared/skeleton.md` |
| 4 | 自检（GATE 3）| `shared/skeleton.md` §14 指纹 + `shared/gate.md` §GATE 3 |
| 5 | 落盘 | `Write books/{slug}/articles/{篇名}/skill.md` + `cat -An` 验证 |
| 6 | 输出总结 | 合规分 / 耗时 / 关键改动 |

**GATE 1 强装载** 在 Step 1a 后、Step 1b 前执行。详见 `shared/gate.md` §GATE 1。

## 主 agent 执行检查清单

启动本 skill 时，按顺序确认：

- [ ] 读到本 SKILL.md
- [ ] 读到 `shared/spec-bundles.md` 了解 4 份规范
- [ ] 读到 `shared/strategy.md` 了解 1a/1b 逻辑
- [ ] 读到 `shared/gate.md` 了解 3 门点
- [ ] 读到 `shared/skeleton.md` 了解落盘规则

## 不在 scope 内

详见 spec §9：

- 不创建新的 Claude Code skill
- 不写 subagent 派发逻辑
- 不调 `scripts/lib/llm-batch.js`
- 不写 `SPEC-skill-create.md`
- 不做批量模式
- 不做干跑预览门点
- 不做跨书聚合型 skill

## 失败处置

详见 spec §5：

| 类别 | 触发 | 处置 |
|------|------|------|
| 1. 上游缺失 | source.md / interpretation.md 不存在 | 阻断，3 选项门（调上游 skill / 取消 / 退出）|
| 2. 指纹不通过 | Step 4 self-check 失败 | 4 选项门（覆盖 / 备份 / 取消 / 退出）|
| 3. 用户中途放弃 | Step 间 `/exit` | 未落盘不保存，重启从 Step 1a 开始 |
| 4. SPEC-skill.md 缺失 | 强装载 gate 失败 | 全阻断，提示恢复 SPEC |
```

- [ ] **Step 2: Verify file is created**

Run:
```bash
wc -l .claude/skills/skill-create/SKILL.md
```

Expected: ~90 lines.

- [ ] **Step 3: Verify all 5 files present + frontmatter valid**

Run:
```bash
ls -la .claude/skills/skill-create/ .claude/skills/skill-create/shared/
echo "---"
head -3 .claude/skills/skill-create/SKILL.md
```

Expected:
- 5 markdown files present (SKILL.md + 4 shared/*.md)
- 1 .gitkeep
- First 3 lines of SKILL.md show frontmatter delimiter + name + description

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/skill-create/SKILL.md
git commit -m "feat(skill-create): SKILL.md 6 步状态机主体 + 触发说明 + 失败处置"
```

---

## Task 7: Dry test (run on existing skill.md)

**Files:** none (test only)

- [ ] **Step 1: Find an existing skill.md to dry-test**

Run:
```bash
find books -name "skill.md" -type f 2>&1 | head -5
```

Expected: 0-3 paths. If 0 paths, **skip to Task 8 wet test** (no existing skill.md to test against).

- [ ] **Step 2: Run the 6-step state machine**

If existing skill.md found, walk through:
1. Step 1a: pick the slug containing that skill.md
2. Step 1b: pick the existing 篇名 (triggers "已有 skill.md，是否调整？" branch)
3. GATE 1: verify 14 fingerprints printed
4. Step 2: verify source.md + interpretation.md exist
5. Step 3-5: produce a copy of the existing skill.md (no actual changes)
6. Step 4: verify 14 指纹 pass
7. Step 5: 4 选项门 — pick "B. 备份" to verify backup path

Expected: 
- Backup file `skill.md.bak.1` created
- 6 steps complete without error
- 14 fingerprints pass

- [ ] **Step 3: Verify backup file created**

Run:
```bash
ls books/{slug}/articles/{篇名}/skill.md*
```

Expected: at minimum `skill.md` + `skill.md.bak.1`.

- [ ] **Step 4: Restore original (no actual content change)**

Run:
```bash
mv books/{slug}/articles/{篇名}/skill.md.bak.1 books/{slug}/articles/{篇名}/skill.md
```

Expected: `skill.md` is unchanged (content matches the pre-test version).

---

## Task 8: Wet test (run on a 未沉淀 skill 的篇)

**Files:** none (test only)

- [ ] **Step 1: Find a candidate 未沉淀篇**

Run:
```bash
# 找有 source.md + interpretation.md 但无 skill.md 的篇
for d in books/*/articles/*/; do
  if [ -f "${d}source.md" ] && [ -f "${d}interpretation.md" ] && [ ! -f "${d}skill.md" ]; then
    echo "CANDIDATE: $d"
  fi
done
```

Expected: 0-N candidates. If 0, pick the first book with `source.md` + `interpretation.md` and run skill-create on it (even if `skill.md` already exists — the wet test just verifies the 6-step pipeline runs end-to-end).

- [ ] **Step 2: Run the full 6-step state machine**

Walk through all 6 steps on the candidate:
1. Step 1a: pick slug
2. Step 1b: pick 篇名 (if not pre-selected, trigger "未沉淀 skill" branch)
3. GATE 1: load 4 SPECs + 14 fingerprints
4. Step 2: verify source.md + interpretation.md exist
5. Step 3: write skill.md 主体 (this is the real test — does the main agent produce a valid skill.md?)
6. Step 4: run 14 指纹 self-check
7. Step 5: 4 选项门 (pick B. 备份 if existing skill.md; pick A. 覆盖 if new)
8. Step 6: 总结

Expected:
- skill.md produced (or backed up + new written)
- 14 指纹 pass
- No fatal error

- [ ] **Step 3: Verify produced skill.md passes 14 fingerprints**

Run:
```bash
# 指纹 1: 4 blockquote 元信息
grep -c "^> 【" books/{slug}/articles/{篇名}/skill.md
# Expected: 4

# 指纹 2: 无 H1
grep -c "^# " books/{slug}/articles/{篇名}/skill.md
# Expected: 0

# 指纹 3: 二级章节数 ≥ 4
grep -c "^## " books/{slug}/articles/{篇名}/skill.md
# Expected: ≥ 4

# 指纹 4-7: 必含章节
for sec in "## 一、适用前提" "## 二、操作流程" "## 三、判定准则" "## 四、边界与例外"; do
  grep -F "$sec" books/{slug}/articles/{篇名}/skill.md || echo "MISSING: $sec"
done
# Expected: no MISSING output

# 指纹 9-10: 无误用块引用
grep -c "^> 【原文】" books/{slug}/articles/{篇名}/skill.md
grep -c "^> 【解读】" books/{slug}/articles/{篇名}/skill.md
# Expected: both 0

# 指纹 14: 学术语体
grep -ci "作为 AI\|我作为\|i am an ai" books/{slug}/articles/{篇名}/skill.md
# Expected: 0
```

- [ ] **Step 4: Restore state if test produced unwanted changes**

If the wet test produced a skill.md that shouldn't exist:
```bash
# 删除测试产物
rm books/{slug}/articles/{篇名}/skill.md
# 恢复备份
mv books/{slug}/articles/{篇名}/skill.md.bak.1 books/{slug}/articles/{篇名}/skill.md
```

Expected: working tree clean for that article.

---

## Task 9: Regression test (concurrent with interpretation-create)

**Files:** none (test only)

- [ ] **Step 1: Run interpretation-create on a 篇**

Pick any book/article that has source.md but no interpretation.md, run interpretation-create. Verify it completes without error.

- [ ] **Step 2: Immediately run skill-create on the same 书**

After interpretation-create finishes, run skill-create on the same book. Verify:
- GATE 1 strong-load still works (14 fingerprints load)
- 6 steps complete without context conflict

- [ ] **Step 3: Verify no cross-contamination**

Run:
```bash
# 检查 interpretation.md 没被 skill-create 误改
md5sum books/{slug}/articles/{篇名}/interpretation.md
# 与 git HEAD 对比
git diff books/{slug}/articles/{篇名}/interpretation.md | head -5
```

Expected: interpretation.md unchanged from its git-tracked state.

---

## Task 10: Final commit + summary

**Files:** none (git ops only)

- [ ] **Step 1: Verify working tree is clean**

Run:
```bash
git status
```

Expected: clean working tree (or only test artifacts that should be discarded).

- [ ] **Step 2: Check commit log**

Run:
```bash
git log --oneline -10
```

Expected: 5-6 new commits from this plan (Tasks 1, 2, 3, 4, 5, 6).

- [ ] **Step 3: Final summary**

Report:
- Total new files: 6 (SKILL.md + 4 shared/*.md + .gitkeep)
- Total new lines: ~400 lines of markdown
- Commits added: 6
- Skill now invokable via `/skill-create`
- Spec coverage: §1-§11 all implemented (1 in Tasks 6+1+2; 2 in Task 5; 3 in Tasks 1+3+6; 4 in Task 4; 5 in Task 4; 6 in Task 6; 7 in Tasks 7+8+9; 8 in all tasks; 9 in Task 6; 10 in Task 2; 11 in Task 6)
