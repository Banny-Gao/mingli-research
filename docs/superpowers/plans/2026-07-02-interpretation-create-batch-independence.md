# interpretation-create 批量模式独立性改造 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理 interpretation-create skill 契约层所有实现细节引用（`generate-interpretations.js` / `lib/llm-batch.js`），合并 script-batch.md + subagent-batch.md → batch.md。

**Architecture:** 删除两个实现耦合的契约文件（script-batch.md / subagent-batch.md），新建 batch.md 作为统一批量调度方法论契约。修改 SKILL.md / strategy.md / pipeline.md / quality-gate.md 清理引用。scripts/generate-interpretations.js / lib/llm-batch.js 不动。

**Tech Stack:** Markdown 契约

**Spec:** `docs/superpowers/specs/2026-07-02-interpretation-create-batch-independence-design.md`

---

## File Structure

| 操作 | 路径 | 责任 |
|---|---|---|
| 删除 | `.claude/skills/interpretation-create/shared/script-batch.md` | CLI 命令参考手册（移除） |
| 删除 | `.claude/skills/interpretation-create/shared/subagent-batch.md` | 含 lib/llm-batch.js 函数签名（移除） |
| 新建 | `.claude/skills/interpretation-create/shared/batch.md` | 统一批量调度方法论 |
| 修改 | `.claude/skills/interpretation-create/SKILL.md` | 4 处实现引用清理 |
| 修改 | `.claude/skills/interpretation-create/shared/strategy.md` | 删除 dry-run 命令模板 + 更新引用 |
| 修改 | `.claude/skills/interpretation-create/shared/pipeline.md` | 1 处实现引用清理 |
| 修改 | `.claude/skills/interpretation-create/shared/quality-gate.md` | 1 处实现引用清理 |

---

### Task 1: 删除 script-batch.md + subagent-batch.md

**Files:**
- Delete: `.claude/skills/interpretation-create/shared/script-batch.md`
- Delete: `.claude/skills/interpretation-create/shared/subagent-batch.md`

- [ ] **Step 1: 删除两个文件**

```bash
rm .claude/skills/interpretation-create/shared/script-batch.md
rm .claude/skills/interpretation-create/shared/subagent-batch.md
```

- [ ] **Step 2: 验证文件已删除**

```bash
ls .claude/skills/interpretation-create/shared/script-batch.md .claude/skills/interpretation-create/shared/subagent-batch.md 2>&1
```

Expected: 两个文件都报 `No such file or directory`。

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/interpretation-create/shared/script-batch.md .claude/skills/interpretation-create/shared/subagent-batch.md
git commit -m "refactor(interpretation-create): 删除 script-batch.md + subagent-batch.md

script-batch.md 是 CLI 命令参考手册（硬编码 generate-interpretations.js 路径）；
subagent-batch.md 含 lib/llm-batch.js 函数签名。
两者合并为 batch.md（见下一 commit）。"
```

---

### Task 2: 新建 batch.md（统一批量调度方法论）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/batch.md`

- [ ] **Step 1: 写入 batch.md**

文件完整内容（与 spec §三 一致）：

```markdown
# 批量模式调度方法论

## 概述

批量模式：N 篇 source.md → N 篇 interpretation.md。
主 agent 负责流程编排，不绑定任何特定执行器。

## 输入

- 书 slug + 篇章列表（逗号或空格分隔；缺省 = 整本所有未解读篇章）
- 篇章名支持精确匹配和模糊匹配（最短前缀匹配）

## 流程

### Step 1 — 收源

读 catalog.md 获取篇章列表。用户可选指定子集或整本。

### Step 2 — dry-run gate

AskUserQuestion 一次性确认：
- 范围（slug + 篇章数 + 估算耗时，每篇 30-90s）
- 是否覆盖已存在 interpretation.md（force / skip）
- 确认 / 取消

### Step 3 — dispatch

主 agent 逐篇或分批处理。每篇经历：
1. 强装载 5 份规范
2. 6 项原文体检
3. 9 步主体流水线
4. self-check 精简版（fatal > 0 → 重写，最多 3 次）
5. 落盘

### Step 4 — 进度反馈

每完成 1 篇回调：当前进度（N/M）、篇章名、状态（success/failed/skipped）。

### Step 5 — 收尾

聚合结果：成功 N / 失败 M / 跳过 K。
失败篇章列出具体原因。
**不**落盘报告文件。

## 中断处理

- 中断时完成当前篇后退出
- 已完成的 interpretation.md 保留
- 未完成篇章在收尾报告中列出

## 失败兜底

| 异常 | 处置 |
|---|---|
| 篇章名未匹配 | 报错退出，列出候选 |
| per-篇 self-check fatal > 0（3 次重写后仍 > 0） | 跳过该篇 + 记日志 |
| per-篇 API 失败 | 重试 3 次退避；最终失败 → 跳过 |
| 中断 | 完成当前篇后退出，收尾汇总 |
```

