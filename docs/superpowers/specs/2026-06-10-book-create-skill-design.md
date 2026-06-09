# book-create 建书技能设计

> **Spec Version:** 2026-06-10
> **Status:** Draft
> **Parent Design:** `2026-06-09-self-check-skill-design.md`（共享 spec-bundles 思路）
> **v1 范围：** 仅 book-create；article-create / source 录入 / 解读 / 技能沉淀留 v2

---

## 1. Goal

为五术研究项目提供**多源入口、人工 gate 强约束、产物严格遵循 SPEC-catalog.md**的建书能力：

- **入口**：`/book-create` 起手
- **输入**：4 种源模式（HTML 片段 / URL / 图片-PDF / 模糊描述）任选其一
- **过程**：6 步引导式状态机 + 2 次人工 gate（策略 gate + 元信息 gate）
- **输出**：`books/{slug}/catalog.md` + `books/{slug}/articles/{篇名}/.gitkeep` 骨架
- **强约束**：每次建书严格遵守 `research-dispute/SPEC-catalog.md` + `research-dispute/general.md`
- **写入方式**：主 agent 直写（不隔离 subagent，理由见 §6）
- **不复制 self-check 的 subagent 隔离模式**，因为 book-create 1 次 1 本、无并发污染

---

## 2. Architecture

```
.claude/skills/book-create/                    # 新建主目录
├── SKILL.md                                   # 主入口：4 源模式路由 + 6 步状态机
│
└── shared/                                    # book-create 私有契约
    ├── spec-bundles.md                        # 规范包（SPEC-catalog + general.md）+ 指纹
    ├── sources/                               # 4 种输入源的处理片段
    │   ├── html.md                            # 模式 A：用户提供 catalog.html 路径
    │   ├── url.md                             # 模式 B：URL（WebFetch 抓取）
    │   ├── image-pdf.md                       # 模式 C：图片/PDF（多模态识别）
    │   └── fuzzy.md                           # 模式 D：模糊描述（WebSearch + 兜底）
    ├── strategy.md                            # 策略建议（全量/精选）模板 + 候选清单呈现
    ├── gate.md                                # 人工 gate 的 AskUserQuestion 设计
    └── skeleton.md                            # articles/{篇名}/.gitkeep 骨架生成规则
```

**为什么独立成 `book-create/` 而非 `content/book-create/`：**

- v1 暂只有 book-create 一个 skill，单立目录降低认知负担
- v2 article-create 入驻时，**再做合并决策**——届时根据实际感受判断是 `content/{book,article}-create/` 还是两个并列顶层
- 现 spec 不预判 v2 拓扑，避免过度设计

**与 self-check 共享但不复制：**

- `spec-bundles.md` 与 self-check 的同名文件**不直接复用**——book-create 只需 `SPEC-catalog.md` + `general.md`，不涉及 bazi.md
- 若 v2 合并 content/，再做 spec-bundles 的统一抽象
- 现阶段明确：book-create 的 spec-bundles 是一份独立的小文件

---

## 3. 4 种源模式契约

每种源模式都以"用户先提供某种输入 → AI 解析为统一内部表示 `{title, author, version, intro, shu, category, contentTypes, fontStrategy, sections: [{name, chapters: [{num, name}]}]}`"为目标。

### 3.1 模式 A：HTML 片段

| 项 | 契约 |
|----|------|
| **输入** | 用户给 `catalog.html` 绝对路径（必在 `books/{slug}/catalog.html` 或临时路径） |
| **处理** | 主 agent `Read` 文件 → 解析 HTML 抽取 `<h1>`-`<h6>` 层级 + 列表/表格中的篇名 |
| **解析容错** | 接受 `<h2>`-`<h4>` 任意层级作为"分类标题"；接受 `<ol>`/`<ul>`/`<table>` 任意列表形式 |
| **失败** | 解析出 0 篇 → 报错"源 HTML 未含篇章列表，请检查路径或换模式" |
| **重活上限** | 解析出 0-2 篇时**警告**并继续（极端短书）；≥ 3 篇才视为正常 |
| **产物中间表示** | `sections: [{name, chapters: [...]}]` 含分类层级 |

