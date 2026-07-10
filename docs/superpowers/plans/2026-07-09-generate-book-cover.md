# generate-book-cover 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一键批量为 `books/` 下所有书籍生成古籍风格封面（文字叠加到模板底图），零 API 调用。

**Architecture:** 单入口脚本 `scripts/generate-book-cover.js`，扫描 `books/*/catalog.md` 提取书名/作者，从模板 metadata 读取字体/颜色/位置规格，调用现有 `renderTextOverlay` 将文字叠加到模板底图，输出到 `public/images/{书名}.png` + metadata JSON。

**Tech Stack:** Node.js ESM，sharp + canvas（已有依赖），vitest（测试）

**涉及文件：**

| 文件 | 操作 |
|------|------|
| `scripts/generate-book-cover.js` | **新建** — 主入口 |
| `scripts/lib/__tests__/generate-book-cover.test.js` | **新建** — 纯函数测试 |
| `scripts/lib/image-gen/text-overlay.js` | 只读引用 — `renderTextOverlay` |
| `scripts/lib/shared/font-installer.js` | 只读引用 — `ensureFontsInstalled` |

---

### Task 1: 编写纯函数测试

**Files:**
- Create: `scripts/lib/__tests__/generate-book-cover.test.js`

- [ ] **Step 1: 编写 `parseCatalogMd` 测试**

```js
/**
 * scripts/lib/__tests__/generate-book-cover.test.js
 *
 * 覆盖 generate-book-cover.js 的纯函数：
 * - parseCatalogMd: 提取书名 / 作者
 * - resolveTexts: 模板占位符替换 + size 自适应 + 空 slot 跳过
 * - buildMetadata: metadata JSON 构建
 */

import { describe, it, expect } from 'vitest'
import { parseCatalogMd, resolveTexts, buildMetadata } from '../generate-book-cover.js'

// ===== parseCatalogMd =====

describe('parseCatalogMd', () => {
  it('extracts title and author from standard catalog.md', () => {
    const md = `# 《八字提要》

> 作者：[民国] 韦千里
> 版本：据问真八字网（iwzbz.com）整理本
> 简介：民国命学家韦千里所著子平八字提要...
> 术数：命
> 类别：八字
> 内容类型：source, interpretation, skill`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('八字提要')
    expect(result.author).toBe('[民国] 韦千里')
  })

  it('handles multi-author format', () => {
    const md = `# 《滴天髓阐微》

> 作者：[明] 刘基 撰 / [清] 任铁樵 注
> 版本：据《四库全书》本`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('滴天髓阐微')
    expect(result.author).toBe('[明] 刘基 撰 / [清] 任铁樵 注')
  })

  it('handles author with parenthetical note', () => {
    const md = `# 《子平真诠》

> 作者：[清] 沈孝瞻 撰（乾隆四年进士）/ [民国] 徐乐吾 评注`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('子平真诠')
    expect(result.author).toBe('[清] 沈孝瞻 撰（乾隆四年进士）/ [民国] 徐乐吾 评注')
  })

  it('returns null title for malformed input', () => {
    expect(parseCatalogMd('').title).toBeNull()
    expect(parseCatalogMd('# No book title here').title).toBeNull()
    expect(parseCatalogMd('> 作者：someone').title).toBeNull()
  })

  it('returns empty author string when author line missing', () => {
    const md = `# 《无名书》

