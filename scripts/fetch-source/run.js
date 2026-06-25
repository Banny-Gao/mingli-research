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