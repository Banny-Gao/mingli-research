# fetch-source 合并重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `scripts/fetch-sources.js` 与 `scripts/fetch-wikisource.js` 合并为单一 CLI 入口 `scripts/fetch-source.js`,内部模块化(`scripts/fetch-source/`),所有 source.md 产出的字节级行为不变,5+ 处 skill/文档同步更新。

**Architecture:** 单入口 + subcommand 分发(`run` / `wiki`)。共享 `format.js` 提纯函数,`extractors/` 放各站点解析器,`run.js` 与 `wiki.js` 是两个 subcommand 的主体。`wiki` 模式加 catalog 存在性硬校验(缺失则建,存在则退出码 2)。

**Tech Stack:** Node.js ESM(项目 `package.json` `"type": "module"`)、零新依赖。

**Refs:**
- Design spec: `docs/superpowers/specs/2026-06-25-fetch-source-consolidation-design.md`(commit f39dcfb)
- 旧源 1: `scripts/fetch-sources.js`(521 行,本次删除)
- 旧源 2: `scripts/fetch-wikisource.js`(453 行,本次删除)
- 共享工具: `scripts/lib/utils.js`、`scripts/t2s.js`

---

## 文件结构总览

| 路径 | 状态 | 职责 |
|------|------|------|
| `scripts/fetch-source.js` | 新建 | 唯一 CLI 入口,argv 解析 + dispatch |
| `scripts/fetch-source/format.js` | 新建 | 共享纯函数(formatSourceMarkdown/renderAnnotationBlock/cleanContent/normalizeBlankLines) |
| `scripts/fetch-source/extractors/iwzbz.js` | 新建 | iwzbz.com 提取器(match + extract) |
| `scripts/fetch-source/extractors/generic.js` | 新建 | generic 通用文本提取(match + extract) |
| `scripts/fetch-source/extractors/wikisource.js` | 新建 | parseFullView + preprocessWikisourceContent |
| `scripts/fetch-source/run.js` | 新建 | run subcommand 主体 |
| `scripts/fetch-source/wiki.js` | 新建 | wiki subcommand 主体(加 catalog 存在性校验) |
| `scripts/fetch-sources.js` | 删除 | - |
| `scripts/fetch-wikisource.js` | 删除 | - |
| `.claude/skills/source-create/shared/sources/script.md` | 改 | 改 2 处命令语法 |
| `.claude/skills/source-create/shared/strategy.md` | 改 | 改 4 处命令语法 |
| `.claude/skills/source-create/shared/gate.md` | 改 | 改 1 处文字提及 |
| `.claude/skills/source-create/SKILL.md` | 改 | 改 2 处引用 |
| `.claude/skills/book-create/shared/sources/url.md` | 改 | 改 1 处文字提及 |
| `docs/DEVELOPMENT_GUIDE.md` | 改 | 改 2 行目录树 |
| `docs/TECH_STACK.md` | 改 | 改 2 行表格 |
| `README.md` | 改 | 改 2 行目录树 |

---

## Task 1: 创建 `scripts/fetch-source/format.js`(共享纯函数)

**Files:**
- Create: `scripts/fetch-source/format.js`

- [ ] **Step 1.1: 创建目录与空文件**

```bash
mkdir -p scripts/fetch-source/extractors
```

- [ ] **Step 1.2: 写入 `scripts/fetch-source/format.js`**

完整内容(逐字对应旧 `fetch-sources.js:58` 的 `normalizeBlankLines`、行 181-192 的 `cleanContent`、行 196-208 的 `renderAnnotationBlock`、行 223-320 的 `transformAnnotations` + `formatSourceMarkdown`):

```javascript
/**
 * scripts/fetch-source/format.js — 共享 source.md 格式化纯函数
 *
 * 零依赖,可单测。两 subcommand 共用。
 */

const { stripHtml } = require('../lib/utils.js')
// 注:本文件不直接调 stripHtml;stripHtml 在 extractors/generic.js 里用
// 此 require 仅为兼容项目内其他模块可能引用——本文件不导出 stripHtml
```

**注:** 上面这段是错的,我们的脚本是 ESM,`lib/utils.js` 也是 ESM(看 `scripts/lib/utils.js:13` 用 `export function`)。重新写:

