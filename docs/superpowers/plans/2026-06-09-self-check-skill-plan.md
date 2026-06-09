# self-check 自检技能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 4 类自检 skill（catalog/source/interpretation/skill），让用户能用 `/self-check` 引导式跑合规扫描并产出按书聚合的 markdown 报告。

**Architecture:** 4 个子 skill 并列 + shared/ 共享契约。主 SKILL.md 实现 5 步引导式状态机；4 个子 SKILL.md 各自组装规范包并派发隔离的 subagent；subagent 输出 markdown 报告，fatal 走主 agent 落盘 gate。

**Tech Stack:** Markdown（SKILL.md 全部用纯文本），Shell（Bash 探测 books/ + git commit），Python 3（仅用于 spec-bundles.md 指纹校验脚本）。无前端、无运行时框架。

---

## File Structure

本 plan 涉及以下文件：

**新建（19 个）：**
```
.claude/skills/self-check/
├── SKILL.md                            # T9
├── shared/
│   ├── entrypoint.md                   # T2
│   ├── goal-loop.md                    # T5
│   ├── subagent-contract.md            # T3
│   ├── books-mode.md                   # T6
│   ├── article-mode.md                 # T7
│   ├── report-template.md              # T4
│   └── spec-bundles.md                 # T8
├── catalog/SKILL.md                    # T10
├── source/SKILL.md                     # T11
├── interpretation/SKILL.md             # T12
└── skill/SKILL.md                      # T13
.claude/notes/self-check/.gitkeep      # T1
scripts/self-check-fingerprint.py       # T14
```

**不修改任何现有文件**（除根 `.gitignore` 视需要追加 `.claude/notes/` 排除项，但不强制）。

---

## Task 1: 创建目录脚手架

**Files:**
- Create: `.claude/skills/self-check/.gitkeep`
- Create: `.claude/skills/self-check/shared/.gitkeep`
- Create: `.claude/skills/self-check/catalog/.gitkeep`
- Create: `.claude/skills/self-check/source/.gitkeep`
- Create: `.claude/skills/self-check/interpretation/.gitkeep`
- Create: `.claude/skills/self-check/skill/.gitkeep`
- Create: `.claude/notes/self-check/.gitkeep`

- [ ] **Step 1: 创建 7 个目录的 .gitkeep 占位文件**

执行：

```bash
mkdir -p /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/{shared,catalog,source,interpretation,skill}
mkdir -p /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check
touch /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/{,shared,catalog,source,interpretation,skill}/.gitkeep
touch /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/.gitkeep
```

- [ ] **Step 2: 验证目录创建成功**

```bash
ls -la /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/
ls -la /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/
```

预期：5 个子目录（shared, catalog, source, interpretation, skill）全部存在，`.claude/notes/self-check/` 存在。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/ .claude/notes/self-check/
git commit -m "chore(self-check): 创建 4 类自检 skill 目录脚手架"
```

---

## Task 2: shared/entrypoint.md（5 步引导式状态机契约）

**Files:**
- Create: `.claude/skills/self-check/shared/entrypoint.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/entrypoint.md`）：

````markdown
# 引导式入口状态机契约

主 SKILL.md 实现 5 步引导式状态机。本片段是契约定义，4 类自检的子 SKILL.md 不再重复。

## 5 步流程

```
[Step 1] 选类别 → AskUserQuestion 4 选 1
[Step 2] 选书籍 → 探测 books/ + Read catalog.md 元信息 + 多选
[Step 3] 选篇章 (可跳过) + 抽检
[Step 4] 模式确认（books / 篇章）
[Step 5] goal + loop
[Step 6] 路由到子 SKILL.md
```

**捷径：** Step 1 接受"类别作为命令参数"（如 `/self-check source`），跳过类别选择直接进 Step 2。其他 Step 不接受命令参数。

## Step 1 — 类别

- 触发：用户输入 `/self-check` 或 `/自检`
- 动作：AskUserQuestion，header "类别"，4 选项 catalog/source/interpretation/skill
- 异常：用户输入 `/self-check source`（带参数）→ 跳过 Step 1，锁定 source
- 状态写：`type ∈ {catalog, source, interpretation, skill}`

## Step 2 — 书籍

- 触发：Step 1 完成
- 动作：
  1. Bash `ls books/ | grep -v '^\.'` 探测
  2. 对每个目录 Read `catalog.md` blockquote，提取 `> 术数：...` 和 `> 类别：...`
  3. 过滤掉 catalog.md 不含合法 `术数` 字段的目录
  4. AskUserQuestion 呈现：书名（中文 `《》`）+ slug + 术数，多选
- 异常：books/ 为空 → 输出"未发现可检书籍，请先放入至少一本带 catalog.md 的书"并退出
- 状态写：`books = [{slug, title, shu}...], count = N`

## Step 3 — 篇章 + 抽检

- 触发：Step 2 完成
- 分支：
  - **catalog 类型**：跳过 Step 3（catalog 不针对篇章）
  - **skill / interpretation 类型**：Bash `ls books/{slug}/articles/`，列目录名作为可选篇名；**必问且至少选 1 篇**
  - **source 类型**：默认全检（不再问篇章），直接进入 Step 4；如用户主动要求聚焦篇章，可在 Step 2 选单书时用命令参数 `/self-check source --focus` 显式进入 Step 3
- 抽检选项（条件性）：
  - 仅在 books 模式 + 总篇章数 > 5 时出现
  - "全检 / 抽检 N 篇" 两选项
  - 选"抽检 N" → 追问"随机种子"（可空，空则用 system time）
  - 抽签算法：等价 Python `random.sample(chapters, N, random=seed)`；seed 空时用 `random.SystemRandom().sample(chapters, N)`
- 异常：抽检 N 大于总篇章数 → 报"超过总数"并回退到全检
- 状态写：`chapters = [...], sample_mode ∈ {all, sample}, sample_n = N, sample_seed = seed`

## Step 4 — 模式确认

- 动作：单问题 AskUserQuestion "本次自检模式：books / 篇章"
- 默认推导：
  - Step 3 选篇章 + Step 2 选单书 → 默认"篇章"
  - Step 3 选篇章 + Step 2 选多书 → 默认"books"
  - Step 3 跳过（catalog）→ 默认"books"
- 用户可覆盖
- 状态写：`mode ∈ {books, article}`

## Step 5 — goal + loop

详见 `shared/goal-loop.md`。

## Step 6 — 路由执行

- 动作：Read `.claude/skills/self-check/{type}/SKILL.md` 全文 → 调入上下文
- 主 agent 此时已持有完整状态：`{type, books, chapters, sample, mode, goal, loop}`
- 子 SKILL.md 接管执行
````

- [ ] **Step 2: 验证文件包含 6 个 Step 标题**

```bash
grep -c '^## Step' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/entrypoint.md
```

预期：`6`（Step 1-6 全部在；Step 5 标题行含跳转引用 `详见 shared/goal-loop.md`，与 spec §4.5 一致）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/entrypoint.md
git commit -m "feat(self-check): 添加 shared/entrypoint.md 5 步引导式状态机契约"
```

