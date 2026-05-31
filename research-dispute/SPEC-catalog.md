# Catalog.md 格式规范

> **用途：** 规范典籍目录结构与生成规则
> **上游依赖：** `catalog.html`（人工维护的书籍目录 HTML 片段）
> **下游 SPEC：** SPEC-source.md → SPEC-interpretation.md → SPEC-skill.md（内容生成链）
> **面向受众：** AI 生成者 + generate.js 消费方

---

## 一、文件结构

### 1.1 目录结构

```
books/
├── {book-slug}/                    # 典籍目录
│   ├── catalog.md                  # 目录文件
│   ├── catalog.html                # 原始目录（人工维护）
│   └── articles/                    # 篇章目录
│       ├── {篇名}/
│       │   ├── source.md          # 原文
│       │   │   ├── interpretation.md  # 解读
│       │   │   └── skill.md            # 技能（可选）
│       │   └── ...
│   ├── yuanhaiziping/
│   │   └── ...
```

**路径规则：**

- 典籍目录：`books/{slug}/`，slug 可使用中文书名或英文标识
- 中文 slug 可读性好（`books/滴天髓阐微/`），英文 slug 对 URL 编码和构建工具兼容性更佳
- 已有项目推荐保持英文 slug 避免 URL 编码问题；纯内容管理场景可用中文
- 篇章目录：`books/{book-slug}/articles/{中文篇名}/`
- 文件落地：`source.md`、`interpretation.md`、`skill.md` 按内容类型放置

### 1.2 文件命名

| 内容 | 文件名              |
| ---- | ------------------- |
| 原文 | `source.md`         |
| 解读 | `interpretation.md` |
| 技能 | `skill.md`          |

### 1.3 从 catalog.html 生成 catalog.md

`catalog.html` 是人工从书籍中摘录的目录 HTML 片段，格式因书而异。生成 catalog.md 有以下策略：

| 策略     | 适用场景                    | 行为                                      |
| -------- | --------------------------- | ----------------------------------------- |
| 全量录入 | 篇章数少、每篇均有价值      | 完整录入所有篇章                          |
| 精选录入 | 篇章数多、存在重复/注水篇章 | AI 调研后提出精品篇章候选，人工确认后录入 |

**人工确认 gate（不可跳过）：**

1. AI 分析 catalog.html 后，提出策略建议（全量 or 精选）及理由，**等待人工确认**
2. 若为精选策略，AI 列出候选篇章清单及排除篇章（附排除理由），**等待人工确认**
3. 确认后方可生成 catalog.md，不得在未确认的情况下自行决定

AI 生成 catalog.md 时的步骤：

1. 解析 `catalog.html`，提取篇章列表和层级结构
2. 提出策略建议和/或精选候选清单，等待人工确认
3. 确认后按本规范 §2 的格式输出元信息和篇章表格
4. 初步填充"状态"列（全为 `待解读`）和"关联技能"列（先留空，待 skill.md 产出后回填）
   > ⚠️ **2026-05-29 更新**：catalog.md 不再记录状态和关联技能，该信息由 generate.js 根据文件是否存在动态判断。表格简化为 2 列（编号、篇名）。

---

## 二、catalog.md 结构

### 2.1 元信息

```markdown
# 《滴天髓阐微》

> 作者：[明] 刘基 撰 / [清] 任铁樵 注
> 版本：据《四库全书》本
> 简介：子平命理学核心经典...
> 术数：命
> 类别：八字
> 内容类型：source, interpretation, skill
```

- 书名用 `《》` 包裹
- blockquote 包含元信息（见上方模板）
- **术数**（必填）决定该书属于哪个术数领域：`山` | `医` | `命` | `相` | `卜`
- **类别**（必填）该书的二级分类，取值来自前端 `CATEGORY_TREE`，当前支持：
  `山` → 拳法 | `医` → 中医 | `命` → 八字、紫微斗数、七政四余 | `相` → 地相、人相、星相 | `卜` → 易经、六爻、梅花易数、奇门遁甲、大六壬
  新增书籍前需先在 `Landing.tsx` 的 `CATEGORY_TREE` 中确认类别已注册
- **内容类型**（必填）决定该书有哪些文件，逗号分隔（如 `source, interpretation, skill`）

