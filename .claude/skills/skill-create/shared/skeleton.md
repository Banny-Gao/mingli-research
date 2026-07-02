# SKILL.md + rules/ 落盘规则

主 agent 在 Step 5 落盘时创建两类产物：

- `skills/{一级}/{二级}/{slug}/SKILL.md`（编排入口，必含）
- `skills/{一级}/{二级}/{slug}/rules/<书slug>.md`（每本源书一份，按书 slug 命名）

## SKILL.md 与 rules/ 的分工

| 维度 | SKILL.md | rules/<书slug>.md |
|------|----------|---------------------|
| 内容 | 编排（功能/输入/处理逻辑调度/输出/示例）| 原文注家块引用 + 该书判定口径 |
| 含原文注家 | **否**（强约束）| **是**（套 SPEC-interpretation §2.1 块引用格式）|
| 二级章节数 | 5（功能/输入/处理逻辑/输出/示例）| 不定（按书判定口径分小节）|
| YAML frontmatter | 8 字段 | **无**（rules 是纯 markdown）|
| 文件名 | `SKILL.md`（大写）| `<书slug>.md`（书 slug 全名）|

## SKILL.md 模板

```markdown
---
slug: {skill-slug}
displayName: {人类可读名，可选}
type: {analysis|lookup|comparison|generation}
input: {输入描述}
output: {输出描述}
description: {功能描述}
requires: []  # 或 SKILL 包粒度依赖数组，如 ["命/八字/取月支藏干"]
sources:
  - {书slug}/{篇章名}
  - {书slug2}/{篇章名2}
  # 多书聚合，每项对应一份 rules/<书slug>.md
updated: {YYYY-MM-DD}
---

## 功能

{用一段话说明这个技能是做什么的、AI 执行者应该在何时调用它。不重复 interpretation 中的知识内容。须注明目标读者：AI 执行 skill 后的输出是给**普通用户**看的，非专业研究者。术语和结论需附带通俗解释。}

## 输入

| 参数名 | 描述 | 类型 | 格式/约束 | 必填 |
|--------|------|------|-----------|------|
| {param1} | {描述} | {string/number/...} | {约束} | {是/否} |

**输入不合法时**（如 ...），输出报告须明确指出「输入非法、无法完成判定」，不得静默失败。

## 处理逻辑

### 前置加载（按顺序）

1. `cat skills/{一级}/{二级}/{前置slug}/SKILL.md` —— {前置必填原因}
2. （按分支条件）`cat skills/{一级}/{二级}/{slug}/rules/{书slug}.md`

### 判定流程

1. **Step 1: {做什么}** → {动作}
   - 如果 **{条件A}** → 加载 `rules/{书slug}.md` 的 "{节名}" 节
   - 否则如果 **{条件B}** → 加载 `rules/{书slug}.md` 的 "{节名}" 节
   - 否则 → 加载 `rules/{书slug}.md` 的 "{兜底节名}" 节
2. **Step 2: {做什么}** ...

## 输出

### 输出模板

```yaml
# {字段名}: {类型} - {取值范围} - {说明}
```

### 字段说明

| 字段 | 类型 | 取值范围 | 说明 |
|------|------|----------|------|
| ... | ... | ... | ... |

**通俗说明要求**：每个专业术语必须在报告中附一句通俗解释。例：「正官（管束命主的力量）」。
**自包含性**：所有通俗解释必须在 skill 报告内部产出，不依赖外部引用。

## 示例

### 示例输入

- {param1}: {值}
- {param2}: {值}

### 示例输出

{完整的输出内容，与 §4 输出模板一致}

### 验证要点

- Step X 应触发 Y 分支，因输入满足条件 Z
```

## rules/<书slug>.md 模板

```markdown
# {书slug} · {skill-slug}

> 源：`books/{书slug}/articles/{篇章名}/source.md` + `interpretation.md`
> 视角：本 skill 中作为 Step X-Y 的判定口径
> 被引用：SKILL.md §3 处理逻辑 的 Step X-Y（按分支条件 cat 本文件）

## {节1 名称}

> 【{注家标识}】{完整原文}

**判定规则**：

1. {操作 1}
2. {操作 2}
3. ...

## {节2 名称}

> 【{注家标识}】{完整原文}

**判定规则**：

1. ...
```

