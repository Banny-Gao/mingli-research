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
