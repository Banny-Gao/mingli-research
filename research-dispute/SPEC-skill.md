# 技能规范

> - 关联：`.claude/skills/skill-create/` 按本 SPEC 严格生成 `skills/{一级}/{二级}/{slug}/SKILL.md`

> **用途：** 规范 `skills/{一级}/{二级}/{slug}/SKILL.md` + `rules/<书slug>.md` 的产出格式
> **生成依赖：** `books/{slug}/articles/{篇名}/{source,interpretation}.md`（上游）
> **产出特性：** 跨书聚合（同一 skill 跨多本书的 rules/ 共同支撑）+ 自包含（每个 SKILL.md 可独立执行）
> **面向受众：** AI 执行者（Claude Code / 其他 LLM Agent）+ 项目内 skill-create 主 agent

---

## 一、前置判断

生成 skill 之前，先判断该议题是否需要提炼为"类别化 skill"。

**需要提炼的场景**：

- 议题在 1+ 本书有原文依据（source.md + interpretation.md 存在）
- 议题有明确的判断逻辑（命理格局判定、医学证型辨证、卜筮起卦断卦等）
- 议题跨多本书有论述（v2 体系核心场景——同一技法在子平/渊海/神峰/滴天髓各讲各的，需聚合）
- 有可操作的流程（步骤 + 兜底分支）
- 有结构化输出（报告、列表、对比结果等）

**不需要提炼的场景**：

- 单一来源、纯理论阐述、无操作流程
- 概念解释为主
- 内容过于抽象，难以结构化

只有判断需要时才调用 `skill-create`。

---

## 二、文件位置

```
skills/{一级类别}/{二级类别}/{skill-slug}/
├── SKILL.md                ← 编排入口（必含）
├── rules/<书slug>.md       ← 该书对 skill 的原文注家与判定口径（默认建）
└── shared/<原子>.md        ← 跨 skill 共享的原子能力（≥2 个 SKILL.md cat 引用时才建）
```

- **路径必须在 CATEGORY_TREE 注册**（一级 + 二级都要）。真源：`scripts/lib/category-tree.js`
- **skill-slug**：中文 slug，**与 path 末段严格一致**，且与 SKILL.md YAML `slug` 字段值一致
- **书 slug**：与 `books/{slug}/` 一致；`<书slug>.md` 文件名与书 slug 完全对应

> 类别不在 CATEGORY_TREE？→ 先在 `scripts/lib/category-tree.js` 加节点，再 `npm run generate` 验证 `exit 0`。
> 类比：`books/{slug}/` 与 CATEGORY_TREE 的对应是 catalog.md 的 `> 类别：` 字段约束，类比同上。

---

## 三、文件结构

### 3.1 YAML Frontmatter（必备）

```yaml
---
slug: 八格判定              # 必填：与 path 末段严格一致
displayName: 八格判定法      # 选填：人类可读名（可与 slug 略不同）
type: analysis               # 必填：analysis | lookup | comparison | generation
input: 八字四柱（年/月/日/时天干地支）  # 必填
output: 格局判定报告           # 必填
description: 基于《滴天髓阐微》八格篇与子平、渊海、神峰三书印证，给出八字格局正变归属、用神定位与病药分析
requires: []                  # 选填：SKILL 包粒度依赖，如 ["命/八字/取月支藏干"]
sources:                      # 必填：与 rules/<书slug>.md 一一对应
  - 滴天髓阐微/八格
  - 子平真诠/论正官格
  - 渊海子平/论正官格
  - 神峰通考/论八格
updated: 2026-06-23           # 必填：本 SKILL.md 最后一次人工审视时间（YYYY-MM-DD）
---
```

**字段说明**：