**参考实现（主 agent 内联）：** `Read` + 简单 HTML 解析（用 `marked` 或 `cheerio` 都可；本 skill 不引入新依赖，主 agent 凭 HTML 字符串手解即可）

### 3.2 模式 B：URL

| 项 | 契约 |
|----|------|
| **输入** | 用户给目录页 URL（豆瓣读书/百度百科/出版社官网/CText 国学大师 等） |
| **处理** | 主 agent `WebFetch` 抓取 → 抽取纯文本 → 复用模式 A 的 HTML 解析逻辑（如有 HTML）/ 文本结构解析 |
| **抓取容错** | WebFetch 默认重试 1 次；遇到 JS 渲染页（`WebFetch` 拿不到正文）→ 报错"该 URL 需 JS 渲染，请改用模式 C/D 或提供 HTML" |
| **失败兜底** | 抓取失败 → 提示"是否切换到模式 D 输入描述？"或"切换到模式 A 粘贴 HTML 文本" |
| **反爬** | 不在本 skill 责任内；如遇 403/验证码 → 直接报错退出，让用户改源 |
| **产物中间表示** | 同模式 A |

### 3.3 模式 C：图片 / PDF

| 项 | 契约 |
|----|------|
| **输入** | 用户给 1 张目录页图片 / 1 个 PDF 文件 / 多张扫描页 |
| **处理** | 主 agent 用多模态读图（`Read` 支持图片）；PDF 走 `Read` 直接打开 |
| **OCR 准确度** | 多模态读图通常 95%+，但篇名中的生僻字/异体字需 spot-check |
| **失败兜底** | 读图失败/识别 0 篇 → 报错"图片无法识别，请改用模式 A/D" |
| **多页文档** | PDF 多页时，主 agent 一次性 Read 全部页 → 跨页拼接目录 |
| **产物中间表示** | 同模式 A |

### 3.4 模式 D：模糊描述

| 项 | 契约 |
|----|------|
| **输入** | 用户口述"《XX》，明 XX 撰，全书 N 卷..."，可含部分已知信息 |
| **处理** | 主 agent `WebSearch` 书名 → 找到权威目录页（首选：维基百科/百度百科/出版社官网）→ 复用模式 B 抓取 |
| **命中难度** | 古籍常无现代权威目录页，需多 query 尝试 |
| **失败兜底** | WebSearch 命中 0 → 报错"未找到目录，请改用模式 A/B/C 或补充书名/作者" |
| **歧义处理** | 同名书多版本 → 列出候选让用户选（不进 gate 流程，先解歧义） |
| **解歧义 UX** | 主 agent 列出 2-3 个候选版本（标注朝代/作者/卷数等差异）→ AskUserQuestion 单选 → 用户选定后继续 Step 4；用户都不满意 → 退出，让用户改用模式 A/B/C |
| **产物中间表示** | 同模式 A |

**4 模式的统一目标：**

```
internal BookDraft {
  title: string
  author: string
  version: string
  intro: string
  shu: '山'|'医'|'命'|'相'|'卜'
  category: string                  // 二级分类，需在 CATEGORY_TREE 已注册
  contentTypes: ['source', ...]     // 逗号分隔
  fontStrategy: '原文照录'|'简体规范化'  // 默认 原文照录
  sections: [
    { name: '上篇 · 通神论', chapters: [{ num: '01', name: '天道' }, ...] },
    ...
  ]
}
```

所有模式解析成功后都填充这个 BookDraft，再走 §4 状态机的 Step 4-6。

---

## 4. 6 步引导式状态机

主 SKILL.md 实现完整 6 步流程。状态机契约定义在此，4 种子片段（sources/, strategy.md, gate.md, skeleton.md）按需被调入。

```
[Step 1] 选源模式 → AskUserQuestion 4 选 1
[Step 2] 收源 → 按模式收输入（路径/URL/图片/描述）
[Step 3] 解析 → AI 填充 BookDraft 中间表示
[Step 4] 策略 gate → 全量/精选 + 候选清单 → 人工确认
[Step 5] 元信息 gate → 6 个 blockquote 字段 → 人工确认
[Step 6] 落盘 → catalog.md + 骨架 + 收尾报告
```