---

## Task 3: shared/subagent-contract.md（subagent prompt 通用契约）

**Files:**
- Create: `.claude/skills/self-check/shared/subagent-contract.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/subagent-contract.md`）：

````markdown
# subagent 契约

## 上下文隔离

**subagent 不传历史上下文。** prompt 全文 = 角色段 + 规范包段 + 任务段 + 输出模板段。

- 不传其他 subagent 的 finding 列表
- 不传 git log
- 不传历史对话
- 唯一动态内容：本篇文件全文（由主 agent 在派发前 Read 并内联）

## subagent prompt 标准结构

```
[角色段]
你是一个隔离的子审查员。本次任务：{type} 自检，单篇聚焦。
你只能 Read 一个文件：books/{slug}/articles/{篇名}/{source|interpretation|skill}.md
（catalog 自检：books/{slug}/catalog.html 与 catalog.md）
你不能 git log、不能 Read 历史对话、不能改任何文件。
你的输出是一份 markdown 报告，写在最终消息里。

[规范包段 - 不可省略]
> 必读：以下为本次任务必须严格遵守的规范正本

## general.md 全文
（内联）

## SPEC-{type}.md 全文
（内联）

## bazi.md 全文（若书的术数=命）
（内联，否则省略）

[任务段]
本次待检文件：{book}/{篇名}
本次自检口径：{goal 描述，含 sample_mode + goal 选项名}
（subagent 不知道"本批"还是"N 批"——这是主 agent 层的语义；subagent 只看到"按规范包逐条过"这一基准）

[输出模板]
请严格按以下 markdown 模板输出。空项写 "无"。

# {书名} — {篇名} — {type}自检报告

> subagent id：sa-{sha256(prompt+timestamp)[:8]}
> 扫描时长：{subagent 自己估算}
> 已对照规范条款：{stats.rules_evaluated 列出}

## 总览
- fatal: 0
- error: 0
- warn: 0
- info: 0

## findings

### F001 [error] 违反 §X.Y
- 位置：{file:line 或 section 名}
- 原文片段：{quote ≤80 字}
- 违反说明：{explanation}
- 建议修复：{suggested_fix - 可直接粘贴的 markdown 片段}

### F002 ...

## ⚠️ 待用户确认的修复建议
（仅当 fatal ≥1 时出现，列出全部 fatal 的 fix，供主 agent 在主对话中落盘）
（无 fatal 时此区块整段省略）

[结束]
输出完毕后不要追加任何元说明。
```

## 修复责任 — C+D 组合

**subagent 永不直接改文件。** 这是隔离的硬底线。

- subagent 报告中**所有 finding** 必填 `suggested_fix`（可粘贴的 markdown 片段）
- subagent 报告中**若发现 ≥1 个 fatal**，报告末尾追加区块 `## ⚠️ 待用户确认的修复建议`
- 主 agent 看到 fatal 区块 → **暂停** → AskUserQuestion 问"是否落盘" → 用户确认 → 主 agent 在主对话里**用 Edit 工具**改文件 → 落盘完成 → 写 commit message 草稿（不自动提交）
- non-fatal（error/warn/info）的 fix 仅在报告里呈现，**不**询问用户；用户自行决定何时处理
````

- [ ] **Step 2: 验证 subagent 隔离条款出现**

```bash
grep -cE '不传历史|不能.*历史' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/subagent-contract.md
```

预期：`≥ 3`（"不传历史上下文"+"不传历史对话"+"不能 Read 历史对话" 共 3 处显式隔离表述；另含"不传其他 subagent 的 finding 列表""不传 git log"两条独立条款）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/subagent-contract.md
git commit -m "feat(self-check): 添加 shared/subagent-contract.md 通用契约"
```

---

## Task 4: shared/report-template.md（报告模板）

**Files:**
- Create: `.claude/skills/self-check/shared/report-template.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/report-template.md`）：

````markdown
# 报告落盘格式

## 每本书一份报告

文件位置：`.claude/notes/self-check/{书-slug}-{type}-{YYYY-MM-DD}.md`

模板：

```markdown
# {书名} — {类型}自检报告

> 生成时间：YYYY-MM-DD HH:MM
> 类型：catalog | source | interpretation | skill
> 覆盖范围：{N} 篇（books 模式）| 单篇「{篇名}」（篇章模式）
> 随机种子：{seed 或 "未指定"}
> 抽检：{全检 | 抽检 N 篇}
> goal：{用户给定 goal 选项 + 抽检模式，如 "sample + 本批通过" / "all + 连续 2 轮自检"}

## 总览

| 严重度 | 数量 | 示例 |
|--------|------|------|
| fatal  | 0    | —    |
| error  | 3    | F002 |
| warn   | 7    | F005 |
| info   | 2    | F011 |

## findings 清单

### F001 [error] 违反 §X.Y
- 书：{slug} 篇：{篇名}
- 位置：{location}
- 原文片段：{quote}
- 违反说明：{explanation}
- 建议修复：{suggested_fix}

### F002 ...
```

## 汇总索引

文件位置：`.claude/notes/self-check/INDEX.md`

每次自检完成后追加一行（不覆盖已有行）：

```markdown
# 自检历史索引

