---
name: interpretation-create
description: 解读生成技能。2 模式（单点 / 批量，双轨：subagent 派发 + CLI 脚本）+ 6 步引导式状态机（单点）/ 7 步（批量含 dry-run）+ 1 次强装载 gate + 1 次原文体检 gate + 落盘前 self-check 精简版合规门，按 SPEC-interpretation.md 严格生成 books/{slug}/articles/{篇名}/interpretation.md。
trigger: 解读|生成解读|写解读|补解读|录解读
---

# interpretation-create 解读生成技能（主入口）

本 skill 仅 interpretation-create。**主 SKILL.md 实现完整引导式状态机 + 双轨批量入口路由。**

## 调用方式

用户输入 `/interpretation-create` 起手。可选带参数 `/interpretation-create {single|batch}` 跳过 Step 1。

## 2 模式

| 模式 | 适用 | 路径 |
|------|------|------|
| 单点 | 1 篇 source.md → 1 篇 interpretation.md | 主 agent 强装载 + 体检 + 9 步 + self-check + 直写 |
| 批量 | N 篇 source.md → N 篇 interpretation.md | 双轨：subagent 派发（入口 A） / CLI 脚本（入口 B），共调 `lib/llm-batch.js` |

## 单点 6 步状态机

```
[Step 1] 模式         ──→ [Step 2] 收源         ──→ [Step 3] 强装载 gate
   │ 2 选 1              │ 定位 source.md         │ Read 5 份规范 + 打印
   │ AskUserQuestion     │ 状态写：source_input   │ gate: 5 份全读后解锁
   │
   ▼
[Step 4] 体检 gate   ──→ [Step 5] 9 步主体    ──→ [Step 6] 落盘
   │ 6 项检查              │ 套 §五 Step 3-9      │ self-check 精简版
   │ 输出体检报告          │ §七 自评 < 4 → 重写  │ 冲突 4 选项
   │ 输入 Step 5          │                        │ Write interpretation.md
   └────────────────────┴────────────────────────┴──────────────
   shortcut: /interpretation-create single
```

### Step 1 — 模式

- AskUserQuestion 2 选项
- 带参数 `/interpretation-create {single|batch}` → 跳过
- 状态写：`mode ∈ {single, batch}`

### Step 2 — 收源

- 定位 `books/{slug}/articles/{篇名}/source.md`
- `Read` 全文
- 状态写：`source_input`

### Step 3 — 强装载 gate

- 详见 `shared/load-gate.md`
- 依次 Read 5 份规范 + 打印确认
- 任一缺失立即终止
- 指纹动态校验（`scripts/self-check-fingerprint.py`）

### Step 4 — 体检 gate

- 详见 `shared/condition-check.md`
- 调 `scripts/lib/condition-check.js` 的 `checkCondition(text)`
- 输出体检报告（6 项）

### Step 5 — 主体 9 步流水线

- 详见 `shared/pipeline.md`
- 调 `scripts/lib/pipeline.js` 的 `buildPipelinePrompt({...})` 装订 prompt
- 调 Claude API（自身即主 agent，无须核心库）
- 调 `evalComplianceScore({fatal, format, content})` 自评
- < 4 分 → 现场重写（最多 3 次）

### Step 6 — 落盘

- 详见 `shared/quality-gate.md` + `shared/skeleton.md`
- 调 `scripts/lib/self-check-lite.js` 的 `runSelfCheckLite(draft)`
- fatal > 0 → 回 Step 5 重写
- fatal = 0 → 冲突 4 选项（`scripts/lib/conflict.js` 的 `resolveConflict`）→ Write 文件

## 批量 7 步状态机

```
[Step 1] 模式         ──→ [Step 2] 收源         ──→ [Step 3] 强装载 gate
   │ 选批量              │ slug + 篇章列表       │ 主 agent Read 5 份
   │                      │                       │
   ▼
[Step 4] dry-run gate ──→ [Step 5] 选入口      ──→ [Step 6] dispatch
   │ 列出 N 篇 + 估算     │ A subagent            │ 调 lib/llm-batch.js
   │ 用户确认             │ B CLI 脚本             │ 共调核心库
   │                      │                       │
   ▼
[Step 7] 收尾
   │ 聚合 results
   │ 成功 N / 失败 M
   │ **不**落盘报告
   └──────────
   shortcut: /interpretation-create batch
```

### Step 4 — dry-run gate

- AskUserQuestion 2 选项（确认 / 取消）
- 列出 N 篇 + 估算耗时（每篇 30-90s）

### Step 5 — 选入口

- AskUserQuestion 2 选项：
  - A. subagent 派发（交互式，可中断，进度反馈）
  - B. CLI 脚本（后台 / CI / 脱离 Claude Code 会话）

### Step 6 — dispatch

- 入口 A：详见 `shared/subagent-batch.md`
- 入口 B：详见 `shared/script-batch.md`
- 两者都调 `scripts/lib/llm-batch.js` 的 `generateInterpretations({...})`

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 规范包 + 指纹 | `shared/spec-bundles.md` |
| 单/批 + dry-run | `shared/strategy.md` |
| 强装载 5 份 | `shared/load-gate.md` |
| 6 项体检 | `shared/condition-check.md` |
| 9 步主体 | `shared/pipeline.md` |
| 落盘规则 + 4 选项 | `shared/skeleton.md` |
| self-check 合规门 | `shared/quality-gate.md` |
| subagent 派发 | `shared/subagent-batch.md` |
| CLI 脚本 | `shared/script-batch.md` |

## 与其他 skill 的关系

| 关系对象 | 关系性质 | 接口 |
|----------|----------|------|
| **book-create**（前置）| 依赖 catalog.md | Step 3 强装载读 catalog.md |
| **source-create**（前置）| 依赖 source.md | Step 2 收源读 source.md；不共享 URL/文本/PDF 三种"补录"源 |
| **self-check-interpretation**（合规端）| v2 评估合并 | v1 用 Node 端精简版（`self-check-lite.js`）|
| **writing-plans**（设计完成后）| brainstorming 收尾转交 | 由 writing-plans 写实施计划 |

## 错误处理总览

| 失败点 | 处置 |
|--------|------|
| Step 3 任一规范文件缺失 | 立即终止 + 缺失清单（**SPEC §五 Step 1.1 刚性条款**）|
| Step 3 通读未达 5 份 | 不解锁 Step 4 |
| Step 4 体检某项异常 | 报告用户 + 套 §六 对应规则继续 |
| Step 5 §七 自评 < 4 分 | 现场重写；最多 3 次仍 < 4 → 报告用户决定 |
| Step 6 self-check fatal > 0 | 报告致命项 + 回 Step 5 重写 |
| Step 6 文件冲突 | 4 选项（覆盖 / 备份 / 取消 / 退出）|
| Step 6 写失败 | 报告 + 退出，清理已写部分 |
| 批量模式脚本失败（非 0 退出）| 报告 stderr + 列出失败篇章，不重试 |
| 批量模式 per-篇失败 | 记日志 + 跳过 + 收尾报告汇总 |
| 批量模式规范指纹漂移 | 警告用户（与 source-create 复用策略）|
| 缺 `ANTHROPIC_API_KEY` | 启动报错并打印配置指引（env.js 的 `ConfigError`）|