| 字段 | 必填 | 语义 | 约束 |
|------|------|------|------|
| `slug` | 是 | 中文 slug，**锁定到 path 末段** | `requires` 与 `sources` 通过 slug 引用，不可漂移 |
| `displayName` | 否 | 人类可读名 | 例：`八格判定法`（当前技能合适的精炼的可读名） |
| `type` | 是 | 四选一 | `analysis` / `lookup` / `comparison` / `generation`|
| `input` / `output` | 是 | 一句话描述 | 对应正文 §2 输入参数 / §4 输出格式 |
| `description` | 是 | 一句话功能说明 | |
| `requires` | 否 | SKILL 包粒度依赖数组 | 元素形如 `命/八字/取月支藏干`。**不指向 shared/ 内文件**（shared/ 通过正文 §4 cat 引用）|
| `sources` | 是 | 书目追溯数组 | 每个元素对应 `rules/<书slug>.md` 存在。generate.js `--audit` 强制一一对应 |
| `updated` | 是 | 人工审视时间 | 不是 interpretation.md 最后改动时间。修改 SKILL.md 正文或 rules/ 内容后必须更新 |

### 3.2 正文骨架（5 节）

**禁止在正文中复制原文注家块引用**（`> 【任氏曰】...`）——这些全部下沉到 `rules/<书slug>.md`。

| 章节 | 内容 | 是否含原文注家 |
|------|------|--------------|
| §1 功能 | 调用时机、目标读者 | 否 |
| §2 输入 | 参数表（含类型/格式/必填） | 否 |
| §3 处理逻辑 | 调度步骤 + 加载指引（见 §3.3 模板） | **否**（用 `cat rules/xxx.md` 指引替代块引用）|
| §4 输出 | 字段定义 + 通俗解释约束 | 否 |
| §5 示例 | 至少 1 个完整输入→输出 | 否（示例中可引用 `cat` 结果，但不展开原文）|

### 3.3 处理逻辑（§3）写法模板

约定口头指令 + 写法模板，**不引入额外 YAML 字段**。

```markdown
## 处理逻辑

### 前置加载（按顺序）

1. `cat skills/命/八字/取月支藏干/SKILL.md` —— 必须先有月支藏干结果
2. （按分支条件）`cat skills/命/八字/八格判定/rules/<书slug>.md`

### 判定流程

1. **Step 1：取月支司令** → 调用前置技能 `取月支藏干`，得月支本气/中气/余气
2. **Step 2：立格判定**
   - 如果本气透干 → `cat rules/滴天髓阐微.md`，按其立格四步法执行
   - 否则如果中气透出 → `cat rules/子平真诠.md`，按其格气不纯处理执行
   - 否则（无透） → `cat rules/渊海子平.md`，按其借格判定执行
3. **Step 3：归组** → 输出正格七组 / 变格九组 / 无格可取 之一
```

**规则**：

- 每个条件分支必须明确指向 `cat` 哪份 `rules/<书slug>.md`
- 兜底分支必须有（"否则" → 哪个 rules/）
- 跨 skill 依赖通过 `cat` 显式声明，不依赖隐式约定
- `cat` 引用路径必须能 resolve 到真实文件（generate.js `--audit` 校验 8 强制）

### 3.4 子结构（rules/ 与 shared/）

| 子目录 | 何时建 | 文件形态 |
|--------|-------|---------|
| `rules/` | **默认建**：单书 skill 也建（只放 1 份），多书 skill 按书 slug 拆，每本书一份 `rules/<书slug>.md` | 该书原文注家块引用 + 该书判定口径 |
| `shared/` | **准入门槛**：至少被 2 个 SKILL.md 在正文 §3 通过 `cat` 引用 | 原子能力，如 `shared/取月支藏干.md`，自身不是完整 SKILL 包 |

**禁止预先拆 `rules/` 但不放内容**——空目录视为噪音。

**`rules/<书slug>.md` 内容约束**：

- 包含该书原文注家块引用（`> 【任氏曰】...` 格式，继承自 SPEC-interpretation §2.1）
- 包含该书的判定口径（如何把原文落到本 skill 的判定步骤上）
- 不重复 SKILL.md 正文已写明的输入/输出/示例
- 原文块引用必须与 `books/{slug}/articles/{篇名}/interpretation.md` 一致或更新（interpretation 是真源，rules 是其在该 skill 视角的提炼）

