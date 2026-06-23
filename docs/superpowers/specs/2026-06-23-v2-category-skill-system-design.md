# 类别化 Skill 体系：按术数类别聚合 + 跨书维护（v2 重写）

> 日期：2026-06-23
> 状态：v2 重写中。v1 见 `2026-06-23-category-skill-system-design.md`（保留作历史快照）
> 前置 commit：`f16f3c3` clean(skill): 拆除篇章→skill 1:1 体系
> 上游 issue：`issues/10-类别化-skill-体系重构-按术数类别聚合-跨书维护.md`
> 替代 SPEC：`research-dispute/SPEC-skill.md`（1:1 文档导向 SPEC，全文重写）

## 修订要点（v1 → v2）

| # | 修订 | 触发原因 |
|---|------|---------|
| 1 | CATEGORY_TREE 真源改为 `scripts/lib/category-tree.js`（纯 JS），前端通过 `src/data/category-tree.ts` 门面消费 | v1 把 CATEGORY_TREE 留在 `Landing.tsx`，generate.js 与前端无共享机制 |
| 2 | `rules/` 从"按需扩展"升格为**默认形态**：3+ 本书共用同一 skill 视为常态而非冲突例外 | 用户确认未来 6 个月会有多书聚合需求 |
| 3 | SKILL.md 正文**只放编排 + 示例**，原文注家全部下沉到 `rules/<书slug>.md` | 避免双份内容同步漂移；SKILL.md 成为"调度器"而非"规则库" |
| 4 | 旧 `books/*/articles/*/skill.md` **迁完即删**（一 skill 一 PR，不留双轨期） | 用户确认无 deprecation 需求 |
| 5 | `requires` 永远 SKILL 包粒度，不指向 `shared/` 内文件 | shared/ 通过 `cat` 在正文 §4 引用，YAML 层面只声明包依赖 |
| 6 | generate.js `--audit` 校验规则增至 5 条；`shared/` 准入门槛 = 至少 2 个 SKILL.md cat 引用 | 防止单引用就开 shared/ 目录膨胀 |
| 7 | SKILL.md §4 提供"前置加载 + 判定流程"模板 | 避免各 skill 写法发散；约定口头指令 |
| 8 | 标注 ModalReader 遗留 `'skill'` 模态类型（test fixture 残留） | 摸清历史入口，避免重蹈"多入口"覆辙 |
| 9 | `updated` 语义改为"本 SKILL.md 最后一次人工审视时间" | 与 interpretation.md 改动解耦 |
| 10 | 引入显式 `slug` 字段（与 path 末段绑定），`displayName` 仍可自由 | `requires` 与 `sources` 锁定到 slug，避免中文长名漂移 |
| 11 | top-actions skill icon 选型待 Phase 3 决定 | 当前不影响 spec 设计 |

---

## 一、目标

将当前"一篇一 skill"的 1:1 绑定体系，改造为**按"术数 × 二级类别"聚合**的能力包体系：

- skill 归属"命·八字·八格判定"等类别路径，跨多本书共同沉淀
- 一个 skill 包包含 `SKILL.md`（编排入口）+ `rules/<书slug>.md`（各书判定口径）+ 可选 `shared/<原子能力>.md`
- YAML frontmatter 明示 `sources`（与 `rules/` 一一对应）+ `requires`（SKILL 包粒度）+ `updated`（人工审视时间）
- 同名 skill（跨类别同名技法）天然路径隔离
- AI 工具链与 src 前端能消费同一份 skill 源

---

## 二、架构总览