### 4.1 Step 1 — 源模式

- 触发：用户输入 `/book-create`
- 动作：AskUserQuestion，header "源模式"，4 选项
  - A. HTML 片段
  - B. URL
  - C. 图片/PDF
  - D. 模糊描述
- 状态写：`source_mode ∈ {A, B, C, D}`
- 异常：用户带参数 `/book-create url` → 跳过 Step 1，锁定源模式

### 4.2 Step 2 — 收源

- 触发：Step 1 完成
- 动作：按 `source_mode` 加载 `shared/sources/{mode}.md`，按其契约收输入
- 状态写：`source_input = {path|url|image|description}`
- 异常：
  - 路径不存在/URL 404 → 提示"源无效，是否切模式？"（不退出主流程，让用户决定）
  - 多次切换模式仍失败 → 报错退出

### 4.3 Step 3 — 解析

- 触发：Step 2 完成
- 动作：主 agent 解析 `source_input` → 填充 `BookDraft`
- 解析深度：
  - 必填：title / sections
  - 智能推测：author / version / intro / shu / category / contentTypes / fontStrategy（推测后**不**直接落盘，留给 Step 5 人工确认）
- 状态写：`draft: BookDraft`
- 异常：
  - 解析出 0 篇 → 报错退出，提示"换模式或检查源"
  - 解析篇章名含 `/\:*?"<>|` 等文件系统非法字符 → 自动 sanitize；sanitize 后仍非法 → 报错退出

### 4.4 Step 4 — 策略 gate

详见 §5.1。状态写：`strategy ∈ {full, curated}, chapter_list: [...]`

### 4.5 Step 5 — 元信息 gate

详见 §5.2。状态写：`confirmed_meta: BookDraft`

### 4.6 Step 6 — 落盘

- 触发：Step 5 完成
- 动作：
  1. 检查 `books/{slug}/` 是否已存在 + `catalog.md` 是否已存在
     - 都不存在 → 直接进入 (2)
     - 仅目录存在但 catalog.md 不存在 → 直接进入 (2)
     - **catalog.md 已存在 → AskUserQuestion 4 选项：覆盖 / 备份为 .bak / 取消 / 退出**
  2. 创建 `books/{slug}/articles/` 目录
  3. 按 `chapter_list` 逐章创建 `books/{slug}/articles/{篇名}/.gitkeep`
  4. 写 `books/{slug}/catalog.md`（按 `shared/skeleton.md` 模板）
  5. **不**自动跑 `node scripts/generate.js`（留给用户决定）
  6. 输出收尾报告（见 §7）
- 状态写：`output_path = books/{slug}/catalog.md`
- 异常：
  - 写文件失败（权限/磁盘） → 主 agent 报告后退出，已写部分需人工清理
  - 篇名长度超文件系统限制（Windows 260 字符） → 报错退出，建议缩短篇名

---

## 5. 人工 Gate 设计

SPEC-catalog.md 明确要求"AI 提出策略 → 等待人工确认"。book-create 强化为 **2 次 gate**，每次都强人工介入。

### 5.1 Gate 1（策略 gate）

**触发：** Step 3 完成后

**输入：** `BookDraft` 中的 `sections` 字段

**AI 动作：**

1. 统计总篇章数 N
2. 按 `shared/strategy.md` 模板生成策略建议：
   - 篇章数 ≤ 30 → **建议全量**（理由：篇章少，无精选必要；此为经验阈值，AI 可在 Gate 1 中说服用户改精选）
   - 30 < N ≤ 100 → **AI 评估**："篇章数适中，建议全量；如下游只想做 X 类，可精选"
   - N > 100 → **必走精选**（理由：规模超出，AI 给出精选策略；阈值与 SPEC-catalog.md §1.3 "精选录入" 适用场景呼应）
