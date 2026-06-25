---
name: self-check-skill
description: skill 自检。检查 books/{slug}/articles/{篇名}/skill.md 的 AI 技能文件合规：YAML frontmatter（displayName/type/input/output/description）/ 功能定位 / 输入参数 / 处理逻辑（含兜底分支）/ 输出模板 / 至少 1 个示例 / 与 catalog 关联（文件存在即关联）。遵守 shared/sources/SPEC-skill.md + shared/sources/general.md + （术数=命时）shared/sources/bazi.md。
---

# skill 自检

## 适用场景

检查 `books/{slug}/articles/{篇名}/skill.md` 的 AI 技能文件合规。skill.md 是产物供 AI Agent 独立调用的能力单元。

## 前置规范（必含）

子 SKILL.md 启动时按 `shared/spec-bundles.md` 加载：

1. `shared/sources/SPEC-skill.md` 全文
2. `shared/sources/general.md` 全文
3. （术数=命时追加 `shared/sources/bazi.md`）

## 必检项目

- YAML frontmatter 5 字段齐全：displayName / type / input / output / description
- `type` 取值合法：analysis / lookup / comparison / generation
- 功能定位段（不重复 interpretation）
- 输入参数含类型 + 格式约束 + 必填/可选
- 处理逻辑步骤完整，每步含"做什么/依据/判定"三段
- 条件分支均有兜底 else/否则
- 边界情况显式处理（输入缺失 / 越界 / 无匹配）
- 输出模板结构化，每个字段有类型和含义说明
- 判定类输出包含"判定依据"字段（引用原文/注家）
- 输出内容自包含（通俗解释全部在文件内）
- 至少 1 个示例（推荐 2-3 个覆盖主路径和边界）
- 引用原文注家有来源标注（块引用格式）

## 调度

- 篇章模式：单书单篇（**必问** Step 3）
- books 模式：可选抽检
- 调度协议遵循 `shared/article-mode.md` / `shared/books-mode.md`

## 报告

按 `shared/report-template.md` 落盘到 `.claude/notes/self-check/{书-slug}-skill-{date}.md`。

## 错误处理

按 spec §9 处理。