### 3.5 SKILL.md 完整模板

> **完整 6 步引导式状态机**（含 Step 0 参数预解析 / Step 0.5 迭代模式 / Step 1a-1d / Step 2-6 + 3 门点）详见 `.claude/skills/skill-create/shared/strategy.md` + `shared/gate.md`。本 SPEC 只定义产物规范（SKILL.md / rules/ 的格式与原则），不重复流程细节。

```markdown
---
slug: {skill-slug}
displayName: {人类可读名，可选}
type: {analysis|lookup|comparison|generation}
input: {输入描述}
output: {输出描述}
description: {功能描述}
requires: []  # 或 SKILL 包粒度依赖数组
sources:
  - {书slug}/{篇章名}
  ...多书聚合
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

1. {cat <path> —— 必填前置}
2. （按分支条件）{cat <path> —— 分支前置}

### 判定流程

1. **Step 1: {做什么}** → {动作}
   - 如果 **{条件A}** → 加载 `rules/{书slug}.md` 的 "{节名}" 节
   - 否则如果 **{条件B}** → 加载 `rules/{书slug}.md` 的 "{节名}" 节
   - 否则 → 加载 `rules/{书slug}.md` 的 "{兜底节名}" 节
2. **Step 2: {做什么}** ...

## 输出

### 输出模板

- {字段名}: {类型} - {取值范围} - {说明}

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

---

## 四、设计原则

1. **类别化聚合** — skill 归属"命·八字·八格判定"等类别路径，跨多本书共同沉淀
2. **基于原文+解读** — skill 从 source（原文依据）和 interpretation（义理解读）中提炼可执行能力
3. **rules/ 默认拆** — 多书聚合视为常态，每本书一份 rules/<书slug>.md，原文注家块引用全部下沉
4. **cat 指引统一** — SKILL.md 正文只用 `cat` 引用规则文件，不复制原文；AI 工具链按需加载
5. **slug 锁定 path 末段** — 跨 skill 引用通过 slug 锁定，避免中文长名漂移
6. **跨书来源追溯** — YAML `sources` 与 `rules/` 一一对应，generate.js `--audit` 校验
7. **更新触发按类别** — 新增/修订某类别书目的解读时，对应 skill 的 rules/ 应被审视
8. **不做 speculative 设计** — 只定义当前议题明确支持的能力
9. **生成后独立** — 每个 SKILL.md 可被 AI 工具链 cat 后独立执行，不依赖外部引用（除 cat 指引的 rules/）

---

## 五、产出自检清单

skill-create 落盘前必须通过所有指纹：

| # | 指纹 | 验证方式 |
|---|------|----------|
| 1 | 路径在 CATEGORY_TREE 注册 | 一级/二级均存在于 `scripts/lib/category-tree.js` |
| 2 | YAML frontmatter 完整 | awk 解析 frontmatter 块闭合，行数 ≥ 8 |
| 3 | frontmatter 必填 8 字段 | grep -cE `^(slug\|displayName\|type\|input\|output\|description\|sources\|updated):` = 8 |
| 4 | `requires` 字段若存在，元素均为 SKILL 包粒度 | grep 不含 `shared/` |
| 5 | `slug` 字段值与 path 末段一致 | `basename $DIR == $slug` |
| 6 | 无 H1（裸篇名由目录系统推导） | grep -c `^# ` = 0 |
| 7 | 二级章节数 = 5（功能/输入/处理逻辑/输出/示例） | grep -c `^## ` = 5 |
| 8 | 包含"功能" | grep `^## 功能$` = 1 |
| 9 | 包含"输入" | grep `^## 输入$` = 1 |
| 10 | 包含"处理逻辑" | grep `^## 处理逻辑$` = 1 |
| 11 | 包含"输出" | grep `^## 输出$` = 1 |
| 12 | 包含"示例" | grep `^## 示例$` = 1 |
| 13 | 处理逻辑含"前置加载"节 | grep `^### 前置加载` >= 1 |
| 14 | 处理逻辑含"判定流程"节 | grep `^### 判定流程` = 1 |
| 15 | 至少 1 份 rules/<书slug>.md 存在 | `ls rules/*.md` ≥ 1 |
| 16 | sources 与 rules/ 一一对应 | `sources` 每项的 `{书slug}` 在 `rules/` 找到对应 .md |
| 17 | SKILL.md 正文不含原文注家块引用 | grep `> 【` 计数 = 0（块引用全部在 rules/） |