| 日期 | 类型 | 书籍 | 报告 | fatal/error/warn |
|------|------|------|------|------------------|
| 2026-06-09 | source | 滴天髓阐微 | [link] | 0/2/5 |
| 2026-06-08 | interpretation | 子平真诠 | [link] | 0/1/3 |
```

`[link]` 格式：相对路径 `./{书-slug}-{type}-{date}.md`。
````

- [ ] **Step 2: 验证两个模板代码块都在**

```bash
grep -c '^```markdown' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/report-template.md
```

预期：`2`（每本书报告 + 汇总索引）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/report-template.md
git commit -m "feat(self-check): 添加 shared/report-template.md 报告模板"
```

---

## Task 5: shared/goal-loop.md（goal + loop 字段契约）

**Files:**
- Create: `.claude/skills/self-check/shared/goal-loop.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/goal-loop.md`）：

````markdown
# goal + loop 字段契约

## `goal` 字段语义

**`goal` 字段语义：通过/收敛的判定口径。** 基准是"按规范包逐条过"，goal 决定"通过"如何定义。

## `goal` 选项按 `sample_mode` 条件性显示

**`sample_mode = sample`（抽检）时：**
- 选项 1: "本批通过"（单次抽检全部 finding ≤ 阈值即退出）
- 选项 2: "前 N 批通过"（连续 N 批达标才退出，**默认 N=2**）
- 选项 3: "总 books 通过率"（全部 books 抽检完且总通过率 ≥ 阈值退出，**默认阈值 = 100%**，即收齐全部 books 才算通过）
- "其他" → 用户自定义补充（与"前 N 批""通过率"等概念叠加）

**`sample_mode = all`（全检）时：**
- 选项 1: "本批通过"（单次全检全部 finding ≤ 阈值即退出）
- 选项 2: "连续 N 轮自检"（连续 N 轮无新 fatal 才退出，**默认 N=2**）
- 选项 3: "全部 books 通过"（所有选中 books 全部自检完才退出）
- "其他" → 用户自定义补充

## goal 默认值

若用户不填，"其他"分支未选，`sample_mode=sample` 时默认选项 2（"前 N 批通过"），`sample_mode=all` 时默认选项 2（"连续 N 轮自检"）。这给"反复打磨直至收敛"一个稳妥默认。

## `loop` 字段语义

**`loop` 字段：监督 goal 完成情况。** 在 goal 达成后，决定是否继续运行。

- loop = "达到即停"（默认）：goal 触发即终止
- loop = "达到后继续一轮"：goal 触发后跑 1 轮确认无 regression，再终止
- loop = "持续运行至用户中断"：goal 仅作日志/告警参考，运行不退出；**中断信号 = 用户在主对话输入"停""退出""abort"任意一个**，主 agent 收到后立即终止当前批次并汇总已检结果

## `loop` 与 `goal` 的关系

- `goal` 是 **目标**（什么算"通过"）
- `loop` 是 **监督策略**（达成目标后怎么响应）
- 两者正交：goal 选 "本批通过" + loop 选 "达到后继续一轮" = 跑两次抽检才退
````

- [ ] **Step 2: 验证条件性显示两节都在**

```bash
grep -c 'sample_mode = sample' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/goal-loop.md
grep -c 'sample_mode = all' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/goal-loop.md
```

预期：两个命令都输出 `1`（每个出现一次）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/goal-loop.md
git commit -m "feat(self-check): 添加 shared/goal-loop.md 条件性 goal + loop 契约"
```

---

## Task 6: shared/books-mode.md（books 模式调度协议）

**Files:**
- Create: `.claude/skills/self-check/shared/books-mode.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/books-mode.md`）：

````markdown
# books 模式调度协议

主 agent 在 books 模式（`mode = books`）下的标准调度流程。

## 调度协议

```
主 agent
  │
  ├── A: 解析所有待检 (book, chapter) 组合 → 列表 L
  ├── B: 抽检模式（如启用）→ 用 sample_seed 从 L 抽 N 个
  ├── C: 决定并发度 N_worker = min(5, len(L), cpu-2)
  ├── D: 用 Agent tool 一次性发起 N_worker 个 general-purpose subagent
  │         每个 subagent prompt = 契约 + 规范包 + (book, chapter) + task
  ├── E: 等待全部 subagent 返回（失败/超时的 subagent 标记为 skipped，不重试）
  ├── F: 收集 N 个 markdown 报告
  ├── G: 跨 subagent 聚合
  │         - 用 (type, book, chapter, rule, location) 五元组模糊去重
  │         - 抽取全部 fatal → 合并到"待用户确认的修复建议"区块
  │         - 生成"本书自检报告"
  │         - 落盘到 .claude/notes/self-check/{书}-{type}-{YYYY-MM-DD}.md
  ├── H: 汇总索引追加到 .claude/notes/self-check/INDEX.md
  ├── I: loop 判断
  │         - 评估 `goal` 是否达成（按所选口径计算）
  │         - 若 loop = "达到即停" + goal 达成 → 退出
  │         - 若 loop = "达到后继续一轮" + goal 达成 → 回 A 跑 1 轮确认，再退出
  │         - 若 loop = "持续运行至用户中断" → 永退出条件，仅响应用户中断
  │         - 若 goal 未达成 → 回 A
  └── End
```

## 重抽时 prompt 调整

- 第二轮开始时，**复用第一轮 prompt 但调整任务段**（追加 `本次自检口径：第 N 轮`）
- 不传上轮 finding 列表（保持隔离）
- 随机种子可由用户重给或复用

## 随机种子的真正用途

随机种子只用于"抽检 N 篇"的范围选择，**不**用于 subagent 调度顺序。理由：subagent 隔离、互不通信，调度顺序对自检结果无影响。
````

- [ ] **Step 2: 验证调度协议 A-I 步都在**

```bash
grep -cE '^  ├── [A-I]:' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/books-mode.md
```

预期：`9`（A, B, C, D, E, F, G, H, I 共 9 步）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/books-mode.md
git commit -m "feat(self-check): 添加 shared/books-mode.md books 模式调度协议"
```

