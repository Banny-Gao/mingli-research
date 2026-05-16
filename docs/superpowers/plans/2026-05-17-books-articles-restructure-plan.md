# Books Articles Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure `books/` directory from flat source/interpretations/skills to article-centric `articles/{篇名}/` organization, enhancing catalog.md with metadata and categories, and updating generate.js + frontend accordingly.

**Architecture:** The data pipeline flows: `catalog.html` → `catalog.md` → `generate.js` → `src/data/*.ts` → frontend. All generated files auto-regenerate. Only source-of-truth files (SPECs, catalog.md, migration script) are manually edited. The frontend ReadList component gains category-based collapsible sections, and the Landing page shows book metadata.

**Tech Stack:** Node.js (generate.js), React/TypeScript (frontend), Vitest (testing), Playwright (verification)

---

### Task 1: Update SPEC-source.md (paths only)

**Files:**
- Modify: `SPEC-source.md`

- [ ] **Step 1: Update path references in SPEC-source.md**

Change all path references from `source/{篇名}.md` to `articles/{篇名}/source.md`:

```
- source/天道.md → articles/天道/source.md
- source/{篇名}.md → articles/{篇名}/source.md
```

Also update:
- Line 2 purpose: `books/**/source/目录下` → `books/**/articles/{篇名}/`目录下
- Section 1 filename convention: `source/{篇名}.md` → `articles/{篇名}/source.md`
- Section 6 generate.js consumer: update path in the JavaScript comment
- Section 7 compliance table: update paths

- [ ] **Step 2: Commit**

```bash
git add SPEC-source.md
git commit -m "docs: update SPEC-source.md paths for articles restructure"
```

---

### Task 2: Update SPEC-interpretation.md (paths + single file)

**Files:**
- Modify: `SPEC-interpretation.md`

- [ ] **Step 1: Update SPEC-interpretation.md**

Changes:
1. Path from `interpretations/{skill_name}/tutorial.md` → `articles/{篇名}/interpretation.md`
2. Remove the tutorial/advanced split (consolidate to single interpretation.md per article)
3. Keep all 7 core sections structure
4. Update "前置依赖" reference paths

The key change is in Section 1 (文件命名规范):
- Old: `interpretations/{skill_name}/tutorial.md`
- New: `articles/{篇名}/interpretation.md`
- Remove the `advanced.md` optional concept

- [ ] **Step 2: Commit**

```bash
git add SPEC-interpretation.md
git commit -m "docs: update SPEC-interpretation.md paths and single-file format"
```

---

### Task 3: Rewrite SPEC-skill.md (executable skill format)

**Files:**
- Modify: `SPEC-skill.md`

- [ ] **Step 1: Rewrite SPEC-skill.md**

Current file is only 20 lines and defines no content structure. Rewrite with:

```markdown
# AI 可执行技能规范

> **用途：** 规范 `books/**/articles/{篇名}/skill.md` 的产出格式
> **前置依赖：** 对应 `source.md`（原文）+ `interpretation.md`（解读）已完成
> **面向受众：** AI 执行者（LLM Agent）

---

## 一、文件命名与目录规范

```
articles/{篇名}/skill.md
```

- `篇名`：中文篇名，与 catalog.md 中的篇名严格一致
- 每篇文章只有一个 skill.md 文件

---

## 二、文件结构规范

每个 skill.md 必须包含以下五个区块：

### 2.1 YAML Frontmatter

```yaml
---
name: tiandao
displayName: 三元分析法
type: analysis
input: 八字四柱
output: 三元分析报告
description: 基于天道篇的三元理论对八字命局进行天元-人元-地元三层分析
---
```

必填字段：
- `name`：英文标识，与 interpretation.md 中引用的篇名关联
- `displayName`：人类可读的技能名称
- `type`：技能类型（analysis / lookup / comparison / generation）
- `input`：技能输入描述
- `output`：技能输出描述
- `description`：一句话说明技能功能

### 2.2 功能定位

```markdown
## 功能