```javascript
/**
 * scripts/fetch-source/format.js — 共享 source.md 格式化纯函数
 *
 * 零依赖,可单测。两 subcommand 共用。
 */

export function normalizeBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

export function cleanContent(text) {
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim()
      return (
        !t ||
        (!/^第\s*[一二三四五六七八九十百千\d]+\s*页\s*$/.test(t) &&
          !/^《[^》]+》.*第\d+章\s*\S/.test(t))
      )
    })
    .join('\n')
}

export function renderAnnotationBlock(block) {
  const blines = block.lines.join('\n').trim()
  if (!blines) return ''
  const parts = blines
    .split('\n\n')
    .map((p, i) => {
      const t = p.trim()
      return t ? (i === 0 ? `> ${block.marker}${t}` : `>\n> ${t}`) : ''
    })
    .filter(Boolean)
  parts.push('')
  return parts.join('\n')
}

// 注家/编辑标记规范化。详见 fetch-sources.js:210-221 的注释。
const ANNOTATION_TRANSFORMS = [
  { re: /^(.{1,4}?)(曰|注|云|断曰|断|解)\s*([：:])\s*(.*)$/, label: m => `【${m[1].trim()}】 ${m[m.length - 1] || ''}` },
  { re: /^《([^》]+)》(?:引诗曰|引诗|云|註|注|歌|舊註曰|舊註)?\s*([：:])\s*(.*)$/, label: m => `【《${m[1]}》】 ${m[m.length - 1] || ''}` },
  { re: /^古歌云\s*[：:]\s*(.*)$/, label: m => `【古歌】 ${m[1] || ''}` },
  { re: /^旧注[曰云]\s*[：:]\s*(.*)$/, label: m => `【旧注】 ${m[1] || ''}` },
  { re: /^诗释\s*[：:]\s*(.*)$/, label: m => `【诗释】 ${m[1] || ''}` },
  { re: /^注释\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^注解\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^古赋云\s*[：:]\s*(.*)$/, label: m => `【古赋】 ${m[1] || ''}` },
  { re: /^补曰\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` },
  { re: /^补日\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` },
  { re: /^曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^又曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^眉批\s*[：:]\s*(.*)$/, label: m => `【眉批】 ${m[1] || ''}` },
  { re: /^(类象|属象|从象|化象|照象|返象|鬼象|伏象)$/, label: m => `【楠·${m[1]}】` },
  { re: /^格言\s*[：:]\s*(.*)$/, label: m => `【格言】 ${m[1] || ''}` },
]

function transformAnnotations(rawContent) {
  return rawContent
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return line
      for (const { re, label } of ANNOTATION_TRANSFORMS) {
        const m = t.match(re)
        if (m) return label(m).trim()
      }
      return line
    })
    .join('\n')
}

export function formatSourceMarkdown(chapterName, rawContent) {
  const normalized = transformAnnotations(rawContent)
  const lines = normalized.split('\n').map(l => l.trim())
  const mainLines = []
  const annotationBlocks = []
  let currentBlock = null,
    inMain = true

  for (const line of lines) {
    if (!line) {
      ;(currentBlock ? currentBlock.lines : mainLines).push('')
      continue
    }

    const markerMatch = line.match(/^【(.+?)】[：:]?\s*(.*)/)
    if (markerMatch) {
      const mName = `【${markerMatch[1]}】`
      if (currentBlock && currentBlock.marker === mName) {
        if (markerMatch[2]) currentBlock.lines.push(markerMatch[2])
        continue
      }
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: mName, lines: markerMatch[2] ? [markerMatch[2]] : [] }
      continue
    }

    const meipiMatch = line.match(/^(眉批|眉注|眉解)[：:](.*)/)
    if (meipiMatch) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: `【${meipiMatch[1]}】`, lines: meipiMatch[2] ? [meipiMatch[2]] : [] }
      continue
    }

    const legacy = line.match(/^(.{1,6})(曰|注)[：:]\s*(.*)/)
    if (legacy && !/^第\s*[一二三四五六七八九十百千\d]+\s*页\s*$/.test(line)) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: `【${legacy[1].trim()}】`, lines: legacy[3] ? [legacy[3]] : [] }
      continue
    }

    if (inMain) mainLines.push(line)
    else if (currentBlock) currentBlock.lines.push(line)
  }

  if (currentBlock) annotationBlocks.push({ ...currentBlock })

  const parts = [`# ${chapterName}`, '']
  const mainText = mainLines.join('\n').trim()
  if (mainText) parts.push(mainText)
  if (annotationBlocks.length > 0) {
    if (mainText) parts.push('')
    for (const block of annotationBlocks) parts.push(renderAnnotationBlock(block))
  }

  return normalizeBlankLines(parts.join('\n')) + '\n'
}
```

- [ ] **Step 1.3: 语法检查**

Run: `node --check scripts/fetch-source/format.js`
Expected: 无输出(退出码 0)

- [ ] **Step 1.4: Commit**

```bash
git add scripts/fetch-source/format.js
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 抽 format.js 共享 source 格式化纯函数"
```

---

## Task 2: 创建 `scripts/fetch-source/extractors/iwzbz.js` 和 `generic.js`

**Files:**
- Create: `scripts/fetch-source/extractors/iwzbz.js`
- Create: `scripts/fetch-source/extractors/generic.js`

- [ ] **Step 2.1: 写入 `scripts/fetch-source/extractors/iwzbz.js`**

对应旧 `fetch-sources.js:107-131` 的 `extractParagraphs` + 行 154-165 的 iwzbz extractor:

```javascript
/**
 * iwzbz.com 提取器
 * 对应旧 fetch-sources.js:154-165 的 EXTRACTORS[0]
 */

import { stripHtml } from '../../../lib/utils.js'

function extractParagraphs(innerHtml, chapterName, opts = {}) {
  const pMatches = innerHtml.match(/<p[^>]*>(.*?)<\/p>/gi)
  if (!pMatches) return null

  const skipExact = new Set([chapterName])
  const { skipHtml } = opts
  const lines = []
  let prevEmpty = false

  for (const p of pMatches) {
    const inner = p.replace(/<\/?p[^>]*>/gi, '').trim()
    if (skipHtml && skipHtml.test(inner)) continue
    const text = stripHtml(p).trim()
    if (skipExact.has(text) && text.length < 20) continue
    if (text) {
      lines.push(text)
      prevEmpty = false
    } else if (!prevEmpty) {
      lines.push('')
      prevEmpty = true
    }
  }

  return lines.join('\n')
}

export function match(url) {
  return /iwzbz\.com/.test(url)
}

