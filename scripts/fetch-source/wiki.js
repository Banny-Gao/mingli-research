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