# 类别化 Skill 体系：按术数类别聚合 + 跨书维护

> 日期：2026-06-23
> 状态：设计已通过 brainstorming，进入待实施
> 前置 commit：`f16f3c3` clean(skill): 拆除篇章→skill 1:1 体系
> 上游 issue：`issues/10-类别化-skill-体系重构-按术数类别聚合-跨书维护.md`
> 替代 SPEC：`research-dispute/SPEC-skill.md`（1:1 文档导向 SPEC，全文重写）

---

## 一、目标

将当前"一篇一 skill"的 1:1 绑定体系，改造为**按"术数 × 二级类别"聚合**的能力包体系：

- skill 归属"命·八字·八格判定"等类别路径，跨多本书共同沉淀
- 一个 skill 是独立模块，由该类别下所有书的原文+解读共同支撑
- YAML frontmatter 明示 `sources` 支撑书目 + `updated` 追溯时间戳
- 同名 skill（跨类别同名技法）天然隔离
- AI 工具链与 src 前端能消费同一份 skill 源

---

## 二、架构总览

```
mingli-research/
├── books/                          ← 原始文献层（不变）
│   └── {slug}/articles/{篇名}/{source,interpretation,skill}.md
├── research-dispute/               ← 规则与争议层（不变）
│   ├── general.md
│   └── SPEC-skill.md               ← 重写为本文档
├── skills/                         ← 【新】可执行能力层
│   ├── 命/八字/{八格判定, 用神配气候, ...}/
│   ├── 卜/六爻/{...}/
│   └── ...
├── src/                            ← 前端消费层
│   └── pages/Skills.tsx            ← 【新】唯一入口
└── scripts/generate.js             ← 扩展：扫描 skills/ → src/data/skills.json
```

三个正交维度：

1. **类别维度**（命/卜/医/...）—— CATEGORY_TREE 唯一真源
2. **能力维度**（单 skill 的 SKILL.md）—— 自包含、可执行
3. **来源书目维度**（YAML `sources`）—— 跨书追溯

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

一级类别：`命` / `卜` / `医` / `山` / `相` / ...（与 `Landing.tsx` 的 `CATEGORY_TREE` 一级节点严格对齐）
二级类别：`八字` / `紫微斗数` / `七政四余` / `易经` / `六爻` / `梅花易数` / `奇门遁甲` / `大六壬` / ...（与 `CATEGORY_TREE` 二级节点对齐）
skill-slug：`八格判定` / `用神配气候` / ...（中文 slug，与 SKILL.md `displayName` 严格一致）

---

## 四、单 SKILL.md 骨架（按需扩展）

### 4.1 默认（必备）

```yaml
---
displayName: 八格判定
type: analysis
input: 八字四柱
output: 格局判定报告
description: 基于《滴天髓阐微》八格篇与多书印证，给出八字格局正变归属...
requires: []                # 默认空数组；需要时填路径数组，如 ["命/八字/取月支藏干"]
sources:                    # 必填：来源书目追溯
  - 滴天髓阐微/八格
  - 子平真诠/论正官格
  - 渊海子平/论正官格
  - 神峰通考/论八格
updated: 2026-06-23         # 必填：最后被来源书目更新触发审视的时间
---
```

正文继承旧 `SPEC-skill.md` §3.2–§3.6 全部章节：功能/输入/处理逻辑/输出/示例/验证要点（向后兼容，原 1:1 skill.md 内容无须修改即可迁移到正文）。

### 4.2 按需（条件触发）

| 触发条件 | 扩展结构 |
|----------|----------|
| 该 skill 在多本书有原文且互相冲突 | `rules/` 子目录按书 slug 拆（如 `rules/滴天髓阐微.md`、`rules/子平真诠.md`），SKILL.md 正文中按"流派分支"按需引用 |
| 该 skill 引用跨 skill 的原子能力 | `shared/` 子目录存原子（如 `shared/取月支藏干.md`），被多个 SKILL.md 通过 YAML `requires` 字段引用 |
| 该 skill 依赖其他类别 skill 的输出 | YAML `requires: ["命/八字/取月支藏干"]`，AI 加载时按需加载 |