export function extract(html, chapterName /* , bookTitle */) {
  const div = html.match(/<div\s+class="book-detail-content">([\s\S]*?)<\/div>/i)
  if (!div) return null
  return extractParagraphs(div[1], chapterName, {
    skipHtml: /^<font\s+class=['"]gold['"]>\s*.+?\s*<\/font>\s*$/i,
  })
}
```

- [ ] **Step 2.2: 写入 `scripts/fetch-source/extractors/generic.js`**

对应旧 `fetch-sources.js:133-152` 的 `extractFromText` + 行 166-172 的 generic extractor:

```javascript
/**
 * generic 通用文本提取器
 * 对应旧 fetch-sources.js:166-172 的 EXTRACTORS[1]
 */

import { stripHtml } from '../../../lib/utils.js'

function extractFromText(text, chapterName, bookTitle) {
  const escapedName = chapterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startPatterns = [
    new RegExp(`《${bookTitle || '[^》]+'}》[^第]*第\\d+章\\s*${escapedName}`),
    /《[^》]+》[^第]*第\d+章\s*\S+/,
  ]

  const startIdx = startPatterns.reduce((idx, pat) => (idx === -1 ? text.search(pat) : idx), -1)
  if (startIdx === -1) return null

  const afterHeader = text.slice(startIdx).split('\n').slice(1).join('\n').trim()
  if (bookTitle) {
    const footerRe = new RegExp(
      `\\n${bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\s*\\[`
    )
    const endIdx = afterHeader.search(footerRe)
    if (endIdx !== -1) return afterHeader.slice(0, endIdx)
  }
  return afterHeader
}

export function match(/* url */) {
  return true // fallback
}

export function extract(html, chapterName, bookTitle) {
  return extractFromText(stripHtml(html), chapterName, bookTitle)
}
```

- [ ] **Step 2.3: 语法检查**

Run:
```bash
node --check scripts/fetch-source/extractors/iwzbz.js
node --check scripts/fetch-source/extractors/generic.js
```
Expected: 均无输出(退出码 0)

- [ ] **Step 2.4: Commit**

```bash
git add scripts/fetch-source/extractors/
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 抽 extractors/iwzbz + extractors/generic 提取器"
```

---

## Task 3: 创建 `scripts/fetch-source/extractors/wikisource.js`

**Files:**
- Create: `scripts/fetch-source/extractors/wikisource.js`

- [ ] **Step 3.1: 写入 `scripts/fetch-source/extractors/wikisource.js`**

对应旧 `fetch-wikisource.js:65-149` 的 `parseFullView` + 行 250-303 中 wikisource 专有的 `namedComment` / `答曰:` 规则(原在 `formatSourceMarkdown` 里,现抽到预处理阶段):

```javascript
/**
 * wikisource 提取器 + 预处理
 *
 * parseFullView: 全览页 HTML → {volume, name, content} 数组
 * preprocessWikisourceContent: wikisource 原文里的"希夷先生曰/答曰:"统一为"【XX】"标记
 *   (原 fetch-wikisource.js:285-303 的 namedComment/answerMatch 规则)
 */

export function parseFullView(html) {
  let body = ''
  const parserMatch = html.match(/<div[^>]*class="[^"]*mw-parser-output[^"]*"[^>]*>([\s\S]+)$/i)
  if (parserMatch) {
    body = parserMatch[1]
    const trimRe =
      /<div[^>]*(?:id="(?:catlinks|mw-data-after-content|license)"|class="[^"]*printfooter)/i
    const trimMatch = body.match(trimRe)
    if (trimMatch) body = body.slice(0, trimMatch.index)
  }
  if (!body) {
    const altMatch = html.match(/<div[^>]*id="bodyContent"[^>]*>([\s\S]+)$/i)
    if (!altMatch) return null
    body = altMatch[1]
  }
  if (!body) return null

  const stripHtmlTags = h => h.replace(/<[^>]+>/g, '')
  const chapters = []
  let currentVolume = ''
  let currentChapter = null

  const sections = body.split(/(?=<div\s+class="mw-heading\s+mw-heading[234])/i)

  for (const section of sections) {
    const h2Match = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    const h3Match = section.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    const h4Match = section.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i)

    if (h2Match) {
      currentVolume = stripHtmlTags(h2Match[1]).replace(/\[编辑\]/g, '').trim()
      continue
    }

    const heading = h3Match || h4Match
    if (heading) {
      if (currentChapter && currentChapter.content.trim()) {
        chapters.push(currentChapter)
      }
      currentChapter = {
        volume: currentVolume,
        name: stripHtmlTags(heading[1]).replace(/\[编辑\]/g, '').trim(),
        content: '',
      }
    }

    if (currentChapter) {
      const pMatches = section.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
      if (pMatches) {
        for (const p of pMatches) {
          let text = stripHtmlTags(p).trim()
          text = text.replace(/\[编辑\]/g, '').trim()
          if (text) currentChapter.content += text + '\n\n'
        }
      }
      const poemMatches = section.match(/<div\s+class="poem">([\s\S]*?)<\/div>/gi)
      if (poemMatches) {
        for (const poem of poemMatches) {
          const poemText = stripHtmlTags(poem).trim()
          if (poemText) currentChapter.content += poemText + '\n\n'
        }
      }
    }
  }

  if (currentChapter && currentChapter.content.trim()) {
    chapters.push(currentChapter)
  }
  return chapters
}

export function preprocessWikisourceContent(text) {
  // 把 wikisource 原文里"某某先生曰:" / "答曰:"统一成"【XX】"标记
  // 由共用 format.js 的 markerMatch 进一步接管并加 "> " 与空行
  return text
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return line
      const namedComment = t.match(/^(.{2,8}(?:先生|真人|道人|曰))[：:]\s*(.*)/)
      if (namedComment && !/^(歌曰|例曰|眉批)/.test(namedComment[1])) {
        return `【${namedComment[1]}】 ${namedComment[2] || ''}`.trim()
      }
      const answerMatch = t.match(/^答曰[：:]\s*(.*)/)
      if (answerMatch) {
        return `【答曰】 ${answerMatch[1] || ''}`.trim()
      }
      return line
    })
    .join('\n')
}
```

- [ ] **Step 3.2: 语法检查**

Run: `node --check scripts/fetch-source/extractors/wikisource.js`
Expected: 无输出(退出码 0)

- [ ] **Step 3.3: Commit**

```bash
git add scripts/fetch-source/extractors/wikisource.js
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 抽 extractors/wikisource 解析器与预处理"
```

---

## Task 4: 创建 `scripts/fetch-source/run.js`(run subcommand 主体)

**Files:**
- Create: `scripts/fetch-source/run.js`

- [ ] **Step 4.1: 写入 `scripts/fetch-source/run.js`**

行为 = 旧 `fetch-sources.js:362-520` 完整主流程,只是 EXTRACTORS 数组改成静态 import 数组:

```javascript
/**
 * scripts/fetch-source/run.js — run subcommand 主体
 *
 * 行为与原 fetch-sources.js 字节级一致,只把 EXTRACTORS 数组改成静态 import 列表。
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { stripHtml, progressBar, formatDuration } from '../lib/utils.js'
import { t2s } from '../t2s.js'
import { cleanContent, formatSourceMarkdown } from './format.js'
import * as iwzbz from './extractors/iwzbz.js'
import * as generic from './extractors/generic.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const BOOKS_DIR = path.join(ROOT, 'books')
const DELAY_MS = 500
const DELAY_JITTER = 500
const MAX_RETRIES = 3
const RETRY_BASE_MS = 2000
const MIN_CONTENT_CHARS = 20
const USER_AGENT = 'Mozilla/5.0 (compatible; BookArchiver/1.0)'

const EXTRACTORS = [iwzbz, generic]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const randomDelay = () => DELAY_MS + Math.random() * DELAY_JITTER

const fetchPage = async (url, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (res.status === 429) {
        const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1) + Math.random() * 1000
        console.warn(
          `\n  ⚠️ 429 Too Many Requests, ${Math.round(wait / 1000)}s 后重试 (${attempt}/${retries})`
        )
        await sleep(wait)
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.text()
    } catch (err) {
      if (attempt === retries) throw err
      await sleep(RETRY_BASE_MS * Math.pow(2, attempt - 1))
    }
  }
}

const parseCatalogMd = bookDir => {
  const p = path.join(bookDir, 'catalog.md')
  if (!fs.existsSync(p)) return null
  const content = fs.readFileSync(p, 'utf-8')
  const bookTitle = (content.match(/^#\s*《(.+?)》/m) || [])[1] || null

  const firstSectionIndex = content.search(/^## /m)
  const metadataSection = firstSectionIndex !== -1 ? content.slice(0, firstSectionIndex) : content
  const glyphMatch = metadataSection.match(/^>\s*字形策略[：:]\s*(.+)$/m)
  const glyphStrategy = glyphMatch ? glyphMatch[1].trim() : null

  const names = content
    .split('\n')
    .map(l => l.trim().split('|').map(c => c.trim()).filter(c => c))
    .filter(cells => cells.length >= 2 && /^\d+$/.test(cells[0]))
    .map(cells => cells[1])
  return { bookTitle, names: names.length > 0 ? names : null, glyphStrategy }
}

const parseCatalogHtml = bookDir => {
  const p = path.join(bookDir, 'catalog.html')
  if (!fs.existsSync(p)) return null
  const html = fs.readFileSync(p, 'utf-8')
  const map = new Map()
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a\s*>/gi)) {
    const url = m[1]
    const pMatch = m[2].match(/<p[^>]*>\s*(.+?)\s*<\/p>/)
    const name = pMatch ? stripHtml(pMatch[1]).trim() : stripHtml(m[2]).trim()
    if (name && url.startsWith('http')) map.set(name, url)
  }
  return map.size > 0 ? map : null
}

function getExtractor(url) {
  return EXTRACTORS.find(ex => ex.match(url)) || EXTRACTORS[EXTRACTORS.length - 1]
}

const matchUrl = (name, urlMap) => {
  const exact = urlMap.get(name)
  if (exact) return exact
  for (const [htmlName, url] of urlMap) {
    if (
      htmlName === name ||
      htmlName.endsWith(`-${name}`) ||
      htmlName.startsWith(`${name}(`) ||
      htmlName.startsWith(`${name}-`) ||
      htmlName.includes(`-${name}(`) ||
      htmlName.includes(`-${name}-`)
    ) {
      return url
    }
  }
  return null
}

const processBook = async (bookSlug, batchChapters, opts) => {
  const { force, dryRun } = opts
  const bookDir = path.join(BOOKS_DIR, bookSlug)
  const outDir = path.join(bookDir, 'articles')
  const startTime = Date.now()

  const catalog = parseCatalogMd(bookDir)
  if (!catalog?.names) {
    console.log('  ⚠️ 跳过: catalog.md 无效')
    return { done: 0, skipped: 0, failed: 0 }
  }
  const { bookTitle, names: chapterNames } = catalog

  const urlMap = parseCatalogHtml(bookDir)
  if (!urlMap) {
    console.log('  ⚠️ 跳过: catalog.html 不存在或无效')
    return { done: 0, skipped: 0, failed: 0 }
  }

  const targetNames = batchChapters?.length ? batchChapters : chapterNames
  const isBatch = !!batchChapters?.length
  const chapters = []
  const missing = []
  for (const name of targetNames) {
    const url = matchUrl(name, urlMap)
    url ? chapters.push({ name, url }) : missing.push(name)
  }

  console.log(
    `  《${bookTitle}》 catalog.md: ${chapterNames.length} 篇, 匹配 URL: ${chapters.length} 篇${isBatch ? ` (指定 ${targetNames.length} 篇)` : ''}`
  )
  if (missing.length > 0)
    console.log(
      `  ⚠️ 未匹配: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` ...等${missing.length}篇` : ''}`
    )
  if (chapters.length === 0) return { done: 0, skipped: 0, failed: missing.length }
  if (dryRun) {
    console.log(`  [dry-run] 将抓取 ${chapters.length} 篇`)
    return { done: 0, skipped: chapters.length, failed: 0 }
  }

  fs.mkdirSync(outDir, { recursive: true })

  let done = 0,
    skipped = 0,
    failed = 0
  const errors = []
  const total = chapters.length

  for (let i = 0; i < total; i++) {
    const { name, url } = chapters[i]
    const outputName = catalog.glyphStrategy === '简体规范化' ? t2s(name) : name
    const chapterDir = path.join(outDir, outputName)
    const outPath = path.join(chapterDir, 'source.md')

    if (fs.existsSync(outPath) && !force) {
      skipped++
      continue
    }
    fs.mkdirSync(chapterDir, { recursive: true })

    try {
      const elapsed = formatDuration(Date.now() - startTime)
      const eta =
        done > 0 ? formatDuration(((Date.now() - startTime) / (i + 1)) * (total - i - 1)) : '--'
      process.stdout.write(
        `\r  ${progressBar(i + 1, total)}  ${i + 1}/${total}  ${elapsed}  ETA ${eta}  ${outputName.padEnd(14)}`
      )

      const html = await fetchPage(url)
      const extractor = getExtractor(url)
      const raw = extractor.extract(html, name, bookTitle)

      if (!raw || raw.trim().length < MIN_CONTENT_CHARS) {
        failed++
        errors.push({
          chapter: name,
          url,
          reason: !raw ? '内容提取失败' : `内容过短 (${raw.trim().length} 字符)`,
        })
        process.stdout.write(` ✗ ${errors[errors.length - 1].reason}\n`)
        continue
      }

      let content = formatSourceMarkdown(outputName, cleanContent(raw))
      if (catalog.glyphStrategy === '简体规范化') {
        content = t2s(content)
      }
      fs.writeFileSync(outPath, content, 'utf-8')
      done++
      if (i < total - 1) await sleep(randomDelay())
    } catch (err) {
      failed++
      errors.push({ chapter: name, url, reason: err.message })
      process.stdout.write(` ✗ ${err.message}\n`)
    }
  }

  process.stdout.write('\n')

  if (!isBatch) {
    const validNames = new Set(
      catalog.glyphStrategy === '简体规范化' ? chapterNames.map(n => t2s(n)) : chapterNames
    )
    for (const d of fs.readdirSync(outDir)) {
      if (!validNames.has(d)) fs.rmSync(path.join(outDir, d), { recursive: true })
    }
  }

  if (errors.length > 0) {
    const logPath = path.join(ROOT, 'fetch-errors.log')
    fs.writeFileSync(
      logPath,
      errors.map(e => `[${bookSlug}] ${e.chapter} | ${e.url} | ${e.reason}`).join('\n') + '\n'
    )
  }

  return { done, skipped, failed }
}

const discoverBooks = targetSlug => {
  const dirs = fs
    .readdirSync(BOOKS_DIR)
    .filter(
      f =>
        fs.statSync(path.join(BOOKS_DIR, f)).isDirectory() &&
        fs.existsSync(path.join(BOOKS_DIR, f, 'catalog.md'))
    )
  return targetSlug ? dirs.filter(d => d === targetSlug) : dirs
}

export async function runMain(argv) {
  const force = argv.includes('--force')
  const dryRun = argv.includes('--dry-run')
  const positional = argv.filter(a => !a.startsWith('-'))
  const [targetSlug, ...chapterArgs] = positional
  const targetChapters =
    chapterArgs.length > 0
      ? chapterArgs.flatMap(a => a.split(',')).map(s => s.trim()).filter(Boolean)
      : []

  const books = discoverBooks(targetSlug)
  if (books.length === 0) {
    console.log('未发现含 catalog.md 的典籍。')
    return
  }

  console.log(`🔧 fetch-source run — 通用典籍原文抓取`)
  console.log(`   FORCE=${force}  DRY_RUN=${dryRun}`)
  console.log(`   发现 ${books.length} 本书: ${books.join(', ')}\n`)

  let totalDone = 0,
    totalSkipped = 0,
    totalFailed = 0
  for (const book of books) {
    console.log(`📖 ${book}`)
    const { done, skipped, failed } = await processBook(
      book,
      targetChapters.length > 0 ? targetChapters : null,
      { force, dryRun }
    )
    console.log(`  ${failed === 0 ? '✅' : '⚠️'} ${done} 新建, ${skipped} 跳过, ${failed} 失败\n`)
    totalDone += done
    totalSkipped += skipped
    totalFailed += failed
  }
  console.log(`✅ 总计: ${totalDone} 新建, ${totalSkipped} 跳过, ${totalFailed} 失败`)
}
```

- [ ] **Step 4.2: 语法检查**

Run: `node --check scripts/fetch-source/run.js`
Expected: 无输出(退出码 0)

- [ ] **Step 4.3: Commit**

```bash
git add scripts/fetch-source/run.js
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 抽 run subcommand 主体(原 fetch-sources.js 主流程)"
```

---

## Task 5: 创建 `scripts/fetch-source/wiki.js`(wiki subcommand 主体)

**Files:**
- Create: `scripts/fetch-source/wiki.js`

- [ ] **Step 5.1: 写入 `scripts/fetch-source/wiki.js`**

行为 = 旧 `fetch-wikisource.js:337-425`,**加 catalog 存在性硬校验**(缺失则建,存在则退出码 2):

```javascript
/**
 * scripts/fetch-source/wiki.js — wiki subcommand 主体
 *
 * 行为与原 fetch-wikisource.js 字节级一致(用 format.js 替代内联 formatSourceMarkdown
 * + extractors/wikisource.js 的 preprocessWikisourceContent 替代原 namedComment 规则),
 * 加 catalog 存在性硬校验:缺失则建,存在则退出码 2。
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { progressBar, formatDuration } from '../lib/utils.js'
import { cleanContent, formatSourceMarkdown } from './format.js'
import { parseFullView, preprocessWikisourceContent } from './extractors/wikisource.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const BOOKS_DIR = path.join(ROOT, 'books')
const DELAY_MS = 300

const WIKI_BOOKS = {
  紫微斗数全书: {
    slug: '紫微斗数全书',
    fullViewUrl:
      'https://zh.wikisource.org/wiki/%E7%B4%AB%E5%BE%AE%E6%96%97%E6%95%B8%E5%85%A8%E6%9B%B8/%E5%85%A8%E8%A6%BD',
    tocUrl:
      'https://zh.wikisource.org/w/index.php?title=%E7%B4%AB%E5%BE%AE%E6%96%97%E6%95%B8%E5%85%A8%E6%9B%B8&action=raw',
    meta: {
      author: '[宋] 陈抟 撰',
      version: '据《正统道藏》本',
      description: '紫微斗数经典著作，托名宋初陈抟撰。包含太微赋、骨髓赋等核心赋文及安星诀法。',
      shushu: '命',
      category: '紫微斗数',
      contentTypes: 'source, interpretation',
    },
  },
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fetchHtml = async url => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WikisourceFetcher/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

const buildCatalogFromChapters = chapters => {
  const volumes = []
  let currentVolume = null
  let idCounter = 0
  for (const ch of chapters) {
    if (ch.volume !== currentVolume?.title) {
      if (currentVolume) volumes.push(currentVolume)
      currentVolume = { title: ch.volume, chapters: [] }
    }
    idCounter++
    currentVolume.chapters.push({
      id: String(idCounter).padStart(2, '0'),
      name: ch.name,
      status: '待解读',
    })
  }
  if (currentVolume) volumes.push(currentVolume)
  return volumes
}

const renderCatalogMd = (bookTitle, meta, volumes) => {
  const lines = [
    `# 《${bookTitle}》`,
    '',
    `> 作者：${meta.author}`,
    `> 版本：${meta.version}`,
    `> 简介：${meta.description}`,
    `> 术数：${meta.shushu}`,
    `> 类别：${meta.category}`,
    `> 内容类型：${meta.contentTypes}`,
    `> 来源：维基文库（zh.wikisource.org）`,
    '',
  ]
  for (const vol of volumes) {
    lines.push(`## ${vol.title}`)
    lines.push('')
    lines.push('| 编号 | 篇名 | 状态 |')
    lines.push('| ---- | ---- | ---- |')
    for (const ch of vol.chapters) {
      lines.push(`| ${ch.id} | ${ch.name} | ${ch.status} |`)
    }
    lines.push('')
  }
  lines.push('---')
  lines.push('')
  lines.push('**备注：**')
  lines.push('- 篇章列表来源为维基文库《紫微斗数全书》页面目录')
  lines.push('- 原文由 fetch-source wiki 自动抓取自维基文库全览页面')
  lines.push('- 维基文库内容为公有领域（清朝作品），可自由使用')
  return lines.join('\n') + '\n'
}

const processBook = async (bookSlug, dryRun) => {
  const config = WIKI_BOOKS[bookSlug]
  if (!config) {
    console.log(`  ⚠️ 未找到 "${bookSlug}" 的 wikisource 配置`)
    return false
  }
  const bookDir = path.join(BOOKS_DIR, bookSlug)
  const articlesDir = path.join(bookDir, 'articles')
  const catalogPath = path.join(bookDir, 'catalog.md')
  const startTime = Date.now()

  console.log(`📖 ${bookSlug}`)

  console.log('  获取全览页面...')
  let html
  try {
    html = await fetchHtml(config.fullViewUrl)
  } catch (err) {
    console.log(`  ❌ 获取失败: ${err.message}`)
    return false
  }
  const chapters = parseFullView(html)
  if (!chapters || chapters.length === 0) {
    console.log('  ❌ 解析章节失败')
    return false
  }
  console.log(`  解析到 ${chapters.length} 个章节`)

  if (dryRun) {
    console.log('  [dry-run] 章节列表:')
    for (const ch of chapters.slice(0, 10)) {
      console.log(`    ${ch.volume} / ${ch.name} (${ch.content.length} 字符)`)
    }
    if (chapters.length > 10) console.log(`    ...等${chapters.length}篇`)
    return true
  }

  // ★ 新增: catalog 存在性硬校验
  if (fs.existsSync(catalogPath)) {
    console.error(`  ❌ catalog.md 已存在 (${catalogPath})`)
    console.error(`     wiki subcommand 仅在 catalog 缺失时建库;若需追加 source,请用 run subcommand`)
    process.exit(2)
  }

  const volumes = buildCatalogFromChapters(chapters)
  fs.mkdirSync(bookDir, { recursive: true })
  fs.writeFileSync(catalogPath, renderCatalogMd(bookSlug, config.meta, volumes), 'utf-8')
  console.log(`  ✅ catalog.md (${volumes.length} 卷)`)

  fs.mkdirSync(articlesDir, { recursive: true })
  let written = 0,
    skipped = 0,
    failed = 0

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i]
    const chapterDir = path.join(articlesDir, ch.name)
    const outPath = path.join(chapterDir, 'source.md')

    try {
      const elapsed = formatDuration(Date.now() - startTime)
      const eta =
        i > 0
          ? formatDuration(((Date.now() - startTime) / (i + 1)) * (chapters.length - i - 1))
          : '--'
      process.stdout.write(
        `\r  ${progressBar(i + 1, chapters.length)}  ${i + 1}/${chapters.length}  ${elapsed}  ETA ${eta}  ${ch.name.slice(0, 20).padEnd(20)}`
      )

      if (fs.existsSync(outPath)) {
        skipped++
        continue
      }

      fs.mkdirSync(chapterDir, { recursive: true })
      const preprocessed = preprocessWikisourceContent(cleanContent(ch.content))
      const formatted = formatSourceMarkdown(ch.name, preprocessed)
      fs.writeFileSync(outPath, formatted, 'utf-8')
      written++

      if (i < chapters.length - 1) await sleep(DELAY_MS)
    } catch (err) {
      failed++
      process.stdout.write(` ✗ ${ch.name}: ${err.message}\n`)
    }
  }

  process.stdout.write('\n')
  console.log(`  ✅ ${written} 新建, ${skipped} 跳过, ${failed} 失败`)
  return true
}

export async function wikiMain(argv) {
  const dryRun = argv.includes('--dry-run')
  const positional = argv.filter(a => !a.startsWith('-'))
  const targetSlug = positional[0]

  const books = targetSlug ? (WIKI_BOOKS[targetSlug] ? [targetSlug] : []) : Object.keys(WIKI_BOOKS)
  if (books.length === 0) {
    console.log(`未找到 wikisource 配置的书籍: ${targetSlug || '(无)'}`)
    console.log(`可用书籍: ${Object.keys(WIKI_BOOKS).join(', ')}`)
    return
  }

  console.log(`🔧 fetch-source wiki — 维基文库典籍抓取`)
  console.log(`   DRY_RUN=${dryRun}`)
  console.log(`   发现 ${books.length} 本书: ${books.join(', ')}\n`)

  let ok = 0,
    fail = 0
  for (const book of books) {
    const result = await processBook(book, dryRun)
    result ? ok++ : fail++
    console.log('')
  }
  console.log(`✅ 完成: ${ok} 成功, ${fail} 失败`)
}
```

- [ ] **Step 5.2: 语法检查**

Run: `node --check scripts/fetch-source/wiki.js`
Expected: 无输出(退出码 0)

- [ ] **Step 5.3: Commit**

```bash
git add scripts/fetch-source/wiki.js
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 抽 wiki subcommand 主体 + catalog 存在性硬校验"
```

---

## Task 6: 创建 `scripts/fetch-source.js`(唯一入口)

**Files:**
- Create: `scripts/fetch-source.js`

- [ ] **Step 6.1: 写入 `scripts/fetch-source.js`**

```javascript
#!/usr/bin/env node
/**
 * scripts/fetch-source.js — 典籍原文批量抓取统一入口
 *
 * 用法:
 *   node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
 *   node scripts/fetch-source.js wiki <slug> [--dry-run]
 *   node scripts/fetch-source.js --help
 *
 * run: 通用抓取(iwzbz.com + generic),需已有 catalog.md + catalog.html
 * wiki: 维基文库全览页抓取,首次运行同时建 catalog.md
 */