3. 精选时列出候选清单 + 排除清单（附排除理由）
4. AskUserQuestion 4 选项：
   - **A. 确认全量** — 全部录入
   - **B. 确认精选** — 按 AI 给的候选清单录入
   - **C. 调整候选** — 进入"自定义模式"，让用户增删篇章
   - **D. 退出** — 放弃本次建书

**状态写：** `strategy, chapter_list`

**"调整候选"分支的 UX：**

不强制 AskUserQuestion 的 4 选项限制。如用户选 C，主 agent 可用更开放的对话形式让用户编辑候选清单（如"请告诉我需要删除/添加哪些篇名"），直到用户满意再继续。

### 5.2 Gate 2（元信息 gate）

**触发：** Gate 1 完成后

**输入：** `BookDraft` 中除 `sections` 外的所有字段（title/author/version/intro/shu/category/contentTypes/fontStrategy）

**AI 动作：**

1. 展示当前拟填入的 6 个 blockquote 字段
2. 智能推测的字段标注 `[AI 推测]`；用户明确给过的字段标注 `[用户提供]`
3. 实时校验：
   - `shu` 取值必须 ∈ `{山,医,命,相,卜}`
   - `category` 必须在 `Landing.tsx` 的 `CATEGORY_TREE` 已注册
   - `contentTypes` 至少包含 `source`（必填项）
   - `fontStrategy` 默认 `原文照录`（不写视为默认）
4. AskUserQuestion 4 选项：
   - **A. 全部确认** — 按 AI 拟填的落盘
   - **B. 修改 X 字段** — 指出要改的字段，主 agent 追问新值
   - **C. 重填** — 全部清空让用户重给
   - **D. 退出** — 放弃本次建书

**状态写：** `confirmed_meta: BookDraft`

**校验失败的处置：**

- 校验失败的字段**不让落盘**——主 agent 标记为"待用户补全"，回到 Gate 2 的 B 选项让用户重填
- 不静默接受非法值（避免 SPEC-catalog.md §五 合规检查红线被破）

---

## 6. 写入策略

**核心决策：主 agent 直写，不走隔离 subagent。**

**理由（与 self-check 对比）：**

| 维度 | self-check | book-create |
|------|------------|-------------|
| 单次规模 | 1-N 篇文章 | 1 本书 |
| 上下文累积 | N 篇读入主 agent 会污染后续判断 | 1 次性读 1 个源 + 1 个写动作 |
| 并发需求 | 是（5 worker 并发跑 4 类型） | 否（1 次 1 本） |
| 隔离价值 | 高（防上下文漂移） | 低（一次性任务） |
| 写文件责任 | subagent 出报告，主 agent 落盘 | 主 agent 直写，token 可控 |

**subagent 隔离的真正价值**只在"读 N 个文件会污染主 agent 上下文"时显现。book-create 任务规模小，主 agent 直写更直接。

**未来扩展：**

- 若 v2 article-create 涉及"批量写 N 篇章"，再考虑引入隔离 subagent
- 本 spec 不预留 subagent 调度代码——YAGNI

**写入的具体动作：**

1. 调 `Bash mkdir -p books/{slug}/articles/{篇名}` 创骨架（也可主 agent 推断后用 Write 工具，但 mkdir 一次性更省事）
2. 用 `Write` 写 `books/{slug}/catalog.md`
3. 用 `Write` 写每个 `books/{slug}/articles/{篇名}/.gitkeep`（空文件）

不调 `node scripts/generate.js`——生成数据文件（books.ts / content.ts / assoc.ts / search-index.json）的责任在用户，book-create 只管建书产物本身。

---

## 7. 收尾报告

落盘成功后，主 agent 输出 markdown 报告（写在主对话里，**不**额外落盘到 notes/，与 self-check 区别）：