---

## Task 7: shared/article-mode.md（篇章模式调度协议）

**Files:**
- Create: `.claude/skills/self-check/shared/article-mode.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/article-mode.md`）：

````markdown
# 篇章模式调度协议

主 agent 在篇章模式（`mode = article`）下的标准调度流程。

## 调度协议

```
主 agent
  │
  ├── A: 锁定单 (book, chapter) 组合
  ├── B: 用 Agent tool 发起 1 个 general-purpose subagent
  ├── C: 等待 subagent 返回
  ├── D: 报告落到 .claude/notes/self-check/{书}-{type}-{YYYY-MM-DD}.md（追加）
  ├── E: loop 判断
  │         - 评估 `goal` 是否达成
  │         - 退出策略按 `loop` 字段
  │         - 篇章模式默认"达到即停"；loop="持续运行至用户中断" 时问用户"是否继续下一篇"
  └── End
```

## 与 books 模式的差异

- 一次只派发 1 个 subagent（不做并发）
- 没有批次聚合阶段（无需去重）
- loop 重启时问用户"是否继续下一篇"而非"重抽一批"

## 报告落盘

- 篇章模式单次执行产出单文件
- 文件名 `{书-slug}-{type}-{date}.md` 与 books 模式一致（同一书同一日同一类型会被覆盖；可由用户按需在文件名追加 `-{篇名}` 区分）
````

- [ ] **Step 2: 验证 A-E 5 步都在**

```bash
grep -cE '^  ├── [A-E]:' /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/shared/article-mode.md
```

预期：`5`（A, B, C, D, E 共 5 步）。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/article-mode.md
git commit -m "feat(self-check): 添加 shared/article-mode.md 篇章模式调度协议"
```

---

## Task 8: shared/spec-bundles.md（规范包内容定义 + 指纹）

**Files:**
- Create: `.claude/skills/self-check/shared/spec-bundles.md`
- Create: `scripts/self-check-fingerprint.py`（指纹校验脚本）

- [ ] **Step 1: 写 spec-bundles.md**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/shared/spec-bundles.md`）：

````markdown
# 4 类自检的"规范包"内容定义

每类自检派发 subagent 时，必须把对应规范**完整文本内联**到 subagent prompt。本文件定义 4 类自检各自需要哪些规范。

## 4 类规范包

| 类型 | 必含 SPEC | 必含 SKILL | 必含工具/文件 |
|------|-----------|------------|--------------|
| catalog | SPEC-catalog.md | general.md | books/{slug}/catalog.html（若存在） |
| source | SPEC-source.md | general.md | books/{slug}/articles/{篇名}/source.md |
| interpretation | SPEC-interpretation.md | general.md + bazi.md | books/{slug}/articles/{篇名}/interpretation.md |
| skill | SPEC-skill.md | general.md + bazi.md | books/{slug}/articles/{篇名}/skill.md |

## bazi.md 条件追加

`bazi.md` 是否必含，由书的"术数"字段动态判断：

- 子 SKILL.md 拿到书后先 Read `catalog.md` blockquote 的 `> 术数：命` 行
- 若 `术数=命` → 规范包追加 `bazi.md` 全文
- 未来扩展其他术数（紫微、六爻等）时，按相同逻辑追加对应专项文件
- 这步必须在主 agent 派发前完成，**不**在 subagent 内动态判断

## 注入策略 — 完整文本内联

- subagent prompt **内联** 完整规范文本（不是文件路径）
- 代价：单次 5-8k tokens
- 收益：subagent 真正"通读"，不会被跳过；与 SPEC-interpretation §五 Step 1.2 "完整通读 general.md 全文"硬约束保持一致
- 替代方案（路径 + 强制 Read / 摘要 + 路径）均因"依赖 subagent 守纪"或"摘要漂移"风险被排除

## 规范包漂移防护 — 指纹

**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。

启动时校验：

```bash
python3 scripts/self-check-fingerprint.py
```

输出形如：

```
general.md 指纹: 197:9a7b2c1e4f8d3a6b  ✓
SPEC-catalog.md 指纹: 204:c8d1e5f2a3b6c9d2  ✓
SPEC-source.md 指纹: 159:1a2b3c4d5e6f7a8b  ✓
SPEC-interpretation.md 指纹: 348:e5f6a7b8c9d0e1f2  ✓
SPEC-skill.md 指纹: 212:3c4d5e6f7a8b9c0d  ✓
bazi.md 指纹: 71:7a8b9c0d1e2f3a4b  ✓
```

指纹不一致时，警告用户并询问"继续使用旧规范 / 用新规范重启"。

## 指纹列表（运行 `python3 scripts/self-check-fingerprint.py` 实时生成）

本文件不存具体指纹值——指纹每次执行时计算并由脚本输出。如需在文档中记录当前指纹值，运行脚本后追加在本节末：

```
<!-- 运行 python3 scripts/self-check-fingerprint.py >> spec-bundles.md 自动追加 -->
```
````

- [ ] **Step 2: 写指纹校验脚本**

文件内容（**完整复制以下全部**到 `scripts/self-check-fingerprint.py`）：

```python
#!/usr/bin/env python3
"""
self-check 规范包指纹校验

计算 research-dispute/ 下 4 份 SPEC + general.md + bazi.md 的指纹：
  指纹 = "<行数>:<sha256(前 5 个 H2 标题拼接)[:16]>"

用法：
  python3 scripts/self-check-fingerprint.py
"""

import hashlib
import sys
from pathlib import Path

FILES = [
    "research-dispute/general.md",
    "research-dispute/SPEC-catalog.md",
    "research-dispute/SPEC-source.md",
    "research-dispute/SPEC-interpretation.md",
    "research-dispute/SPEC-skill.md",
    "research-dispute/bazi.md",
]


def compute_fingerprint(path: Path) -> str:
    """返回 '<行数>:<sha256_hex[:16]>' 格式指纹"""
    if not path.exists():
        return "0:0"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    h2_headers = []
    for line in lines:
        if line.startswith("## "):
            h2_headers.append(line.strip())
            if len(h2_headers) == 5:
                break
    headers_blob = "".join(h2_headers).encode("utf-8")
    sha = hashlib.sha256(headers_blob).hexdigest()[:16]
    return f"{len(lines)}:{sha}"


def main():
    repo_root = Path(__file__).parent.parent

    for rel in FILES:
        path = repo_root / rel
        fp = compute_fingerprint(path)
        marker = "✓" if path.exists() else "✗ MISSING"
        print(f"{rel} 指纹: {fp}  {marker}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: 验证脚本能跑**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
chmod +x scripts/self-check-fingerprint.py
python3 scripts/self-check-fingerprint.py
```