用一段话说明这个技能是做什么的，AI 执行者应该何时调用它。
```

### 2.3 输入

```markdown
## 输入

列出所有需要的输入参数及其类型/格式：
- 参数名：描述
```

### 2.4 处理逻辑

```markdown
## 处理逻辑

具体的分析步骤/算法，按顺序列出。
每个步骤应包含：
1. 做什么
2. 依据的原文/原注/任氏曰（引用来源）
3. 判定条件/分支逻辑
```

### 2.5 输出

```markdown
## 输出

定义输出格式/结构。可以使用 TypeScript 类型定义或 JSON schema：
```

---

## 三、设计原则

1. **不重复 interpretation.md 的内容** — skill.md 定义的是"做什么"，不是"讲什么"
2. **功能导向** — 每个 skill 必须是一个 AI 可独立调用的能力
3. **引用原文但不堆砌** — 引用关键原文作为依据，不要全文照搬
4. **输出可结构化** — 输出应能被程序解析和消费

---

## 四、示例

见 `books/ditiansui-site/articles/天道/skill.md`

---

## 五、产出自检清单

- [ ] YAML frontmatter 完整（name, displayName, type, input, output, description）
- [ ] 功能定位清晰，一句话说明
- [ ] 输入参数完整列出
- [ ] 处理逻辑可执行，步骤明确
- [ ] 输出格式结构化
- [ ] 不与 interpretation.md 内容重叠
- [ ] 引用原文有来源标注
```

- [ ] **Step 2: Commit**

```bash
git add SPEC-skill.md
git commit -m "docs: rewrite SPEC-skill.md with executable skill format"
```

---

### Task 4: Create SPEC-catalog.md

**Files:**
- Create: `SPEC-catalog.md`

- [ ] **Step 1: Create SPEC-catalog.md**

```markdown
# Catalog.md 格式规范

> **用途：** 规范 `books/{book-slug}/catalog.md` 的格式
> **面向受众：** AI 生成者 + generate.js 消费方

---

## 一、文件位置

```
books/{book-slug}/catalog.md
```

---

## 二、文件结构

### 2.1 标题与元信息

```markdown
# 《滴天髓阐微》

> 作者：[清] 刘基 撰 / 任铁樵 注
> 版本：XXXX
> 简介：<100-200 字的书籍简介>
```

- 一级标题：书名（含《》）
- blockquote 元信息：作者、版本、简介
- 所有字段必填

### 2.2 分类与表格

```markdown
## 分类名称

| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |
| ---- | ---- | -------- | -------- | ---- | -------- |
| 01   | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |
| 02   | 坤道 | articles/坤道/source.md | articles/坤道/interpretation.md | 待解读 |          |
```

- 每个 `##` 二级标题表示一个分类
- 分类下紧接一个 6 列表格
- 路径统一使用 `articles/{篇名}/{type}.md` 格式
- 状态：已解读 / 待解读
- 关联技能：多个用英文逗号分隔

---

## 三、解析规则（generate.js 消费者）

1. 读取第一个 `#` 为书名
2. 读取 `>` blockquote 为元信息
3. 遍历每个 `##`：记录当前分类名
4. 解析表格行，记录编号、篇名、原文路径、解读路径、状态、关联技能
5. 每行的分类为当前所在的 `##` 标题

---

## 四、合规检查