> 版本：某版本`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('无名书')
    expect(result.author).toBe('')
  })
})

// ===== resolveTexts =====

describe('resolveTexts', () => {
  const template = [
    {
      content: '{{title}}',
      position: { x: 'center', y: 'center' },
      size: 88,
      sizeMin: 64,
      sizeMax: 96,
      color: '#2C1810',
      fontHint: 'ShouJin',
      layout: 'vertical',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
    {
      content: '{{author}}',
      position: { x: 'center', y: '80%' },
      size: 24,
      color: '#3D2B1F',
      fontHint: 'HYNanGong',
      layout: 'horizontal',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
    {
      content: '{{subtitle}}',
      position: { x: 'center', y: '90%' },
      size: 18,
      color: '#3D2B1F',
      fontHint: 'KaiTi',
      layout: 'horizontal',
      stroke: null,
      explicitColor: true,
    },
  ]

  it('replaces {{title}} and {{author}} placeholders', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    expect(result[0].content).toBe('八字提要')
    expect(result[1].content).toBe('[民国] 韦千里')
  })

  it('skips slots whose resolved content is empty', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    // subtitle 为空，第三个 slot 应被过滤掉
    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('八字提要')
    expect(result[1].content).toBe('[民国] 韦千里')
  })

  it('scales size for long titles (6 chars → near sizeMin)', () => {
    const result = resolveTexts(template, { title: '紫微斗数全书', author: '[宋] 陈抟 撰', subtitle: '' })
    const titleSlot = result.find(t => t.content === '紫微斗数全书')
    // 6 字书名 → 字号应缩到 sizeMin(64) 附近
    expect(titleSlot.size).toBeLessThan(80)
    expect(titleSlot.size).toBeGreaterThanOrEqual(64)
  })

  it('scales size for short titles (3 chars → near sizeMax)', () => {
    const result = resolveTexts(template, { title: '呱呱集', author: '[民国] 韦千里', subtitle: '' })
    const titleSlot = result.find(t => t.content === '呱呱集')
    // 3 字书名 → 字号应接近 sizeMax(96)
    expect(titleSlot.size).toBeGreaterThan(85)
    expect(titleSlot.size).toBeLessThanOrEqual(96)
  })

  it('uses original size when sizeMin/sizeMax not specified', () => {
    const noScaleTemplate = [
      {
        content: '{{title}}',
        position: { x: 'center', y: 'center' },
        size: 50,
        fontHint: 'SimHei',
        layout: 'horizontal',
        stroke: null,
        explicitColor: false,
      },
    ]
    const result = resolveTexts(noScaleTemplate, { title: '很长的书名测试' })
    expect(result[0].size).toBe(50)
  })

  it('clamps scaled size to [sizeMin, sizeMax] range', () => {
    const result = resolveTexts(template, { title: '这是一个超级长的书名标题', author: '', subtitle: '' })
    const titleSlot = result[0]
    expect(titleSlot.size).toBeGreaterThanOrEqual(64) // sizeMin
    expect(titleSlot.size).toBeLessThanOrEqual(96)    // sizeMax
  })
})

// ===== buildMetadata =====

describe('buildMetadata', () => {
  it('builds valid metadata JSON with all required fields', () => {
    const meta = buildMetadata({
      book: { title: '八字提要', author: '[民国] 韦千里' },
      texts: [
        { content: '八字提要', position: { x: 'center', y: 'center' }, size: 88, fontHint: 'ShouJin', layout: 'vertical', verticalDirection: 'rtl', color: '#2C1810', stroke: null, explicitColor: true },
        { content: '[民国] 韦千里', position: { x: 'center', y: '80%' }, size: 24, fontHint: 'HYNanGong', layout: 'horizontal', verticalDirection: 'rtl', color: '#3D2B1F', stroke: null, explicitColor: true },
      ],
      bgPath: '/abs/path/to/bg.png',
      filename: '八字提要.png',
      size: 12345,
    })

    expect(meta.type).toBe('t2i')
    expect(meta.name).toBe('八字提要')
    expect(meta.prompt).toBe('书籍名称：八字提要,作者信息：[民国] 韦千里')
    expect(meta.aspectRatio).toBe('3:4')
    expect(meta.model).toBe('image-01')
    expect(meta.backgroundPath).toBe('/abs/path/to/bg.png')
    expect(meta.results[0].filename).toBe('八字提要.png')
    expect(meta.results[0].reusedFrom).toBe('/abs/path/to/bg.png')
    expect(meta.textOverlay.texts).toHaveLength(2)
    expect(meta.textOverlay.texts[0].content).toBe('八字提要')
  })
})
```

- [ ] **Step 2: 运行测试确认全部失败（函数未定义）**