```markdown
## book-create 建书完成

> 时间：YYYY-MM-DD HH:MM
> 源模式：A / B / C / D
> 策略：全量 / 精选（候选清单）
> 总篇章：N 篇

### 产物

- `books/{slug}/catalog.md`（元信息 + K 个分类小节 + N 行篇章表格）
- `books/{slug}/articles/{篇名}/.gitkeep` × N

### 后续建议

1. 运行 `node scripts/generate.js` 刷新数据文件
2. 跑 `/self-check catalog {slug}` 做合规扫描
3. （如需录入原文）准备进入 v2 article-create

### 状态

- [x] Step 1-6 全部完成
- [x] 2 次 gate 全部通过
- [x] 元信息合规校验通过
```

报告的目的是给用户一目了然的"做了什么、下一步该做什么"。不持久化（与 self-check 的 report 落盘策略不同——book-create 1 次 1 本无需历史索引）。

---

## 8. 错误处理

| 失败点 | 处置 |
|--------|------|
| **Step 2 源提供失败**（路径不存在 / URL 404 / 图片不可读） | 提示 + 让用户重选模式，不退出主流程 |
| **Step 3 解析出 0 篇** | 报错退出，提示"可能源不对，请检查或换模式" |
| **Step 3 篇名含文件系统非法字符** | 自动 sanitize（`/` → `／`、`: ` → `：` 等）；sanitize 后仍非法 → 报错退出 |
| **Step 3 多模态读图失败** | 报错"图片无法识别，请改用模式 A/D 或换张图" |
| **Step 4 Gate 1 用户选 C 调整候选** | 进入开放对话模式，不强制 4 选项 |
| **Step 5 Gate 2 元信息校验失败** | 标记字段"待补全"，回到 Gate 2 的 B 选项 |
| **Step 6 写文件冲突** | 4 选项：覆盖 / 备份为 .bak / 取消 / 退出 |
| **Step 6 写文件失败** | 报告错误，已写部分需人工清理 |
| **Step 6 篇名长度超 260 字符** | 报错退出，建议缩短篇名 |
| **多次切换源模式仍失败** | 报错退出 |
| **规范包漂移**（SPEC-catalog 变更） | Step 3 启动时校验 `spec-bundles.md` 指纹，不一致则警告用户，由用户决定继续还是用新规范重启 |

**规范包漂移防护：**

`spec-bundles.md` 里给每份规范存一个指纹。**指纹格式：** `<行数>:<sha256_hex[:16]>`，其中 sha256 输入是"前 5 个 H2 标题拼接"。Step 3 启动时算一次指纹。指纹不一致则警告用户，由用户决定继续还是用新规范重启。

---

## 9. 与 self-check / 项目其他部分的关系

### 9.1 不共享 `shared/` 目录

book-create 私有 `shared/`，不挂到 `.claude/skills/shared/` 之下。理由：

- v1 只 book-create 一个 skill，私有化最简单
- v2 多 skill 时再做"提升哪些片段到顶层 shared/"的决策
- 现阶段避免提前抽象

### 9.2 不复用 self-check 的 subagent-contract.md

book-create 不用 subagent，无需该契约。subagent-contract.md 是 self-check 的资产，不外借。

### 9.3 spec-bundles.md 部分重叠

self-check 的 spec-bundles.md 包含 4 类规范的指纹（catalog/source/interpretation/skill）。book-create 只需其中 catalog + general 两份。**book-create 的 spec-bundles.md 是一份精简版**：

| 字段 | self-check | book-create |
|------|------------|-------------|
| 必含规范 | 4 份 SPEC 之一 + general.md + 可选 bazi.md | SPEC-catalog.md + general.md |
| 指纹校验 | 子 SKILL 启动时 | Step 3 启动时 |
| 注入策略 | 内联到 subagent prompt | 不内联（主 agent 直读即可） |

### 9.4 与 `node scripts/generate.js` 的关系

book-create 写 `catalog.md`，**不**自动跑 generate.js。原因：

- generate.js 还会写 `books.ts` / `content.ts` / `assoc.ts` / `search-index.json`，这些是前端数据层，建书 skill 不应擅自改
- 写完 catalog.md 后用户可能还要手工调整表格/元信息，再跑 generate.js 更稳妥
- 收尾报告里**提示**用户跑 generate.js，但**不自动跑**

### 9.5 与 SPEC-catalog.md 的关系