import { runMain } from './fetch-source/run.js'
import { wikiMain } from './fetch-source/wiki.js'

const HELP = `用法:
  node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
  node scripts/fetch-source.js wiki <slug> [--dry-run]
  node scripts/fetch-source.js --help

Subcommand:
  run   通用典籍抓取 (需 books/<slug>/catalog.md + catalog.html)
  wiki  维基文库全览页抓取 (首次运行建 catalog.md;已存在则拒绝)`

const subcommand = process.argv[2]
const rest = process.argv.slice(3)

if (subcommand === 'run') {
  await runMain(rest)
} else if (subcommand === 'wiki') {
  await wikiMain(rest)
} else {
  console.log(HELP)
  process.exit(subcommand === '--help' || subcommand === '-h' ? 0 : 1)
}
```

- [ ] **Step 6.2: 语法检查 + 帮助**

Run:
```bash
node --check scripts/fetch-source.js
node scripts/fetch-source.js --help
```
Expected: 第二条命令打印 HELP 多行文本

- [ ] **Step 6.3: Commit**

```bash
git add scripts/fetch-source.js
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 新建唯一 CLI 入口 + subcommand 分发"
```

---

## Task 7: 删除旧脚本

**Files:**
- Delete: `scripts/fetch-sources.js`
- Delete: `scripts/fetch-wikisource.js`

- [ ] **Step 7.1: 删除两个旧文件**

Run:
```bash
git rm scripts/fetch-sources.js scripts/fetch-wikisource.js
```
Expected: 两文件从 git 移除

- [ ] **Step 7.2: Commit**

```bash
git -c core.hooksPath=/dev/null commit -m "refactor(fetch-source): 删除旧 fetch-sources/fetch-wikisource 入口"
```

---

## Task 8: 同步 5+ 处 skill/文档引用

**Files:**
- Modify: `.claude/skills/source-create/shared/sources/script.md:14,17`
- Modify: `.claude/skills/source-create/shared/strategy.md:23,49,52,55`
- Modify: `.claude/skills/source-create/shared/gate.md:14`
- Modify: `.claude/skills/source-create/SKILL.md:18,64`
- Modify: `.claude/skills/book-create/shared/sources/url.md:24`
- Modify: `docs/DEVELOPMENT_GUIDE.md:150-151`
- Modify: `docs/TECH_STACK.md:461-462`
- Modify: `README.md:115-116`

- [ ] **Step 8.1: 改 source-create/shared/sources/script.md**

把:
```
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force --dry-run

   # 实跑
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force
```
改成:
```
   node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force --dry-run

   # 实跑
   node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force