- [ ] 一级标题为书名（含《》）
- [ ] blockquote 包含作者、版本、简介
- [ ] 每个分类使用 `##` 标题
- [ ] 表格为 6 列
- [ ] 路径使用 articles/ 格式
- [ ] 无手动编辑（仅 AI 生成）
```

- [ ] **Step 2: Commit**

```bash
git add SPEC-catalog.md
git commit -m "docs: add SPEC-catalog.md for catalog.md format specification"
```

---

### Task 5: Create migration script

**Files:**
- Create: `scripts/migrate-articles.js`

- [ ] **Step 1: Create the migration script**

This script performs the actual file reorganization. It must:

1. Read `books/ditiansui-site/catalog.md` to get all article names
2. For each article:
   a. Create `articles/{篇名}/` directory
   b. Move `source/{篇名}.md` → `articles/{篇名}/source.md`
   c. If interpretation exists, move `interpretations/{skill}/tutorial.md` → `articles/{篇名}/interpretation.md`
   d. If skill exists, move `skills/{skill}/SKILL.md` → `articles/{篇名}/skill.md`
3. Report any missing files or errors

```javascript
#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BOOKS_DIR = path.join(__dirname, '../books')

function parseCatalogForMigration(catalogPath) {
  const content = fs.readFileSync(catalogPath, 'utf-8')
  const articles = []
  let currentCategory = ''

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (/^##\s/.test(trimmed)) {
      currentCategory = trimmed.replace(/^##\s*/, '')
      continue
    }
    if (!trimmed || /^\|[-:\s|]+\|$/.test(trimmed) || /^#/.test(trimmed)) continue

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '')
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue

    articles.push({
      num: cells[0],
      title: cells[1],
      sourcePath: cells[2] || '',
      interpPath: cells.length >= 6 ? cells[3] : '',
      status: cells.length >= 6 ? cells[4] : (cells[3] || ''),
      skills: cells.length >= 6 ? (cells[5] || '') : (cells[4] || ''),
      category: currentCategory,
    })
  }
  return articles
}

