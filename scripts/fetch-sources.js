#!/usr/bin/env node
/**
 * fetch-sources.js — 批量抓取典籍原文，生成符合 SPEC-source 的 source.md
 *
 * 完全通用：自动发现 books/ 下所有含 catalog.md 的典籍。
 * 新增典籍只需放入 catalog.html + catalog.md 即可，无需修改本脚本。
 *
 * 用法:
 *   node scripts/fetch-sources.js                    # 全部书籍
 *   node scripts/fetch-sources.js 滴天髓阐微          # 单本书
 *   node scripts/fetch-sources.js 滴天髓阐微 八格     # 单篇章
 *   node scripts/fetch-sources.js --force --dry-run   # 预览
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { stripHtml, progressBar, formatDuration } from './lib/utils.js'
import { t2s } from './t2s.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const BOOKS_DIR = path.join(ROOT, 'books')
const DELAY_MS = 500
const DELAY_JITTER = 500 // 随机抖动量，实际延迟 500-1000ms
const MAX_RETRIES = 3
const RETRY_BASE_MS = 2000
const MIN_CONTENT_CHARS = 20
const FORCE = process.argv.includes('--force')
const DRY_RUN = process.argv.includes('--dry-run')
const USER_AGENT = 'Mozilla/5.0 (compatible; BookArchiver/1.0)'

// ===== 工具 =====

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
const normalizeBlankLines = text => text.replace(/\n{3,}/g, '\n\n').trim()

// ===== catalog.md 解析 =====

const parseCatalogMd = bookDir => {
  const p = path.join(bookDir, 'catalog.md')
  if (!fs.existsSync(p)) return null
  const content = fs.readFileSync(p, 'utf-8')
  const bookTitle = (content.match(/^#\s*《(.+?)》/m) || [])[1] || null

  // 解析字形策略: 截取第一个 ## 之前的 metadata blockquote
  const firstSectionIndex = content.search(/^## /m)
  const metadataSection = firstSectionIndex !== -1 ? content.slice(0, firstSectionIndex) : content
  const glyphMatch = metadataSection.match(/^>\s*字形策略[：:]\s*(.+)$/m)
  const glyphStrategy = glyphMatch ? glyphMatch[1].trim() : null

  const names = content
    .split('\n')
    .map(l =>
      l
        .trim()
        .split('|')
        .map(c => c.trim())
        .filter(c => c)
    )
    .filter(cells => cells.length >= 2 && /^\d+$/.test(cells[0]))
    .map(cells => cells[1])
  return { bookTitle, names: names.length > 0 ? names : null, glyphStrategy }
}

// ===== catalog.html 解析 → 篇章名→URL =====

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

// ===== 内容提取器 =====
// 按 URL 域名自动匹配策略。新网站只需添加一个提取器到 EXTRACTORS 数组

const extractParagraphs = (innerHtml, chapterName, opts = {}) => {
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

const extractFromText = (text, chapterName, bookTitle) => {
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

const EXTRACTORS = [
  {
    name: 'iwzbz',
    match: url => /iwzbz\.com/.test(url),
    extract(html, chapterName) {
      const div = html.match(/<div\s+class="book-detail-content">([\s\S]*?)<\/div>/i)
      if (!div) return null
      return extractParagraphs(div[1], chapterName, {
        skipHtml: /^<font\s+class=['"]gold['"]>\s*.+?\s*<\/font>\s*$/i,
      })
    },
  },
  {
    name: 'generic',
    match: () => true,
    extract(html, chapterName, bookTitle) {
      return extractFromText(stripHtml(html), chapterName, bookTitle)
    },
  },
]

function getExtractor(url) {
  return EXTRACTORS.find(ex => ex.match(url)) || EXTRACTORS[EXTRACTORS.length - 1]
}

// ===== 清理 =====

const cleanContent = text =>
  text
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

// ===== SPEC-source 格式化 =====

const renderAnnotationBlock = block => {
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

// ===== 注家/编辑标记规范化 =====
// iwzbz 等站点把"【楠】""《格解》云：""古歌云：""注释：""补曰："等注家/编辑标记
// 全部 dump 为顶格 plain text。本函数把它们转成 `【…】` 块引用 marker 前缀，
// 由 formatSourceMarkdown 的 markerMatch 进一步接管并加 `> ` 与空行。
//
// 4 类模式 → 4 类标签（避免全固定转"注家名"，因为引书/佚名/续注不是注家人名）：
//   1. 具名注家   "XX曰/注 ："   → "【XX】"  (XX 是人名，如楠)
//   2. 引书       "《X》云/注 ：" → "【《X》】" (XX 是书名)
//   3. 佚名占位   "古歌云/旧注曰/诗释/注释/注解" → "【古歌】/【旧注】/【诗释】/【原注】"
//   4. 续注/补    "补曰 / 曰（裸用）" → "【补】/【又】"
//
// 不可识别的模式不转（原样保留到 main body），由 source 自检 warn 提示。

const ANNOTATION_TRANSFORMS = [
  // 1. 具名注家（人名 1-4 字 + 曰/注/云/断/解）
  { re: /^(.{1,4}?)(曰|注|云|断曰|断|解)\s*([：:])\s*(.*)$/, label: m => `【${m[1].trim()}】 ${m[m.length - 1] || ''}` },
  // 2. 引书名（《X》 + 可选"云/注/引诗" + 标点；含繁体"註"、异体"舊"）
  { re: /^《([^》]+)》(?:引诗曰|引诗|云|註|注|歌|舊註曰|舊註)?\s*([：:])\s*(.*)$/, label: m => `【《${m[1]}》】 ${m[m.length - 1] || ''}` },
  // 3. 佚名占位（惯用词）
  { re: /^古歌云\s*[：:]\s*(.*)$/, label: m => `【古歌】 ${m[1] || ''}` },
  { re: /^旧注[曰云]\s*[：:]\s*(.*)$/, label: m => `【旧注】 ${m[1] || ''}` },
  { re: /^诗释\s*[：:]\s*(.*)$/, label: m => `【诗释】 ${m[1] || ''}` },
  { re: /^注释\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^注解\s*[：:]\s*(.*)$/, label: m => `【原注】 ${m[1] || ''}` },
  { re: /^古赋云\s*[：:]\s*(.*)$/, label: m => `【古赋】 ${m[1] || ''}` },
  // 4. 续注/补（裸用）
  { re: /^补曰\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` },
  { re: /^补日\s*[：:]\s*(.*)$/, label: m => `【补】 ${m[1] || ''}` }, // 异体
  { re: /^曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^又曰\s*[：:]\s*(.*)$/, label: m => `【又】 ${m[1] || ''}` },
  { re: /^眉批\s*[：:]\s*(.*)$/, label: m => `【眉批】 ${m[1] || ''}` },
  // 5. 八法子节名（神趣八法/类似篇目专用，2 字独立成行）
  { re: /^(类象|属象|从象|化象|照象|返象|鬼象|伏象)$/, label: m => `【楠·${m[1]}】` },
  // 6. 裸"格言"开篇
  { re: /^格言\s*[：:]\s*(.*)$/, label: m => `【格言】 ${m[1] || ''}` },
]

const transformAnnotations = rawContent => {
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

const formatSourceMarkdown = (chapterName, rawContent) => {
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

// ===== 书籍发现 =====

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

// ===== 模糊匹配 =====

const matchUrl = (name, urlMap) => {
  const exact = urlMap.get(name)
  if (exact) return exact
  for (const [htmlName, url] of urlMap) {
    // 模糊匹配：
    // "正官格" → "内十八格-正官格" (前缀后缀)
    // "碧渊赋" → "碧渊赋(元妙论)" (括号别称)
    // "夹丘格" → "外十八格-夹丘格(拱财格)" (前缀+括号后缀)
    // "女命大义" → "女命大义-1" (子编号)
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

// ===== 主流程 =====

const processBook = async (bookSlug, batchChapters = null) => {
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
  const chapters = [],
    missing = []
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
  if (DRY_RUN) {
    console.log(`  [dry-run] 将抓取 ${chapters.length} 篇`)
    return { done: 0, skipped: chapters.length, failed: 0 }
  }

  fs.mkdirSync(outDir, { recursive: true })

  let done = 0,
    skipped = 0,
    failed = 0
  const errors = [],
    total = chapters.length

  for (let i = 0; i < total; i++) {
    const { name, url } = chapters[i]
    const outputName = catalog.glyphStrategy === '简体规范化' ? t2s(name) : name
    const chapterDir = path.join(outDir, outputName)
    const outPath = path.join(chapterDir, 'source.md')

    if (fs.existsSync(outPath) && !FORCE) {
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
    // 每次运行覆盖日志，避免无限增长
    const existing = fs.existsSync(logPath) && i === 0 ? '' : ''
    fs.writeFileSync(
      logPath,
      errors.map(e => `[${bookSlug}] ${e.chapter} | ${e.url} | ${e.reason}`).join('\n') + '\n'
    )
  }

  return { done, skipped, failed }
}

// ===== 入口 =====

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const [targetSlug, ...chapterArgs] = args
// 支持批量篇章：逗号分隔 或 空格分隔
const targetChapters =
  chapterArgs.length > 0
    ? chapterArgs
        .flatMap(a => a.split(','))
        .map(s => s.trim())
        .filter(Boolean)
    : []
const books = discoverBooks(targetSlug)

if (books.length === 0) {
  console.log('未发现含 catalog.md 的典籍。')
  process.exit(0)
}

console.log(`🔧 fetch-sources.js — 通用典籍原文抓取`)
console.log(`   FORCE=${FORCE}  DRY_RUN=${DRY_RUN}`)
console.log(`   发现 ${books.length} 本书: ${books.join(', ')}\n`)

let totalDone = 0,
  totalSkipped = 0,
  totalFailed = 0
for (const book of books) {
  console.log(`📖 ${book}`)
  const { done, skipped, failed } = await processBook(
    book,
    targetChapters.length > 0 ? targetChapters : null
  )
  console.log(`  ${failed === 0 ? '✅' : '⚠️'} ${done} 新建, ${skipped} 跳过, ${failed} 失败\n`)
  totalDone += done
  totalSkipped += skipped
  totalFailed += failed
}
console.log(`✅ 总计: ${totalDone} 新建, ${totalSkipped} 跳过, ${totalFailed} 失败`)