```

- [ ] **Step 8.2: 改 source-create/shared/strategy.md**

4 处命令全部 `scripts/fetch-sources.js` → `scripts/fetch-source.js run`(行 23、49、52、55)。

- [ ] **Step 8.3: 改 source-create/shared/gate.md:14**

把 `走 fetch-sources.js 批量通道` 改成 `走 fetch-source.js run 批量通道`。

- [ ] **Step 8.4: 改 source-create/SKILL.md**

- 行 18:`调 fetch-sources.js` → `调 fetch-source.js run`
- 行 64:`走 fetch-sources.js 通道` → `走 fetch-source.js run 通道`

- [ ] **Step 8.5: 改 book-create/shared/sources/url.md:24**

把 `fetch-sources.js` 改成 `fetch-source.js`(文字提及)。

- [ ] **Step 8.6: 改 docs/DEVELOPMENT_GUIDE.md:150-151**

```
├── fetch-sources.js        # 通用原文抓取
├── fetch-wikisource.js     # 维基文库抓取（紫微）
```
改成:
```
├── fetch-source.js         # 典籍原文抓取统一入口 (run/wiki subcommand)
├── fetch-source/           # 内部模块 (format / extractors / run / wiki)
```

- [ ] **Step 8.7: 改 docs/TECH_STACK.md:461-462**

| `fetch-sources.js` | ... | → | `fetch-source.js` | ... |
| `fetch-wikisource.js` | ... | → | (随 fetch-source.js 合并) | ... |

- [ ] **Step 8.8: 改 README.md:115-116**

同 Step 8.6 的目录树注释。

- [ ] **Step 8.9: 全仓 grep 验证旧路径清零**

Run:
```bash
grep -rn "scripts/fetch-sources\.js\|scripts/fetch-wikisource\.js" --include="*.md" --include="*.js" --include="*.json" --include="*.sh" .
```
Expected: 0 命中

- [ ] **Step 8.10: Commit**

```bash
git add .claude/skills/ docs/ README.md
git -c core.hooksPath=/dev/null commit -m "docs: 同步 fetch-source 路径引用 (5+ 处 skill/文档)"
```

---

## Task 9: 端到端验收(10 项,见 design spec §七)

**Files:** 无,只跑命令

- [ ] **Step 9.1: 验收 #1 旧脚本已删**

Run: `ls scripts/fetch-sources.js scripts/fetch-wikisource.js 2>&1`
Expected: 两个文件均"无此文件或目录"

- [ ] **Step 9.2: 验收 #2 新入口可执行**

Run: `node scripts/fetch-source.js --help`
Expected: 打印 HELP 三段(Subcommand: run / wiki)

- [ ] **Step 9.3: 验收 #3 run 模式 dry-run 命中**

Run: `node scripts/fetch-source.js run 滴天髓阐微 --dry-run`
Expected: 打印 `《滴天髓阐微》 catalog.md: N 篇, 匹配 URL: M 篇` + `[dry-run] 将抓取 M 篇`

- [ ] **Step 9.4: 验收 #4 wiki 模式 dry-run 命中**

Run: `node scripts/fetch-source.js wiki 紫微斗数全书 --dry-run`
Expected: 打印 `📖 紫微斗数全书` + `解析到 N 个章节` + `[dry-run] 章节列表:`

- [ ] **Step 9.5: 验收 #5 wiki 模式拒绝重复建库**

Run:
```bash
# 先 dry-run 一次(不建 catalog)
node scripts/fetch-source.js wiki 紫微斗数全书 --dry-run
# 此时 catalog 还不存在
# 真实跑(建 catalog)
node scripts/fetch-source.js wiki 紫微斗数全书 2>&1 | head -5
# 实际跑前先确保可中断: Ctrl+C 或等结束
# 然后再跑同命令
node scripts/fetch-source.js wiki 紫微斗数全书
echo "exit code: $?"
```
Expected: 第二次跑 exit code = 2,stderr 包含 "catalog.md 已存在"

- [ ] **Step 9.6: 验收 #6 run 模式实际产出**

Run: `node scripts/fetch-source.js run 滴天髓阐微 八格 --force`
Expected: 进度条 + `1 新建, 0 跳过, 0 失败`(假设 八格 未录;若已录则 0 新建)

- [ ] **Step 9.7: 验收 #7 字节级 diff(核心)★**

**这是最关键的验收**。挑 1 篇未录篇章跑:

```bash
# 挑 1 篇确认未录(示例: 神峰通考 的"弃命从财")
ls books/神峰通考/articles/弃命从财/source.md 2>&1
# 若存在则跳过此验收,另选 1 篇

