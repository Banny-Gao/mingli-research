#!/usr/bin/env node
/**
 * fetch-wikisource.js — 从维基文库全览页面批量生成 source.md + catalog.md
 *
 * 用法:
 *   node scripts/fetch-wikisource.js                                           # 全部书籍
 *   node scripts/fetch-wikisource.js 紫微斗数全书                                # 单本书
 *   node scripts/fetch-wikisource.js --dry-run                                  # 预览
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { progressBar, formatDuration } from './lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const BOOKS_DIR = path.join(ROOT, 'books')
const DRY_RUN = process.argv.includes('--dry-run')
const DELAY_MS = 300

// ===== wikisource 全览页 URL 配置 =====
// 新增书籍在此添加一条即可

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
      contentTypes: 'source, interpretation, skill',
    },
  },
}

// ===== 工具 =====

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const fetchHtml = async url => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WikisourceFetcher/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

const fetchRaw = async url => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WikisourceFetcher/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ===== 章节解析 =====

const stripHtmlTags = html => html.replace(/<[^>]+>/g, '')

const parseFullView = html => {
  // 提取 mw-parser-output 内容容器
  let body = ''
  const parserMatch = html.match(/<div[^>]*class="[^"]*mw-parser-output[^"]*"[^>]*>([\s\S]+)$/i)
  if (parserMatch) {
    body = parserMatch[1]
    // 尝试在末尾截断（去掉分类、许可等后续 div）
    const trimRe =
      /<div[^>]*(?:id="(?:catlinks|mw-data-after-content|license)"|class="[^"]*printfooter)/i
    const trimMatch = body.match(trimRe)
    if (trimMatch) {
      body = body.slice(0, trimMatch.index)
    }
  }
  if (!body) {
    // 备用：直接取 bodyContent
    const altMatch = html.match(/<div[^>]*id="bodyContent"[^>]*>([\s\S]+)$/i)
    if (!altMatch) return null
    body = altMatch[1]
  }
  if (!body) return null

  const chapters = []
  let currentVolume = ''
  let currentChapter = null

  // 按 mw-heading div 分割（h2=卷, h3/h4=篇章）
  const sections = body.split(/(?=<div\s+class="mw-heading\s+mw-heading[234])/i)

  for (const section of sections) {
    const h2Match = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    const h3Match = section.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    const h4Match = section.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i)

    if (h2Match) {
      currentVolume = stripHtmlTags(h2Match[1])
        .replace(/\[编辑\]/g, '')
        .trim()
      continue
    }

    const heading = h3Match || h4Match
    if (heading) {
      if (currentChapter && currentChapter.content.trim()) {
        chapters.push(currentChapter)
      }
      currentChapter = {
        volume: currentVolume,
        name: stripHtmlTags(heading[1])
          .replace(/\[编辑\]/g, '')
          .trim(),
        content: '',
      }
      // 不 continue — 同一 section 内 heading 后面就是正文
    }

    if (currentChapter) {
      // 提取 <p> 标签内容
      const pMatches = section.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
      if (pMatches) {
        for (const p of pMatches) {
          let text = stripHtmlTags(p).trim()
          text = text.replace(/\[编辑\]/g, '').trim()
          if (text) currentChapter.content += text + '\n\n'
        }
      }
      // 提取 <div class="poem"> 中的诗歌内容
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

// ===== 内容清理 =====

const cleanContent = text => {
  // 合并多余空行
  let cleaned = text.replace(/\n{3,}/g, '\n\n').trim()

  // 处理 wiki 注释格式：将注家标识转为 SPEC-source 兼容格式
  // 希夷先生曰、玉蟾先生曰等 → 保持原样（由 formatSourceMarkdown 处理）
  // 答曰: → 保持原文
  // 歌曰 → 保持原文

  return cleaned
}

// ===== catalog.md 生成 =====

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
      skills: '',
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
    lines.push('| 编号 | 篇名 | 状态 | 关联技能 |')
    lines.push('| ---- | ---- | ---- | -------- |')
    for (const ch of vol.chapters) {
      lines.push(`| ${ch.id} | ${ch.name} | ${ch.status} | ${ch.skills} |`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('**备注：**')
  lines.push('- 篇章列表来源为维基文库《紫微斗数全书》页面目录')
  lines.push('- 原文由 fetch-wikisource.js 自动抓取自维基文库全览页面')
  lines.push('- 维基文库内容为公有领域（清朝作品），可自由使用')

  return lines.join('\n') + '\n'
}

// ===== SPEC-source 格式化 =====

const cleanSourceContent = text => {
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim()
      if (/^第\s*[一二三四五六七八九十百千\d]+\s*页\s*$/.test(t)) return false
      return true
    })
    .join('\n')
}

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

const formatSourceMarkdown = (chapterName, rawContent) => {
  const lines = rawContent.split('\n').map(l => l.trim())
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

    // 处理 wikisource 中常见的注家格式：某某先生曰: / 答曰:
    const namedComment = line.match(/^(.{2,8}(?:先生|真人|道人|曰))[：:]\s*(.*)/)
    if (namedComment && !/^(歌曰|例曰|眉批)/.test(namedComment[1])) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = {
        marker: `【${namedComment[1]}】`,
        lines: namedComment[2] ? [namedComment[2]] : [],
      }
      continue
    }

    // 答曰:
    const answerMatch = line.match(/^答曰[：:]\s*(.*)/)
    if (answerMatch) {
      if (currentBlock) annotationBlocks.push({ ...currentBlock })
      inMain = false
      currentBlock = { marker: '【答曰】', lines: answerMatch[1] ? [answerMatch[1]] : [] }
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

  return (
    parts
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

// ===== 主流程 =====

const processBook = async bookSlug => {
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

  // 1. 获取全览页面，解析章节
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

  if (DRY_RUN) {
    console.log('  [dry-run] 章节列表:')
    for (const ch of chapters.slice(0, 10)) {
      console.log(`    ${ch.volume} / ${ch.name} (${ch.content.length} 字符)`)
    }
    if (chapters.length > 10) console.log(`    ...等${chapters.length}篇`)
    return true
  }

  // 2. 从已解析的章节生成 catalog.md
  const volumes = buildCatalogFromChapters(chapters)
  fs.mkdirSync(bookDir, { recursive: true })
  fs.writeFileSync(catalogPath, renderCatalogMd(bookSlug, config.meta, volumes), 'utf-8')
  console.log(`  ✅ catalog.md (${volumes.length} 卷)`)

  // 3. 写入 source.md
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
      const cleaned = cleanSourceContent(cleanContent(ch.content))
      const formatted = formatSourceMarkdown(ch.name, cleaned)
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

// ===== 入口 =====

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const targetSlug = args[0]

const books = targetSlug ? (WIKI_BOOKS[targetSlug] ? [targetSlug] : []) : Object.keys(WIKI_BOOKS)

if (books.length === 0) {
  console.log(`未找到 wikisource 配置的书籍: ${targetSlug || '(无)'}`)
  console.log(`可用书籍: ${Object.keys(WIKI_BOOKS).join(', ')}`)
  process.exit(0)
}

console.log(`🔧 fetch-wikisource.js — 维基文库典籍抓取`)
console.log(`   DRY_RUN=${DRY_RUN}`)
console.log(`   发现 ${books.length} 本书: ${books.join(', ')}\n`)

let ok = 0,
  fail = 0
for (const book of books) {
  const result = await processBook(book)
  result ? ok++ : fail++
  console.log('')
}

console.log(`✅ 完成: ${ok} 成功, ${fail} 失败`)