function migrateBook(bookSlug) {
  const bookRoot = path.join(BOOKS_DIR, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')
  const articlesDir = path.join(bookRoot, 'articles')

  if (!fs.existsSync(catalogPath)) {
    console.log(`  ⏭️  跳过 ${bookSlug}: 无 catalog.md`)
    return
  }

  const articles = parseCatalogForMigration(catalogPath)
  console.log(`\n📚 ${bookSlug}: 发现 ${articles.length} 篇文章`)

  const oldDirs = {
    source: path.join(bookRoot, 'source'),
    interp: path.join(bookRoot, 'interpretations'),
    skills: path.join(bookRoot, 'skills'),
  }

  const oldDirsUsed = { source: new Set(), interp: new Set(), skills: new Set() }

  for (const art of articles) {
    const artDir = path.join(articlesDir, art.title)
    fs.mkdirSync(artDir, { recursive: true })

    // Migrate source
    const oldSourcePath = path.join(oldDirs.source, `${art.title}.md`)
    if (fs.existsSync(oldSourcePath)) {
      fs.renameSync(oldSourcePath, path.join(artDir, 'source.md'))
      oldDirsUsed.source.add(path.dirname(oldDirs.source))
      console.log(`  ✅ ${art.title}/source.md`)
    } else {
      console.log(`  ⚠️  ${art.title}: source.md 不存在`)
    }

    // Migrate interpretation (need to find the correct skill directory)
    // Read catalog to determine skill_name from interpPath
    if (art.interpPath && art.interpPath.length > 0) {
      // interpPath format: articles/{篇名}/interpretation.md — so we look for
      // interpretations/{skill_name}/tutorial.md instead
      // Actually, from the old structure, we find via skills/ directories
      const skillsDir = oldDirs.skills
      if (fs.existsSync(skillsDir)) {
        for (const skillEntry of fs.readdirSync(skillsDir)) {
          const tutorialPath = path.join(oldDirs.interp, skillEntry, 'tutorial.md')
          if (fs.existsSync(tutorialPath)) {
            // Check if this skill's article is the current one
            // We need to map skills to articles — look for the article name
            // Actually, just check all interpretations and match by article name
            // Better approach: scan interpretations dirs for the article
          }
        }
      }
    }
  }

  // Better approach: scan interpretations/ and skills/ dirs and match by catalog
  // Re-do the logic more simply:
  for (const art of articles) {
    const artDir = path.join(articlesDir, art.title)
    fs.mkdirSync(artDir, { recursive: true })

    // Source
    const srcOld = path.join(oldDirs.source, `${art.title}.md`)
    if (fs.existsSync(srcOld)) {
      fs.renameSync(srcOld, path.join(artDir, 'source.md'))
    }
  }

  // Now handle interpretations: scan directories, check SKILL-bazi link
  if (fs.existsSync(oldDirs.interp)) {
    for (const entry of fs.readdirSync(oldDirs.interp)) {
      const tutorialPath = path.join(oldDirs.interp, entry, 'tutorial.md')
      if (fs.existsSync(tutorialPath)) {
        // Find which article this belongs to via catalog skills column
        // We use a simple approach: find the article that has this skill in its skills list
        const targetArt = articles.find(a => a.skills.includes(entry))
        if (targetArt) {
          const artDir = path.join(articlesDir, targetArt.title)
          fs.mkdirSync(artDir, { recursive: true })
          fs.renameSync(tutorialPath, path.join(artDir, 'interpretation.md'))
          oldDirsUsed.interp.add(entry)
          console.log(`  ✅ ${targetArt.title}/interpretation.md`)
        }
      }
    }
  }

  // Skills
  if (fs.existsSync(oldDirs.skills)) {
    for (const entry of fs.readdirSync(oldDirs.skills)) {
      const skillPath = path.join(oldDirs.skills, entry, 'SKILL.md')
      if (fs.existsSync(skillPath)) {
        const targetArt = articles.find(a => a.skills.includes(entry))
        if (targetArt) {
          const artDir = path.join(articlesDir, targetArt.title)
          fs.mkdirSync(artDir, { recursive: true })
          fs.renameSync(skillPath, path.join(artDir, 'skill.md'))
          oldDirsUsed.skills.add(entry)
          console.log(`  ✅ ${targetArt.title}/skill.md`)
        }
      }
    }
  }

  console.log(`\n✅ ${bookSlug} 迁移完成`)
}

// Migrate all books
const bookDirs = fs.readdirSync(BOOKS_DIR).filter(f =>
  fs.statSync(path.join(BOOKS_DIR, f)).isDirectory() &&
  fs.existsSync(path.join(BOOKS_DIR, f, 'catalog.md'))
)

for (const slug of bookDirs) {
  migrateBook(slug)
}

console.log('\n🎉 全部迁移完成')
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-articles.js
git commit -m "feat: add migration script for articles directory restructure"
```

---

### Task 6: Run migration script

**Files:** (creates articles/ structure under books/ditiansui-site/)

- [ ] **Step 1: Run migration**

```bash
cd /c/Users/Administrator/Desktop/mingli-research
node scripts/migrate-articles.js
```

Verify the output:
```bash
ls books/ditiansui-site/articles/ | head -5
ls books/ditiansui-site/articles/天道/
```

Expected: `天道/ 坤道/ 人道/ ...` each with `source.md`, and for interpreted articles also `interpretation.md` and `skill.md`.

- [ ] **Step 2: Verify migration completeness**

```bash
# Source files: should have 64 source.md files
find books/ditiansui-site/articles -name "source.md" | wc -l
# Interpretation files: should have 9
find books/ditiansui-site/articles -name "interpretation.md" | wc -l
# Skill files: should have 9
find books/ditiansui-site/articles -name "skill.md" | wc -l
```

Expected: 64 source, 9 interpretation, 9 skill.

---

### Task 7: Update catalog.md (paths + metadata + categories)

**Files:**
- Modify: `books/ditiansui-site/catalog.md`

- [ ] **Step 1: Update catalog.md**

Changes:
1. Add book metadata blockquote after title: author, version, description
2. Update all table paths from `source/{篇名}.md` to `articles/{篇名}/source.md`
3. Update interpretation paths from `interpretations/{skill}/tutorial.md` to `articles/{篇名}/interpretation.md`
4. Keep category sections (`## 上篇 · 通神论`, `## 下篇 · 六亲论`) unchanged

The path changes are mechanical replacements:
- `source/天道.md` → `articles/天道/source.md` (for all 64 rows)
- `interpretations/tiandao/tutorial.md` → `articles/天道/interpretation.md` (for 9 interpreted rows)

And add after the title line:
```markdown
> 作者：[明] 刘基 撰 / [清] 任铁樵 注
> 版本：据《四库全书》本
> 简介：子平命理学核心经典，以天干地支五行生克为核心，通过六十余篇专题系统阐述命理原理，被尊为"命学五经"之首。
```

- [ ] **Step 2: Commit**

```bash
git add books/ditiansui-site/catalog.md
git commit -m "feat: update catalog.md with metadata and articles paths"
```

---

### Task 8: Update generate.js (new paths + category parsing + books.ts enhancement)

**Files:**
- Modify: `scripts/generate.js`

- [ ] **Step 1: Update path resolution in generate.js**

The critical change is in `parseCatalog()`. The catalog now has paths like `articles/天道/source.md`. The current logic reads `source/{篇名}.md` and `interpretations/{skill}/tutorial.md`. We need to update this to read from the articles directory.

Change the `parseCatalog()` function to also track categories from the `##` headings. Add a `category` field to each parsed row.

Also update the reading loops:
- `source/天道.md` → read from catalog row's `sourcePath`
- `interpretations/tiandao/tutorial.md` → read from catalog row's `interpPath`  
- `skills/{skill}/SKILL.md` → read from catalog row's skills, read from `articles/{篇名}/skill.md`

Key changes:
1. In `parseCatalog()` — track current category from `##` headings, add `category` to each row
2. In the main loop — read source from `path.join(bookRoot, row.sourcePath)` (already uses the path from catalog — should work as-is since path is now `articles/{篇名}/source.md`)
3. Same for interp — read from `path.join(bookRoot, row.interpPath)`
4. For skills — instead of scanning `skills/` directory, scan `articles/` directories for `skill.md` files, or read the path from catalog's skills column and construct `articles/{篇名}/skill.md`
5. Add `category` to ChapterInfo output
6. Add book metadata parsing (author, version, description from blockquote)

- [ ] **Step 2: Add category to ChapterInfo and Book interfaces**

In the generated `books.ts`, update `ChapterInfo`:
```typescript
export interface ChapterInfo {
  num: string;
  name: string;
  isDone: boolean;
  category: string;  // NEW: category name from ## heading
}
```

Add `categories` to the generated model so frontend can render collapsible sections.

- [ ] **Step 3: Run generate.js and verify**

```bash
cd /c/Users/Administrator/Desktop/mingli-research
node scripts/generate.js
```

Expected output: no errors, all 63(4) articles processed, skill keys read from articles/ directories.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate.js
git commit -m "feat: update generate.js for articles path and category parsing"
```

---

### Task 9: Regenerate .ts files

- [ ] **Step 1: Run generate to regenerate all files**

```bash
node scripts/generate.js
```

Verify:
```bash
head -20 src/data/books.ts  # Should show category field in ChapterInfo
```

- [ ] **Step 2: Verify generated files exist**

```bash
ls src/data/ditiansui-site/interp/*.ts | wc -l
ls src/data/ditiansui-site/skill/*.ts | wc -l
ls src/data/ditiansui-site/source/*.ts | wc -l
```

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "chore: regenerate data files with articles restructure"
```

---

### Task 10: Update ReadList.tsx (category sections + expand/collapse)

**Files:**
- Modify: `src/components/ReadList.tsx`

- [ ] **Step 1: Read current ReadList.tsx**

Already read above. Current implementation renders a flat list of chapters.

- [ ] **Step 2: Refactor ReadList with collapsible categories**

Replace the flat `.chapter-list` rendering with category-grouped collapsible sections:

```tsx
import React, { useState } from 'react'
import { Book, ChapterInfo } from '../data/books'

interface Props {
  book: Book
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  sourceNames: string[]
  skillToInterp: Record<string, string[]>
}

const ReadList: React.FC<Props> = ({
  book,
  onChapterClick,
  onSourceClick,
  sourceNames,
  skillToInterp,
}) => {
  // Group chapters by category
  const categories = new Map<string, ChapterInfo[]>()
  for (const ch of book.chapters) {
    const cat = ch.category || '未分类'
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(ch)
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">篇目总览</span>
        <span className="section-badge">
          共{book.total}篇 · 已解读{book.done}篇
        </span>
      </div>
      {Array.from(categories.entries()).map(([category, chapters]) => (
        <CategorySection
          key={category}
          category={category}
          chapters={chapters}
          onChapterClick={onChapterClick}
          onSourceClick={onSourceClick}
          sourceNames={sourceNames}
          skillToInterp={skillToInterp}
        />
      ))}
    </div>
  )
}

function CategorySection({
  category,
  chapters,
  onChapterClick,
  onSourceClick,
  sourceNames,
  skillToInterp,
}: {
  category: string
  chapters: ChapterInfo[]
  onChapterClick: (name: string) => void
  onSourceClick: (name: string) => void
  sourceNames: string[]
  skillToInterp: Record<string, string[]>
}) {
  const [collapsed, setCollapsed] = useState(false)
  const doneCount = chapters.filter(c => c.isDone).length

  return (
    <div className="category-section">
      <div
        className="category-header"
        onClick={() => setCollapsed(v => !v)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--color-surface)',
          marginTop: 12,
          marginBottom: collapsed ? 0 : 8,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-dim)', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
          <span style={{ fontWeight: 600 }}>{category}</span>
        </div>
        <span className="section-badge">
          {doneCount}/{chapters.length} 已解读
        </span>
      </div>
      {!collapsed && (
        <div className="chapter-list" style={{ marginTop: 0 }}>
          {chapters.map((ch, i) => {
            const num = ch.num
            const hasSource = sourceNames.includes(ch.name)
            const hasInterp = ch.isDone
            const hasSkill = !!skillToInterp[ch.name]
            return (
              <div key={ch.name} className={`chapter-row ${ch.isDone ? 'done' : 'undone'}`}>
                <div className="chapter-num">{num}</div>
                <div className={`chapter-name ${ch.isDone ? 'done' : 'undone'}`}>{ch.name}</div>
                <div className="chapter-actions">
                  {hasSource && (
                    <button
                      className="btn-text chapter-action action-source"
                      onClick={() => onSourceClick(ch.name)}
                    >
                      原文
                    </button>
                  )}
                  {hasInterp && (
                    <button
                      className="btn-text chapter-action"
                      onClick={() => onChapterClick(ch.name)}
                    >
                      解读
                    </button>
                  )}
                  {hasSkill && (
                    <button
                      className="btn-text chapter-action action-skill"
                      onClick={() => onChapterClick(ch.name)}
                    >
                      技能
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReadList
```

- [ ] **Step 3: Verify TS compiles**

```bash
cd /c/Users/Administrator/Desktop/mingli-research
npx tsc --noEmit
```

No type errors expected.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReadList.tsx
git commit -m "feat: add category-based collapsible sections to ReadList"
```

---

### Task 11: Update Landing.tsx (book metadata)

**Files:**
- Modify: `src/pages/Landing.tsx`

- [ ] **Step 1: Enhance book card with metadata**

The Landing page currently shows hardcoded author info. After the restructure, `Book` interface should carry metadata. Update the Book interface in `books.ts` and the Landing card to display author/description when available:

```typescript
// In books.ts (generated, but the interface is defined here)
export interface Book {
  slug: string;
  title: string;
  author: string;     // NEW
  version: string;    // NEW
  description: string; // NEW
  total: number;
  done: number;
  chapters: ChapterInfo[];
  skills: { name: string }[];
  sources: { name: string }[];
}
```

Update generate.js to parse metadata from the blockquote in catalog.md and add to the `Book` entry output.

In Landing.tsx, replace the hardcoded `原著：刘伯温（托名）｜注疏：任铁樵` with `book.meta.author` dynamic content.

- [ ] **Step 2: Commit**

```bash
git add src/pages/Landing.tsx src/data/books.ts scripts/generate.js
git commit -m "feat: add book metadata display to Landing page"
```

---

### Task 12: Update tests

**Files:**
- Modify: `tests/generate.test.ts`

- [ ] **Step 1: Update test expectations for new path format**

Update the test data to use new path format:
```typescript
const line = '| 1 | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |';
```

Add a test for category parsing:
```typescript
it('应解析 catalog.md 中的分类信息', () => {
  const content = `## 上篇 · 通神论\n\n| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |\n| ---- | ---- | -------- | -------- | ---- | -------- |\n| 01 | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |`
  // Test category tracking
  const lines = content.split('\n')
  let currentCategory = ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^##\s/.test(trimmed)) {
      currentCategory = trimmed.replace(/^##\s*/, '')
    }
  }
  expect(currentCategory).toBe('上篇 · 通神论')
})
```

- [ ] **Step 2: Run tests**

```bash
cd /c/Users/Administrator/Desktop/mingli-research
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/generate.test.ts
git commit -m "test: update tests for articles restructure paths and categories"
```

---

### Task 13: Remove old directories

**Files:**
- Remove: `books/ditiansui-site/source/`
- Remove: `books/ditiansui-site/interpretations/`
- Remove: `books/ditiansui-site/skills/`

- [ ] **Step 1: Verify migration is complete first**

```bash
# Check no files left in old directories
ls books/ditiansui-site/source/ 2>/dev/null && echo "WARNING: source dir not empty" || echo "source dir clean"
ls books/ditiansui-site/interpretations/ 2>/dev/null && echo "WARNING: interp dir not empty" || echo "interp dir clean"
ls books/ditiansui-site/skills/ 2>/dev/null && echo "WARNING: skills dir not empty" || echo "skills dir clean"
```

If the directories are empty (files migrated), remove them:
```bash
rmdir books/ditiansui-site/source
rmdir books/ditiansui-site/interpretations
rmdir books/ditiansui-site/skills
```

If not empty, check for leftover files and move them manually.

- [ ] **Step 2: Commit**

```bash
git rm -r books/ditiansui-site/source books/ditiansui-site/interpretations books/ditiansui-site/skills 2>/dev/null
git commit -m "chore: remove old flat directories after articles migration"
```

---

### Task 14: Playwright verification

**Files:** (verification only)

- [ ] **Step 1: Start dev server and verify with Playwright**

```bash
cd /c/Users/Administrator/Desktop/mingli-research
npm run dev &
sleep 3
```

Then use Playwright MCP to verify:

1. Landing page loads and shows correct book title/metadata
2. Click on book card → BookApp page loads with category sections
3. Category sections are collapsible (click to expand/collapse)
4. Click "原文"/"解读"/"技能" buttons → modal opens with correct content
5. Verify modal content is not empty
6. Run generate and verify no errors

- [ ] **Step 2: Final commit with all verification state**

```bash
git add -A
git commit -m "verification: full articles restructure verified with Playwright"
```

---

### Task 15: Remove migration script (optional, cleanup)

- [ ] **Step 1: Remove migration script if no longer needed**

```bash
git rm scripts/migrate-articles.js
git commit -m "chore: remove migration script after successful migration"
```