预期：6 行输出，每行形如 `research-dispute/general.md 指纹: 197:9a7b2c1e4f8d3a6b  ✓`，所有文件存在（✓）。

- [ ] **Step 4: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/shared/spec-bundles.md scripts/self-check-fingerprint.py
git commit -m "feat(self-check): 添加 shared/spec-bundles.md 规范包定义 + 指纹校验脚本"
```

---

## Task 9: 主 SKILL.md（路由 + 5 步引导）

**Files:**
- Create: `.claude/skills/self-check/SKILL.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/SKILL.md`）：

````markdown
---
name: self-check
description: 五术研究项目自检技能。覆盖 catalog/source/interpretation/skill 4 类内容管道的合规扫描。每次自检严格遵守 general.md + 对应 SPEC，使用隔离的 subagent 输出按书聚合的 markdown 报告。
trigger: 自检|合规扫描|规范校验
---

# self-check 自检技能（主入口）

本 skill 覆盖 4 类自检。**主 SKILL.md 只做路由 + 5 步引导，不做实际自检。**

## 4 类自检

| 子 skill | 检查对象 | 对应 SPEC |
|----------|----------|-----------|
| `catalog/` | books/{slug}/catalog.md 元信息、表格、路径 | SPEC-catalog.md |
| `source/` | books/{slug}/articles/{篇名}/source.md 原文 | SPEC-source.md |
| `interpretation/` | books/{slug}/articles/{篇名}/interpretation.md 解读 | SPEC-interpretation.md |
| `skill/` | books/{slug}/articles/{篇名}/skill.md AI 技能 | SPEC-skill.md |

## 调用方式

用户输入 `/self-check` 或 `/自检` 起手。可选带参数 `/self-check source` 跳过类别选择。

## 5 步引导式流程

详见 `shared/entrypoint.md`。主 SKILL.md 不重复实现，按 entrypoint.md 流程执行。

## 路由

Step 6 路由：Read `.claude/skills/self-check/{type}/SKILL.md` 全文调入上下文，移交执行权。

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 5 步引导式状态机 | `shared/entrypoint.md` |
| subagent prompt 通用契约 | `shared/subagent-contract.md` |
| goal + loop 字段 | `shared/goal-loop.md` |
| books 模式调度 | `shared/books-mode.md` |
| 篇章模式调度 | `shared/article-mode.md` |
| 报告模板 | `shared/report-template.md` |
| 规范包内容 + 指纹 | `shared/spec-bundles.md` |
````

- [ ] **Step 2: 验证 frontmatter 含必要字段**

```bash
head -5 /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/SKILL.md
```

预期输出：
```
---
name: self-check
description: 五术研究项目自检技能。覆盖 catalog/source/interpretation/skill 4 类内容管道的合规扫描。每次自检严格遵守 general.md + 对应 SPEC，使用隔离的 subagent 输出按书聚合的 markdown 报告。
trigger: 自检|合规扫描|规范校验
---
```

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/SKILL.md
git commit -m "feat(self-check): 添加主 SKILL.md 路由 + 5 步引导入口"
```

---

## Task 10: 子 SKILL.md — catalog

**Files:**
- Create: `.claude/skills/self-check/catalog/SKILL.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/catalog/SKILL.md`）：

````markdown
---
name: self-check-catalog
description: catalog 自检。检查 books/{slug}/catalog.md 的元信息（书名 `《》`、作者、版本、简介、术数、类别、内容类型）、2 列表格（编号+篇名）、路径一致性。遵守 research-dispute/SPEC-catalog.md + research-dispute/general.md。
---

# catalog 自检

## 适用场景

检查 `books/{slug}/catalog.md` 的合规性。catalog 是内容管道的入口，错误会级联到所有下游。

## 前置规范（必含）

子 SKILL.md 启动时按 `shared/spec-bundles.md` 加载：

1. `research-dispute/SPEC-catalog.md` 全文
2. `research-dispute/general.md` 全文
3. （术数=命时追加 `research-dispute/bazi.md`）

## 必检项目

- 元信息 blockquote 完整：作者 / 版本 / 简介 / 术数 / 类别 / 内容类型
- 术数取值合法：`山|医|命|相|卜`
- 类别取值在 `CATEGORY_TREE` 已注册
- `《》` 书名格式
- 表格 2 列（编号、篇名），无路径列（路径由 generate.js 推导）
- 表格内的篇名能在 `books/{slug}/articles/{篇名}/` 找到目录
- 若存在 `books/{slug}/catalog.html`，元信息与 catalog.md 一致

## 调度

- 篇章模式不可用（catalog 不针对篇章）
- 默认走 books 模式：扫描选中书的全部 catalog.md
- 调度协议遵循 `shared/books-mode.md` 与 `shared/subagent-contract.md`

## 报告

按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-catalog-{date}.md`。

## 错误处理

按 spec §9 处理。**catalog 不走 Step 3 篇章选择**——Step 3 跳过直接进 Step 4。
````

- [ ] **Step 2: 验证 frontmatter 含必要字段**

```bash
head -5 /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/catalog/SKILL.md
```

预期：3 行 frontmatter（name, description）+ `---` 闭合。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/catalog/SKILL.md
git commit -m "feat(self-check): 添加 catalog 子 SKILL"
```

---

## Task 11: 子 SKILL.md — source

**Files:**
- Create: `.claude/skills/self-check/source/SKILL.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/source/SKILL.md`）：

