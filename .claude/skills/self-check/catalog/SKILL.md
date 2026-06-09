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
