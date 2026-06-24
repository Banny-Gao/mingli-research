# 模式选择 + 6 步流程总览

skill-create 仅支持**单点 interactive 模式**。主 agent 按本模板引导。

## Step 0：参数预解析

如果用户输入 `/skill-create {args}` 含参数：

- `/skill-create 命/八字/八格判定` → 已锁定类别路径+slug，跳到 Step 1c 选源书
- `/skill-create 八格判定 滴天髓阐微` → 已锁定 skill slug + 1 源书，跳到 Step 1d 选篇章
- `/skill-create --iterate` → 识别为"迭代已有 skill"模式，跳到 Step 0.5 选已有 skill

如未提供参数或参数不全 → 按 Step 1a → 1b → 1c → 1d 顺序询问。

## Step 0.5：迭代模式（如触发）

扫描 `skills/{一级}/{二级}/*/SKILL.md` 列出已有 skill，AskUserQuestion 选 1 个。选中后：

- 读取该 SKILL.md + rules/ 全部内容
- 提示用户：「你想新增 rules/（多书聚合扩展）/ 修订 SKILL.md 正文 / 删除某条 rules/？」
- 走对应分支

**迭代模式本质**：Step 1a-1d 的部分输入已预填。后续流程与新建相同。

---

## Step 1a：选类别路径（一级+二级）

**AskUserQuestion：**

- Q1: 「请选择一级类别（术数）」
- 列出 `shared/sources/category-tree.json` 中 `SECTION_ORDER` 的所有一级：`命` / `医` / `山` / `相` / `卜`

输出：`section`（如「命」）。

- Q2: 「请选择二级类别（基于一级 `{section}`）」
- 列出该 section 下的 `categories` 数组

输出：`subcategory`（如「八字」）。

**校验**：`{section}/{subcategory}` 必须在 `shared/sources/category-tree.json` 的 `CATEGORY_TREE` 数组中注册（用 `CATEGORY_TREE.find(n=>n.section===section)?.categories.includes(subcategory)` 自行校验；`isValidCategory` 函数未序列化进副本）。否则阻断（套 SPEC §九 失败处置 1）。

---

## Step 1b：选 skill slug

**AskUserQuestion：**

- Q: 「请给本 skill 起一个中文 slug（将作为 `skills/.../{slug}/` 末段与 SKILL.md YAML `slug` 字段值）」
- 占位提示：「如『八格判定』『用神配气候』『取月支藏干』等，简洁、动名词结构、避免长句」
- 校验：slug 不可含 `/`，不可为空，建议 ≤ 8 个汉字

**同类别同 slug 冲突检查**：

- `skills/{section}/{subcategory}/{slug}/` 已存在 → 提示「该 skill 已存在，是否迭代？」（套 Step 0.5 迭代模式）
- 不存在 → 新建模式继续

输出：`slug`（如「八格判定」）。

---

## Step 1c：选源书（≥1 本）

扫 `books/*/catalog.md`，筛选**类别 = 所选 subcategory** 的书（`> 类别：{subcategory}`）：

- 若结果 0 本 → 阻断，提示「{subcategory} 类别下无现有书籍，请先调 book-create 加书」
- 若结果 ≥ 1 本 → AskUserQuestion 多选

**AskUserQuestion：**

- Q: 「请选择支撑本 skill 的来源书目（多选，至少 1 本）」
- 选项：每个匹配的 `{slug}` 一项 + 「其他」兜底（输入新 slug 会提示"该书不在 books/"）

**多书聚合推荐**：v2 体系默认 3+ 本书共用同一 skill 为常态。但**单书 skill 也合法**——单书时仍建 1 份 `rules/<书slug>.md`（与 SPEC §3.4 「默认建」一致，不省略 rules/ 目录）。

输出：`bookSlugs` 数组（如 `["滴天髓阐微", "子平真诠"]`）。

---

## Step 1d：选/沉淀篇（每本书）

对 Step 1c 选出的每本书，扫 `books/{slug}/articles/` 列出有 source.md + interpretation.md 的篇名（**GATE 2 体检的"上游齐备"列表**）。

**AskUserQuestion（每本书循环）：**

- Q: 「请选择 `{bookSlug}` 中本 skill 要引用的篇章（多选，至少 1 篇）」
- 选项：所有 source.md + interpretation.md 都齐备的篇名（按 catalog 顺序）

**多篇选择**：同一本书可多选多篇——多篇 source/interpretation 将被综合提炼到 `rules/{bookSlug}.md` 的多个小节。

输出：每本书的 `articleNames` 数组（如 `{滴天髓阐微: ["八格"], 子平真诠: ["论正官", "论用神纯杂"]}`）。

---

## Step 1 总结输出

完成 Step 1a-1d 后，主 agent 在上下文中持有：

```yaml
selected:
  section: "命"          # 一级类别
  subcategory: "八字"    # 二级类别
  slug: "八格判定"       # skill slug
  bookSlugs: ["滴天髓阐微", "子平真诠"]  # ≥1 本
  perBook:               # 每本书的篇章
    滴天髓阐微: ["八格"]
    子平真诠: ["论正官", "论用神纯杂"]
```

---

## 6 步流程总览

| Step | 名称 | 门点 | 输出 |
|------|------|------|------|
| 0 | 参数预解析 | — | 模式判定（新建 / 迭代） |
| 0.5 | 迭代模式（如触发） | — | 已有 skill 选中 + 修订类型 |
| 1a | 选类别路径 | — | section + subcategory |
| 1b | 选 skill slug | — | slug |
| 1c | 选源书 | — | bookSlugs[] |
| 1d | 选/沉淀篇 | — | perBook{ book: [篇名] } |
| 2 | 原文体检 | **GATE 2** | 上游存在性确认 + 类别一致性确认 |
| 3 | 写 SKILL.md + rules/ 主体 | — | 草稿（在上下文）|
| 4 | 自检 | **GATE 3** | v2 指纹 17 条通过 |
| 5 | 落盘 | — | 写入文件 |
| 6 | 输出总结 | — | 用户报告 + CI 提示 |

**GATE 1（强装载）** 在 Step 1a 之后、Step 1b 之前执行。详见 `gate.md`。