```
mingli-research/
├── books/                          ← 原始文献层（不变）
│   └── {slug}/articles/{篇名}/{source,interpretation}.md
├── research-dispute/               ← 规则与争议层（不变）
│   ├── general.md
│   └── SPEC-skill.md               ← 历史快照（已被本文档替代）
├── scripts/lib/
│   └── category-tree.js            ← 【新】CATEGORY_TREE 真源（纯 JS，前后端共享）
├── skills/                         ← 【新】可执行能力层
│   ├── 命/八字/八格判定/
│   │   ├── SKILL.md                ← 编排入口：功能/输入/输出/判定流程/示例
│   │   ├── rules/滴天髓阐微.md      ← 该书对"八格判定"的原文注家与判定口径
│   │   ├── rules/子平真诠.md
│   │   ├── rules/渊海子平.md
│   │   └── rules/神峰通考.md
│   ├── 命/八字/取月支藏干/
│   │   ├── SKILL.md
│   │   └── shared/                 ← 仅当该原子能力被 ≥2 个 SKILL.md cat 引用时建
│   └── ...
├── src/
│   ├── data/category-tree.ts       ← 【新】CATEGORY_TREE TS 门面（re-export + 类型）
│   ├── data/skills.json            ← 【新】generate.js 产物
│   └── pages/Skills.tsx            ← 【新】唯一前端入口
└── scripts/generate.js             ← 扩展：扫描 skills/ → src/data/skills.json + --audit
```

三个正交维度：

1. **类别维度**（命/卜/医/山/相）—— `scripts/lib/category-tree.js` 唯一真源
2. **能力维度**（单 SKILL.md）—— 自包含、可独立执行的编排入口
3. **来源书目维度**（YAML `sources` ↔ `rules/<书slug>.md`）—— 跨书追溯

---

## 三、路径骨架

### 3.1 顶层位置

`skills/` 与 `books/` 平级，作为**与原始文献平行的"可执行能力层"**。

理由：

- `books/` 语义是"原始文献+解读"，`skills/` 语义是"可被 AI 调用的能力包"
- 平级隔离便于 AI 工具链扫描 `skills/`（如 `~/.claude/skills/` 同型）
- 不污染 `research-dispute/`（该目录语义是"争议处置"，不是"能力库"）

### 3.2 类别路径

```
skills/{一级类别}/{二级类别}/{skill-slug}/
```

一级类别：`命` / `卜` / `医` / `山` / `相`（与 `scripts/lib/category-tree.js` 的 CATEGORY_TREE 一级节点严格对齐）
二级类别：`八字` / `紫微斗数` / `七政四余` / `易经` / `六爻` / `梅花易数` / `奇门遁甲` / `大六壬` / ...（与 CATEGORY_TREE 二级节点对齐）
skill-slug：中文 slug，**必须与 path 末段严格一致**，且与 `SKILL.md` 的 YAML `slug` 字段值一致

### 3.3 CATEGORY_TREE 真源

**真源**：`scripts/lib/category-tree.js`（纯 ESM JS 模块，前后端共享）

```js
// scripts/lib/category-tree.js
export const SECTION_ORDER = ['命', '医', '山', '相', '卜']
export const CATEGORY_TREE = [
  { section: '山', categories: ['拳法'] },
  { section: '医', categories: ['中医'] },
  { section: '命', categories: ['八字', '紫微斗数', '七政四余'] },
  { section: '相', categories: ['地相', '人相', '星相'] },
  { section: '卜', categories: ['易经', '六爻', '梅花易数', '奇门遁甲', '大六壬'] },
]
```

**前端门面**：`src/data/category-tree.ts`

```ts
// src/data/category-tree.ts
import { CATEGORY_TREE as RAW } from '../../scripts/lib/category-tree.js'
export const CATEGORY_TREE = RAW as const
export const SECTION_ORDER = RAW.map(t => t.section) as typeof RAW[number]['section'][]
export type ArtSection = (typeof CATEGORY_TREE)[number]['section']
```

**消费方**：

- `src/pages/Landing.tsx` —— 从本文件 import，删除原硬编码字面量（v1 §3.2 提到但未落实）
- `src/components/SectionHeader/index.tsx` —— 通过 props 接收，不直接 import
- `scripts/generate.js` —— 直接 import `scripts/lib/category-tree.js`（Node 跑 ESM 即可）

**变更原则**：新增一级/二级类别**必须**先改 `scripts/lib/category-tree.js`，再 `npm run generate`。generate.js 在扫描 `skills/` 时若发现未注册类别，**报错并提示此文件路径**。

---

## 四、单 SKILL.md 骨架

### 4.1 YAML Frontmatter（必备）