- [ ] **Step 2: 验证 batch.md 不出现实现引用**

```bash
grep -n 'generate-interpretations\|lib/llm-batch\|node scripts/' .claude/skills/interpretation-create/shared/batch.md
```

Expected: 0 命中。

- [ ] **Step 3: 验证 batch.md 含 5 步流程**

```bash
grep -c '^### Step' .claude/skills/interpretation-create/shared/batch.md
```

Expected: `5`。

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/interpretation-create/shared/batch.md
git commit -m "feat(interpretation-create): 新建 batch.md 统一批量调度方法论

合并原 script-batch.md（CLI 命令参考）+ subagent-batch.md（subagent 协议）
为单一方法论契约。不绑定任何执行器，不引用实现路径。"
```

---

### Task 3: 修改 strategy.md（删除命令模板 + 更新引用）

**Files:**
- Modify: `.claude/skills/interpretation-create/shared/strategy.md`

- [ ] **Step 1: 读取现状定位修改点**

```bash
grep -n 'subagent-batch\|script-batch\|generate-interpretations\|dry-run 命令' .claude/skills/interpretation-create/shared/strategy.md
```

Expected: 命中 L30、L32-42 区域。

- [ ] **Step 2: 修改批量模式入口引用行**

将 L30：

```
详见 `subagent-batch.md`（入口 A，交互式）与 `script-batch.md`（入口 B，后台/CI）。
```

改为：

```
详见 `batch.md`。
```

使用 Edit 工具精确替换。

- [ ] **Step 3: 删除 "dry-run 命令模板" 整段**

删除从 `## dry-run 命令模板` 到文件末尾（或到下一个 `##` 标题前）的全部内容。包括：

```
## dry-run 命令模板

```bash
# CLI 入口
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run

# 整本所有未解读篇章
node scripts/generate-interpretations.js <slug> --dry-run
```

subagent 派发入口的 dry-run 由主 agent 在 dispatch 前打印（不调脚本）。
```

- [ ] **Step 4: 验证 strategy.md 不再含实现引用**

```bash
grep -n 'generate-interpretations\|subagent-batch\|script-batch\|node scripts/' .claude/skills/interpretation-create/shared/strategy.md
```

Expected: 0 命中。

- [ ] **Step 5: 验证 strategy.md 含新引用**

```bash
grep -n 'batch.md' .claude/skills/interpretation-create/shared/strategy.md
```

Expected: 1 命中。

- [ ] **Step 6: 提交**

```bash
git add .claude/skills/interpretation-create/shared/strategy.md
git commit -m "refactor(interpretation-create): strategy.md 删除 dry-run 命令模板 + 更新引用

删除含 generate-interpretations.js 的命令模板段。
subagent-batch.md / script-batch.md 引用改为 batch.md。"
```

---

### Task 4: 修改 pipeline.md（清理 1 处实现引用）

**Files:**
- Modify: `.claude/skills/interpretation-create/shared/pipeline.md`

- [ ] **Step 1: 读取现状定位 L69**

```bash
grep -n 'lib/llm-batch' .claude/skills/interpretation-create/shared/pipeline.md
```

Expected: 命中 L69。

