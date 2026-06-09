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
