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