**任一指纹不通过 → 回 Step 3 修复，不允许落盘。**

> **关于 cat 引用 resolve 校验**：本表 17 指纹仅校验 SKILL.md 自身结构。`cat <path>.md` 引用路径能否 resolve 到真实文件的校验，由 `scripts/generate.js --audit` 承担（见 §七）。

---

## 六、与 books/catalog 的关联

skill-create 在 GATE 2 原文体检阶段会读取 `books/{slug}/catalog.md`：

- `> 术数：` 字段 → 加载 `research-dispute/{术数}.md` 专项规范（如 `bazi.md`）
- `> 类别：` 字段 → 校验该书在 CATEGORY_TREE 的二级类别注册（与本 skill 的目标二级类别一致）

**类别一致性约束**：

- 所选书在 catalog.md 的二级类别 = skill 目标二级类别
- 例：想做 `命·八字` 的 skill，选的书必须在 `> 类别：八字`
- 不一致：阻断，提示「该书类别是 X，本 skill 类别是 Y，请先调 catalog.md 或选其他书」

---

## 七、与 generate.js / --audit 的关系

`scripts/generate.js` 是 skill 的下游消费者（非创建者）。skill-create 创建/迭代 SKILL.md 后，**不直接调 generate.js**，由 git commit 触发：

```
skill-create 落盘 → git diff（人工） → git commit
    ↓
CI: npm run generate → src/data/skills.json
    ↓
CI: npm run generate -- --audit → exit 0
```

**CI 必须 exit 0 才允许合并**。`--audit` 失败的常见原因：

- 新 SKILL.md 的 `sources` 引用了不存在的 `rules/`
- `slug` 与 path 末段不一致
- `requires` 指向不存在的 SKILL.md
- 路径不在 CATEGORY_TREE
- 正文 cat 引用路径不 resolve

**任一违规 → PR 被 CI 拒绝。**

---

## 八、scope 之外

skill-create **不**做以下事情：

- 不写 subagent 派发逻辑（沿用 v0 单点 interactive 模式）
- 不调 `scripts/lib/llm-batch.js`（不批量）
- 不写 `SPEC-skill-create.md`（**本 SPEC-skill.md 即其规范**——skill-create 不维护独立 SPEC 文件）
- 不做干跑预览门点（一次性交互）
- 不创建 `.claude/skills/` 下的 Claude Code skill（不是 skill-create 范围）
- 不直接调 `scripts/generate.js`（CI 自动触发）

---

## 九、失败处置

| 类别 | 触发 | 处置 |
|------|------|------|
| 1. CATEGORY_TREE 未注册 | 所选类别路径未在 scripts/lib/category-tree.js | 阻断，2 选项门：先注册类别 / 退出 |
| 2. 源书类别不一致 | 书的 `> 类别：X` ≠ skill 目标二级类别 | 阻断，3 选项门：调 catalog.md / 选其他书 / 退出 |
| 3. 上游缺失 | source.md / interpretation.md 不存在 | 阻断，3 选项门：调 source-create / interpretation-create / 退出 |
| 4. 指纹不通过 | 17 条指纹任一失败 | 4 选项门：A 覆盖（仅当文件已存在）/ B 取消 / C 回 Step 3 修复（推荐默认）/ D 退出 |
| 5. 用户中途放弃 | Step 间 `/exit` | 未落盘不保存，重启从 Step 0 开始 |
| 6. SPEC-skill.md 缺失 | 强装载 gate 失败 | 全阻断，提示恢复 SPEC |