````markdown
---
name: self-check-source
description: source 自检。检查 books/{slug}/articles/{篇名}/source.md 的原文录入合规：照录原则、字形策略（catalog.md blockquote 声明）、排版规范、注家标注、勘误标记。遵守 research-dispute/SPEC-source.md + research-dispute/general.md。
---

# source 自检

## 适用场景

检查 `books/{slug}/articles/{篇名}/source.md` 的原文录入合规。source 是数据管道的源头，错误会污染下游解读。

## 前置规范（必含）

子 SKILL.md 启动时按 `shared/spec-bundles.md` 加载：

1. `research-dispute/SPEC-source.md` 全文
2. `research-dispute/general.md` 全文

注：source 不需要 bazi.md（原文不涉及命理解读）。

## 必检项目

- 原文照录：未修改任何字（按 catalog.md 字形策略声明：默认 `原文照录` / 可选 `简体规范化`）
- 排版：段与段空行分隔；无额外列表/粗体/斜体/图片/表格
- 注家标注：`> 【注家名】` 块引用格式
- 一级标题仅篇名，无序号无副标题
- 勘误处理：`【录入注：...】` 标注而非直接修改
- 禁区：未混入解读内容、未修改原文用字、未添加规范外标记

## 调度

- 篇章模式：单书单篇聚焦
- books 模式：默认全检（source 不走 Step 3 篇章选择，除非 `--focus`）
- 调度协议遵循 `shared/article-mode.md` / `shared/books-mode.md`

## 报告

按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-source-{date}.md`。

## 错误处理

按 spec §9 处理。
````

- [ ] **Step 2: 验证 frontmatter**

```bash
head -5 /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/source/SKILL.md
```

预期：3 行 frontmatter。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/source/SKILL.md
git commit -m "feat(self-check): 添加 source 子 SKILL"
```

---

## Task 12: 子 SKILL.md — interpretation

**Files:**
- Create: `.claude/skills/self-check/interpretation/SKILL.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/interpretation/SKILL.md`）：

````markdown
---
name: self-check-interpretation
description: interpretation 自检。检查 books/{slug}/articles/{篇名}/interpretation.md 的解读合规：表层义理 / 深化洞见 / 通俗注释层 / 引用规范 / 注家分层 / 红线禁令 / 模式判定（短篇/标准/密集）/ 自检清单合规分。遵守 research-dispute/SPEC-interpretation.md + research-dispute/general.md + （术数=命时）research-dispute/bazi.md。
---

# interpretation 自检

## 适用场景

检查 `books/{slug}/articles/{篇名}/interpretation.md` 的解读合规。interpretation 是连接 source 与下游的解读层，最易触碰红线（自创理论、断章引用、判定流派高下等）。

## 前置规范（必含）

子 SKILL.md 启动时按 `shared/spec-bundles.md` 加载：

1. `research-dispute/SPEC-interpretation.md` 全文
2. `research-dispute/general.md` 全文（含 14 条红线）
3. （术数=命时追加 `research-dispute/bazi.md`）

## 必检项目

- 必检 §一.4 学术语体规范（元自我引用 / 元自我标签 / 流水线术语 / 元数据块 / 改写方向）
- 必检 §一.5 通用红线 14 条
- 必检 §五 Step 1 前置自检义务三件套（文件存在性 / 正本通读 / 专项约束）
- 必检 §六 古籍异常场景处理（版本异文 / 脱漏 / 无注 / 无案例 / 重复 / 超长）
- 注家标注格式统一；缺失 catalog.md 时使用兜底标识（【原文】【原注】【诸家评】【后人补注】【夹注】）
- 引文必须 `>` 块引用
- 通俗注释融入表层义理写作语言（无独立【白话】行）
- 图解使用符合「必用/禁用」规则
- mode_of() 模式判定与原文体量匹配
- 七、产出自检清单全部勾选

## 调度

- 篇章模式：单书单篇（**必问** Step 3）
- books 模式：可选抽检
- 调度协议遵循 `shared/article-mode.md` / `shared/books-mode.md`

## 报告

按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-interpretation-{date}.md`。

## 错误处理

按 spec §9 处理。**fatal 走主 agent 落盘 gate**（subagent 永不直接改文件）。
````

- [ ] **Step 2: 验证 frontmatter**

```bash
head -5 /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/interpretation/SKILL.md
```

预期：3 行 frontmatter。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/interpretation/SKILL.md
git commit -m "feat(self-check): 添加 interpretation 子 SKILL"
```

---

## Task 13: 子 SKILL.md — skill

**Files:**
- Create: `.claude/skills/self-check/skill/SKILL.md`

- [ ] **Step 1: 写文件**

文件内容（**完整复制以下全部**到 `.claude/skills/self-check/skill/SKILL.md`）：

````markdown
---
name: self-check-skill
description: skill 自检。检查 books/{slug}/articles/{篇名}/skill.md 的 AI 技能文件合规：YAML frontmatter（displayName/type/input/output/description）/ 功能定位 / 输入参数 / 处理逻辑（含兜底分支）/ 输出模板 / 至少 1 个示例 / 与 catalog 关联（文件存在即关联）。遵守 research-dispute/SPEC-skill.md + research-dispute/general.md + （术数=命时）research-dispute/bazi.md。
---

# skill 自检

## 适用场景

检查 `books/{slug}/articles/{篇名}/skill.md` 的 AI 技能文件合规。skill.md 是产物供 AI Agent 独立调用的能力单元。

## 前置规范（必含）

子 SKILL.md 启动时按 `shared/spec-bundles.md` 加载：

1. `research-dispute/SPEC-skill.md` 全文
2. `research-dispute/general.md` 全文
3. （术数=命时追加 `research-dispute/bazi.md`）

## 必检项目

- YAML frontmatter 5 字段齐全：displayName / type / input / output / description
- `type` 取值合法：analysis / lookup / comparison / generation
- 功能定位段（不重复 interpretation）
- 输入参数含类型 + 格式约束 + 必填/可选
- 处理逻辑步骤完整，每步含"做什么/依据/判定"三段
- 条件分支均有兜底 else/否则
- 边界情况显式处理（输入缺失 / 越界 / 无匹配）
- 输出模板结构化，每个字段有类型和含义说明
- 判定类输出包含"判定依据"字段（引用原文/注家）
- 输出内容自包含（通俗解释全部在文件内）
- 至少 1 个示例（推荐 2-3 个覆盖主路径和边界）
- 引用原文注家有来源标注（块引用格式）

