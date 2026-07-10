#!/usr/bin/env node
/**
 * scripts/generate-book-cover.js — 一键批量生成古籍封面
 *
 * 扫描 books 下各书的 catalog.md，提取书名/作者，用模板底图 + 文字叠加生成封面。
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
import { createRequire } from 'node:module'
import { renderTextOverlay } from './lib/image-gen/text-overlay.js'
import { ensureFontsInstalled, logInstallSummary } from './lib/shared/font-installer.js'
import { parseCatalogMd, resolveTexts, scaleTextsToCanvas, buildMetadata } from './lib/generate-book-cover/core.js'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const BOOKS_DIR = path.join(PROJECT_ROOT, 'books')
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images')

const DEFAULT_MEATADATA_PATH = 'public/images/template/墨兰鎏金-古籍封面.json'

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
        opts.books = (argv[i + 1] || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        i++
        break
      case '--metadata':
        opts.metadataPath = argv[i + 1] || null
        i++
        break
      case '--help':
        opts.help = true
        break
      default:
        if (argv[i].startsWith('--')) {
          console.warn(`⚠️  未知选项: ${argv[i]}`)
        }
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
      backgroundPath: meta.backgroundPath,
      refCanvas: meta.refCanvas || null,
      texts: meta.textOverlay.texts,
    }
  } catch (err) {
    console.error(`❌ 模板解析失败: ${err.message}`)
    process.exit(1)
  }
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
    const filtered = books.filter(b => opts.books.includes(b.slug) || opts.books.includes(b.title))
    if (filtered.length === 0) {
      console.error(`❌ 未找到匹配的书籍: ${opts.books.join(', ')}`)
      console.error(`   可用书籍: ${books.map(b => b.slug).join(', ')}`)
      process.exit(1)
    }
    const notFound = opts.books.filter(
      name => !books.some(b => b.slug === name || b.title === name)
    )
    if (notFound.length > 0) {
      console.warn(`⚠️  未找到: ${notFound.join(', ')}`)
    }
    books = filtered
  }

  console.log(`\n📚 扫描到 ${books.length} 本书籍`)

  // 加载模板
  const template = loadTemplate(opts.metadataPath || DEFAULT_MEATADATA_PATH)
  const bgPath = path.isAbsolute(template.backgroundPath)
    ? template.backgroundPath
    : path.resolve(PROJECT_ROOT, template.backgroundPath)
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

    // 解析文字（占位符替换 + charCount 字号缩放，size 为基准画布像素值）
    const texts = resolveTexts(template.texts, book)
    if (texts.length === 0) {
      console.warn(`   ⚠️  文字解析结果为空，跳过`)
      failed++
      continue
    }

    // 按实际画布宽度归一化字号（模板 refCanvas → 实际背景图宽）
    const { width: canvasWidth } = await sharp(bgPath).metadata()
    const scaledTexts = template.refCanvas
      ? scaleTextsToCanvas(texts, template.refCanvas, canvasWidth)
      : texts

    for (const t of scaledTexts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} size=${t.size} @ ${JSON.stringify(t.position)}`
      )
    }

    try {
      // 渲染文字叠加
      await renderTextOverlay(bgPath, scaledTexts, imagePath)

      // 保存 metadata
      const stat = fs.statSync(imagePath)
      const metadata = buildMetadata({
        book,
        texts: scaledTexts,
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

const isMain =
  process.argv[1] && path.basename(process.argv[1]).replace(/\.js$/, '') === 'generate-book-cover'
if (isMain) {
  main().catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
}