原则：**按需扩展，禁止预先拆出 `rules/` 或 `shared/`**。默认单 SKILL.md 自包含。

---

## 五、数据流

```
books/{slug}/catalog.md（> 类别：八字）
    ↓ 类别聚合
skills/命/八字/{八格判定}/SKILL.md
    ↓ generate.js 扫描
src/data/skills.json
    ↓
前端：Skills.tsx（按 CATEGORY_TREE 二级分类）
    ↓
AI 工具链：cat skills/命/八字/八格判定/SKILL.md + 按需加载 rules/shared
```

### 5.1 generate.js 扫描契约

输入契约：

- 扫描 `skills/{一级}/{二级}/{slug}/SKILL.md`
- 解析 frontmatter：`displayName`、`type`、`input`、`output`、`description`、`requires`、`sources`、`updated`
- 校验：`{一级}` 与 `{二级}` 必须在 CATEGORY_TREE 中注册（否则报错，提示「先在 Landing.tsx 的 CATEGORY_TREE 加此类别」）

输出契约（追加到现有 `src/data/skills.json`，不破坏其他字段）：

```json
[
  {
    "category": "命",
    "subcategory": "八字",
    "slug": "八格判定",
    "displayName": "八格判定",
    "type": "analysis",
    "input": "八字四柱",
    "output": "格局判定报告",
    "description": "基于《滴天髓阐微》八格篇与多书印证...",
    "sources": ["滴天髓阐微/八格", "子平真诠/论正官格", "渊海子平/论正官格", "神峰通考/论八格"],
    "updated": "2026-06-23",
    "path": "skills/命/八字/八格判定/SKILL.md"
  }
]
```

### 5.2 更新触发链

- 修订 `books/{slug}/articles/{篇名}/interpretation.md` 时，git diff 自动列出该篇名被哪些 `skills/*/SKILL.md` 的 `sources` 引用 → PR review 时一并审视
- `scripts/generate.js` 增加 `--audit` 子命令（CI 可调用）：
  - 反向校验：`sources` 中列出的篇名是否全部仍存在
  - 反向校验：`requires` 指向的 SKILL 是否仍存在
  - 失败时 exit 1，阻止 CI 通过
- `updated` 字段由人工在审视完成后手动改写（本轮不自动化）

---

## 六、src 入口（唯一）

| 元素 | 决定 |
|------|------|
| top-actions | 已有 notes icon 下拉收纳 **skill icon**，与笔记并列 |
| skill icon 点击 | 进 `Skills.tsx` 技能列表页 |
| `Skills.tsx` | 二级 Tab 完全沿用 CATEGORY_TREE 二级分类（如 `命` 下挂 `八字/紫微斗数/七政四余`） |
| 每 Tab 内 | 列出该二级分类下所有 SKILL 卡（`displayName` + `description` + 来源书目数） |
| SKILL 卡点击 | 进 SKILL 详情/调用页（输入参数表单 → 渲染执行报告） |
| Landing / 书籍页 / SearchBar | **一律不挂** skill 入口，YAGNI |

---

## 七、迁移路径

旧 `books/滴天髓阐微/articles/八格/skill.md`（199 行）按以下步骤迁出：

1. **生成新位置** `skills/命/八字/八格判定/SKILL.md`，正文一字不改复制
2. **加 frontmatter**：`requires: []`、`sources: ["滴天髓阐微/八格"]`、`updated: 2026-06-23`
3. **同步加入 index**：generate.js 扫到新文件后写入 `src/data/skills.json`
4. **前端屏蔽旧路径**：`books/{slug}/articles/{篇名}/skill.md` 不再被 generate.js 读取
5. **保留旧文件**作为 git tracked 锚点，不消费；下个 minor 版本（v0.x → v0.y）后删除

---

## 八、与旧 SPEC-skill.md 的差异