```bash
pnpm test scripts/lib/__tests__/generate-book-cover.test.js
```
Expected: 全部 FAIL（`parseCatalogMd is not a function` / `resolveTexts is not a function` / `buildMetadata is not a function`）

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/__tests__/generate-book-cover.test.js
git commit -m "test: add generate-book-cover pure function tests (red)"
```

---

### Task 2: 实现 `parseCatalogMd` + `resolveTexts` + `buildMetadata`

**Files:**
- Create: `scripts/generate-book-cover.js`（这三个导出 + 骨架 main）

- [ ] **Step 1: 创建脚本骨架，实现三个纯函数**

```js
#!/usr/bin/env node
/**
 * scripts/generate-book-cover.js — 一键批量生成古籍封面
 *
 * 扫描 books/*/catalog.md，提取书名/作者，用模板底图 + 文字叠加生成封面。
 * 零 API 调用：复用现有 renderTextOverlay，只替换文字内容。
 *
 * 用法：
 *   node scripts/generate-book-cover                         扫描全部，跳过已有封面
 *   node scripts/generate-book-cover --force                  全部覆盖
 *   node scripts/generate-book-cover --books 子平真诠,滴天髓阐微  指定书籍
 *   node scripts/generate-book-cover --metadata path/to/template.json  自定义模板
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { renderTextOverlay } from './lib/image-gen/text-overlay.js'
import { ensureFontsInstalled, logInstallSummary } from './lib/shared/font-installer.js'

const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const BOOKS_DIR = path.join(PROJECT_ROOT, 'books')
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images')
const DEFAULT_BG = path.join(IMAGES_DIR, '墨兰鎏金-古籍封面.png')