## 字段填充规则

- **YAML frontmatter 必填 7 字段**（严格）：slug / type / input / output / description / sources / updated
- **YAML frontmatter 选填 2 字段**：displayName（人类可读名）、requires（SKILL 包粒度依赖数组，元素形如 `命/八字/取月支藏干`；不指向 shared/ 内文件）
- **type 可选值**：analysis / lookup / comparison / generation
- **无 H1**（裸篇名由目录系统推导）
- **必含 5 个二级章节**：功能 / 输入 / 处理逻辑 / 输出 / 示例
- **处理逻辑必含 2 个三级节**：前置加载 / 判定流程
- **判定流程 ≥ 2 步**，每步分支必须明确指向 `cat rules/<书slug>.md`
- **每个分支的兜底必须有**（"否则" → 哪个 rules/）
- **SKILL.md 正文不含 `> 【` 块引用**——原文注家全部在 rules/

## 落盘前自检 指纹 17 条

| # | 指纹 | 验证方式 |
|---|------|----------|
| 1 | 路径在 CATEGORY_TREE 注册 | 一级/二级均存在于 `shared/sources/category-tree.json` |
| 2 | YAML frontmatter 完整 | awk 解析 frontmatter 块闭合，行数 ≥ 8 |
| 3 | frontmatter 必填 7 字段 | grep -cE `^(slug\|type\|input\|output\|description\|sources\|updated):` >= 7 |
| 4 | `requires` 字段若存在，元素均为 SKILL 包粒度 | grep 不含 `shared/` |
| 5 | `slug` 字段值与 path 末段一致 | `basename $DIR == $slug` |
| 6 | 无 H1 | grep -c `^# ` = 0 |
| 7 | 二级章节数 = 5 | grep -c `^## ` = 5 |
| 8 | 包含"功能" | grep `^## 功能$` = 1 |
| 9 | 包含"输入" | grep `^## 输入$` = 1 |
| 10 | 包含"处理逻辑" | grep `^## 处理逻辑$` = 1 |
| 11 | 包含"输出" | grep `^## 输出$` = 1 |
| 12 | 包含"示例" | grep `^## 示例$` = 1 |
| 13 | 处理逻辑含"前置加载"节 | grep `^### 前置加载` >= 1 |
| 14 | 处理逻辑含"判定流程"节 | grep `^### 判定流程` = 1 |
| 15 | 至少 1 份 rules/<书slug>.md 存在 | `ls rules/*.md` ≥ 1 |
| 16 | sources 与 rules/ 一一对应 | `sources` 每项的 `{书slug}` 在 `rules/` 找到对应 .md |
| 17 | SKILL.md 正文不含原文注家块引用 | grep `> 【` 计数 = 0（块引用全部在 rules/）|

**任一指纹不通过 → 回 Step 3 修复，不允许落盘。**

## 落盘后 CI 校验（不归 skill-create 责任）

CI 审计流程在 git commit 后自动触发，校验 1-8 条规则（spec §5.2）：

1. `{一级}` / `{二级}` 在 CATEGORY_TREE 注册
2. `slug` 字段与 path 末段一致
3. `sources` 数组每个元素对应 `rules/<书slug>.md` 存在
4. `requires` 数组每个元素指向存在的 SKILL.md
5. `shared/` 内文件至少被 2 个 SKILL.md cat 引用
6. 旧 `books/*/articles/*/skill.md` 不应存在（v0 1:1 迁完即删的承诺）
7. 所有 `rules/<书slug>.md` 必须被 SKILL.md 的 `sources` 字段覆盖（无孤儿）
8. SKILL.md + rules/ 中所有 `cat <path>.md` 引用能 resolve 到真实文件

**任一失败 → CI 拒绝。**