| 维度 | 旧 SPEC | 新 SPEC |
|------|---------|---------|
| 归属 | `books/{slug}/articles/{篇名}/skill.md` | `skills/{一级}/{二级}/{slug}/SKILL.md` |
| 来源追溯 | 无 | YAML `sources` 必填 |
| 时间戳 | 无 | YAML `updated` 必填 |
| 跨 skill 依赖 | 无 | YAML `requires` 可选 |
| 子结构 | 无 | `rules/` / `shared/` 按需 |
| 文件名 | `skill.md`（小写） | `SKILL.md`（大写，对齐 Claude Skills 习惯） |
| 前端入口 | ModalReader/useChapterContent/SearchBar/ReadList/ActionBar 多入口 | Skills.tsx 唯一入口 |
| 类别源 | 篇章侧（篇章跟书走） | CATEGORY_TREE 唯一真源 |

---

## 九、落地清单（分阶段）

### Phase 1：基础设施（不破坏现有）

- [ ] 在 `Landing.tsx` 的 CATEGORY_TREE 中确认所有现有 `books/*/catalog.md` 的 `> 类别：` 字段都有对应节点（如有缺失则补齐）
- [ ] `scripts/generate.js` 增加 `--audit` 子命令（仅审计，不修改文件）
- [ ] 验证：跑 `--audit` 现状应 exit 0（无 skill 目录时是空集）

### Phase 2：迁移首个 skill 跑通管线

- [ ] 创建 `skills/命/八字/八格判定/SKILL.md`，从 `books/滴天髓阐微/articles/八格/skill.md` 复制正文
- [ ] 加 YAML frontmatter：`requires: []`、`sources: ["滴天髓阐微/八格"]`、`updated: 2026-06-23`
- [ ] `scripts/generate.js` 扩展 SKILL.md 扫描契约（§5.1）
- [ ] 验证：跑 generate.js 后 `src/data/skills.json` 含 1 条记录
- [ ] 验证：跑 `--audit` exit 0

### Phase 3：前端入口

- [ ] 创建 `src/pages/Skills.tsx`：CATEGORY_TREE 二级 Tab + SKILL 卡列表
- [ ] 创建 `src/pages/SkillDetail.tsx`：输入参数表单 + 调用执行入口
- [ ] top-actions 加 skill icon（与 notes 同型）
- [ ] 验证：在浏览器中能点击进入 Skills、看到"命·八字·八格判定"、点击进入详情、填表提交

### Phase 4：扩展与清理

- [ ] 依据 Phase 2-3 验证情况，将其他 skill 逐批迁移（首批候选：子平真诠·论正官格、渊海子平·论格局、神峰通考·论八格）
- [ ] 下一 minor 版本：删除 `books/*/articles/*/skill.md` 旧文件
- [ ] 更新 `issues/10-...md` 验收状态为"已完成"

---

## 十、风险与未决问题

1. **多本书原文冲突**：跨书 skill 中若两本书对同一技法有矛盾论述（如"子平真诠"与"渊海子平"对八格判定标准不一），`SKILL.md` 正文应如何处理？是任选一派并注明、还是按"流派分支"在 `rules/` 下拆？本轮推荐**默认单 SKILL.md + 正文注明流派分歧**，仅在冲突尖锐时拆 `rules/`。
2. **跨类别同名 skill**："命·八字·格局判定" 与 "卜·六爻·格局判定" 路径天然隔离，但 `displayName` 可能重名。生成时 `slug` 强制中文 + 路径隔离，是否需要在 `skills.json` 增加 `id = category + subcategory + slug` 复合键防前端 key 冲突？
3. **`updated` 字段的真实性**：本轮规定人工改写，存在被遗忘风险。是否需要 CI 检查"被引用的 interpretation.md git log 最近 30 天有更新时，对应 SKILL.md 的 `updated` 仍是 30 天前"则 warn？建议**作为下个 issue 处理**，本轮不引入。
4. **`requires` 字段的执行语义**：YAML 中 `requires: ["命/八字/取月支藏干"]` 是声明依赖，但 AI 执行时如何知道要先调用？是否需要在 SKILL.md 正文 §4（处理逻辑）开头加一段"前置加载顺序"？建议**约定 SKILL.md 必须在 §4 首句说明依赖加载顺序**，不引入额外字段。
5. **`books/*/articles/*/skill.md` 删除时机**：本轮规定下个 minor 版本删除，但若届时仍有用户脚本依赖该路径，需要 deprecation 警告期。建议**保留 1 个 minor 版本后删除，并在 generate.js 移除读取该路径时打 console.warn**。