```yaml
---
slug: 八格判定              # 必填：与 path 末段严格一致，被 requires/sources 引用
displayName: 八格判定法      # 选填：人类可读名，可与 slug 略不同
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

| 字段 | 必填 | 语义 |
|------|------|------|
| `slug` | 是 | 中文 slug，**锁定到 path 末段**。`requires` 与 `sources` 通过 slug 引用，不可漂移 |
| `displayName` | 否 | 人类可读名。例：`八格判定法`（slug 是 `八格判定`，displayName 多一个"法"字） |
| `type` | 是 | `analysis` / `lookup` / `comparison` / `generation` 四选一（继承自旧 SPEC-skill.md §3.1） |
| `input` / `output` | 是 | 一句话描述，对应正文 §3 输入参数 / §5 输出格式 |
| `description` | 是 | 一句话说明技能功能 |
| `requires` | 否 | SKILL 包粒度依赖数组，元素形如 `命/八字/取月支藏干`。**不指向 shared/ 内文件**（shared/ 通过正文 §4 cat 引用） |
| `sources` | 是 | 书目追溯数组，每个元素对应 `rules/<书slug>.md` 存在。generate.js `--audit` 强制一一对应校验 |
| `updated` | 是 | 人工审视完成时间（不是 interpretation.md 最后改动时间）。修改 SKILL.md 正文或 rules/ 内容后必须更新 |

### 4.2 正文骨架

继承旧 `SPEC-skill.md` §3.2–§3.6 全部章节，但**禁止在正文中复制原文注家块引用**（`> 【任氏曰】...`）——这些应全部下沉到 `rules/<书slug>.md`。

| 章节 | 内容 | 是否含原文注家 |
|------|------|--------------|
| §1 功能 | 调用时机、目标读者 | 否 |
| §2 输入 | 参数表（含类型/格式/必填） | 否 |
| §3 处理逻辑 | 调度步骤 + 加载指引（见 §4.3 模板） | 否（用 `cat rules/xxx.md` 指引替代块引用） |
| §4 输出 | 字段定义 + 通俗解释约束 | 否 |
| §5 示例 | 至少 1 个完整输入→输出 | 否（示例中可引用 `cat` 结果，但不展开原文） |

### 4.3 处理逻辑（§3）写法模板

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

### 4.4 子结构（rules/ 与 shared/）

| 子目录 | 何时建 | 文件形态 |
|--------|-------|---------|
| `rules/` | **默认建**：该 skill 在多本书有原文（视为常态） | 按书 slug 拆，每本书一份 `rules/<书slug>.md`，含该书原文注家块引用 + 该书视角的判定口径 |
| `shared/` | **准入门槛**：至少被 2 个 SKILL.md 在正文 §4 通过 `cat` 引用 | 原子能力，如 `shared/取月支藏干.md`，自身不是完整 SKILL 包 |

**禁止预先拆 `rules/` 但不放内容**——空目录视为噪音。如果该 skill 只在 1 本书有原文，仍可省略 `rules/`，SKILL.md 正文 §4 直接 cat `books/{slug}/articles/{篇名}/interpretation.md`（保留向旧体系兼容的逃生通道）。

**`rules/<书slug>.md` 内容约束**：

- 包含该书原文注家块引用（`> 【任氏曰】...` 格式，继承自 SPEC-interpretation §2.1）
- 包含该书的判定口径（如何把原文落到本 skill 的判定步骤上）
- 不重复 SKILL.md 正文已写明的输入/输出/示例

### 4.5 与 v1 §四按需扩展的差异

v1 把 `rules/` 放在"按需触发"条件里（"该 skill 在多本书有原文且互相冲突"才拆）。v2 把 `rules/` 升格为**默认形态**：

- v1 假设大多数 skill 是单源 → 大多数 SKILL.md 自包含
- v2 假设大多数 skill 是多源聚合 → 大多数 SKILL.md 配 `rules/`

这是基于用户对未来 6 个月规划的判断，**不是性能优化**。

---

## 五、数据流

```
books/{slug}/articles/{篇名}/interpretation.md
    ↓ 跨书聚合 + 规则抽取
skills/命/八字/八格判定/SKILL.md + rules/<书slug>.md
    ↓ generate.js 扫描