# 跑
node scripts/fetch-source.js run 神峰通考 弃命从财 --force
# 备份产出
cp books/神峰通考/articles/弃命从财/source.md /tmp/new-source.md

# 用 git checkout 旧版本产出(若 git 历史里有)
git log --oneline --all -- books/神峰通考/articles/弃命从财/source.md | head -3
# 假设找到 commit X
git show X:books/神峰通考/articles/弃命从财/source.md > /tmp/old-source.md
diff /tmp/old-source.md /tmp/new-source.md
```

Expected: diff 无输出(字节级一致)

若 git 历史里没有该 source.md(因为本次是首次录入),此验收改为"视觉抽样检查"——看新产出包含 H1 标题 + 正文 + (若有)注家块引用,格式与同书其他篇一致。

- [ ] **Step 9.8: 验收 #8 旧路径清零**

Run:
```bash
grep -rn "scripts/fetch-sources\.js\|scripts/fetch-wikisource\.js" --include="*.md" --include="*.js" --include="*.json" --include="*.sh" --include="*.cjs" .
```
Expected: 0 命中

- [ ] **Step 9.9: 验收 #9 t2s 行为不变**

找 1 本字形策略=简体规范化的书(滴天髓阐微 / 千里命稿 等),跑 1 篇,检查输出仍是简体。

Run:
```bash
# 查看哪本书字形策略=简体规范化
grep -l "字形策略：简体规范化" books/*/catalog.md
# 假设是 千里命稿,跑其中 1 篇
node scripts/fetch-source.js run 千里命稿 <某篇> --force
# 检查输出文件不含 "複"、"乾"、"餘" 等常见繁简差异字
```
Expected: 输出文件主体字符为简体

- [ ] **Step 9.10: 验收 #10 wiki 字节级 diff**

紫微斗数全书**已存在** catalog.md(验收 #5 已建),所以 wiki 模式无法重跑。改为:

```bash
# 验证 catalog.md 内容与原 fetch-wikisource.js 产出一致
diff <(cat books/紫微斗数全书/catalog.md) <(git show HEAD~7:books/紫微斗数全书/catalog.md 2>/dev/null)
```

Expected: 仅可能的差异点 = `fetch-wikisource.js` 字样 → `fetch-source wiki`(已在 `renderCatalogMd` 的备注行里改)。除此以外 diff 为空。

- [ ] **Step 9.11: 最终 commit(若有调整)**

若验收 #7 / #10 发现格式漂移,**回退**对应 commit,逐个排查;不要直接修。
若全通过,此任务不产生 commit。

---

## Task 10: 落盘完成,打总结 commit

- [ ] **Step 10.1: 创建 README 说明**

Create: `scripts/fetch-source/README.md`(用法 + 内部模块结构):

```markdown
# fetch-source — 典籍原文抓取工具集

`scripts/fetch-source.js` 是统一入口,两个 subcommand:

- `run` — 通用抓取(iwzbz.com + generic),需已有 `catalog.md` + `catalog.html`
- `wiki` — 维基文库全览页抓取,首次运行建 `catalog.md`;已存在则拒绝

## 用法

\`\`\`bash
node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
node scripts/fetch-source.js wiki <slug> [--dry-run]
\`\`\`

## 内部模块

\`\`\`
scripts/fetch-source/
├── format.js                 # 共享 source.md 格式化纯函数
├── run.js                    # run subcommand 主体
├── wiki.js                   # wiki subcommand 主体
└── extractors/
    ├── iwzbz.js              # iwzbz.com 提取器
    ├── generic.js            # generic 通用文本提取
    └── wikisource.js         # wikisource 解析 + 预处理
\`\`\`

## 行为契约

`run` 模式读 `catalog.md` 的 `字形策略` 字段,仅 `简体规范化` 时启用 t2s。
`wiki` 模式不再使用 t2s(维基文库本身简体)。
所有 `source.md` 产出的字节级行为与重构前完全一致,只改调用语法。
```

- [ ] **Step 10.2: Commit README**

```bash
git add scripts/fetch-source/README.md
git -c core.hooksPath=/dev/null commit -m "docs(fetch-source): 模块说明 README"
```

- [ ] **Step 10.3: 验收 #1-#10 全过,在主入口加一行注释**

`scripts/fetch-source.js` 第 1 行已有 shebang。无需额外改动。

Run:
```bash
git status
```
Expected: 工作区干净。

---

## 收尾

- 所有 10 个验收项在 Task 9 已逐项验证
- 工作区干净(`git status` 无输出)
- 5+ 处 skill/文档同步更新
- 单入口 `scripts/fetch-source.js` + 6 个新内部模块
- 2 个旧入口已删除

执行方通过 superpowers:subagent-driven-development (推荐) 或 superpowers:executing-plans 完成本计划。