## 调度

- 篇章模式：单书单篇（**必问** Step 3）
- books 模式：可选抽检
- 调度协议遵循 `shared/article-mode.md` / `shared/books-mode.md`

## 报告

按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-skill-{date}.md`。

## 错误处理

按 spec §9 处理。
````

- [ ] **Step 2: 验证 frontmatter**

```bash
head -5 /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check/skill/SKILL.md
```

预期：3 行 frontmatter。

- [ ] **Step 3: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/skills/self-check/skill/SKILL.md
git commit -m "feat(self-check): 添加 skill 子 SKILL"
```

---

## Task 14: 4 个干跑用例 — 用例 1：source 篇章模式

**Files:** 不创建新文件；操作现有 skill + 真实书籍

**测试输入：** `books/滴天髓阐微/`（已存在；目录最完整）

- [ ] **Step 1: 用 `/self-check source` 启动引导**

由 plan 执行者（人 / agent）按以下步骤交互：

1. 在主对话输入 `/self-check source`（带参数 → 跳过 Step 1）
2. Step 2：选书籍 → 选 `滴天髓阐微`（slug）
3. Step 3：source 类型默认全检，**自动跳过**（除非带 `--focus`），但**本用例强制走篇章模式**需要在 Step 4 选"篇章"
4. Step 4：选"篇章"模式
5. Step 5：goal 默认（连续 N 轮自检），loop 默认（达到即停）
6. Step 6：路由到 `source/SKILL.md` → 调入 `shared/subagent-contract.md` → 派发 1 个 subagent

预期：5 步引导交互不报错。

- [ ] **Step 2: 验证 subagent prompt 含规范包**

通过查看 subagent 实际收到的 prompt（subagent 自身的入参）来验证：

- prompt 长度 ≥ 5000 tokens（粗略验证规范包注入）
- prompt 包含 `research-dispute/SPEC-source.md` 的章节标题
- prompt 包含 `research-dispute/general.md` 的 14 条红线

**判据：人工检查 subagent 入参。** 不通过则：

- 检查 `source/SKILL.md` 是否引用 `shared/spec-bundles.md`
- 检查主 agent 是否 Read 了 `shared/spec-bundles.md`

- [ ] **Step 3: 验证报告落盘**

```bash
ls /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/
```

预期：存在 `滴天髓阐微-source-2026-06-09.md`（或当天日期）。

- [ ] **Step 4: 验证报告含至少 1 个 finding**

```bash
grep -c '^### F' /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-source-2026-06-09.md
```

预期：`≥ 1`（含 1 个及以上 F001 编号的 finding）。

- [ ] **Step 5: 验证 INDEX.md 更新**

```bash
grep -c '滴天髓阐微' /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/INDEX.md
```

预期：`≥ 1`（索引里出现该书）。

- [ ] **Step 6: 提交**

如本任务期间有新增文件（如 INDEX.md），提交：

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/notes/self-check/
git commit -m "test(self-check): 干跑用例 1 通过 — source 篇章模式 + 滴天髓阐微"
```

---

## Task 15: 4 个干跑用例 — 用例 2：interpretation 篇章模式

**Files:** 操作现有 skill + 真实书籍

**测试输入：** `books/滴天髓阐微/`

- [ ] **Step 1: 用 `/self-check interpretation` 启动引导**

由执行者按以下步骤交互：

1. 输入 `/self-check interpretation`
2. Step 2：选书籍 → `滴天髓阐微`
3. Step 3：**必问**篇章 → 选 1 篇（如 `天道`）
4. Step 4：单书单篇 → 默认"篇章"模式（用户可确认或覆盖）
5. Step 5：goal 默认 + loop 默认
6. Step 6：路由到 `interpretation/SKILL.md` → 派发 1 个 subagent

预期：5 步引导交互不报错。

- [ ] **Step 2: 验证 subagent prompt 含 bazi.md**

检查 subagent 入参：

- prompt 包含 `research-dispute/bazi.md` 的内容（因为 `滴天髓阐微` 的 `术数=命`）

**判据：人工检查 subagent 入参。** 不通过则：

- 检查主 agent 是否 Read 了 `books/滴天髓阐微/catalog.md` blockquote
- 检查 `interpretation/SKILL.md` 规范包表是否声明 bazi.md

- [ ] **Step 3: 验证报告落盘 + 至少 1 个 finding**

```bash
ls /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-interpretation-2026-06-09.md
grep -c '^### F' /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-interpretation-2026-06-09.md
```

预期：文件存在 + 至少 1 个 finding。

- [ ] **Step 4: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/notes/self-check/
git commit -m "test(self-check): 干跑用例 2 通过 — interpretation 篇章模式 + 滴天髓阐微/天道"
```

---

## Task 16: 4 个干跑用例 — 用例 3：catalog books 模式

**Files:** 操作现有 skill + 真实书籍

**测试输入：** `books/滴天髓阐微/`

- [ ] **Step 1: 用 `/self-check catalog` 启动引导**

1. 输入 `/self-check catalog`
2. Step 2：选书籍 → `滴天髓阐微`（单本，**注意：catalog 不能跨书混检**）
3. Step 3：**catalog 跳过 Step 3**（不针对篇章）
4. Step 4：单书无篇章选择 → 默认"books"模式
5. Step 5：goal 默认 + loop 默认
6. Step 6：路由到 `catalog/SKILL.md` → 派发 1 个 subagent（catalog 是单书 1 subagent）

预期：5 步引导交互不报错，Step 3 显式跳过。

- [ ] **Step 2: 验证 subagent prompt 不含 bazi.md**

检查 subagent 入参：

- prompt **不**包含 `research-dispute/bazi.md`（catalog 检查元信息，不涉及命理解读）