book-create 是 SPEC-catalog.md 的"AI 执行器"。**任何 SPEC-catalog.md 的修订都要同步：**

- 更新 `shared/spec-bundles.md` 的指纹
- 检查 Step 4-5 的人工 gate 设计是否仍合规
- 检查 §3 的 4 源模式解析是否需要适配新格式

---

## 10. 测试方案

### 10.1 3 个干跑用例（v1 强制通过）

| # | 模式 | 源 | 通过判据 |
|---|------|----|----------|
| 1 | A | 现有真实书的 `books/{slug}/catalog.html`（如 `子平真诠`） | 6 步全部走完；catalog.md 元信息 + 表格与现状一致；骨架全齐 |
| 2 | B | 一个公开目录页 URL（如豆瓣读书的《子平真诠》条目） | WebFetch 抓取成功；与模式 A 同验证 |
| 3 | D | 用户口述一本已存在的书（如"《滴天髓阐微》，明刘基撰"） | WebSearch 命中；同上 |

**通过判据统一：**

- 6 步引导不出错（用户模拟 6 步走完）
- 2 次人工 gate 都弹出且用户可正常确认
- catalog.md 元信息 6 字段（作者/版本/简介/术数/类别/内容类型/字形策略）齐全且合法
- 表格 2 列（编号、篇名），每行篇名能对应 `articles/{篇名}/.gitkeep` 骨架
- 与 generate.js 解析兼容（运行 `node scripts/generate.js` 不报错；generate.js 当前未提供 --dry-run，由用户自行决定何时跑）

### 10.2 静态合规测试（开发期手动跑）

- SKILL.md 必含 4 个段落：源模式路由 / 6 步状态机 / gate 设计 / 错误处理
- `shared/sources/*.md` 4 份文件存在性
- `shared/spec-bundles.md` 指纹与正本 SPEC 同步
- `shared/skeleton.md` 模板与 SPEC-catalog.md §二 的格式逐字对齐

### 10.3 后续扩展（v1 不做）

- 批量建书（一次 N 本）— v2
- 字形策略"简体规范化"的自动繁转简执行 — v2
- catalog.md 增量更新（已有目录添加新篇章）— v2
- 与 self-check 报告格式统一 — v2

---

## 11. 提交策略

- **第一批（3 个干跑用例通过后）：** 单 commit
  - `feat(book-create): 初版建书 skill，含 4 源模式 + 6 步状态机 + 2 次 gate`
- **后续按 issue 演进：** 每次扩展（新增 OCR 适配、加新源模式）单开 commit

---

## 12. 不在范围（v1 明确不做）

| 项 | 留到 | 原因 |
|----|------|------|
| article-create（source/interpretation/skill 录入） | v2 | 流程异质 + 范围已超 v1 |
| 批量建书（一次 N 本） | v2 | 1 本 1 流程已能验证模式 |
| 自动跑 `node scripts/generate.js` | v2 | 改动数据层需用户明确同意 |
| catalog.md 增量更新 | v2 | 复杂度过高，v1 遇冲突即退出 |
| 字形策略"简体规范化"自动执行（OpenCC t2s） | v2 | v1 只在元信息 blockquote 声明策略 |
| subagent 隔离写入 | v2 | 主 agent 直写足够 v1 任务规模 |
| 与 self-check 报告落盘格式统一 | v2 | 写入 vs 只读两套体系 |
| 跨 book-create 与 article-create 的衔接 UI | v2 | v1 收尾报告里给文字提示即可 |
| 引入新依赖（cheerio/puppeteer 等） | 不做 | 主 agent 凭 HTML 字符串手解 |
| 反爬对抗（验证码/JS 渲染） | 不做 | 失败后让用户换源 |

---

_本 spec 定义 book-create 建书 skill 的设计契约，从属《research-dispute》规范体系；任何与 general.md / SPEC-catalog.md 冲突处，以正本规范为准。v1 范围严格限定为 book-create；v2 article-create / source 录入 / 解读 / 技能沉淀的 skill 设计待本次实施完成后再开新 spec 讨论。_
