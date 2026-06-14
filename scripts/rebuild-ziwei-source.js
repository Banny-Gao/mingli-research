#!/usr/bin/env node
// rebuild-ziwei-source.js — 以维基文库 3 卷底本（已拉到 /tmp/ziwei_j1.raw|j2.raw|j3.raw）
// 为权威，重写 books/紫微斗数全书/articles/*/source.md
//
// 设计原则：
// 1. 维基底本无重复（已用 grep 验证 53 篇标题唯一），任何"重复录入"都是前次脚本事故
// 2. 维基底本 ==卷== 三层 ===篇=== 二层 ====问 X==== 四层
// 3. 篇名映射：维基 "一 命宫" → 本地 "命宫"，"問紫微所主若何？" → "问紫微所主若何？"（繁→简）
// 4. 内容清理：去 poem/wiki markup/[编辑]/ref 标签等
// 5. 不动 catalog.md（结构问题非本任务）
// 6. 不动命宫/source.md 的 `&#160;` 缩进、ASCII 表格、戍/戌异体（属 B 类问题，不属"重复"）

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const BOOK_DIR = path.join(ROOT, 'books', '紫微斗数全书')
const ARTICLES_DIR = path.join(BOOK_DIR, 'articles')

const VOL_RAW = {
  1: '/tmp/ziwei_j1.raw',
  2: '/tmp/ziwei_j2.raw',
  3: '/tmp/ziwei_j3.raw',
}

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

// ===== 繁→简：使用 opencc-js 完整 OpenCC 词典 =====
// 覆盖手写 T2S 表的所有漏字（樞/宮/災/惡/雖/聲/萬/歐/會/衝/斷/賦 等）
import { Converter } from 'opencc-js'
const T2S = Converter({ from: 'tw', to: 'cn' })
const t2s = (s) => T2S(s)

// ===== wiki 标签清理 =====

const stripWiki = text => {
  return text
    // poem 块标签
    .replace(/<\/?poem>/g, '')
    // nowiki / pre
    .replace(/<\/?(nowiki|pre|source)>[\s\S]*?<\/?(nowiki|pre|source)>/g, m => m.replace(/<\/?(nowiki|pre|source)>/g, ''))
    // 简单内联标签 <br> <i> <b> <u>
    .replace(/<\/?(?:br|i|b|u)[^>]*>/g, '')
    // 引用 [编辑] [编辑源代码] 等
    .replace(/\[编辑[^\]]*\]/g, '')
    // ref 标签
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    // 维基链接 [[...|...]] 或 [[...]]
    .replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)
    // 模板 {{...}} 简单去除（保留内容）
    .replace(/\{\{[^}]*?\}\}/g, '')
    // 残留 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 残留 wiki 强调标记 ''' ''' 或 '' ''（粗/斜/粗斜）
    .replace(/'{2,5}([^']+?)'{2,5}/g, '$1')
    // 繁→简（OpenCC 整串转换）
    .replace(/[㐀-鿿]+/g, (m) => t2s(m))
}

// ===== 章节解析（按 h3/h4 切）=====

const parseVolume = (rawText, volNum) => {
  const lines = rawText.split('\n')
  const chapters = [] // { name, level, content: [] }
  let currentChapter = null

  for (const line of lines) {
    // 严格按"首尾连续等号数量"判定层级，避免 h3/h4 互相误捕
    const m = line.match(/^(={2,})\s*(.+?)\s*\1$/)
    if (!m) {
      if (currentChapter) currentChapter.content.push(line)
      continue
    }
    const eq = m[1]
    const title = m[2].trim()
    const level = eq.length // 2==卷 3==篇 4==问 X
    if (level === 2) {
      // 卷级（我们按卷分别解析，不进入章节）
      if (currentChapter) chapters.push(currentChapter)
      currentChapter = null
      continue
    }
    if (level === 3 || level === 4) {
      if (currentChapter) chapters.push(currentChapter)
      currentChapter = { vol: volNum, name: t2s(title), level, content: [] }
      continue
    }
    if (currentChapter) {
      currentChapter.content.push(line)
    }
  }
  if (currentChapter) chapters.push(currentChapter)
  return chapters
}

// ===== 章节内容清理 =====

const cleanContent = (lines) => {
  const text = lines.join('\n')
  let cleaned = stripWiki(text)
  // 合并多余空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()
  return cleaned
}

// ===== 格式化为 SPEC-source 兼容 markdown =====

// SPEC §3.2: 注家注释以 `> 【注家名】` 开头，使用 markdown 块引用包裹
// 块引用内的续行也必须以 `> ` 开头
// 触发条件：注家标识起头（"答曰："/"某某先生曰："/"歌曰"/"例曰"/"眉批：" / "【某人】"）
const ANNOTATION_HEAD_RE = /^(【.+?】|答曰[：:]|歌曰|例曰|眉批[：:]|.{1,8}?(?:先生|真人|道人)[：:])/