### 2.2 篇章表格

```markdown
## 上篇 · 通神论

| 编号 | 篇名 |
| ---- | ---- |
| 01   | 天道 |
| 02   | 坤道 |
```

**规则：**

- `##` 二级标题表示分类（如"上篇 · 通神论"）
- 表格 2 列：编号、篇名
- 原文路径和解读路径不再写入表格——ChapterKey 统一后，路径由篇名推导：
  - 原文：`articles/{篇名}/source.md`
  - 解读：`articles/{篇名}/interpretation.md`
  - 技能：`articles/{篇名}/skill.md`
- **状态**（已解读/待解读）不再记录，由 `interpretation.md` 是否存在动态判断
- **关联技能**不再记录，由 `skill.md` 是否存在动态判断

---

## 三、数据生成

### 3.1 统一 Key

所有内容类型共用统一的 **ChapterKey**：

```typescript
export type ChapterKey = '天道' | '坤道' | '人道' | '八格' | ...
```

不再区分 InterpKey / SourceKey / SkillKey — 篇名是跨内容类型的唯一标识。

### 3.2 关联结构

> ⚠️ **2026-05-29 更新**：技能与篇章 1:1 对应，skill.md 即表示该篇章已沉淀技能。

```typescript
// 篇章 → 技能列表（displayName，等同于篇名本身）
export const chapterToSkills: Record<string, string[]> = {
  天道: ['天道'],
  八格: ['八格'],
}

// 技能 → 篇章列表（等同于技能名本身）
export const skillToChapters: Record<string, string[]> = {
  天道: ['天道'],
  八格: ['八格'],
}
```

### 3.3 skill.md 格式

skill.md 的 YAML frontmatter 和内容结构详见 **SPEC-skill.md**。catalog.md 仅通过文件是否存在与之关联。

---

## 四、generate.js 解析规则

1. 读取 `#《书名》` 提取书名
2. 读取 blockquote 元信息：作者、版本、简介、术数（分类）、内容类型
3. 术数取值：`山` | `医` | `命` | `相` | `卜`
4. 遍历 `##` 标题为篇章分类名
5. 解析表格（2 列）：编号、篇名
6. 路径由篇名推导：`articles/{篇名}/source.md`、`articles/{篇名}/interpretation.md`、`articles/{篇名}/skill.md`
7. **状态** 和 **关联技能** 由 generate.js 运行时动态判断：
   - `isDone`：检查 `interpretation.md` 是否存在
   - `hasSkill`：检查 `skill.md` 是否存在
8. 生成：
   - `books.ts`：书籍列表
   - `content.ts`：加载器（`import.meta.glob` 动态加载 markdown）
   - `assoc.ts`：`chapterToSkills` / `skillToChapters`
   - `search-index.json`：全文搜索索引（见 §4.1）

### 4.1 search-index.json 格式

```typescript
// public/search-index.json — 全文搜索索引
interface SearchIndexEntry {
  slug: string // 书籍 slug
  section: string // 术数分类
  title: string // 书名
  interp: Array<{ key: string; text: string }> // 解读条目
  skill: Array<{ key: string; displayName?: string; text: string }> // 技能条目
  source: Array<{ key: string; text: string }> // 原文条目
}
```

- `text` 字段已截断至 **3000 字符**（约 500-600 中文汉字），足够搜索匹配和结果预览
- 前端由 `SearchBar` 组件懒加载（仅在用户打开搜索时 `fetch`），不阻塞首屏
- 加载后缓存在内存中，同一会话不重复请求
- 使用 Fuse.js 做客户端模糊搜索

---

## 五、合规检查

- [ ] 典籍目录为 `books/{slug}/`
- [ ] 篇章目录为 `books/{slug}/articles/{篇名}/`
- [ ] 书名含 `《》`
- [ ] blockquote 元信息完整（作者、版本、简介、术数、内容类型）
- [ ] 术数取值为 `山` | `医` | `命` | `相` | `卜`
- [ ] 表格 2 列（编号、篇名），路径由篇名推导
- [ ] 状态和关联技能由 generate.js 动态判断，无需记录

---

_本规范定义了 catalog.md 的通用生成标准，支持五术平台所有典籍。_
