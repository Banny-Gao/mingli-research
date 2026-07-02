# interpretation-create 批量模式独立性改造设计

> **日期**：2026-07-02
> **范围**：`.claude/skills/interpretation-create/` 批量模式契约清理
> **前置规范**：[SPEC-interpretation.md](../../research-dispute/SPEC-interpretation.md)、《开发指南》`docs/DEVELOPMENT_GUIDE.md`

---

## 一、目标

清理 `interpretation-create` skill 契约层中所有实现细节引用，让契约描述**做什么**而非**怎么实现**。

**驱动力：**

1. `shared/script-batch.md` 整篇是 CLI 命令参考手册（`node scripts/generate-interpretations.js ...`），不是方法论契约
2. `shared/subagent-batch.md` 含 `lib/llm-batch.js` 函数签名（`generateInterpretations({...})`），把实现细节写进了规范
3. `shared/strategy.md` 含 `node scripts/generate-interpretations.js ... --dry-run` 命令模板
4. `SKILL.md` 多处引用 `lib/llm-batch.js`、`scripts/lib/llm-batch.js` 等实现路径
5. `shared/pipeline.md`、`shared/quality-gate.md` 各有 1 处实现引用

**根本原则：** `lib/llm-batch.js`、`scripts/generate-interpretations.js` 等是 skill 自己的代码实现，契约层不应出现它们的名字。

**非目标（显式排除）：**

- 不改 `scripts/generate-interpretations.js`、`scripts/lib/llm-batch.js`、`scripts/lib/pipeline.js`、`scripts/lib/self-check-lite.js`（仍是 skill 的实现代码）
- 不改单点模式 6 步状态机
- 不改 SPEC-interpretation.md
- 不改 `shared/load-gate.md`、`shared/condition-check.md`、`shared/skeleton.md`、`shared/spec-bundles.md`

---

## 二、最终结构

```
.claude/skills/interpretation-create/
├── SKILL.md                              # 改：清理 4 处实现引用 + 更新契约索引
└── shared/
    ├── batch.md                          # 新建：统一批量调度方法论（合并 script-batch.md + subagent-batch.md）
    ├── script-batch.md                   # 删除（CLI 命令参考手册）
    ├── subagent-batch.md                 # 删除（含 lib/llm-batch.js 函数签名）
    ├── strategy.md                       # 改：删除 dry-run 命令模板 + 更新引用
    ├── pipeline.md                       # 改：1 处实现引用清理
    ├── quality-gate.md                   # 改：1 处实现引用清理
    ├── load-gate.md                      # 不动
    ├── condition-check.md                # 不动
    ├── skeleton.md                       # 不动
    └── spec-bundles.md                   # 不动
```

---

## 三、核心契约：`shared/batch.md`

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

---

## 四、其他文件改动

### 4.1 `shared/strategy.md`

**删除** "dry-run 命令模板"整段（含 `node scripts/generate-interpretations.js ...` 两条命令）。

**修改** 批量模式入口引用行：
```
旧：详见 `subagent-batch.md`（入口 A，交互式）与 `script-batch.md`（入口 B，后台/CI）。
新：详见 `batch.md`。
```

### 4.2 `SKILL.md`（4 处）

| 位置 | 旧 | 新 |
|---|---|---|
| 2 模式表格（批量行） | `双轨：subagent 派发（入口 A） / CLI 脚本（入口 B），共调 \`lib/llm-batch.js\`` | `详见 batch.md` |
| 批量状态机图 Step 6 | `调 lib/llm-batch.js` | `dispatch 批量` |
| Step 6 dispatch 描述 | 入口 A/B 两行 + "两者都调 `scripts/lib/llm-batch.js` 的 `generateInterpretations({...})`" | `详见 shared/batch.md` |
| 共享契约索引 | subagent 派发 / CLI 脚本 两行 | 合并为一行：`批量调度方法论 | shared/batch.md` |

### 4.3 `shared/pipeline.md`

L69：
```
旧：- 批量（`scripts/lib/llm-batch.js`）：每篇重写循环里调 `runSelfCheckLite(output)`
新：- 批量：每篇重写循环里调 self-check，score < 4 → 重写或失败
```

### 4.4 `shared/quality-gate.md`

L43：
```
旧：1. 调 `lib/llm-batch.js` 跑 9 步流水线
新：1. 跑 9 步流水线
```

---

## 五、变更总览

| 操作 | 文件 | 说明 |
|---|---|---|
| 删 | `shared/script-batch.md` | CLI 命令参考手册 |
| 删 | `shared/subagent-batch.md` | 含 lib/llm-batch.js 函数签名 |
| 新建 | `shared/batch.md` | 统一批量调度方法论 |
| 改 | `SKILL.md` | 4 处实现引用清理 |
| 改 | `shared/strategy.md` | 删除 dry-run 命令模板 + 更新引用 |
| 改 | `shared/pipeline.md` | 1 处实现引用清理 |
| 改 | `shared/quality-gate.md` | 1 处实现引用清理 |
| 不动 | `shared/load-gate.md` | 无实现引用 |
| 不动 | `shared/condition-check.md` | 无实现引用 |
| 不动 | `shared/skeleton.md` | 无本次相关引用 |
| 不动 | `shared/spec-bundles.md` | 无实现引用 |

**总计：** 2 删 + 1 新建 + 4 改。

**不动：** `scripts/generate-interpretations.js`、`scripts/lib/llm-batch.js`、`scripts/lib/pipeline.js`、`scripts/lib/self-check-lite.js`、SPEC-interpretation.md、单点模式 6 步状态机。

---

## 六、测试策略

纯契约清理，不写运行时代码。测试 = 契约自检（grep）。

| 检查项 | 方法 | 通过标准 |
|---|---|---|
| 契约层不出现 `generate-interpretations` | grep 在 `.claude/skills/interpretation-create/shared/` + `SKILL.md` | 0 命中 |
| 契约层不出现 `lib/llm-batch` | 同上 | 0 命中 |
| 契约层不出现 `node scripts/` 命令模板 | 同上 | 0 命中 |
| `script-batch.md` / `subagent-batch.md` 已删除 | `ls` | 不存在 |
| `batch.md` 含 5 步流程 | grep `### Step` | ≥ 5 |
| 跨文件引用一致 | grep `batch.md` 在 strategy.md + SKILL.md | ≥ 2 |