const formatMarkdown = (chapterName, cleanedText) => {
  const lines = cleanedText.split('\n')
  const out = []
  let inBlock = false // 当前是否在 > 块引用内

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      out.push('')
      // 块引用不因空行中断（维基底本中 <poem> 块会插入空行）
      continue
    }

    // 检测注家起始行
    if (ANNOTATION_HEAD_RE.test(trimmed)) {
      out.push(`> ${trimmed}`)
      inBlock = true
      continue
    }

    if (inBlock) {
      out.push(`> ${trimmed}`)
      continue
    }

    out.push(trimmed)
    inBlock = false
  }

  // 压缩空行
  const result = []
  let prevEmpty = true
  for (const l of out) {
    if (l === '') {
      if (!prevEmpty) {
        result.push('')
        prevEmpty = true
      }
      continue
    }
    result.push(l)
    prevEmpty = false
  }

  return [`# ${chapterName}`, '', ...result].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

// ===== 篇名映射（维基→本地）=====

// 维基 → 本地篇名映射：本地目录名为准，反查维基章节
// 维基 "一 命宫" "二兄弟" "十二父母" 都映射到本地目录名（无前缀）
const mapName = (name) => name.trim() // 不做自动处理，留给 indexByLocalName 反查

// ===== 主流程 =====

const main = async () => {
  // 1. 解析 3 卷底本
  const allChapters = []
  for (const vol of [1, 2, 3]) {
    const raw = fs.readFileSync(VOL_RAW[vol], 'utf-8')
    const chapters = parseVolume(raw, vol)
    console.log(`卷${vol}: ${chapters.length} 章`)
    allChapters.push(...chapters)
  }
  console.log(`底本合计: ${allChapters.length} 章`)

  // 2. 遍历本地 articles 目录，按篇名匹配
  const localDirs = fs.readdirSync(ARTICLES_DIR).sort()
  console.log(`本地目录: ${localDirs.length} 篇`)

  const matched = []
  const unmatched = []
  const dupes = []

  // 维基篇章按"本地目录名"反查索引
  // 维基篇名可能带前缀 "一 命宫" / "二兄弟" / "十二父母" 等
  // 但 "十二宫诸星..." 不可剥（"十二"是篇名一部分）
  const wikiByLocalName = new Map()

  // 收集所有本地目录名
  const localNames = new Set(fs.readdirSync(ARTICLES_DIR))

  for (const ch of allChapters) {
    const wikiName = ch.name // 已经是 t2s 过的简体
    if (localNames.has(wikiName)) {
      wikiByLocalName.set(wikiName, ch)
      continue
    }
    // 尝试去前缀：单字 + 空白（"一 命宫" → "命宫"）
    const m1 = wikiName.match(/^[一二三四五六七八九]\s+(.+)$/)
    if (m1 && localNames.has(m1[1])) {
      wikiByLocalName.set(m1[1], ch)
      continue
    }
    // 尝试去前缀：单字 + 汉字（"二兄弟" → "兄弟"）
    const m2 = wikiName.match(/^[一二三四五六七八九]([一-鿿].*)$/)
    if (m2 && localNames.has(m2[1])) {
      wikiByLocalName.set(m2[1], ch)
      continue
    }
    // 尝试去前缀：双字 + 汉字（"十二父母" → "父母"，"十一福德" → "福德"）
    const m3 = wikiName.match(/^十(?:[一二三四五六七八九]?)([一-鿿].*)$/)
    if (m3 && localNames.has(m3[1])) {
      wikiByLocalName.set(m3[1], ch)
      continue
    }
    // 都没匹配 → key 用 wiki 原名（可能本地未匹配）
    wikiByLocalName.set(wikiName, ch)
  }

  for (const local of localDirs) {
    const wikiCh = wikiByLocalName.get(local)
    if (!wikiCh) {
      unmatched.push(local)
      continue
    }
    matched.push({ local, wiki: wikiCh })
  }

  console.log(`匹配: ${matched.length}, 未匹配: ${unmatched.length}`)

  if (unmatched.length) {
    console.log('本地未在维基底本找到的篇名:')
    for (const u of unmatched) console.log(`  - ${u}`)
  }

  // 3. 重写 source.md
  let written = 0, skipped = 0
  for (const { local, wiki } of matched) {
    const outPath = path.join(ARTICLES_DIR, local, 'source.md')
    const exists = fs.existsSync(outPath)

    if (exists && !FORCE) {
      skipped++
      continue
    }

    const cleaned = cleanContent(wiki.content)
    // 标题用本地目录名（去前缀后的）而非 wiki 原名
    const md = formatMarkdown(local, cleaned)

    if (DRY_RUN) {
      console.log(`[dry-run] ${local} <- vol${wiki.vol} ${wiki.name} (${cleaned.length} chars)`)
      continue
    }

    fs.writeFileSync(outPath, md, 'utf-8')
    written++
  }

  console.log(`\n${DRY_RUN ? '[dry-run] ' : ''}${written} 写入, ${skipped} 跳过${FORCE ? ' (force)' : ''}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
