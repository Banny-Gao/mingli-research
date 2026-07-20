---
name: format-check
description: Markdown 格式规范检查与修复技能。覆盖 15 条格式规则，支持交互式/自动修复两种模式、单篇/按书两种范围，可选 LLM 深度分析。确保 books/ 下文章在 react-markdown 下渲染效果良好。
trigger: 格式检查|format-check|格式修复|排版检查|markdown格式|markdown排版|渲染检查|排版优化|插图
---

# format-check 格式检查技能（主入口）

## 定位

本 skill 是 **source-create / interpretation-create 之后的排版后处理层**，由用户手动触发，对生成产物做排版整理。

**作用域与权限：**

| 文件 | 权限 | 说明 |
|------|------|------|
| `interpretation.md` | **可读写**（主作用域） | 排版整理、拆段、加粗关键词、插入意境图，均在此 |
| `source.md` | **只读体检** | 扫描后命中只进报告，绝不 Edit（尊重 SPEC-source §2.1「原文照录」红线） |

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
| 🟡 警告 | R6 | 长引用块/正文无内部结构 |
| 🟡 警告 | R7 | 引用块内部多段被挤成单段 |
| 🟡 警告 | R15 | 流程图可读性（含移动端适配） |
| 🔵 建议 | R8 | 可用表格未用 |
| 🔵 建议 | R9 | 缺少分节线 |
| 🔵 建议 | R10 | 连续空行冗余 |
| 🔵 建议 | R11 | 中英文间缺空格 |
| 🔵 建议 | R12 | 强调标记不一致 |
| 🔵 建议 | R13 | 行尾空白 |

完整规则定义见 `rules/critical.md`、`rules/warning.md`、`rules/suggestion.md`。

> R6 已从「仅引用块」扩展到「引用块 + 正文段落」——正文文字墙是 creation 产物里最高频的排版不适，拆段（插空行）+ 加粗关键词均在 interpretation.md 上允许写。

## 调用方式

| 命令 | 模式 | 范围 |
|------|------|------|
| `/format-check <file-path>` | 交互式 | 单篇 |
| `/format-check --book <slug>` | 交互式 | 按书 |
| `/format-check --fix <file-path>` | 自动修复 | 单篇 |
| `/format-check --fix --book <slug>` | 自动修复 | 按书 |
| `/format-check --analyze <file-path>` | 交互式 + LLM | 单篇 |
| `/format-check --analyze --book <slug>` | 交互式 + LLM | 按书 |
| `/format-check --illustrate <interpretation.md 路径>` | 插图子流程 | 单篇 |

## 插图子流程

为 interpretation.md 在插入意境/氛围图。**结构图归 mermaid（R15），不进 t2i。**

| 项 | 约定 |
|----|------|
| 作用域 | 仅 interpretation.md；source.md 不碰 |
| 必要性 | 不是每篇都有，LLM 分析「值不值得插」，多数篇 0 张 |
| 图性质 | 意境/氛围图（装饰性，非信息承载） |
| 密度 | 宁缺毋滥|
| 位置 | 由 LLM 分析合适的位置 |
| 图题 | 加图题（如 `**图：四月甲木·枯木待润**`），与 R15 mermaid 图题约定对齐 |
| 执行 | 半自动：subagent 分析 → 出 prompt + 图题 → 主 agent 逐图确认 → t2i 生成 → 插入 |
| 触发 | 单篇才走插图流程；全本默认跳过；全本若开启则跳过已有插图的篇章 |
| 落盘 | `./public/images/articles/`（不存在则新建） |
| 命名 | `{书名}-{篇名}-{图名}.png`，如 `穷通宝鉴-四月甲木-枯木待润.png` |
| md 引用 | `/images/articles/{书名}-{篇名}-{图名}.png`（根绝对路径，Vite public 映射，react-markdown 默认 img 渲染） |
| t2i 调用 | `node scripts/t2i.js --prompt "..." --name {书名}-{篇名}-{图名} --output-dir ./public/images/articles` |

插图 subagent 契约见 `shared/illustrator.md`。

## 4 步引导式流程

详见 `shared/entrypoint.md`。主 SKILL.md 不重复实现，按 entrypoint.md 流程执行。

## 路由

Step 4 路由：主 agent 持有完整状态 `{scope, mode, files, llm_enabled, illustrate}` 后，按 `shared/scanner.md` 契约逐文件扫描，按 `shared/fixer.md` 契约执行修复；若 `illustrate=true`，按 `shared/illustrator.md` 契约执行插图子流程。

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 4 步引导式状态机 | `shared/entrypoint.md` |
| 规则扫描引擎 | `shared/scanner.md` |
| 修复执行器 | `shared/fixer.md` |
| 插图 subagent 契约 | `shared/illustrator.md` |
| 🔴 严重规则 | `rules/critical.md` |
| 🟡 警告规则 | `rules/warning.md` |
| 🔵 建议规则 | `rules/suggestion.md` |