**判据：人工检查 subagent 入参。** 不通过则：检查 `catalog/SKILL.md` 规范包表是否声明不含 bazi.md。

- [ ] **Step 3: 验证报告含至少 1 个 finding**

```bash
ls /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-catalog-2026-06-09.md
grep -c '^### F' /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-catalog-2026-06-09.md
```

预期：文件存在 + 至少 1 个 finding。

- [ ] **Step 4: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/notes/self-check/
git commit -m "test(self-check): 干跑用例 3 通过 — catalog books 模式 + 滴天髓阐微"
```

---

## Task 17: 4 个干跑用例 — 用例 4：skill 篇章模式

**Files:** 操作现有 skill + 真实书籍

**测试输入：** `books/滴天髓阐微/`

- [ ] **Step 1: 用 `/self-check skill` 启动引导**

1. 输入 `/self-check skill`
2. Step 2：选书籍 → `滴天髓阐微`
3. Step 3：**必问**篇章 → 选 1 篇（如 `天道`，前提是该篇已有 `skill.md`）
4. Step 4：单书单篇 → 默认"篇章"
5. Step 5：goal 默认 + loop 默认
6. Step 6：路由到 `skill/SKILL.md` → 派发 1 个 subagent

预期：5 步引导交互不报错。

**预检：** Step 3 选篇前先检查该篇是否有 `skill.md`：

```bash
ls /Users/gaozhipeng/Desktop/mingli-research/books/滴天髓阐微/articles/天道/skill.md 2>/dev/null
```

若不存在 → 选有 skill.md 的篇，或换书（如 `三命通会` 可能有完整 skill.md）。

- [ ] **Step 2: 验证 subagent prompt 含 bazi.md**

检查 subagent 入参：

- prompt 包含 `research-dispute/bazi.md`（因 `术数=命`）

**判据：人工检查。**

- [ ] **Step 3: 验证报告落盘 + 至少 1 个 finding**

```bash
ls /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-skill-2026-06-09.md
grep -c '^### F' /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/滴天髓阐微-skill-2026-06-09.md
```

预期：文件存在 + 至少 1 个 finding。

- [ ] **Step 4: 提交**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git add .claude/notes/self-check/
git commit -m "test(self-check): 干跑用例 4 通过 — skill 篇章模式 + 滴天髓阐微"
```

---

## Task 18: 第一批 commit 收尾

**Files:** 不创建新文件

- [ ] **Step 1: 检查所有 4 个干跑报告 + INDEX 都在**

```bash
ls -la /Users/gaozhipeng/Desktop/mingli-research/.claude/notes/self-check/
```

预期：4 份报告（`滴天髓阐微-{type}-2026-06-09.md` × 4）+ INDEX.md。

- [ ] **Step 2: 检查 4 个子 SKILL.md + 7 个 shared 片段 + 主 SKILL.md 全部存在**

```bash
find /Users/gaozhipeng/Desktop/mingli-research/.claude/skills/self-check -name 'SKILL.md' -o -name '*.md' | sort
```

预期：12 个文件（1 主 + 4 子 + 7 shared）。

- [ ] **Step 3: 检查指纹脚本可跑**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
python3 scripts/self-check-fingerprint.py
```

预期：6 行输出（4 份 SPEC + general.md + bazi.md），全部 ✓。

- [ ] **Step 4: 提交（如果上一步有未跟踪的变更）**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git status
# 如果有未提交：
git add -A
git commit -m "test(self-check): 4 干跑用例全部通过，初版完工"
```

- [ ] **Step 5: 推送到远端（可选）**

```bash
cd /Users/gaozhipeng/Desktop/mingli-research
git push origin main
```

---

## Out of Scope (本 plan 不做)

明确不做的事：

- books 模式 + 抽检 + loop 干跑（spec §10.3 后续）
- 16 用例矩阵（spec §10.3 长期目标）
- 静态合规测试脚本（spec §10.2，开发期手动跑即可）
- 跨类型联检（spec §12）
- GitHub Actions 自动跑（spec §12）
- 自动 commit 修复（spec §12）

---

## 自我检查（写完后）

1. **spec 覆盖：**
   - §1 Goal → T9 主 SKILL.md 描述
   - §2 Architecture 7 个 shared → T2-T8
   - §3 4 类规范包 → T10-T13 各子 SKILL + T8 spec-bundles
   - §4 5 步引导式 → T2 entrypoint + T9 主 SKILL
   - §4.5 goal+loop → T5 goal-loop
   - §5.1-5.3 subagent 契约 + 修复责任 → T3 subagent-contract
   - §6 books 模式 → T6 books-mode
   - §7 篇章模式 → T7 article-mode
   - §8 报告 → T4 report-template
   - §9 错误处理 → 各子 SKILL 末尾 + spec §9 直接引用
   - §10.1 4 干跑用例 → T14-T17
   - §11 提交策略 → 每个 task 自带 commit
   - §12 不在范围 → "Out of Scope" 节

2. **占位扫描：** 无 TBD / TODO / FIXME（"task 自带 commit" 中"如本任务期间有新增文件"是条件性语句，不是占位）。

3. **类型一致：**
   - `type ∈ {catalog, source, interpretation, skill}` — T1 .gitkeep 不冲突，T2 entrypoint、T9 主 SKILL、T10-T13 全部用同一组字符串
   - `mode ∈ {books, article}` — T6/T7 协议使用一致
   - `sample_mode ∈ {all, sample}` — T2 entrypoint、T5 goal-loop、T6 books-mode 一致
   - `loop ∈ {"达到即停", "达到后继续一轮", "持续运行至用户中断"}` — T5 goal-loop、T6 books-mode、T7 article-mode 一致
   - 指纹格式 `<行数>:<sha256_hex[:16]>` — T8 spec-bundles 定义 + 脚本实现一致

4. **任务粒度：** 19 个 task，每个含 1 个或多个 commit step。T1 脚手架 1 commit；T2-T8 共享片段 7 commit；T9 主入口 1 commit；T10-T13 子入口 4 commit；T14-T17 干跑 4 commit；T18 收尾 1 commit。合计 18 commit，符合"频繁提交"。
