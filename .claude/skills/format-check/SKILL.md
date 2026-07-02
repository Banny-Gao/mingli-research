---
name: format-check
description: Markdown 格式规范检查与修复技能。覆盖 15 条格式规则，支持交互式/自动修复两种模式、单篇/按书两种范围，可选 LLM 深度分析。确保 books/ 下文章在 react-markdown 下渲染效果良好。
trigger: 格式检查|format-check|格式修复|排版检查|markdown格式|markdown排版|渲染检查
---

# format-check 格式检查技能（主入口）

本 skill 覆盖 15 条 markdown 格式规则。**主 SKILL.md 只做路由 + 4 步引导，不做实际扫描修复。**

## 15 条规则

| 严重度 | 规则编号 | 说明 |
|--------|----------|------|
| 🔴 严重 | R1 | 韵文/口诀换行丢失 |
| 🔴 严重 | R2 | 代码块内包含引用标记 `>` |
| 🔴 严重 | R14 | Mermaid 语法错误 |
| 🟡 警告 | R3 | 标题层级过浅 |
| 🟡 警告 | R4 | 同类条目无子标题 |
| 🟡 警告 | R5 | 标题跳级 |
| 🟡 警告 | R6 | 长引用块无内部结构 |
| 🟡 警告 | R7 | 引用块内部多段被挤成单段 |
| 🟡 警告 | R15 | 流程图可读性（含移动端适配） |
| 🔵 建议 | R8 | 可用表格未用 |
| 🔵 建议 | R9 | 缺少分节线 |
| 🔵 建议 | R10 | 连续空行冗余 |
| 🔵 建议 | R11 | 中英文间缺空格 |
| 🔵 建议 | R12 | 强调标记不一致 |
| 🔵 建议 | R13 | 行尾空白 |

完整规则定义见 `rules/critical.md`、`rules/warning.md`、`rules/suggestion.md`。

## 调用方式

| 命令 | 模式 | 范围 |
|------|------|------|
| `/format-check <file-path>` | 交互式 | 单篇 |
| `/format-check --book <slug>` | 交互式 | 按书 |
| `/format-check --fix <file-path>` | 自动修复 | 单篇 |
| `/format-check --fix --book <slug>` | 自动修复 | 按书 |
| `/format-check --analyze <file-path>` | 交互式 + LLM | 单篇 |
| `/format-check --analyze --book <slug>` | 交互式 + LLM | 按书 |

## 4 步引导式流程

详见 `shared/entrypoint.md`。主 SKILL.md 不重复实现，按 entrypoint.md 流程执行。

## 路由

Step 4 路由：主 agent 持有完整状态 `{scope, mode, files, llm_enabled}` 后，按 `shared/scanner.md` 契约逐文件扫描，按 `shared/fixer.md` 契约执行修复。

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 4 步引导式状态机 | `shared/entrypoint.md` |
| 规则扫描引擎 | `shared/scanner.md` |
| 修复执行器 | `shared/fixer.md` |
| 🔴 严重规则 | `rules/critical.md` |
| 🟡 警告规则 | `rules/warning.md` |
| 🔵 建议规则 | `rules/suggestion.md` |