- [ ] **Step 2: 修改 L69**

将：

```
- 批量（`scripts/lib/llm-batch.js`）：每篇重写循环里调 `runSelfCheckLite(output)`，score < 4 → 重写或失败
```

改为：

```
- 批量：每篇重写循环里调 self-check，score < 4 → 重写或失败
```

使用 Edit 工具精确替换。

- [ ] **Step 3: 验证 pipeline.md 不再含实现引用**

```bash
grep -n 'lib/llm-batch\|generate-interpretations' .claude/skills/interpretation-create/shared/pipeline.md
```

Expected: 0 命中。

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/interpretation-create/shared/pipeline.md
git commit -m "refactor(interpretation-create): pipeline.md 清理 lib/llm-batch.js 引用

L69 移除 scripts/lib/llm-batch.js 路径，改为纯方法论描述。"
```

---

### Task 5: 修改 quality-gate.md（清理 1 处实现引用）

**Files:**
- Modify: `.claude/skills/interpretation-create/shared/quality-gate.md`

- [ ] **Step 1: 读取现状定位 L43**

```bash
grep -n 'lib/llm-batch' .claude/skills/interpretation-create/shared/quality-gate.md
```

Expected: 命中 L43。

- [ ] **Step 2: 修改 L43**

将：

```
1. 调 `lib/llm-batch.js` 跑 9 步流水线
```

改为：

```
1. 跑 9 步流水线
```

使用 Edit 工具精确替换。

- [ ] **Step 3: 验证 quality-gate.md 不再含实现引用**

```bash
grep -n 'lib/llm-batch\|generate-interpretations' .claude/skills/interpretation-create/shared/quality-gate.md
```

Expected: 0 命中。

- [ ] **Step 4: 提交**

```bash
git add .claude/skills/interpretation-create/shared/quality-gate.md
git commit -m "refactor(interpretation-create): quality-gate.md 清理 lib/llm-batch.js 引用

L43 移除 lib/llm-batch.js 路径，改为纯方法论描述。"
```

---

### Task 6: 修改 SKILL.md（4 处实现引用清理）

**Files:**
- Modify: `.claude/skills/interpretation-create/SKILL.md`

- [ ] **Step 1: 读取现状定位全部修改点**

```bash
grep -n 'generate-interpretations\|lib/llm-batch\|subagent-batch\|script-batch\|node scripts/' .claude/skills/interpretation-create/SKILL.md
```

Expected: 命中 7 处（见 spec §四 4.2）。

- [ ] **Step 2: 修改 2 模式表格（L20）**

将表格中批量行：

```
| 批量 | N 篇 source.md → N 篇 interpretation.md | 双轨：subagent 派发（入口 A） / CLI 脚本（入口 B），共调 `lib/llm-batch.js` |
```

改为：

```
| 批量 | N 篇 source.md → N 篇 interpretation.md | 详见 `batch.md` |
```

- [ ] **Step 3: 修改批量状态机图（L86）**

将：

```
│ A subagent            │ 调 lib/llm-batch.js
```

改为：

```
│ dispatch              │ 详见 batch.md
```

注：状态机 ASCII 框的列宽需保持对齐。

- [ ] **Step 4: 修改 Step 6 dispatch 描述（L111-113）**

将：

```
- 入口 A：详见 `shared/subagent-batch.md`
- 入口 B：详见 `shared/script-batch.md`
```

以及：

```
- 两者都调 `scripts/lib/llm-batch.js` 的 `generateInterpretations({...})`
```

改为：

```
详见 `shared/batch.md`。
```

- [ ] **Step 5: 修改共享契约索引（L126-127）**

将：

```
| subagent 派发     | `shared/subagent-batch.md`  |
| CLI 脚本          | `shared/script-batch.md`    |
```

改为一行：

```
| 批量调度方法论 | `shared/batch.md` |
```

- [ ] **Step 6: 验证 SKILL.md 不再含实现引用**

```bash
grep -n 'generate-interpretations\|lib/llm-batch\|subagent-batch\|script-batch\|node scripts/' .claude/skills/interpretation-create/SKILL.md
```

Expected: 0 命中。

- [ ] **Step 7: 验证 SKILL.md 含新引用**

```bash
grep -n 'batch.md' .claude/skills/interpretation-create/SKILL.md
```

Expected: ≥ 3 命中（2 模式表格 + Step 6 + 契约索引）。

- [ ] **Step 8: 提交**

```bash
git add .claude/skills/interpretation-create/SKILL.md
git commit -m "refactor(interpretation-create): SKILL.md 清理 4 处实现引用