src/data/skills.json
    ↓
前端：Skills.tsx（按 CATEGORY_TREE 二级分类）
    ↓
AI 工具链：cat skills/命/八字/八格判定/SKILL.md + 按 §4.3 模板 cat rules/shared
```

### 5.1 generate.js 扫描契约

**输入契约**：

- 扫描 `skills/{一级}/{二级}/{slug}/SKILL.md`
- 解析 frontmatter：`slug`、`displayName`、`type`、`input`、`output`、`description`、`requires`、`sources`、`updated`
- 校验规则（任一失败 → exit 1）：
  1. **`{一级}` 与 `{二级}` 必须在 `CATEGORY_TREE` 中注册**（否则报错，提示「先在 `scripts/lib/category-tree.js` 加此类别」）
  2. **`slug` 字段必须与 path 末段一致**
  3. **`sources` 数组每个元素必须在 `rules/<书slug>.md` 找到对应文件**（书 slug = `sources` 项按 `/` 分割的第一段）
  4. **`requires` 数组每个元素必须指向存在的 SKILL.md 路径**（必须为 SKILL 包粒度，不可指向 `shared/` 内文件）
  5. **`shared/` 内每个文件至少被 2 个 SKILL.md 在正文 §4 通过 `cat` 引用**（否则 warn + 标待清理）

**输出契约**（追加到现有 `src/data/skills.json`，不破坏其他字段；如文件不存在则新建）：

```json
[
  {
    "category": "命",
    "subcategory": "八字",
    "slug": "八格判定",
    "displayName": "八格判定法",
    "type": "analysis",
    "input": "八字四柱",
    "output": "格局判定报告",
    "description": "基于《滴天髓阐微》八格篇与子平、渊海、神峰三书印证...",
    "sources": ["滴天髓阐微/八格", "子平真诠/论正官格", "渊海子平/论正官格", "神峰通考/论八格"],
    "requires": [],
    "updated": "2026-06-23",
    "path": "skills/命/八字/八格判定/SKILL.md",
    "rulesCount": 4
  }
]
```

**`id` 复合键**（v1 §十风险 2）：生成时自动派生 `id = category + '/' + subcategory + '/' + slug`，用于前端 React key。`displayName` 重名不影响。

### 5.2 --audit 子命令

CI 可调用，仅审计不修改文件。

- 校验规则同 §5.1 输入校验 1-5（任何失败 → exit 1）
- 附加校验 6：扫描 `books/*/articles/*/skill.md`，**若存在则视为违规**（迁完即删的承诺，参见 §七）
- 附加校验 7：所有 `rules/<书slug>.md` 必须被 `SKILL.md` 的 `sources` 字段覆盖（无孤儿文件）

### 5.3 更新触发链

- 修订 `books/{slug}/articles/{篇名}/interpretation.md` 时，git diff 自动列出该篇名被哪些 `skills/*/rules/<书slug>.md` 引用 → PR review 时一并审视
- 修改 `SKILL.md` 正文或 `rules/` 内容后，**人工**更新 frontmatter `updated` 字段（本轮不自动化，参见 §十风险 3）
- generate.js 不消费 `updated` 字段做决策——它仅作前端展示与审计参考

---

## 六、src 入口（唯一）

| 元素 | 决定 |
|------|------|
| 路由 | `App.tsx` 新增 `/skills`（列表） + `/skills/:category/:subcategory/:slug`（详情） |
| top-actions | 已有 notes icon 下拉收纳 **skill icon**，与笔记并列。icon 选型在 Phase 3 决定（候选：`Wand2` / `Sparkles` / `BookMarked`，避开 `UserStar`/`Search`） |
| skill icon 点击 | 进 `Skills.tsx` 技能列表页 |
| `Skills.tsx` | 二级 Tab 完全沿用 CATEGORY_TREE 二级分类（如 `命` 下挂 `八字/紫微斗数/七政四余`） |
| 每 Tab 内 | 列出该二级分类下所有 SKILL 卡（`displayName` + `description` + 来源书目数） |
| SKILL 卡点击 | 进 `SkillDetail.tsx`：输入参数表单 + 调用执行入口（**调用执行不在本 spec 范围**，Phase 3 只做"展示 SKILL.md 正文 + 输入表单"） |
| Landing / 书籍页 / SearchBar | **一律不挂** skill 入口，YAGNI |
| 搜索索引 | `search-index.json` 当前不含 skill 数据。Phase 3 决定是否扩展（v1 未提，是真问题） |

**遗留接口标注**：

`src/components/ModalReader/__tests__/RelatedTags.test.tsx:31` 含 `'skill-1': '技能一号'` 测试 fixture，`modalType.test.ts:32` 含 `isModalType('skill')`。说明 ModalReader 历史上有 `type: 'skill'` 模态。本 spec **不清理该测试 fixture**，但 Skills.tsx 不复用该路径，避免重蹈"多入口"覆辙。清理时机作为后续 issue。

---

## 七、迁移路径

**原则**：一 skill 一 PR，迁完即删旧文件，**不留双轨期**。

### 7.1 单 skill 迁移步骤

以 `books/滴天髓阐微/articles/八格/skill.md`（199 行）迁到 `skills/命/八字/八格判定/` 为例：

1. **创建新目录** `skills/命/八字/八格判定/`
2. **创建 `rules/滴天髓阐微.md`**：从旧 `skill.md` 中抽取所有原文注家块引用（`> 【任氏曰】...`），按"该书判定口径"组织。原文块引用必须与 `books/滴天髓阐微/articles/八格/interpretation.md` 一致或更新（interpretation 是真源，rules 是其在该 skill 视角的提炼）
3. **创建 `SKILL.md`**：
   - frontmatter：照 §4.1 填写
   - 正文：按 §4.3 模板重写处理逻辑，将原 skill.md 的"Step 1/2/3..."改为"调度步骤 + `cat rules/xxx.md` 指引"
   - 功能/输入/输出/示例：保留旧 skill.md 的对应章节，但删除原文注家块引用
4. **删除旧文件** `books/滴天髓阐微/articles/八格/skill.md`
5. **本地验证**：
   - `npm run generate` —— `src/data/skills.json` 应新增 1 条
   - `npm run generate -- --audit` —— exit 0
   - `npm run build` —— 前端构建无回归
6. **单 PR 提交**：含 step 1-5 所有变更，commit message 形如 `refactor(skill): 八格判定迁移至 skills/命/八字/八格判定/`

### 7.2 批量迁移约束

- 跨 skill 迁移**禁止合并 PR**：每个 skill 一个 PR，便于 review 与回滚
- 跨 skill 共享的 `shared/<原子>.md` 必须先于引用它的 skill 迁移
- 当所有现存 skill 迁完（约 1 个）+ Skills.tsx 上线后，**生成 `books/*/articles/*/skill.md` 全无**——`--audit` 校验 6 在此之后才有意义（迁完前容忍旧文件存在？否，迁完即删，第 1 个迁移 PR 起就应清空）

### 7.3 与 v1 §七的差异

v1 §七步骤 5「保留旧文件作为 git tracked 锚点，不消费；下个 minor 版本后删除」。v2 改为「迁完即删，一 skill 一 PR」。理由：用户明确不希望保留双轨期。

---

## 八、与旧 SPEC-skill.md 的差异

| 维度 | 旧 SPEC（v0，1:1 文档导向） | 新 SPEC（v2，类别化能力包） |
|------|---------------------------|---------------------------|
| 归属 | `books/{slug}/articles/{篇名}/skill.md` | `skills/{一级}/{二级}/{slug}/SKILL.md` |
| 来源追溯 | 无 | YAML `sources` 必填，与 `rules/` 一一对应 |
| 时间戳 | 无 | YAML `updated` 必填（人工审视时间） |
| 跨 skill 依赖 | 无 | YAML `requires` 可选（SKILL 包粒度） |
| 子结构 | 无 | `rules/` 默认建 + `shared/` 准入门槛 |
| 文件名 | `skill.md`（小写） | `SKILL.md`（大写，对齐 Claude Skills 习惯） |
| 前端入口 | ModalReader/useChapterContent/SearchBar/ReadList/ActionBar 多入口 | Skills.tsx 唯一入口 |
| 类别源 | 篇章侧（篇章跟书走） | CATEGORY_TREE 唯一真源（`scripts/lib/category-tree.js`） |
| SKILL.md 内容 | 自包含全部处理逻辑与原文引用 | 只放编排/调度，正文注家下沉到 `rules/` |
| slug | 无显式字段，`displayName` 自由 | 显式 `slug` 字段锁定到 path 末段 |

---

## 九、落地清单（分阶段）

### Phase 1：基础设施（不破坏现有）

- [ ] 创建 `scripts/lib/category-tree.js`，从 `src/pages/Landing.tsx:14-20` 抽出 CATEGORY_TREE 字面量
- [ ] 创建 `src/data/category-tree.ts` 门面（re-export + 派生 `ArtSection` 类型）
- [ ] `Landing.tsx` 改为从 `src/data/category-tree.ts` import，删除硬编码字面量
- [ ] 验证：`npm run build` 通过、`npm run dev` 启动正常、Landing 页面渲染无变化
- [ ] `scripts/generate.js` 增加 `--audit` 子命令（仅审计，不修改文件）
- [ ] 验证：跑 `--audit` 现状应 exit 0（无 `skills/` 目录时是空集）
- [ ] **Phase 1 完成验收**：本节 6 项全 ✓ 才进入 Phase 2

### Phase 2：迁移首个 skill 跑通管线

- [ ] **PR-1：八格判定迁移**
  - 创建 `skills/命/八字/八格判定/` + `rules/滴天髓阐微.md`
  - 创建 `SKILL.md`（frontmatter + 正文按 §4.3 模板）
  - 删除旧 `books/滴天髓阐微/articles/八格/skill.md`
  - 扩展 `scripts/generate.js` §5.1 扫描契约
  - 验证：`npm run generate` 后 `src/data/skills.json` 含 1 条记录
  - 验证：`npm run generate -- --audit` exit 0
  - 验证：`npm run build` 通过
- [ ] **Phase 2 完成验收**：本 PR 合并后，全仓已无 `books/*/articles/*/skill.md` 旧文件，generate.js `--audit` 校验 6 第一次有意义

### Phase 3：前端入口

- [ ] **PR-2：Skills.tsx 列表页**
  - 创建 `src/pages/Skills.tsx`：CATEGORY_TREE 二级 Tab + SKILL 卡列表
  - 路由 `App.tsx` 新增 `/skills`
  - top-actions 加 skill icon（具体选型在 PR 内决定）
  - 验证：浏览器中能点击进入 Skills、看到"命·八字·八格判定"卡
- [ ] **PR-3：SkillDetail.tsx 详情页**
  - 创建 `src/pages/SkillDetail.tsx`：展示 SKILL.md 正文 + 输入参数表单
  - 路由 `App.tsx` 新增 `/skills/:category/:subcategory/:slug`
  - **范围说明**：调用执行（真正"跑"skill）不在本 spec 范围
  - 验证：能点击进入详情、看到正文、填表（提交按钮可 disable 或跳提示）
- [ ] **search-index.json 决策**（v1 未提）：本 PR 决定是否在搜索索引中包含 SKILL.md 摘要。**默认包含**（首段 300 字截断）
- [ ] **Phase 3 完成验收**：能在浏览器完成"看到列表 → 点入详情 → 读 SKILL.md 正文 → 看输入表单"完整路径

### Phase 4：扩展与清理

- [ ] 依据 Phase 2-3 验证情况，将其他 skill 逐批迁移（一 skill 一 PR）
  - 首批候选：子平真诠·论正官格、渊海子平·论格局、神峰通考·论八格
- [ ] 首个 PR-1 起，旧 `books/*/articles/*/skill.md` 已全部清除（迁完即删）
- [ ] 更新 `issues/10-...md` 验收状态为"已完成"
- [ ] （可选）清理 ModalReader `'skill'` 模态测试 fixture

---

## 十、风险与未决问题

### 10.1 已处置的风险（v1 遗留）

| v1 编号 | 风险 | v2 处置 |
|---------|------|---------|
| 风险 1（多本书冲突） | 拆 `rules/` 改为默认形态，冲突处理变自然 | §四按需扩展 → §4.4 |
| 风险 2（同名 skill） | 派生 `id = category/subcategory/slug` 复合键 | §5.1 输出契约 |
| 风险 3（updated 真实性） | 语义改为"人工审视时间"，与 interpretation 改动解耦 | §4.1 字段说明 |
| 风险 4（requires 执行语义） | §4.3 提供写法模板，约定口头指令 | §4.3 |
| 风险 5（删除时机） | 改为迁完即删，不留双轨期 | §七 |

### 10.2 v2 新增/未决风险

1. **`rules/` 准入门槛的边界**：哪些书算"该 skill 在该书有原文"？例：子平真诠的"论用神格局高低"算"八格判定"的源吗？还是另立 skill "用神配格局"？**建议**：以"该篇章 catalog 章节名包含本 skill slug 关键词"为判定，差异案例留待 Phase 4 累积中讨论。

2. **`shared/` 准入门槛的过早收紧**："≥2 个 SKILL.md cat 引用"可能在初期误伤合法 shared（因为多书聚合 skill 还没充分铺开）。**建议**：Phase 2-3 期间 shared/ 准入门槛降为 warn 而非 exit 1，Phase 4 起再升为严格。

3. **`scripts/lib/category-tree.js` 与 `src/data/category-tree.ts` 的双层结构**：当前真源在 JS，门面在 TS。如果 Phase 4 后续要给 TS 门面加更多派生（type guards 等），会反向污染 JS 真源。**建议**：Phase 4 评估是否需要再抽一层 `src/data/category-tree-derivations.ts` 专门做派生，门面文件保持薄。

4. **`books/.../skill.md` 全无后，旧 SPEC-skill.md §六「chapterToSkills/skillToChapters 由 generate.js 自动判断」承诺的落地**：该承诺在旧 1:1 体系下未实现，在新类别化体系下**可能不再需要**（skill 不再跟篇章走）。**建议**：本 spec 不实现该承诺，作为遗留债务登记。

5. **search-index.json 是否包含 skill**：v1 未提。默认包含（首段 300 字），但若 skill 包过大（八格判定法 199 行 × 4 本书 = 800 行 rules/），搜索索引会膨胀。**建议**：Phase 3 PR-2/3 之间做容量评估，必要时改为"只索引 SKILL.md 正文，不索引 rules/"。

6. **top-actions skill icon 与 notes icon 视觉权重**：两个并列 icon 若都显眼会争夺注意力。**建议**：skill icon 用更"工具"语义（`Wand2`），notes 用更"内容"语义（`UserStar` 已用），视觉上自然区分。

7. **AI 工具链消费 skill 的真实性验证**：spec §4.3 模板基于口头约定（"AI 执行时 cat ..."）。该约定是否被实际 AI Agent 工具链尊重？需要在 Phase 2 PR-1 后跑一次真实 AI Agent 验证（如 `cat` 命令在 Claude Skills 体系中是否被支持）。**建议**：Phase 2 PR-1 合并前必须有一次手工跑通，否则 §4.3 模板可能空想。

8. **CATEGORY_TREE 新增节点的传播链**：改了 `scripts/lib/category-tree.js` → generate.js 校验通过 → 前端 Landing 重渲染。这条链没有自动化测试。**建议**：Phase 1 完成时补一个 CI 步骤：构造一个临时 `skills/未注册类/` 目录跑 `--audit`，确认 exit 1。

---

## 十一、附录

### 11.1 完整迁移示例（八格判定法）

旧 `books/滴天髓阐微/articles/八格/skill.md`（199 行）拆分示例：

**`skills/命/八字/八格判定/SKILL.md`**：

```yaml
---
slug: 八格判定
displayName: 八格判定法
type: analysis
input: 八字四柱（年/月/日/时天干地支）
output: 格局判定报告（正格/变格/无格 + 用神 + 病药）
description: 基于《滴天髓阐微》八格篇与子平、渊海、神峰四书印证，给出八字格局正变归属、用神定位与病药分析
requires:
  - 命/八字/取月支藏干
sources:
  - 滴天髓阐微/八格
  - 子平真诠/论正官格
  - 渊海子平/论正官格
  - 神峰通考/论八格
updated: 2026-06-23
---

## 功能

本 skill 用于根据用户给定的八字四柱，按"立格四步法"与"正变两类十六格"体系，判定该命局的格局归属，并给出用神定位与病药分析。

适用场景：命理研究者、学习者拿到一张八字四柱后，需要快速判别其格局正变、用神喜忌。

目标读者：执行本 skill 后输出的判定报告须面向**普通用户**——术语与结论需附带通俗解释。

## 输入

| 参数名 | 描述 | 类型 | 格式/约束 | 必填 |
|--------|------|------|-----------|------|
| year_pillar | 年柱 | string | 2 字符（天干地支） | 是 |
| month_pillar | 月柱 | string | 2 字符（天干地支） | 是 |
| day_pillar | 日柱 | string | 2 字符（天干地支），日干为命主 | 是 |
| hour_pillar | 时柱 | string | 2 字符（天干地支） | 是 |
| gender | 命主性别 | string | 取值 `男` / `女` | 否（默认 `男`） |

**输入不合法时**（如某柱不是合法天干地支组合），输出报告须明确指出「该柱格式非法、无法完成判定」，不得静默失败。

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
4. **Step 4：用神定位** → 根据格的喜忌定用神
5. **Step 5：病药分析** → 检查原局是否有病、是否有药

## 输出

格式：JSON Schema 或 Markdown 模板（继承自旧 SPEC-skill.md §3.5）。本字段示意：

```json
{
  "格局归属": "正格七组之一 / 变格九组之一 / 无格可取",
  "用神": "...",
  "病": "...",
  "药": "...",
  "判定依据": "引用哪个 rules/<书slug>.md 哪一段"
}
```

## 示例

### 示例输入

- year_pillar: 甲子
- month_pillar: 丙寅
- day_pillar: 戊申
- hour_pillar: 壬戌
- gender: 男

### 示例输出

（此处略，迁移时从旧 skill.md §3.6 抽取，去除原文块引用后填入）

### 验证要点

- Step 1 必须 cat 取月支藏干 SKILL.md，不能用本文件中的展开文本替代
- Step 2 各分支必须按 §4.3 模板加载对应 rules/<书slug>.md
```

**`skills/命/八字/八格判定/rules/滴天髓阐微.md`**：

```markdown
# 滴天髓阐微 · 八格判定

> 源：`books/滴天髓阐微/articles/八格/source.md` + `interpretation.md`
> 视角：本 skill 中作为"本气透干 → 立格四步法"的判定口径

## 原文注家

> 【原注】格之真者，月支之神，透于天干也。
>
> 【任氏曰】若月逢禄刃，无格可取，须审日主之喜忌另寻别支透出天干者，借以为用。

> 【任氏曰】正者必兼五行之常礼也，曰官印，曰煞印，曰财煞，曰食神制杀，曰食神生财，曰伤官佩印，曰伤官生财；变者，必从五行之气势也，曰从财，曰从官杀，曰从食伤，曰从强，曰从弱，曰从势，曰一行得气，曰两气成形。

## 判定口径

本规则文件对应 SKILL.md §3 处理逻辑 Step 2 第一条分支：

> 如果本气透干 → `cat rules/滴天髓阐微.md`，按其立格四步法执行

具体步骤：

1. 取月支本气（如寅月本气甲木）
2. 查四柱天干是否有本气透出
3. 如本气透出 → 按"正格七组"分类
4. 如本气不透但中气/余气透出 → 注明"格气不纯"，仍按正格七组分类但标注
5. 如完全无透 → 不进入本规则，回到 SKILL.md Step 2 走借格分支
```

### 11.2 与 Claude Skills 体系对齐

本文档的 SKILL.md 形态与 `~/.claude/skills/` 同型（path 内大写 SKILL.md + YAML frontmatter + 可选子目录），AI 工具链消费习惯无需重新学习。`rules/` 与 `shared/` 是本项目特有的扩展，对应 Claude Skills 的 "references" 目录（仅命名不同，语义一致）。