// ===== 默认模板 =====
// 基于 八字提要-metadata.json 的 textOverlay.texts 提炼。
// content 中用 {{title}} / {{author}} / {{subtitle}} 占位符。
const DEFAULT_TEMPLATE = Object.freeze({
  backgroundPath: DEFAULT_BG,
  texts: [
    {
      content: '{{title}}',
      position: { x: 'center', y: 'center' },
      size: 88,
      sizeMin: 60,
      sizeMax: 96,
      color: '#2C1810',
      fontHint: 'ShouJin',
      layout: 'vertical',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
    {
      content: '{{author}}',
      position: { x: 'center', y: '80%' },
      size: 24,
      color: '#3D2B1F',
      fontHint: 'HYNanGong',
      layout: 'horizontal',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
  ],
})

// ===== 1. parseCatalogMd =====

/**
 * 从 catalog.md 内容中提取书名和作者。
 * @param {string} content - catalog.md 全文
 * @returns {{ title: string|null, author: string }}
 */
export function parseCatalogMd(content) {
  const titleMatch = content.match(/^#\s*《(.+?)》/m)
  const authorMatch = content.match(/^>\s*作者：(.+)/m)
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    author: authorMatch ? authorMatch[1].trim() : '',
  }
}

// ===== 2. resolveTexts =====

/**
 * 将模板 texts 数组中的占位符替换为实际值。
 * - {{title}} / {{author}} / {{subtitle}} → 实际文本
 * - 替换后 content 为空字符串的 slot 被过滤掉
 * - 有 sizeMin/sizeMax 的 slot 根据字数线性缩放字号
 *
 * @param {Array<object>} templateTexts - 模板的 texts 数组
 * @param {{ title: string, author: string, subtitle?: string }} book
 * @returns {Array<object>} 替换后的 texts 数组（深拷贝，不修改原模板）
 */
export function resolveTexts(templateTexts, book) {
  const placeholders = {
    '{{title}}': book.title || '',
    '{{author}}': book.author || '',
    '{{subtitle}}': book.subtitle || '',
  }

  const REF_CHARS = 4 // 参考字数，4 字书名 = 基准字号

  return templateTexts
    .map(t => {
      const resolved = { ...t }
      let content = t.content
      for (const [placeholder, value] of Object.entries(placeholders)) {
        content = content.replaceAll(placeholder, value)
      }
      resolved.content = content

      // 空 slot 跳过
      if (!content.trim()) return null

      // 字号自适应（仅当指定了 sizeMin/sizeMax 时生效）
      if (t.sizeMin != null && t.sizeMax != null) {
        const charCount = [...content].length
        // 线性插值：字数越多，字号越小
        const ratio = Math.max(0, Math.min(1, (charCount - 2) / (8 - 2))) // 2字→0, 8字→1
        resolved.size = Math.round(t.sizeMax - ratio * (t.sizeMax - t.sizeMin))
      }

      return resolved
    })
    .filter(Boolean)
}

// ===== 3. buildMetadata =====

/**
 * 构建与 t2i 兼容的 metadata JSON 对象。
 * @param {{ book: {title, author}, texts: Array, bgPath: string, filename: string, size: number }} params
 * @returns {object}
 */
export function buildMetadata({ book, texts, bgPath, filename, size }) {
  const timestamp = new Date().toISOString()
  return {
    timestamp,
    type: 't2i',
    prompt: `书籍名称：${book.title},作者信息：${book.author}`,
    apiPrompt: `书籍名称：${book.title},作者信息：${book.author}`,
    model: 'image-01',
    aspectRatio: '3:4',
    width: null,
    height: null,
    style: null,
    n: 1,
    seed: null,
    promptOptimizer: false,
    promptOptimizerEffective: false,
    aigcWatermark: false,
    responseFormat: 'url',
    name: book.title,
    results: [
      {
        filename,
        size,
        reusedFrom: bgPath,
      },
    ],
    textOverlay: {
      intent: null,
      cleanPrompt: null,
      reservedAreas: [],
      texts,
      bgInfo: null,
      llmCalls: [],
    },
    backgroundPath: bgPath,
  }
}

// ===== main（骨架，Task 3 实现） =====

function parseArgs(argv) {
  // Task 3 实现
  return { force: false, books: null, metadataPath: null }
}

function scanBooks() {
  // Task 3 实现
  return []
}

async function main() {
  // Task 3 实现
}

const isMain = process.argv[1] && process.argv[1].endsWith('/generate-book-cover.js')
if (isMain) {
  main().catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
}
```

- [ ] **Step 2: 运行测试确认纯函数全部通过**

```bash
pnpm test scripts/lib/__tests__/generate-book-cover.test.js
```
Expected: 全部 PASS（12 tests）

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-book-cover.js
git commit -m "feat(generate-book-cover): add parseCatalogMd, resolveTexts, buildMetadata"
```

---

### Task 3: 实现 CLI + main 编排逻辑

**Files:**
- Modify: `scripts/generate-book-cover.js`（替换骨架 main）

- [ ] **Step 1: 实现 `parseArgs` + `scanBooks` + `main`**

将 Task 2 的骨架替换为以下完整实现：

```js
// ===== CLI 参数解析 =====

function printHelp() {
  console.log(`用法: node scripts/generate-book-cover [选项]

一键批量生成古籍封面（文字叠加到模板底图，零 API 调用）。

选项:
  --force               覆盖已有封面（默认跳过已存在的）
  --books <name,...>    只生成指定书籍（逗号分隔），默认扫描全部
  --metadata <path>     自定义模板 metadata JSON（默认内置模板）
  --help                显示此帮助

示例:
  node scripts/generate-book-cover                           # 扫描全部，跳过已有
  node scripts/generate-book-cover --force                    # 全部覆盖
  node scripts/generate-book-cover --books 子平真诠,滴天髓阐微  # 指定书籍
  node scripts/generate-book-cover --metadata my-template.json # 自定义模板
`)
}

function parseArgs(argv) {
  const opts = { force: false, books: null, metadataPath: null, help: false }
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--force':
        opts.force = true
        break
      case '--books':
        opts.books = (argv[i + 1] || '').split(',').map(s => s.trim()).filter(Boolean)
        i++
        break
      case '--metadata':
        opts.metadataPath = argv[i + 1] || null
        i++
        break
      case '--help':
        opts.help = true
        break
    }
  }
  return opts
}

// ===== 书籍扫描 =====

/**
 * 扫描 books/ 目录，返回所有有 catalog.md 的书籍信息。
 * @returns {Array<{slug: string, title: string, author: string, catalogPath: string}>}
 */
function scanBooks() {
  if (!fs.existsSync(BOOKS_DIR)) {
    console.error(`❌ books 目录不存在: ${BOOKS_DIR}`)
    process.exit(1)
  }

  const books = []
  const entries = fs.readdirSync(BOOKS_DIR, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const catalogPath = path.join(BOOKS_DIR, entry.name, 'catalog.md')
    if (!fs.existsSync(catalogPath)) continue

    try {
      const content = fs.readFileSync(catalogPath, 'utf-8')
      const { title, author } = parseCatalogMd(content)
      if (!title) {
        console.warn(`⚠️  无法解析书名: ${catalogPath}`)
        continue
      }
      books.push({ slug: entry.name, title, author, catalogPath })
    } catch (err) {
      console.warn(`⚠️  读取失败: ${catalogPath} — ${err.message}`)
    }
  }
  return books
}

// ===== 模板加载 =====

/**
 * 加载模板。如果指定了 --metadata 路径则从文件加载，否则使用内置默认模板。
 */
function loadTemplate(metadataPath) {
  if (metadataPath) {
    const absPath = path.resolve(metadataPath)
    if (!fs.existsSync(absPath)) {
      console.error(`❌ 模板文件不存在: ${absPath}`)
      process.exit(1)
    }
    try {
      const meta = JSON.parse(fs.readFileSync(absPath, 'utf-8'))
      if (!meta.textOverlay?.texts || meta.textOverlay.texts.length === 0) {
        console.error('❌ 模板 metadata 中缺少 textOverlay.texts')
        process.exit(1)
      }
      return {
        backgroundPath: meta.backgroundPath || DEFAULT_BG,
        texts: meta.textOverlay.texts,
      }
    } catch (err) {
      console.error(`❌ 模板解析失败: ${err.message}`)
      process.exit(1)
    }
  }
  return { ...DEFAULT_TEMPLATE, texts: DEFAULT_TEMPLATE.texts.map(t => ({ ...t })) }
}

// ===== 封面存在性检查 =====

function coverExists(bookTitle) {
  const imagePath = path.join(IMAGES_DIR, `${bookTitle}.png`)
  return fs.existsSync(imagePath)
}

// ===== 主流程 =====

async function main() {
  const args = process.argv.slice(2)
  const opts = parseArgs(args)

  if (opts.help) {
    printHelp()
    process.exit(0)
  }

  // 初始化字体（renderTextOverlay 依赖已注册字体）
  const fontResult = await ensureFontsInstalled()
  logInstallSummary(fontResult)

  // 扫描书籍
  let books = scanBooks()
  if (books.length === 0) {
    console.log('📚 未找到任何书籍（books/ 下无 catalog.md）')
    process.exit(0)
  }

  // 按 --books 过滤
  if (opts.books && opts.books.length > 0) {
    const bookSet = new Set(opts.books)
    const filtered = books.filter(b => bookSet.has(b.slug) || bookSet.has(b.title))
    if (filtered.length === 0) {
      console.error(`❌ 未找到匹配的书籍: ${opts.books.join(', ')}`)
      console.error(`   可用书籍: ${books.map(b => b.slug).join(', ')}`)
      process.exit(1)
    }
    const notFound = opts.books.filter(name => !books.some(b => b.slug === name || b.title === name))
    if (notFound.length > 0) {
      console.warn(`⚠️  未找到: ${notFound.join(', ')}`)
    }
    books = filtered
  }

  console.log(`\n📚 扫描到 ${books.length} 本书籍`)

  // 加载模板
  const template = loadTemplate(opts.metadataPath)
  const bgPath = template.backgroundPath
  if (!fs.existsSync(bgPath)) {
    console.error(`❌ 模板底图不存在: ${bgPath}`)
    process.exit(1)
  }
  console.log(`🖼️  模板底图: ${path.relative(PROJECT_ROOT, bgPath)}`)

  // 确保输出目录存在
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  // 逐个生成封面
  let generated = 0
  let skipped = 0
  let failed = 0

  for (const book of books) {
    const imagePath = path.join(IMAGES_DIR, `${book.title}.png`)

    // 跳过已有封面（除非 --force）
    if (!opts.force && coverExists(book.title)) {
      console.log(`⏭️  跳过: 《${book.title}》（封面已存在）`)
      skipped++
      continue
    }

    console.log(`\n🖼️  生成: 《${book.title}》`)
    console.log(`   作者: ${book.author || '(无)'}`)

    // 解析文字
    const texts = resolveTexts(template.texts, book)
    if (texts.length === 0) {
      console.warn(`   ⚠️  文字解析结果为空，跳过`)
      failed++
      continue
    }

    for (const t of texts) {
      console.log(`   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`)
    }

    try {
      // 渲染文字叠加
      await renderTextOverlay(bgPath, texts, imagePath)

      // 保存 metadata
      const stat = fs.statSync(imagePath)
      const metadata = buildMetadata({
        book,
        texts,
        bgPath,
        filename: `${book.title}.png`,
        size: stat.size,
      })
      const metaPath = path.join(IMAGES_DIR, `${book.title}-metadata.json`)
      fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8')

      console.log(`   ✅ ${book.title}.png (${(stat.size / 1024).toFixed(1)} KB)`)
      generated++
    } catch (err) {
      console.error(`   ❌ 失败: ${err.message}`)
      failed++
    }
  }

  // 汇总
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`🏁 完成：生成 ${generated}，跳过 ${skipped}，失败 ${failed}`)
  if (failed > 0) process.exit(1)
}

const isMain = process.argv[1] && process.argv[1].endsWith('/generate-book-cover.js')
if (isMain) {
  main().catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
}
```

- [ ] **Step 2: 验证 CLI help 输出**

```bash
node scripts/generate-book-cover.js --help
```
Expected: 显示用法帮助。

- [ ] **Step 3: dry-run 验证（不实际生成）**

```bash
node scripts/generate-book-cover.js --books 呱呱集 2>&1 | head -20
```
Expected: 扫描到 1 本书，显示书名/作者/文字规格，输出封面文件。

- [ ] **Step 4: 验证生成结果**

```bash
ls -la public/images/呱呱集.png public/images/呱呱集-metadata.json
```
Expected: 两个文件都存在，PNG 大小合理（非 0 字节）。

- [ ] **Step 5: 验证 --force 覆盖行为**

```bash
node scripts/generate-book-cover.js --books 呱呱集 --force 2>&1
```
Expected: 重新生成（不显示"跳过"）。

- [ ] **Step 6: 验证跳过逻辑（无 --force）**

```bash
node scripts/generate-book-cover.js --books 呱呱集 2>&1
```
Expected: 显示"跳过: 《呱呱集》（封面已存在）"。

- [ ] **Step 7: 运行测试确认纯函数仍然通过**

```bash
pnpm test scripts/lib/__tests__/generate-book-cover.test.js
```
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-book-cover.js
git commit -m "feat(generate-book-cover): add CLI, scan, and main orchestration"
```

---

### Task 4: 全量验证 + 清理

- [ ] **Step 1: 跑全量测试确保无回归**

```bash
pnpm test
```
Expected: 除预先存在的 3 个 fail 外无新增失败。

- [ ] **Step 2: 全量 dry-run（不指定 --books，观察跳过行为）**

```bash
node scripts/generate-book-cover.js 2>&1
```
Expected: `八字提要` 和 `呱呱集` 被跳过，其余 16 本逐一生成。

- [ ] **Step 3: 验证输出完整性**

```bash
ls public/images/*.png | wc -l
ls public/images/*-metadata.json | wc -l
```
Expected: 至少 18 个 PNG + 18 个 metadata JSON（`八字提要` + `呱呱集` + 新生成的 16 本）。

- [ ] **Step 4: 抽查一个 metadata JSON 结构完整性**

```bash
cat public/images/子平真诠-metadata.json | python3 -m json.tool > /dev/null && echo "valid JSON"
```
Expected: `valid JSON`

- [ ] **Step 5: 验证 rerender 兼容性**

```bash
node scripts/t2i.js --rerender public/images/子平真诠-metadata.json 2>&1 | tail -5
```
Expected: 正常 rerender 输出（底图识别正确，文字叠加成功）。

- [ ] **Step 6: Commit**

```bash
git add public/images/*.png public/images/*-metadata.json
git commit -m "feat: batch generate book covers for all 18 books"
```