- 2 模式表格：移除双轨+lib/llm-batch.js 引用 → batch.md
- 状态机图：移除 lib/llm-batch.js → dispatch
- Step 6：移除 subagent-batch.md/script-batch.md/lib/llm-batch.js → batch.md
- 契约索引：合并 subagent/CLI 两行为批量调度方法论
"
```

---

### Task 7: 最终契约自检

**Files:**
- 无（纯验证）

- [ ] **Step 1: 验证契约层不出现 generate-interpretations**

```bash
grep -rn 'generate-interpretations' .claude/skills/interpretation-create/shared/ .claude/skills/interpretation-create/SKILL.md
```

Expected: 0 命中。

- [ ] **Step 2: 验证契约层不出现 lib/llm-batch**

```bash
grep -rn 'lib/llm-batch' .claude/skills/interpretation-create/shared/ .claude/skills/interpretation-create/SKILL.md
```

Expected: 0 命中。

- [ ] **Step 3: 验证契约层不出现 node scripts/ 命令模板**

```bash
grep -rn 'node scripts/' .claude/skills/interpretation-create/shared/ .claude/skills/interpretation-create/SKILL.md
```

Expected: 0 命中（skeleton.md:68 的 `node scripts/generate.js` 是另一个工具，不在范围）。

- [ ] **Step 4: 验证 script-batch.md / subagent-batch.md 已删除**

```bash
ls .claude/skills/interpretation-create/shared/script-batch.md .claude/skills/interpretation-create/shared/subagent-batch.md 2>&1
```

Expected: 两个都 `No such file or directory`。

- [ ] **Step 5: 验证 batch.md 存在且含 5 步流程**

```bash
grep -c '^### Step' .claude/skills/interpretation-create/shared/batch.md
```

Expected: `5`。

- [ ] **Step 6: 验证跨文件引用一致**

```bash
grep -rn 'batch.md' .claude/skills/interpretation-create/SKILL.md .claude/skills/interpretation-create/shared/strategy.md
```

Expected: SKILL.md ≥ 3 + strategy.md 1 = ≥ 4 命中。

- [ ] **Step 7: 验证 git 状态干净**

```bash
git status
```

Expected: `nothing to commit, working tree clean`。

- [ ] **Step 8: 验证 commit 历史**

```bash
git log --oneline -8
```

Expected: 6 个改造 commit + spec doc + 本次自检（如需补 commit）。

---

## Self-Review

### 1. Spec 覆盖

| Spec 章节 | 实施任务 |
|---|---|
| §一 目标（5 条驱动力 + 非目标） | Task 1-6（全改造） |
| §二 最终结构 | Task 1（删除）+ Task 2（新建）+ Task 3-6（修改） |
| §三 batch.md 内容 | Task 2 |
| §四 4.1 strategy.md | Task 3 |
| §四 4.2 SKILL.md | Task 6 |
| §四 4.3 pipeline.md | Task 4 |
| §四 4.4 quality-gate.md | Task 5 |
| §五 变更总览 | 全部 Task 覆盖 |
| §六 测试策略 | Task 7 |

无遗漏。

### 2. Placeholder scan

- 0 个 TBD/TODO
- 0 个 "similar to Task N"
- 每个 Step 含完整命令/代码块/Expected 输出

### 3. 类型/命名一致性

- 全程使用 `batch.md` 单一文件名
- 全程使用 `shared/batch.md` 引用路径
- grep 模式在 Task 1-7 间一致（`generate-interpretations\|lib/llm-batch\|node scripts/`）
