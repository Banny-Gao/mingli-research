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
