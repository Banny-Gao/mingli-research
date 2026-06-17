# skill.md 落盘规则

主 agent 在 Step 5 落盘时创建产物：`books/{slug}/articles/{篇名}/skill.md`

## 与 source.md / interpretation.md 的关键差异

| 维度 | source.md | interpretation.md | skill.md |
|------|-----------|-------------------|----------|
| 元信息 | 无 | 无 | **YAML frontmatter**（displayName / type / input / output / description）|
| 一级标题 | `# {篇名}` 裸篇名 | 无 H1 | **无 H1**（避免与目录系统重复） |
| 块引用 | 仅 `> 【注家名】` | 多类 | **有**（> 【注家标识】完整原文）用于处理逻辑引文 |
| 表格 | 无 | 允许 | 允许 |
| Mermaid | 无 | 允许 | 允许 |
| 二级标题 | 无 | 多 | 5 节（功能 / 输入 / 处理逻辑 / 输出 / 示例）|

## skill.md 模板（摘自 SPEC-skill.md §三）

```markdown
---
displayName: {中文技能名}
type: {analysis | lookup | comparison | generation}
input: {技能输入描述}
output: {技能输出描述}
description: {一句话说明技能功能}
---

## 功能

{用一段话说明这个技能是做什么的、AI 执行者应该在何时调用它。不重复 interpretation 中的知识内容。须注明目标读者：AI 执行 skill 后的输出是给**普通用户**看的，非专业研究者。术语和结论需附带通俗解释。}

## 输入

列出所有需要的输入参数，每个参数含：名称、类型、格式约束、是否必填。

- 参数名：描述 | 类型 | 格式/约束 | 必填

## 处理逻辑

按顺序列出分析/处理步骤。每个步骤标明：

### Step 1: {做什么}

> 【注家标识】完整原文

判定：

- 如果 **条件A**，则 **结果A**
- 否则如果 **条件B**，则 **结果B**
- 否则 **结果C**（兜底分支，必须有）

### Step 2: {做什么}

> 【注家标识】完整原文

判定：

- 如果 **条件A**，则 **结果A**
- 否则 **结果B**（兜底分支，必须有）

## 输出

1. **输出模板** — 结构化格式（JSON Schema / Markdown 模板 / 字段列表）
2. **字段说明** — 逐一解释每个输出字段

输出面向普通用户 — 每个技术术语须附带一句通俗解释，结论须说明"这意味着什么"。对于分析/判定类 skill，输出中必须包含**判定依据**字段（引用哪个原文/注家），不可只给结论。输出末尾建议附"进一步了解"指引（可阅读的相关篇章）。**自包含性**：所有通俗解释必须在 skill 文件内部产出，不依赖外部引用。

## 示例

至少提供一个完整的输入→输出示例，用于验证技能正确性。

### 示例输入

- 参数1：值
- 参数2：值

### 示例输出

（完整的输出内容，与上文 输出 模板一致）

### 验证要点

- 步骤 X 应触发 Y 分支，因输入满足条件 Z
```

## 字段填充规则

- **YAML frontmatter 必填 5 字段**：displayName / type / input / output / description
- **type 可选值**：analysis / lookup / comparison / generation（按篇章内容选）
- **无 H1**（裸篇名由目录系统推导）
- **必含 5 个二级章节**：功能 / 输入 / 处理逻辑 / 输出 / 示例
- **处理逻辑 ≥ 2 步**，每步必有兜底分支
- 引文用 `> 【注家标识】完整原文` 格式（套 SPEC-interpretation.md §2.1）
- 引用 source.md / interpretation.md 内容时用 `见 source.md` / `见 interpretation.md` 简短指引，不复制粘贴

## 落盘前自检 14 指纹

| # | 指纹 | 验证方式 |
|---|------|----------|
| 1 | YAML frontmatter 完整 | `awk 'BEGIN{f=0;d=0} /^---$/{f++;next} f==2{exit} f==1{d++} END{print d}' $FILE` ≥ 5 |
| 2 | frontmatter 5 字段必填 | grep -cE `^(displayName\|type\|input\|output\|description):` = 5 |
| 3 | 无 H1 | grep -c `^# ` 计数 = 0 |
| 4 | 二级章节数 = 5 | grep -c `^## ` 计数 = 5 |
| 5 | 包含"功能" | grep -E `^## 功能$` = 1 |
| 6 | 包含"输入" | grep -E `^## 输入$` = 1 |
| 7 | 包含"处理逻辑" | grep -E `^## 处理逻辑$` = 1 |
| 8 | 包含"输出" | grep -E `^## 输出$` = 1 |
| 9 | 包含"示例" | grep -E `^## 示例$` = 1 |
| 10 | 处理逻辑 ≥ 2 步 | grep -c `^### Step` ≥ 2 |
| 11 | 每步有兜底分支 | grep -c `否则 ` 在 `## 处理逻辑` 块内 ≥ 2 |
| 12 | 表格行无空列 | awk -F'\|' '/^\|/ && !/^\|---/ && (NF<4)' 计数 = 0 |
| 13 | Mermaid 块有 ` ``` ` 头尾 | grep -c '```mermaid' 为偶数 |
| 14 | 学术语体（无 AI 自指） | grep -i "作为 AI\|我作为\|i am an ai" 计数 = 0 |

**任一指纹不通过 → 回 Step 3 修复。**
